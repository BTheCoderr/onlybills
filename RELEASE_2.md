# OnlyBills — Design release 2.0

## Objective
Replace the decorative MVP with a credible and consistent public prototype. Make one release commit, not a string of little pushes.

## Included
- Editorial warm-paper/deep-green/coral identity and scalable receipt icon
- Responsive homepage explaining the actual product and constraints
- An interactive fictional request preview, preserving the existing Explore feed
- Sample expenses with no invented paid balances or fake verified-user testimonials
- A matching Instagram campaign at /try and early access page at /beta
- Practice swipes and a short Netlify Forms feedback poll
- Separate requester and potential supporter beta-intent capture
- Clear disclosures that real accounts, money handling and bill settlements are not active
- Basic static regression tests for pages, Netlify forms and routes

## Public beta status
[x] Fictional swipe demo
[x] Netlify forms for the early access list and interest survey
[x] Requester/supporter audience segmentation
[x] Clear limitations and privacy contact form
[ ] Physical-device smoke test after deploy
[ ] Automatic email notification and welcome delivery end-to-end verified
[ ] Real Supabase account signups and protected uploads configured
[ ] Human request review, identity/anti-fraud and operational moderation tested
[ ] Regulated payment processor/biller capabilities, settlement, refunds and disputes approved
[ ] Terms, privacy policy and support procedures reviewed for real money handling

Permitted marketing copy:
"OnlyBills is an interactive prototype. Try fictional example bills, vote on the idea and join the beta list."

Don't claim:
"Pay a bill today"; "Verified bills"; "We settled a bill"; "Guaranteed help"; "Tax-deductible donations".

## Manual release QA
- Check home, /try, /beta, /#/discover, and /contact.html on 360px/390px iPhone and desktop.
- Swipe through sample cards to completion and reset.
- Check no horizontal mobile overflow and confirm tabs/keyboard form behavior.
- Test Netlify form with a controlled address, inspect response and verified submissions.
- Confirm all copy remains clear that no real payments or bill uploads are active.
- Test the actual Instagram in-app browser.
