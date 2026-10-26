# OnlyBills · Founding Givers and funnel instrumentation
Prepared October 26, 2026 · one consolidated release.

## Live pages
- `/givers`: focused explanation of the *proposed* biller-payment pilot, with supporter and business buttons leading to the existing `/beta` consent form.
- `/try`: original three fictional swipe cards with a direct Founding Givers path.
- `/beta`: existing role-dependent questionnaire and Netlify Forms. Signup is research interest, **not** a donation or binding pledge.
- Accounts, genuine bills and money movement remain disabled.

## Anonymous first-party funnel signals
The shared `src/anon-events.js` sends a static-image request to a fixed event path; Netlify rewrites that request to the 1×1 `/assets/pixel.gif` (200 status). No cookies, visitor IDs, email, IP in parameters, local/sessionStorage, fingerprints or form contents are added by OnlyBills. Netlify naturally receives ordinary request metadata under its own retention rules. `navigator.globalPrivacyControl` and browser Do Not Track prevent beacon submission. These events are **directional counts**, not conversions or unique users.

- `/givers` viewed: use Netlify browser-classified HTML request counts for `/givers` (avoid automatic impressions due to preview bots).
- `/events/demo-start.gif`: the user first swipes or chooses an option in the fictional `/try` demo.
- `/events/demo-complete.gif`: the user reaches card 3/3. Counted once per page load.
- `/events/giver-click.gif`: a user clicks a Founding Giver button on supported pages.
- `/events/giver-form-submit.gif`, `/events/business-form-submit.gif`: browser-side intent immediately before Netlify Form submission. These can undercount if navigation aborts image loading, and they include failed submissions; **Netlify Forms accepted submissions are the source of truth**.

Each event includes ONLY allowlisted alphanumeric `source` and `campaign` query tags up to 32 characters. No `fbclid`, addresses, email, form choices or unique identifiers. UTM source/campaign travel through homepage → /try → /givers → /beta when visitors click designated links.

## Reading the funnel
1. Filter Netlify edge requests for `/givers`, `/try` and `/events/*` (differentiate browser vs preview).
2. Compare *trend*, not unique visitor conversion; image caching or network blocks may suppress some events.
3. Use the Netlify beta form submissions to review aggregate roles and UTM campaigns; exports may include personal details, so keep them private.
4. Distinguish `intent=want-to-help` and `intent=business-creator` in approved signup notifications. Verify test entries/duplicates before reporting them.
5. Never call a survey response a donated dollar, qualified sponsor, approved applicant or verified bill.

## Links for recruiting Givers
Instagram profile: https://onlybillss.netlify.app/givers?utm_source=instagram&utm_campaign=founding_givers
Creator outreach: https://onlybillss.netlify.app/givers?utm_source=creator&utm_campaign=founding_givers
Business outreach: https://onlybillss.netlify.app/beta?intent=business-creator&utm_source=outreach&utm_campaign=business_pilot

## Still required
No partner commitment, actual payment, Stripe/processor integration, verified email sender or real signup pilot exists. Do not send money or ask for sensitive bill uploads until a licensed/approved financial partner and safeguards are established.

## Maintenance
`robots.txt` and sitemap are now provided, plus Apple touch icons. Site is still on the Netlify subdomain. A final brand icon and custom domain remain future branding tasks.
