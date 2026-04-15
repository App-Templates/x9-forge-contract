---
phase: 05-vault-contracts-block-e
plan: 05-03
subsystem: vault
tags: [forge-migration, drift-guard, vault, contracts]
one_liner: "Migrated Forge vault types (packages/types, vault.repo, vault.service) to consume @x9-forge/contracts/vault; added sync-all contract test as drift guard."
requires: [05-02]
provides: [forge-consumer-of-bridge-vault]
affects: [forge-v2/packages/types, forge-v2/services/vault]
tech_stack_added: []
patterns: [re-export-shim, contract-drift-test]
key_files:
  created:
    - forge-v2/services/vault/tests/routes/sync-all.contract.test.ts
  modified:
    - forge-v2/packages/types/src/vault.ts
    - forge-v2/services/vault/src/repositories/vault.repo.ts
    - forge-v2/services/vault/src/services/vault.service.ts
    - forge-v2/services/vault/package.json
decisions:
  - "WorkspaceFile/WorkspaceFileSchema NOT re-exported from @forge/types shim (barrel collision with Forge-local WorkspaceFile in agent.ts with different shape); consumers must import directly from bridge."
  - "Contract test placed under tests/routes/ (existing Forge convention) rather than test/routes/ as PLAN.md specified — vitest default glob still picks it up."
metrics:
  tasks_completed: 3
  files_created: 1
  files_modified: 4
  tests_before: 51
  tests_after: 54
  forge_commits: 3
  completed_date: 2026-04-15
---

# Phase 5 Plan 03: Forge Migration Summary

Migrate Forge vault-related type definitions to consume `@x9-forge/contracts/vault` (landed in 05-02) as the single source of truth, and add a contract drift-guard test on the Forge side.

## Tasks Completed

| Task | Name                                                                         | Commit (forge-v2) |
| ---- | ---------------------------------------------------------------------------- | ----------------- |
| 1    | Rewrite `forge-v2/packages/types/src/vault.ts` as bridge re-export shim      | `29d797b`         |
| 2    | Replace local `VaultTier` + `SyncAgentResult` in vault repo + service        | `7d9c158`         |
| 3    | Add `tests/routes/sync-all.contract.test.ts` drift guard                     | `d60b575`         |

## Files Changed

- **created:** `forge-v2/services/vault/tests/routes/sync-all.contract.test.ts`
- **modified:**
  - `forge-v2/packages/types/src/vault.ts` (full-file rewrite — 13 lines → 53-line shim)
  - `forge-v2/services/vault/src/repositories/vault.repo.ts` (local `VaultTier` → `import type` + re-export from bridge)
  - `forge-v2/services/vault/src/services/vault.service.ts` (drop local `SyncAgentResult` interface; import `VaultTier` + `SyncAgentResult` from bridge; re-export `SyncAgentResult` for downstream back-compat)
  - `forge-v2/services/vault/package.json` (add `@x9-forge/contracts: workspace:*` dep)
- **regenerated (pnpm install side-effect):** `forge-v2/pnpm-lock.yaml` (included in Task 1 commit)

## Bridge Symbols Wired Into Forge

| Symbol                         | Source (bridge)                       | Consumer (forge-v2)                              |
| ------------------------------ | ------------------------------------- | ------------------------------------------------ |
| `VaultTier`                    | `@x9-forge/contracts/vault`           | `packages/types/src/vault.ts` + `services/vault/src/repositories/vault.repo.ts` + `services/vault/src/services/vault.service.ts` |
| `SyncAgentResult`              | `@x9-forge/contracts/vault`           | `packages/types/src/vault.ts` + `services/vault/src/services/vault.service.ts` |
| `SyncAllResponseSchema`        | `@x9-forge/contracts/vault`           | `services/vault/tests/routes/sync-all.contract.test.ts` |
| `VaultEntryPlain` (as alias `VaultEntry`) | `@x9-forge/contracts/vault` | `packages/types/src/vault.ts` (back-compat alias) |
| `VaultSyncState`, `VaultEntryEncrypted`, `SyncAllRequest/Response/ErrorResponse`, `VaultSyncEvent`, `PlatformBootstrapEnv`, `AgentVaultedCredentials` + matching schemas | `@x9-forge/contracts/vault` | `packages/types/src/vault.ts` (surface for all Forge services) |

## Test Results

- `pnpm --filter @forge/vault-svc test`: **54 passed / 54 total** (before: 51 → after: 54; +3 new contract tests).
- `pnpm --filter @forge/vault-svc exec tsc --noEmit`: exit 0.
- `pnpm --filter @forge/types build`: exit 0.
- `pnpm --filter @forge/types exec tsc --noEmit`: exit 0.
- `pnpm install` (forge-v2 root): linked `@x9-forge/contracts` into `services/vault/node_modules/@x9-forge/contracts` via `pnpm.overrides: link:../x9-forge-contract-bridge`.

