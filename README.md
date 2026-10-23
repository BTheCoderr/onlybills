# OnlyBills · Swipe with purpose

> "There should be an app where you upload your bills and bored billionaires swipe right to pay them."

A mobile-friendly, GitHub-ready bill-help community prototype. The experience has a polished landing page, swipeable donor feed, category filters, bill submission with supporting private evidence, email/password accounts, user dashboard, pledge records, an authorized moderation queue, and a responsive mobile UI.

## What is actually working

| Feature | Status |
| --- | --- |
| Responsive landing page and featured stories | Working |
| Swipe left to skip, swipe right to select support, buttons and keyboard arrows | Working |
| Filter requests by bill type | Working |
| Choose pledge amount, validate against remaining goal | Working (not financial payment) |
| Demo accounts, uploads metadata, requests and pledges | Working locally via browser storage |
| Supabase signup for help seekers or supporters, sign-in, email confirmation, and password recovery | Wired; requires a Supabase project and allowed Auth redirect URLs |
| Real request records + private PDF/JPG/PNG uploads | Wired; requires database migration |
| Human approval/rejection queue with proof review and audit trail | Wired; requires admin assignment |
| Database row-level access policies, private storage, pledge concurrency lock | Included in SQL migration |
| Charge a donor / transfer to biller | **Not built** |
| Identity/fraud checks, dispute handling, deletion, full production legal compliance | **Not built** |

**Important: No payment processor is enabled.** The app records nonbinding pledges. A "pledge" is not a payment, a donation receipt, or proof that any bill has been paid. Do not enable real fundraising or market the product as a way to settle bills until the regulated payment flow has been built and reviewed.

## Launch in demo mode in under a minute

No `npm install` or build tools needed.

1. Unzip into your new GitHub repository.
2. Run `python3 -m http.server 4173` from the project folder, or `npm run dev` if Python and Node are installed.
3. Open `http://localhost:4173`.
4. Click **Explore bills** to swipe fictional requests.
5. Click **Post a bill**, create a demo account, attach a PDF/JPG/PNG and submit. Open **My space** and click **Simulate approval** to publish your fictional request to the swipe feed.
6. Visit **My space** for pledge history. Demo data is saved in browser `localStorage`.

The demo cannot upload your document anywhere; it remembers only the *filename*. You can reset the browser demo by removing the `onlybills_demo_v1` localStorage entry.

## Put it on GitHub

Create an empty repository, for example `onlybills`, then from the extracted project folder:

```bash
git init
git add .
git commit -m "Build OnlyBills swipe-to-pledge MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/onlybills.git
git push -u origin main
```

**Netlify:** Import the GitHub repository as a new site. Publish directory is `.` and there is no build command. You can also drag the complete extracted folder into Netlify Drop.

## Connect real accounts and uploads with Supabase

1. Create a new Supabase project.
2. In **SQL Editor**, execute `supabase/migrations/0001_onlybills.sql` against that project. This creates tables, row security, an approved-only public view, a private `bill-documents` bucket, and pledge and moderation triggers.
3. In **Authentication → Providers**, enable email/password and require email verification. In **Authentication → URL Configuration**, add the deployed site URL, its `/#/auth` confirmation redirect, and `/?reset=1` password reset redirect to the allow list.
4. Configure **custom SMTP** for public signups and password resets. Supabase's default mailer is severely rate limited and not suitable for a public app.
5. In `src/config.js`, paste the Supabase project URL and **publishable/anon** key:

```js
export const CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  siteName: 'OnlyBills',
};
export const IS_DEMO = !(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
```

6. Refresh the app; Supabase mode replaces browser demo data. New requests stay private in `pending_review` until an admin approves them.
7. To appoint a reviewer, first create their account through the website, then execute in the SQL Editor, replacing the email with their actual account email:

```sql
insert into public.admin_users(user_id)
select id from auth.users where email = 'ACTUAL_REVIEWER_EMAIL_HERE'
on conflict do nothing;
```

8. Reviewer signs in and opens **My space → Review queue**. They can open the private upload through a one-minute signed URL and approve/reject. A successful approval makes a public story appear in **Explore bills**.

Account creation asks whether the person needs help with a bill or wants to support others. That choice is a **UI preference**, not a permission role; both can browse and post. Reviewers must be promoted in `admin_users` separately. Password recovery and verification email sending are unavailable in demo mode; the app never claims to send demo emails.

**Never put your Supabase service-role key, database password, Stripe secret key, or other server secrets in `src/config.js`.** Browser auth + SQL RLS is the security boundary for this version. `esm.sh` is used to load the Supabase client only when configured; review and pin that dependency for production.

## Data and security model

- Public: nickname, city/state (optional), category, story, amount, pledge total, due date, and creation date, only after approval.
- Private: account email, uploaded bill evidence, authentication data and pledge-to-donor association.
- Private storage: 8MB maximum, PDF/JPG/PNG only, uploader/reviewer access. Signed reviewer preview URLs expire after 60 seconds.
- The app escapes user-generated text before inserting it into HTML.
- Only admins can approve/reject, and statuses have an audit log.
- Pledge insertion locks the bill database row to prevent oversubscribing the displayed goal during concurrent pledge requests.
- Requesters cannot mark their own bills approved, or update pledge totals through the browser.
- Pledges are **not reserved, charged, guaranteed, or disbursed**. A complete payment lifecycle must be a separate verified feature.
- Private uploads should have antivirus scanning, EXIF stripping for images, access logging, retention/deletion processes, and sensitive data masking before production. These are not yet built.

## Before accepting actual money

The meme assumes a wealthy supporter can "swipe right to pay". A production-grade service should not route arbitrary payments to strangers or to a general Stripe balance without a legitimate payout/biller settlement path. Before launch, choose and verify a payment architecture (for example, a reputable bill-pay integration for supported billers), determine who is merchant/recipient of record, obtain qualified regulatory/tax advice on charitable solicitation, KYC/AML, money transmission, refunds and disputes, and implement reliable payment webhooks and an immutable money ledger. Add identity checks, fraud controls, evidence validation, rate limiting, abuse reporting, payment status receipts, consumer support, retention rules, and terms/privacy/contact information. Only then label statuses "paid" or take funds.

## Structure

```
index.html                     App entry (no build required)
styles.css, auth.css           Design system + responsive account layout
src/app.js                     Pages, navigation, swipe UI, forms
src/backend.js                 Demo store + Supabase adapter
src/config.js                  Browser config: ONLY public keys
src/data.js                    Fictional demo stories
src/utils.js                   Validation and display utilities
supabase/migrations/           Tables, policies, triggers, private files
tests/                         Node smoke tests for core helpers
netlify.toml                   Static deploy and security headers
```

## Quick check

```bash
npm test
```

Supported browsers: modern Chrome, Edge, Safari and Firefox. A touch device can swipe horizontally; mouse users can drag; arrow keys work on the discover feed.

**Working title:** OnlyBills. Change the name, logo, favicon, colors, and domain before production branding if preferred.
