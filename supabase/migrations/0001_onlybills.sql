-- OnlyBills MVP. Apply to a NEW Supabase project through the SQL Editor.
-- Financial transactions are intentionally NOT implemented: pledges are not payments.
-- Run as the Supabase SQL editor owner (postgres). Never paste a service_role key into browser code.

create extension if not exists pgcrypto;

-- Non-exposed schema for privileged internal functions. Do not add "private" to API exposed schemas.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;


create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Update own name" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create or replace function private.new_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $
begin
  insert into public.profiles(id, full_name) values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name',''), 120))
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_user_created on auth.users;
create trigger on_user_created after insert on auth.users for each row execute procedure private.new_user_profile();
revoke execute on function private.new_user_profile() from public, anon, authenticated;

-- Membership here is granted manually, never by a client-controlled role or profile field.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $
  select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- RPC wrapper has no elevated privileges: only the hidden private function does.
create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = '' as $
  select private.is_admin();
$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alias text not null check (char_length(alias) between 2 and 40),
  title text not null check (char_length(title) between 8 and 90),
  story text not null check (char_length(story) between 35 and 900),
  category text not null check (category in ('Housing','Utilities','Transportation','Medical','Education','Essentials')),
  city text not null default '' check(char_length(city) <= 60),
  amount_cents integer not null check(amount_cents between 500 and 1000000),
  pledged_cents integer not null default 0 check(pledged_cents >= 0 and pledged_cents <= amount_cents),
  due_date date,
  document_path text not null unique,
  status text not null default 'pending_review' check(status in ('pending_review','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);
create index if not exists bills_owner_created_idx on public.bills(user_id,created_at desc);
create index if not exists bills_status_created_idx on public.bills(status,created_at desc);
alter table public.bills enable row level security;
revoke all on public.bills from anon, authenticated;
grant select on public.bills to authenticated;
grant insert (user_id,alias,title,story,category,city,amount_cents,due_date,document_path) on public.bills to authenticated;
grant update (status) on public.bills to authenticated;
create policy "Own or moderator read" on public.bills for select to authenticated
  using(user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Submit pending bill" on public.bills for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending_review' and pledged_cents = 0
    and document_path like (select auth.uid())::text || '/%');
create policy "Only moderator can review" on public.bills for update to authenticated
  using((select public.is_admin())) with check((select public.is_admin()));

-- Views own only deliberately public columns. Default security definer is REQUIRED here;
-- all rows must be constrained to approved and this view must never select document_path.
create or replace view public.public_bills with (security_barrier = true) as
select id, alias, title, story, category, city, amount_cents, pledged_cents, due_date, created_at
from public.bills
where status = 'approved';
revoke all on public.public_bills from public, anon, authenticated;
grant select on public.public_bills to anon, authenticated;

create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete restrict,
  donor_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check(amount_cents >= 100),
  status text not null default 'pledged' check(status = 'pledged'),
  created_at timestamptz not null default now()
);
create index if not exists pledges_donor_created_idx on public.pledges(donor_id,created_at desc);
create index if not exists pledges_bill_idx on public.pledges(bill_id);
alter table public.pledges enable row level security;
revoke all on public.pledges from anon, authenticated;
grant select on public.pledges to authenticated;
-- Pledges remain disabled for authenticated API users until a controlled server-side
-- payment/reconciliation system is implemented. The prototype must not be used to forge totals.
revoke insert on public.pledges from anon, authenticated;
create policy "Read own pledges or moderate" on public.pledges for select to authenticated
  using(donor_id = (select auth.uid()) or (select public.is_admin()));
-- No INSERT policy is installed for pledges. An API client cannot invent a funded total.
-- Future payment integrations must use trusted transactions and idempotent provider events.

-- Serialize pledge requests by locking the target bill row before modifying the counter.
-- This prevents competing clients from oversubscribing the amount.
create or replace function private.reserve_pledged_amount()
returns trigger language plpgsql security definer set search_path = '' as $
declare
  target public.bills%rowtype;
begin
  if new.donor_id is distinct from (select auth.uid()) then
    raise exception 'Pledge must belong to the authenticated user';
  end if;
  select * into target from public.bills where id = new.bill_id for update;
  if not found or target.status <> 'approved' then
    raise exception 'This bill is not accepting pledges';
  end if;
  if target.user_id = new.donor_id then
    raise exception 'Cannot pledge toward your own request';
  end if;
  if target.pledged_cents + new.amount_cents > target.amount_cents then
    raise exception 'Amount exceeds the remaining pledge goal';
  end if;
  update public.bills set pledged_cents = pledged_cents + new.amount_cents where id = new.bill_id;
  return new;
end;
$$;
drop trigger if exists on_pledge_insert on public.pledges;
create trigger on_pledge_insert before insert on public.pledges
for each row execute function private.reserve_pledged_amount();
revoke execute on function private.reserve_pledged_amount() from public, anon, authenticated;

-- Make each moderation status change auditable.
create table if not exists public.bill_reviews (
  id bigint generated always as identity primary key,
  bill_id uuid not null references public.bills(id),
  previous_status text not null,
  new_status text not null,
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz not null default now()
);
alter table public.bill_reviews enable row level security;
revoke all on public.bill_reviews from anon, authenticated;
grant select on public.bill_reviews to authenticated;
create policy "Reviewers read audit history" on public.bill_reviews for select to authenticated using((select public.is_admin()));
create or replace function private.audit_bill_review()
returns trigger language plpgsql security definer set search_path = '' as $
begin
  if new.status is distinct from old.status then
    if not private.is_admin() then
      raise exception 'Only approved reviewers may change a bill status';
    end if;
    if old.status <> 'pending_review' then
      raise exception 'Only pending requests can be reviewed in MVP';
    end if;
    new.reviewed_at = now();
    new.reviewed_by = (select auth.uid());
    insert into public.bill_reviews(bill_id,previous_status,new_status,reviewer_id)
      values(old.id,old.status,new.status,(select auth.uid()));
  end if;
  return new;
end;
$$;
drop trigger if exists on_bill_review on public.bills;
create trigger on_bill_review before update of status on public.bills
for each row execute function private.audit_bill_review();
revoke execute on function private.audit_bill_review() from public, anon, authenticated;


-- Intake is bounded per account. Private documents must exist *before* bill submission.
-- This trigger runs with owner rights only to check Storage metadata and enforce limits;
-- clients cannot execute the function directly.
create or replace function private.check_bill_submission()
returns trigger language plpgsql security definer set search_path = '' as $
begin
  if (select auth.uid()) is null or new.user_id is distinct from (select auth.uid()) then
    raise exception 'Submit a request using your own authenticated account';
  end if;
  if new.status <> 'pending_review' or new.pledged_cents <> 0 then
    raise exception 'New requests must enter private review with no pledge total';
  end if;
  if new.document_path not like new.user_id::text || '/%' then
    raise exception 'Document path must belong to the requesting account';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'bill-documents'
      and name = new.document_path
      and owner_id = new.user_id::text
  ) then
    raise exception 'Upload private supporting evidence before submitting a request';
  end if;

  -- Serialize submissions for this account to prevent concurrent limit bypass.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.user_id::text));
  if (select count(*) from public.bills
      where user_id = new.user_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'Daily request limit reached';
  end if;
  if (select count(*) from public.bills
      where user_id = new.user_id and status = 'pending_review') >= 3 then
    raise exception 'Maximum pending review requests reached';
  end if;
  return new;
end;
$;
revoke all on function private.check_bill_submission() from public, anon, authenticated;
drop trigger if exists on_bill_insert on public.bills;
create trigger on_bill_insert before insert on public.bills
for each row execute function private.check_bill_submission();

-- Private evidence: authorized reviewers and the original uploader may view.
-- The public feed NEVER contains storage paths or signed URLs.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('bill-documents','bill-documents',false,8388608,ARRAY['application/pdf','image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,
allowed_mime_types=excluded.allowed_mime_types;

create policy "Uploader may add private evidence" on storage.objects for insert to authenticated
  with check(bucket_id='bill-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Uploader and reviewer may inspect evidence" on storage.objects for select to authenticated
  using(bucket_id='bill-documents' and (
    (storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())
  ));


-- An authenticated uploader may remove a failed, unreferenced upload.
-- They cannot remove evidence already attached to a request.
create policy "Uploader may clean unused evidence" on storage.objects for delete to authenticated
  using(bucket_id='bill-documents'
    and owner_id=(select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.bills where document_path = name));

-- GRANT A REVIEWER ONLY AFTER CREATING/CONFIRMING THEIR AUTH ACCOUNT:
-- insert into public.admin_users(user_id)
-- select id from auth.users where email = 'reviewer@example.com';
-- The first launch must include fraud prevention, data retention and deletion operations,
-- full privacy terms, abuse reporting, and lawful biller payment infrastructure.
