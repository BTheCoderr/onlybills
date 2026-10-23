# OnlyBills — Joke-to-beta launch experiment
Updated October 23, 2026

## Purpose
Turn curiosity about the internet's "swipe right to pay bills" idea into evidence about **two distinct audiences**:
1. People who need help with a legitimate bill.
2. People, creators, businesses, or organizations willing to help.

OnlyBills is currently a prototype with fictional demo cards, an anonymous concept poll, and a Netlify Forms email waitlist. It is **not** accepting or transferring money, and signup to the waitlist is **not** a user account.

## Live funnel
- Idea / story hook: https://onlybillss.netlify.app/idea.html
- Shareable social link: https://onlybillss.netlify.app/idea.html?utm_source=instagram&utm_medium=social&utm_campaign=joke_to_beta
- Try the demo: https://onlybillss.netlify.app/#/discover
- Early-access form: https://onlybillss.netlify.app/join.html?utm_source=instagram&utm_medium=social&utm_campaign=joke_to_beta
- Site: https://onlybillss.netlify.app/
- Netlify Forms: "onlybills-concept-pulse" (role, interest, most important trust feature), "onlybills-early-access" (name, email, intent, consent, sanitized referrer and campaign)
- Anonymous practice swipes run only in the visitor's browser; **do not claim** they are centrally recorded.

## Positioning
**Public hook:** "The internet joked. We built the demo."
**Tagline:** "Swipe right. Show up for someone."
**Plain-English product promise under exploration:** "Discover a real need, review what you can verify without exposing private details, and contribute directly to an expense if and when secure payment infrastructure is in place."

Billionaires are an entertaining meme, not the business model. Position around everyday givers and trustworthy, small, opt-in contributions.

**Do not say yet:** "We pay bills," "verified bill payouts," "donations are tax-deductible," "billionaires are funding this," "payments go directly to billers," or "we guarantee assistance." These are not operational facts.

## Audience-test hypothesis
H1: At least some people who would offer help are interested in a bill-specific, reviewed, transparent experience rather than open-ended cash appeals.
H2: People needing assistance will be willing to express early interest without public disclosure or uploading sensitive materials.
H3: Proof review, biller payment and privacy are important trust features. The poll helps identify which to prioritize, but is not proof of actual payment intent.

## 7-day organic sampling plan
| Day | Action | Validation signal |
| --- | --- | --- |
| 1 | Comment/reply to the original conversation with the product name, short demo tease and "link in bio"; publish a short reel showing the demo | Idea page traffic, poll responses |
| 2 | Run a Story question: "If a bill were independently reviewed, would you swipe to help?" with a link sticker | Poll submissions by role |
| 3 | Post three fictional example card interactions, explicitly labeled sample, and invite feedback | More people completing the poll |
| 4 | Publish a trust-first post: private documents, verified expenses, no payments yet | Which trust feature voters select |
| 5 | Compare two hooks: **The internet joked. We built it** vs **Would you put $20 toward a verified power bill?** | Distinct UTM campaigns and waitlist opt-ins |
| 6 | Ask five prospective helpers and five prospective recipients for short interviews, without requesting bills, bank data or sensitive details | Top concerns and willingness to participate in a supervised beta |
| 7 | Review feedback and waitlist by segment; decide whether to invest in payment-feasibility work or adjust the concept | Quality of intent, not just views |

Suggested small-sample targets, not evidence of product-market fit: 100 qualified visits, 30 anonymous polls, and 10 opted-in early-access leads from each side. Track both absolute counts and rates; don't misrepresent sample sizes as statistical significance.

## Channel examples
**Instagram comment under the original post (if appropriate):** "I took the joke seriously 😂 Built an OnlyBills demo. No payments yet, but people can swipe through examples and vote on whether this should exist. It's in my bio."
**Reel hook (0–3s):** "They said billionaires should swipe right to pay our bills…"
**Reel middle (3–10s):** "I built the prototype. Here are three sample bills. Pass or consider helping. Which would you swipe on?"
**Reel CTA (10–15s):** "Try it and vote on what would make it trustworthy. OnlyBills in my bio."
**Threads:** "Internet: 'An app where billionaires swipe right to pay bills.' Me: 'What if we built the safe version for *everyday* people?' OnlyBills demo is live. Would you try it?"
**Suggested short caption:** "Y'all joked about an app that lets people swipe right to help pay a bill. I built the OnlyBills demo 😂 No real payments yet. Try 3 sample swipes, tell me what would make you trust it, then join the beta list. Link in bio. #OnlyBills #BuildInPublic #Startup #Fintech"

## Measurement and privacy
- Poll tracks responses anonymously via Netlify Forms; it does **not** record demo swipes or visits.
- Early-access form requires opt-in and records source / campaign (when provided). No passwords or bill documents.
- View counts require separate, compliant site analytics or platform insights; don't present Netlify form counts as traffic totals.
- Never post sensitive bill screenshots, account numbers, exact personal details, or unapproved testimonials.
- If referencing the original Instagram post, credit its creator where appropriate and do not imply partnership or endorsement. Ask permission before republishing their screenshot in paid promotional material.
- Have a clear deletion/contact path before collecting more than early interest.
- Before taking payments: review payment partner approval, identity/anti-fraud measures, payouts and biller acceptance, funds handling, privacy/retention and applicable fundraising and money-transmission requirements.

## Implementation order after interest validation
1. Dedicated Supabase Auth project and safe onboarding, with email confirmation and password recovery.
2. Abuse-resistant profile/bill document submission and moderation; no full bills published.
3. Biller payment feasibility and payments/legal review with regulated providers.
4. Payment success/failure/refund and audit state handling before accepting real funds.
5. A closed pilot with a small supervised cohort, then expand if trust and operations meet targets.