## Contract Test Details

**File:** `forge-v2/services/vault/tests/routes/sync-all.contract.test.ts`

**Asserts:**
1. `vaultService.syncGlobalToAllAgents()` output wrapped with `{ ok: true, ...result }` parses via `SyncAllResponseSchema.parse` with `synced.length === 1`, `errors.length === 1`.
2. Zero-agent edge case — parses with empty arrays.
3. No-directory skip case — parses with 1 error whose message contains `/directory/i`.

**Mocks used:**
- `vi.spyOn(agentRepo, 'findAll')` — returns synthetic agent arrays.
- `vi.spyOn(vaultService as any, 'syncToEnvFile')` — cast-to-any to access private method; chain `.mockResolvedValueOnce` + `.mockRejectedValueOnce` to simulate the success + error agent pair.
- Top-of-file `vi.mock('../../src/db', ...)` + `vi.mock('@forge/db', ...)` — prevent `DATABASE_URL` guard in `db.ts` from `process.exit(1)` when `vault.service.ts` is imported.

**Drift guard semantic:** If bridge `SyncAllResponseSchema` ever tightens (e.g. new required field), `SyncAllResponseSchema.parse(...)` throws in all three tests → Forge CI red before bridge upgrade ships to prod.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] `WorkspaceFile` name collision on @forge/types barrel**

- **Found during:** Task 1 (`pnpm --filter @forge/types build` exit 2).
- **Issue:** `packages/types/src/agent.ts` defines a Forge-local `WorkspaceFile` interface (id/agentId/content/updatedAt — DB row shape) that collides with the bridge's `WorkspaceFile` DTO when both are re-exported via `src/index.ts` barrel (`export * from './agent'; export * from './vault'`). Build error: `TS2308: Module './agent' has already exported a member named 'WorkspaceFile'.`
- **Fix:** Removed `WorkspaceFile` (type) and `WorkspaceFileSchema` (value) from the vault re-export shim. Added an explanatory comment directing consumers that need the bridge workspace file DTO to import directly from `@x9-forge/contracts/vault`. Phase 7 shim removal will reconcile the two shapes.
- **Files modified:** `forge-v2/packages/types/src/vault.ts` (13 lines delta vs plan's verbatim content).
- **Commit:** `29d797b`.

### Location deviation (non-blocking)

- Plan specified `forge-v2/services/vault/test/routes/sync-all.contract.test.ts`; actual path used: `forge-v2/services/vault/tests/routes/sync-all.contract.test.ts` (plural `tests/`) to match existing Forge vault test convention. Vitest default glob (`**/*.test.ts`) picks it up — all 54 tests run.

## Verification Grep Checks (from PLAN verification section)

- `grep -rn "export type VaultTier = 'platform'" forge-v2/` → 0 matches in source (only old `.planning/` docs) ✓
- `grep -rn "export interface SyncAgentResult" forge-v2/services/vault/src/` → 0 matches ✓
- `grep -rn "from '@x9-forge/contracts/vault'" forge-v2/` (incl. double-quoted variants) → 6+ matches (types shim x2, vault.repo, vault.service x2, contract test) ✓

## Known Stubs

None — all changes are complete refactors or additive tests; no placeholder values.

## Threat Flags

None — no new security-relevant surface introduced. The contract test is a CI-only drift guard; no new endpoint or auth path.

## Manual-Only Verifications (deferred)

- Staging VPS smoke test of `POST /api/vault/sync-all` — manual, tracked in `05-03-SMOKE.md` (to be created per Phase 4 convention; empty checklist deferred to operator task list).

## Self-Check

- [x] `forge-v2/packages/types/src/vault.ts` modified (shim in place)
- [x] `forge-v2/services/vault/src/repositories/vault.repo.ts` modified
- [x] `forge-v2/services/vault/src/services/vault.service.ts` modified
- [x] `forge-v2/services/vault/tests/routes/sync-all.contract.test.ts` created
- [x] `forge-v2/services/vault/package.json` modified (dep added)
- [x] Commits `29d797b`, `7d9c158`, `d60b575` exist in forge-v2 git log
- [x] `pnpm --filter @forge/vault-svc test` exits 0 (54/54)
- [x] `pnpm --filter @forge/vault-svc exec tsc --noEmit` exits 0
- [x] `pnpm --filter @forge/types build` + typecheck exit 0

**Status: PASSED**
