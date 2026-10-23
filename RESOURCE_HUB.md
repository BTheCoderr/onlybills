# OnlyBills - Public Bill Assistance Resource Hub

## What it is
- A practical U.S. assistance directory for people who currently need help with bills.
- Live page: /help (Netlify redirect to /resources.html); alternate /resources.
- U.S.-wide **information and referrals**, not a claim of funding, an eligibility determination, a bill submission or payment service.
- Seven linked resources (211, LIHEAP energy assistance, emergency rent, HUD housing counseling, SNAP, CMS medical assistance, Lifeline discounts).
- Search by everyday bill concern, filter category, and use a checklist that stays entirely in the browser (it is not persisted).
- No sign-in, upload, location, bank information or social security number required.
- Explicit outside-party and no-guarantee warnings.

## Verified sources as of October 2026
1. 211 — local assistance referral: https://211.org/about-us/your-local-211
2. USAGov LIHEAP and energy bills: https://www.usa.gov/help-with-energy-bills
3. USAGov emergency rent: https://www.usa.gov/emergency-pay-rent
4. HUD housing counseling: https://www.hud.gov/hud-partners/single-family-about-housing-counseling
5. USAGov SNAP information: https://www.usa.gov/food-stamps
6. CMS medical bill financial aid: https://www.cms.gov/initiatives/your-patient-rights/medical-bill-rights/get-help/guides-resources/apply-financial-assistance
7. USAGov Lifeline phone and internet: https://www.usa.gov/help-with-phone-internet-bills
8. USAGov avoiding grant scams: https://www.usa.gov/no-free-money/

No scrape or API integration with these agencies is implied. Review links and program changes regularly. This site's external referral links go directly to each source.

## QA
- Verify /help redirects, cards render with JavaScript disabled, and search/filter actions work when JS is enabled.
- Check 360px mobile and desktop layouts, focus indicators and outbound links.
- Confirm no forms or PII data collection on /help.
- Confirm /try, /beta and homepage link directly to /help.
- Verify the site header and Netlify deployment stay unaffected.
- Test feedback/waitlist separately: they continue using existing consent-based Netlify Forms.

## Real account rollout still blocked
Dedicated Supabase credentials and URL aren't configured in src/config.js and no dedicated OnlyBills Supabase project was found under the two inspected connected accounts. Do not connect OnlyBills to another product's database. Before enabling real authentication:
- Identify the intended organization/account and provision a distinct Supabase project.
- Apply and security-test the database migration and private storage policies.
- Enable email verification, register allowed redirect URLs and email sender domain.
- Test real signup, login, password recovery, review access, private document security and deletion.
- Do not ask people to upload bills or process payments until privacy, abuse protection and legal/payment review is complete.

Ship this as one milestone, not individual design pushes.
