# OnlyBills Impact Hub — Feature validation milestone

Status: **Public prototype only**. No real accounts, verified sponsors, settlements, invoices or payment receipts. Do not mistake the UI for an operating donation/payment service.

## What ships now (one grouped release)
- /impact: an Impact League with actual zero-state and opt-in/anonymous participation plan; Individuals/Businesses tab toggles.
- Business matching: interactive scenario builder for 0.5:1, 1:1, 2:1 and example caps. Browser-only and strictly nonbinding.
- Proof of impact: an intentionally watermarked *example* record that states No for processing and bill payment, not a printable receipt.
- An Impact Interest Netlify Form: name, email, org optional, participant segment, priority feature and explicit opt-in; honeypot, success page, source tag.
- Promotion via home cards, desktop/mobile nav, and the Instagram /try concept page.
- No fake business or donor identities, funding bars, first-place rankings or invented transaction data.

## Next milestones after actual demand

### 1. Verified Impact League
- Only count transactions carrying a settled or completed status **confirmed by a payment processor**, biller or corresponding trusted counterparty. Webhooks must be signature checked and idempotent.
- Use a completed funding source-to-biller record; don't count "pledged", "authorized" or failed/refunded transfers. Handle reversals, partial settlement, chargebacks and repayment adjustment.
- Rank based on verified settled cents or verified bills assisted; do not conflate promised matches with disbursements. Include transparent time boundaries and currency.
- Support opt-in display names, anonymous giving, legal names kept private, opt-out, staff review, abuse/duplicate-account checks and dispute resolution.
- No user-submitted public totals or leaderboard fields. Derived aggregate queries only.

### 2. Business Matching Challenges
- Sponsoring business must be verified; formal agreement, eligibility rules and maximum cap reviewed.
- Escrow/funds handling and commitments only via an authorized regulated payment provider, following jurisdiction-specific advice.
- Pair each eligible settled base contribution with at most one matching contribution; enforce atomic reserved cap to avoid overspending.
- Handle challenge pause, cancellation, expiration, returns and payment reversals; show terms and already-used cap transparently.
- The current interactive "challenge builder" records **nothing** and commits no funds.

### 3. Proof of Impact
- Separate "pledged", "authorized", "processed", "paid/settled", and "confirmed by biller".
- Receipts must be generated from trusted server-side transaction records only after genuine settlement; never from client-only taps.
- Redact private account numbers, recipient identity, invoice uploads and precise locations in public display. The present mock isn't a receipt.
- Reconcile refund/chargeback updates and revocations, audit every state change, and provide customer support contact and corrections.

## Pilot validation
- Gather at least 10 credible participants via the Impact Interest Form, preferably across individuals, brands and creators.
- Interview five supporters and three potential business sponsors about verification, matching caps and repeat contribution intent.
- Review feedback alongside organic conversion. Exclude known test submissions from acquisition figures.
- Prioritize data security, legal/payments approvals and clear user support before any real billing or transfers.

## Important operating constraints
- The Netlify form must be registered at build time (static HTML), have opt-in and distinct campaign data, and be confirmed with a real test submission.
- Email notifications need to be configured in Netlify UI; form capture alone does not prove email delivery or automatic welcome emails.
- There are no real payment credentials in browser JS or the repo. No Supabase schema was applied by this milestone.
- /impact-thanks should not claim a sponsorship agreement or donation exists.
