# OnlyBills — human-approved agent operations

This file is a workflow for human-assisted or separately authorized coding agents; it does not activate an autonomous model.

## Product and legal boundaries
OnlyBills is a research/prototype for direct-to-biller assistance, not a live donation/payment service.
- Never enable payment processing, private bill upload, user accounts, financial pledges, disbursements, donor tax claims or live identity verification without founder, payment-partner and privacy/legal approval.
- Do not invent users, donors, sponsor interest, partner approvals, verified bills or payments.
- Do not accept or commit bill documents, names, addresses, payment account numbers, donor details or credentials into GitHub issues, tests, screenshots or logs.
- Treat the existing OnlyBills naming-conflict issue #5 as an unresolved launch gate before advertising or brand investment.
- Keep all product-testing data fictional; even a successful donation-button demo is not a real pledge.

## Roles and boundaries
Planner creates measurable, constrained issue.
Engineer makes agent/ branch and PR with source tests, no direct main pushes.
QA confirms forms are honest, accessible, consented and do not accept real payments.
Founder approves release, payment relationships, privacy disclosures, branding and any paid integrations.

## Validation
The existing Verify OnlyBills / tests CI runs JavaScript syntax checks and npm test on pull requests. The new risk-map checks review headings and flags sensitive paths, but is not a security certification.

## Mandatory PR headings
### What changed
### Verification
### Risk assessment
### Human approval and rollback
### After release

No automated merges, production updates, financial actions or outbound messages.
