# OnlyBills: Account + Private Intake Pilot
Prepared October 23, 2026. This is **not yet a live account launch**.

## Status and safety switches
The existing Netlify site remains a fictional prototype. New code adds a secure activation path for a dedicated Supabase project and guards:
- `ONLYBILLS_ACCOUNTS_ENABLED=1`: enables Supabase sign-in, sign-up, confirmation and password recovery only after the dedicated project is configured.
- `ONLYBILLS_PRIVATE_INTAKE_ENABLED=1`: additionally opens real private uploads. Requires verified email, row-level protections and reviewer training. Leave OFF until approved.
- `ONLYBILLS_PUBLIC_FEED_ENABLED=1`: additionally opens approved requests to public browsers. Leave OFF during closed pilot; this is not a payments switch.
- **No flag enables donations, charges or fake pledges.** Real-money activity is explicitly blocked.

Defaults for every flag are OFF. A Netlify build generates `src/runtime-config.js` containing only the public Supabase project URL and its `sb_publishable_` key. Secrets do not belong in this browser app. The build fails closed if accounts are enabled without an HTTPS `*.supabase.co` URL and a proper publishable key, or if a private-only flag is enabled without accounts.

## Blocker
No project named OnlyBills was found across the nine connected Supabase account links. We must create a **dedicated OnlyBills project** in the correct user-selected organization (e.g. BTheCoderr or Bthedream), not reuse another application's tables.

## Deployment & verification checklist
1. User selects the Supabase organization. Create `OnlyBills` in a U.S. region with approved billing.
2. In the *new* project, use the reviewed `supabase/migrations/0001_onlybills.sql` as a **fresh-install starting point**. It has not been executed against any database. Review against the current Supabase schema and security guidance before applying. Do not blindly apply it to an existing project.
3. Verify schema creation and that every exposed public table has RLS. Check database security/performance advisors.
4. Create and verify a moderator user through Auth. Assign only that verified user in `public.admin_users` using a privileged SQL operation. No client-supplied role or JWT user_metadata can confer admin privileges.
5. Register allowed Auth redirects: `https://onlybillss.netlify.app/` and appropriate `/#/auth` flows (Auth redirect targets cannot assume a URL fragment will survive every provider). Verify signup/confirmation, login, sign-out, and reset from a physical iPhone. Update to the final brand domain when ready.
6. Configure a dedicated OnlyBills SMTP sender, verified SPF/DKIM, spam/reputation checks, email templates, and rate limits. Supabase's default test sender is **not** a reliable production mail service.
7. In Netlify environment settings (build scope), set:
    - `ONLYBILLS_ACCOUNTS_ENABLED=1`
    - `ONLYBILLS_SUPABASE_URL=https://<actual-ref>.supabase.co`
    - `ONLYBILLS_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<actual-key>`
    - Leave `ONLYBILLS_PRIVATE_INTAKE_ENABLED` and `ONLYBILLS_PUBLIC_FEED_ENABLED` unset.
   Never set server-side service_role keys, SMTP passwords or other secrets as client build variables.
8. Perform registration and user-isolation tests: user A cannot see B's private requests or storage paths; anonymous users have no access to private tables, and no non-admin can view pending review queue or signed evidence.
9. Pilot the private upload workflow by enabling `ONLYBILLS_PRIVATE_INTAKE_ENABLED=1` after the legal/privacy workflow is complete. File size and type rules are enforced at Storage, uploaded evidence must exist and belong to the requester, and intake is rate-limited. Review status changes must be auditable.
10. Before publishing **any** genuine request to an open feed: consent, privacy review, published moderation rules, account deletion/retention procedure, contact and fraud reporting. Public feed remains OFF by default.
11. Payment acceptance, biller settlement, refunds and reconciliation require separate engineering/legal milestones; never count pledges as settled donations.

## Current limitations
- This code does not by itself create a Supabase project, verify email delivery, apply SQL or run an end-to-end private document upload.
- SQL is an unexecuted fresh-install definition. All RLS and Storage rules must be tested against the newly provisioned project before enabling uploads.
- The browser still loads a pinned Supabase JS ESM dependency from a CDN; review supply-chain and secure hosting requirements before the production launch.
- Existing early-access and impact research forms remain separate Netlify Forms; do not silently enroll those contacts as authenticated users.
- No actual bill-funding or money movement is provided or promised.

## Explicit release discipline
Deliver the account-hardening changes as a **single draft PR** while the public site remains unchanged. Merge only after database selection and end-to-end security review. This avoids a build merely to show unfinished signup controls.
