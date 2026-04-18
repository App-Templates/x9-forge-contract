# AI Governance — Usage Guide (x9-forge-contract-bridge)

Canonical version: `forge-v2/.ai/context/ai-governance-usage.md`.

**Bridge-specific notes:**

- Every task here has `risk_assessment.touches_bridge: true` by default
  (it's a bridge repo). If a change here requires consumer updates in
  X9 and/or Forge, set `cross_repo_contract.required: true` in the contract
  and track the consumer PRs in the `repos` block.
- Bridge-auditor subagent (`x9-contract-bridge-auditor`) enforces the
  consumer-pinning rule: both agent-x9 and forge-v2 must reference the
  same bridge SHA/version.
- Before releasing a new bridge version, check:
  1. `pnpm build` passes
  2. `pnpm test` passes
  3. `CHANGELOG.md` has a new entry describing the change
  4. `package.json` version bumped according to semver
- Consumers track bridge version via `package.json` or `pnpm-workspace.yaml`
  pin. Check drift with `pnpm why @x9-forge/contracts` in each consumer.

See `stack-map.md` for bridge sub-paths and consumers.

*Last updated: 2026-04-18.*
