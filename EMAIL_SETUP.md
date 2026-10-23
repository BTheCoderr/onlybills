# OnlyBills email readiness

Checked October 23, 2026.
Website: https://onlybillss.netlify.app

## Verified
- Netlify Forms are enabled.
- The early-access form has a required email field, consent, intent, honeypot and success page.
- A Netlify log recorded a POST at 17:03:59 UTC (HTTP 200); Netlify previously reported one stored early-access submission.
- Forms were detected for early-access signup, concept feedback and privacy contact.
- All three forms include a clear email notification subject.

This confirms **form intake**, not that an alert arrived in the operator's inbox.

## Turn on signup email alerts

1. Open https://app.netlify.com/projects/onlybillss
2. Select Forms > Submission notifications > Add notification.
3. Choose Email notification.
4. Choose the operator's preferred inbox as the recipient.
5. Select onlybills-early-access; optionally repeat for onlybills-contact. Avoid alerting on every concept poll if not useful.
6. Save.

Netlify's default form notification sender is formresponses@netlify.com.
The signup subject is "OnlyBills: New early access signup (%{submissionId})".
Docs: https://docs.netlify.com/manage/forms/notifications/

## Verify with a real test

1. Open https://onlybillss.netlify.app/beta in a private browser.
2. Complete one test signup with an email address the operator controls.
3. Confirm the browser reaches /thanks.html.
4. Confirm the verified new record in Netlify Forms.
5. Confirm the alert arrives at the chosen inbox (also check Spam), with expected sender and subject.
6. Remove the test record if appropriate.

## Not active yet

Netlify email alerts notify **the site operator**, not the person who joins the waitlist.
Automatic signup confirmation or welcome emails to new subscribers are not implemented.
Real user accounts, verification and password resets need dedicated auth and a verified sender domain.

Never put mail service secret keys in public JavaScript or send OnlyBills mail from an unrelated brand's sending domain.
