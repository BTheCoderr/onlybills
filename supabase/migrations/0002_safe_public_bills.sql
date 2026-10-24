-- Migration 0002: replace security-definer approved-bills view with a public,
-- RLS-protected projection table. Private document paths NEVER enter this table.
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'public_bills' and c.relkind = 'v'
  ) then
    drop view public.public_bills;
  end if;
end $$;

create table if not exists public.public_bills (
  id uuid primary key references public.bills(id) on delete cascade,
  alias text not null,
  title text not null,
  story text not null,
  category text not null,
  city text not null default '',
  amount_cents integer not null,
  pledged_cents integer not null default 0,
  due_date date,
  created_at timestamptz not null
);
alter table public.public_bills enable row level security;
revoke all on public.public_bills from public, anon, authenticated;
grant select on public.public_bills to anon, authenticated;
create policy "Read published request summaries" on public.public_bills
  for select to anon, authenticated using (true);

-- Only moderation can approve a bill, which triggers the internal publication.
-- Clients lack direct write access to public_bills, including during demo.
create or replace function private.publish_reviewed_bill()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' then
    insert into public.public_bills (
      id, alias, title, story, category, city,
      amount_cents, pledged_cents, due_date, created_at
    ) values (
      new.id, new.alias, new.title, new.story, new.category,
      new.city, new.amount_cents, new.pledged_cents, new.due_date,
      new.created_at
    )
    on conflict (id) do update set
      alias = excluded.alias,
      title = excluded.title,
      story = excluded.story,
      category = excluded.category,
      city = excluded.city,
      amount_cents = excluded.amount_cents,
      pledged_cents = excluded.pledged_cents,
      due_date = excluded.due_date,
      created_at = excluded.created_at;
  else
    delete from public.public_bills where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function private.publish_reviewed_bill() from public, anon, authenticated;
drop trigger if exists on_bill_publication on public.bills;
create trigger on_bill_publication
after update of status on public.bills
for each row execute function private.publish_reviewed_bill();
