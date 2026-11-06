# OnlyBills agent-assisted rollout

Adapted from SmartProBono's free GitHub-based development pattern. No paid coding agent, financial processor, production feature, or public marketing is enabled.

- Existing Verify OnlyBills / tests runs syntax checks and npm test.
- New Agent PR Risk Map / risk-map requires clear scope, verification, risk and human release sections.
- New OnlyBills Agent Brief is manual-only so it does not generate daily noise until reviewed.
- AGENTS.md sets strict limits on private bills, donor data, brand claims and payments.

## To activate
1. Review PR preview and both workflow checks, then merge setup with founder approval.
2. Owner creates GitHub main Ruleset requiring PRs and passing checks tests and risk-map, blocking force pushes and deletion. A zero-reviewer-count solo workflow can still require manual founder merge.
3. Run OnlyBills Agent Brief from the Actions tab, verify one issue gets created/updated.
4. Start with issues #3 (useful giver evidence), #5 (brand collision), and #4 (regulated direct-to-biller partner design). NEVER enable real donations or accounts because CI is green.
5. Connect any autonomous coding runtime only after confirming cost and repository scope separately.

## Verification difference
OnlyBills is a privacy/financial trust product; testing is not proof of funding, biller settlement, donor intent, legal compliance or charitable status. Track verified research interviews before charging or processing financial records.
