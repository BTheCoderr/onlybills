# OnlyBills — Founding Giver interview qualification
October 31, 2026

## Purpose
Prior signup forms attracted almost exclusively people who needed help. Before investing in payments, speak to potential supporters who might participate in a partner-managed and legally approved pilot.

## One-page form
The landing page at /givers now contains a Netlify-detected POST form named `onlybills-giver-interviews`. It asks:
1. Are you an individual or a business/creator?
2. Which trust safeguard matters most (verification, direct-to-biller, trusted nonprofit, payment proof, or more information)?
3. Optional hypothetical contribution band (NOT money pledged).
4. Will you talk to the team for 15 minutes? Yes, maybe, or no.
5. Contact information and mandatory permission to be contacted about the prospective pilot.
6. Completely separate, optional subscription to wider product updates.
No sensitive financial data, bill photos, banking information, or government IDs.

The primary and business CTAs scroll to the same form and preselect the right role. A simple thank-you page explains what happens next. No payment, account creation or submitted bill.

## Real outcomes to record
- Verified form submission (Netlify Forms: exclude tests/spam/duplicates)
- Qualified for interview (yes or maybe, reachable email, clear interest)
- Conversation booked and held
- Specific trust requirement
- Written funding-program interest *conditional on legal, privacy and biller setup* (never call it a donation)
- Partner meeting / pilot feasibility response

## Netlify notification setup
New form detection occurs on the next published deploy. The old `onlybills-early-access` notification does NOT guarantee alerts for this distinct form. Check Netlify Forms and configure a submission notification if necessary via Netlify UI:
Site > Forms > Submission notifications > Add notification > Email.
Verify one real submission, not repeated fake submissions. Do not publicly post prospects' names or emails. Review the spam queue for false positives.

## Outreach links
Instagram: https://onlybillss.netlify.app/givers?utm_source=instagram&utm_campaign=founding_givers
Business outreach: https://onlybillss.netlify.app/givers?role=business&utm_source=outreach&utm_campaign=business_pilot
Local nonprofit intro: https://onlybillss.netlify.app/givers?utm_source=partner&utm_campaign=assistance_pilot

## Partner inquiry
United Way of Rhode Island administers the Good Neighbor Energy Fund and reports direct payments to utilities. Official contact: Front.Desk@unitedwayri.org. Draft partnership inquiry exists in Gmail but has not been sent.
Official source: https://www.unitedwayri.org/gnef/

## Launch gates
No donor funds, bill uploads, public applicants, or payment toggles are activated. Registration/email verification, two-user RLS tests, legal brand clearance, partner approval, fund custody, and actual biller payment reconciliation remain open.
