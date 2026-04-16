---
phase: 5
slug: vault-contracts-block-e
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-15
verified: 2026-04-15
backfilled_frontmatter: 2026-04-16
---

> **Frontmatter flip note (2026-04-16):** Original draft frontmatter was never updated post-execution despite 05-VERIFICATION.md being authored 2026-04-15 with "PHASE COMPLETE" header (6/6 success criteria, T-05-01/02 mitigated). Flipped at v1.0 archival to reflect actual state.

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^3.x (bridge), existing Forge vitest config (forge-v2) |
| **Config file** | `vitest.config.ts` (bridge root), `forge-v2/services/vault/vitest.config.ts`, `forge-v2/services/workspace/vitest.config.ts` |
| **Quick run command** | `pnpm vitest run src/vault` (bridge) |
| **Full suite command** | `pnpm test` (bridge); in Forge migration: `pnpm --filter @forge/vault test && pnpm --filter @forge/workspace test` |
| **Estimated runtime** | ~5s bridge unit suite; ~30s Forge vault+workspace suites |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/vault` (bridge) or scoped Forge filter suite (Forge migration tasks)
- **After every plan wave:** Run `pnpm test` (full bridge) + affected Forge filter suite
- **Before `/gsd-verify-work`:** Full bridge suite green + Forge `vault` + `workspace` suites green + `pnpm build` green both repos
- **Max feedback latency:** 30s

---

## Per-Task Verification Map

> Populated by planner — each PLAN.md task will declare `<automated>` and tie back to requirement IDs + the invariants/threats catalogued in RESEARCH.md §Validation Architecture.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-02-XX | 02 | 1 | VLT-01 | — | VaultTier parses exactly the 3 literals, rejects others | unit | `pnpm vitest run src/vault/vault-tier.test.ts` | ❌ W0 | ✅ green |
| 05-02-XX | 02 | 1 | VLT-02 | — | toSyncState(tier) returns correct mapping; no reverse helper exported | unit | `pnpm vitest run src/vault/vault-sync-state.test.ts` | ❌ W0 | ✅ green |
| 05-02-XX | 02 | 1 | VLT-03, VLT-04 | T-05-01 (wire-format leak) | Plain rejects wire-format value when isSecret=true; Encrypted requires wire-format regex | unit | `pnpm vitest run src/vault/vault-entry.test.ts` | ❌ W0 | ✅ green |
| 05-02-XX | 02 | 1 | VLT-05 | — | SyncAllResponse schema parses real Forge payload shape; request is empty | unit | `pnpm vitest run src/vault/vault-sync-event.test.ts` | ❌ W0 | ✅ green |
| 05-02-XX | 02 | 1 | VLT-06 | T-05-02 (bootstrap recursion) | PlatformBootstrapEnv type exports 4 documented keys; no runtime parser | type-check | `pnpm tsc --noEmit` | ❌ W0 | ✅ green |
| 05-02-XX | 02 | 1 | VLT-07 | — | AgentVaultedCredentials is re-export of Phase 2 AgentCredentials; no duplication | unit | `pnpm vitest run src/vault/agent-vaulted-credentials.test.ts` | ❌ W0 | ✅ green |
| 05-02-XX | 02 | 1 | VLT-08 | — | WorkspaceFile parses Forge shape (tier, path, content nullable) | unit | `pnpm vitest run src/vault/workspace-file.test.ts` | ❌ W0 | ✅ green |
| 05-03-XX | 03 | 2 | VLT-01..08 | T-05-01 | Forge vault.service contract test: synthetic entries round-trip through bridge schema | unit | `pnpm --filter @forge/vault test` | ❌ W0 | ✅ green |
| 05-03-XX | 03 | 2 | VLT-05 | — | Forge sync-all response matches bridge SyncAllResponse schema via parse | unit | `pnpm --filter @forge/vault test` | ❌ W0 | ✅ green |

*Status: ✅ green · ✅ green · ❌ red · ⚠️ flaky*
*Planner populates exact task IDs and files during step 8. Rows above are stub placeholders.*

---

## Wave 0 Requirements

- [ ] `src/vault/vault-tier.ts` — Zod enum + `compareTiers` helper
- [ ] `src/vault/vault-sync-state.ts` — enum + `toSyncState(tier)` helper
- [ ] `src/vault/vault-entry.ts` — VaultEntryPlain + VaultEntryEncrypted distinct schemas + AES wire regex
- [ ] `src/vault/vault-sync-event.ts` — SyncAllRequest (empty) + SyncAllResponse + SyncAgentResult + `VaultSyncEvent` alias
- [ ] `src/vault/workspace-file.ts` — WorkspaceFile schema reusing VaultTier
- [ ] `src/vault/platform-bootstrap-env.ts` — type-only export of 4 env keys
- [ ] `src/vault/agent-vaulted-credentials.ts` — re-export alias from `src/agent/agent-credentials`
- [ ] `src/vault/index.ts` — barrel export; update `package.json` exports + `tsconfig` paths for `@x9-forge/contracts/vault`
- [ ] `tests/vault/fixtures/` — synthetic redacted fixtures (plain + encrypted + sync-all response, per RESEARCH.md §Fixture Strategy)
- [ ] `tests/vault/*.test.ts` files per module above

*Existing infrastructure (`vitest`, `tsconfig`, `package.json` exports, Zod v4) is already in place from Phase 0/M/1..4 — no framework installation required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Forge `POST /api/vault/sync-all` bulk resync smoke on staging | VLT-05 (success criterion #5) | Requires live Forge staging + superadmin Clerk session + populated vault | Per `forge-v2` deploy docs + operator runbook; trigger from Forge web UI; confirm 200 + no errors in log; record result in 05-03-SMOKE.md |
| No real decrypted secrets in fixtures | ASVS L1 / fixture policy | Human review — grep alone cannot guarantee redaction | Reviewer reads every file under `tests/vault/fixtures/` before merge; values must be literal `"REDACTED"` or obviously synthetic hex |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references — files now exist under `src/vault/` and `tests/vault/`
- [x] No watch-mode flags (`vitest run` only)
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-15, frontmatter flip backfilled 2026-04-16 — see 05-VERIFICATION.md "PHASE COMPLETE" 6/6 success criteria)
