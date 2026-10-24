# OnlyBills · Beta questionnaire and pilot conversion

## The question we're trying to answer
Does the product have a balanced group of people who need bill assistance AND people or organizations actually interested in sponsoring safe, verified bill payments?

## Current user-facing early-access form
- Everyone: email, optional first name, participant role, optional state/region, explicit opt-in, attribution/campaign parameters.
- Potential recipient: expense category + timing; **not** a funding application or assistance guarantee.
- Potential supporter: preferred help route + optional comfortable one-time range; **not** a pledge or charge.
- Business or creator: capped-pilot willingness + optional organization name; **not** a sponsorship agreement.
- Just curious: no extra questions, to avoid abandoning the form.
- Segment-specific input controls are disabled when hidden to avoid collecting unrelated answers.

## What this can measure
- Unique opted-in emails, excluding controlled tests and duplicates (Netlify dashboard export required; built-in connector exposes only counts).
- Prospective recipients by expense category and timing.
- Potential givers by intended help type and OPTIONAL amount band.
- Qualified organizations open to a limited pilot.
- UTM-sourced waitlist submission count by original comment/profile/feature page.

## What it CANNOT prove
- A form submission is not an actual donation, verification, funded bill, real signup or evidence of payment.
- Likes/views are not validated website users; request logs include assets and automated traffic.
- Email notifications and welcome email deliverability are still unverified.

## Launch traffic links
- Generic: https://onlybillss.netlify.app/beta?utm_source=instagram&utm_campaign=comment100
- Potential supporter: https://onlybillss.netlify.app/beta?utm_source=instagram&utm_campaign=supporter_invite&intent=want-to-help
- Potential requester: https://onlybillss.netlify.app/beta?utm_source=instagram&utm_campaign=requester_invite&intent=need-help
- Business/creator: https://onlybillss.netlify.app/beta?utm_source=instagram&utm_campaign=business_invite&intent=business-creator
- Research only: https://onlybillss.netlify.app/try?utm_source=instagram&utm_campaign=comment100

## Review process
1. Every week, export the Netlify waitlist and concept submissions privately; remove tests/duplicates for analysis and honor opt-outs.
2. Start by looking for 5 plausible requesters, 5 plausible supporters, and 2 businesses/creators open to learning more. These are recruitment targets, not a statistical proof threshold.
3. Interviews should ask what bill problem exists, how people judge verification, whether they trust direct-to-biller settlement, and why they might decline to use the platform.
4. Track signup-to-pilot-acceptance before building the payment interface.
5. Do not contact anyone who did not opt into launch updates. Do not send unverified email campaigns.

## Release discipline
One reviewed merge/deployment for the account guardrails and conditional beta questionnaire. Real account activation, uploads, and payments remain separate gated milestones.
