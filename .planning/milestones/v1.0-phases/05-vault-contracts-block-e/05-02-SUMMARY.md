---
phase: 05-vault-contracts-block-e
plan: 05-02
subsystem: vault
tags: [vault, contracts, bridge, zod, aes-wire-format, sync-all]
requires:
  - 05-01 (research + Q1/Q2 resolutions frozen)
  - Phase 2 AgentCredentialsSchema (re-export source)
provides:
  - "@x9-forge/contracts/vault sub-path (16 symbols)"
  - VaultTier + VaultSyncState enums + helpers
  - VaultEntryPlain/Encrypted schemas + T-05-01 guard
  - SyncAll* contracts + syncAllContract constant
  - WorkspaceFile schema (Q2-aligned nullable agentId)
  - PlatformBootstrapEnv type (type-only, mitigates T-05-02)
  - AgentVaultedCredentials referential re-export
affects:
  - plan 05-03 (Forge migration — consumes this bridge)
tech-stack:
  added: []
  patterns: [sub-path barrel export, re-export alias, type-only export, Zod refine guard]
key-files:
  created:
    - src/vault/vault-tier.ts
    - src/vault/vault-sync-state.ts
    - src/vault/vault-entry.ts
    - src/vault/vault-sync-event.ts
    - src/vault/workspace-file.ts
    - src/vault/platform-bootstrap-env.ts
    - src/vault/agent-vaulted-credentials.ts
    - tests/vault/vault-tier.test.ts
    - tests/vault/vault-sync-state.test.ts
    - tests/vault/vault-entry.test.ts
    - tests/vault/vault-sync-event.test.ts
    - tests/vault/workspace-file.test.ts
    - tests/vault/agent-vaulted-credentials.test.ts
    - tests/vault/fixtures/REDACTION-NOTES.md
    - tests/vault/fixtures/vault-entry-plain-agent.json
    - tests/vault/fixtures/vault-entry-plain-platform.json
    - tests/vault/fixtures/vault-entry-encrypted-agent.json
    - tests/vault/fixtures/vault-entry-encrypted-owner.json
    - tests/vault/fixtures/sync-all-response-ok.json
    - tests/vault/fixtures/sync-all-response-all-ok.json
    - tests/vault/fixtures/sync-all-response-all-errors.json
    - tests/vault/fixtures/workspace-file-platform.json
    - tests/vault/fixtures/workspace-file-agent.json
  modified:
    - src/vault/index.ts (was placeholder; fully rewritten as barrel)
decisions:
  - "createdAt optional on VaultEntry (Q1 — vault_entries has no updated_at column)"
  - "agentId nullable on WorkspaceFile (Q2 — aligned with Drizzle schema; supersedes CONTEXT D-22)"
  - "PlatformBootstrapEnv is type-only, no Zod (D-18; mitigates T-05-02 bootstrap recursion)"
  - "AgentVaultedCredentialsSchema is a re-export alias of AgentCredentialsSchema (D-20, I11 referential identity)"
  - "AES wire regex is lowercase-only with {24}:{32}:{2,} enforced (D-13 / T-05-03)"
  - "T-05-01 guard via Zod .refine() rejects isSecret=true + AES-wire-shaped value"
metrics:
  duration: ~5min
  completed: 2026-04-15
---

# Phase 5 Plan 02: Vault Bridge Contracts Implementation Summary

Shipped the `@x9-forge/contracts/vault` sub-path with 7 modules (6 runtime + 1 type-only) and ~16 public symbols, backed by 47 new unit tests that exercise invariants I1–I12 from `05-RESEARCH.md` §Validation Architecture.

## Tasks completed

| Task | Name                                                                 | Commit    |
| ---- | -------------------------------------------------------------------- | --------- |
| 1    | VaultTier + VaultSyncState schemas + helpers (VLT-01, VLT-02)        | `a36400c` |
| 2    | VaultEntryPlain + Encrypted schemas + T-05-01 guard (VLT-03, VLT-04) | `176e527` |
| 3    | SyncAll* + WorkspaceFile schemas + syncAllContract (VLT-05, VLT-08)  | `4cfd165` |
| 4    | PlatformBootstrapEnv + AgentVaultedCredentials alias (VLT-06, VLT-07)| `f056308` |

## Test count

- **Pre-existing tests:** 228 (carried over from Phase 4)
- **New vault tests:** 47 (10 tier + 8 sync-state + 13 entry + 9 sync-event + 4 workspace + 3 creds)
- **Total passing:** 287 (expected ≥258; plan baseline ~259)
- **T-05-01 guard area (vault-entry.test.ts):** 13 tests (≥12 required)

## Invariants covered (RESEARCH §Validation Architecture)

| ID  | Invariant                                                                            | Test                                                         |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| I1  | `VAULT_TIERS = ['platform','owner','agent']` in exact priority order                 | vault-tier.test.ts                                           |
| I2  | `VaultTierSchema` rejects unknown strings                                            | vault-tier.test.ts                                           |
| I3  | `compareTiers` reflects priority (-1, 0, 1)                                          | vault-tier.test.ts                                           |
| I4  | No `fromSyncState` export (lossy mapping by design)                                  | vault-sync-state.test.ts                                     |
| I5  | T-05-01: `isSecret=true` + AES-wire value rejected                                   | vault-entry.test.ts (guard test + message assertion)         |
| I6  | AES wire regex: lowercase, `{24}:{32}:{2,}` exact                                    | vault-entry.test.ts (uppercase/missing/short neg cases)      |
| I7  | `VaultEntryEncryptedSchema.isSecret` is literal `true`                               | vault-entry.test.ts (flipped-literal neg case)               |
| I8  | `SyncAllRequestSchema` is strict `{}`                                                | vault-sync-event.test.ts                                     |
| I9  | `SyncAllResponseSchema.ok` is literal `true` (error uses SyncAllErrorResponseSchema) | vault-sync-event.test.ts                                     |
| I10 | `WorkspaceFileSchema.agentId` nullable (Q2 resolution)                               | workspace-file.test.ts (platform fixture agentId=null parse) |
| I11 | `AgentVaultedCredentialsSchema === AgentCredentialsSchema` (referential)             | agent-vaulted-credentials.test.ts (`.toBe()` assertion)      |
| I12 | `syncAllContract` method/path/authType triple is `POST /api/vault/sync-all /none`    | vault-sync-event.test.ts                                     |

## Threats mitigated

| Threat   | Category              | Mitigation                                                                                         |
| -------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| T-05-01  | Information disclosure | `VaultEntryPlainSchema.refine()` rejects `isSecret=true && AES_WIRE_FORMAT_REGEX.test(value)` with message containing "decrypt was not performed". Test #7 green. |
| T-05-02  | Denial of service     | `PlatformBootstrapEnv` is **type-only** — no runtime Zod export. JSDoc documents bootstrap recursion. `grep "import.*zod" src/vault/platform-bootstrap-env.ts` returns 0. |
| T-05-03  | Tampering (loose regex) | AES regex literal `/^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]{2,}$/` (lowercase-only, explicit segment lengths). 3 neg-case tests. |
| T-05-04  | Information disclosure (real secrets in fixtures) | `REDACTION-NOTES.md` documents policy. All encrypted fixtures carry `_synthetic: true` sentinel and use obvious hex patterns (`aaaa…`, `dead…`). |
| T-05-05  | Tampering (`isSecret=false` masking plaintext in encrypted schema) | `VaultEntryEncryptedSchema.isSecret = z.literal(true)`. Flipped-literal test green. |

## Q1 / Q2 resolutions applied

- **Q1 — `createdAt` (not `updatedAt`) on VaultEntry:** `createdAt: z.string().datetime({ offset: true }).optional()` in `VaultEntryBase`. JSDoc cross-links CONTEXT D-08 reconciliation against Forge Drizzle `vault_entries` (no `updated_at` column).
- **Q2 — `agentId` nullable on WorkspaceFile:** `agentId: z.number().int().nullable()`. JSDoc notes "supersedes CONTEXT D-22 per 05-01-PLAN.md Q2 resolution". Platform fixture exercises `agentId=null`.

## Sub-path symbol smoke (consumer-side)

```
$ node --input-type=module -e "import('./dist/vault/index.js').then(m => console.log(Object.keys(m).sort().join(', ')))"
AES_WIRE_FORMAT_REGEX, AgentVaultedCredentialsSchema, SyncAgentResultSchema,
SyncAllErrorResponseSchema, SyncAllRequestSchema, SyncAllResponseSchema,
VAULT_SYNC_STATES, VAULT_TIERS, VaultEntryEncryptedSchema, VaultEntryPlainSchema,
VaultSyncStateSchema, VaultTierSchema, WorkspaceFileSchema, compareTiers,
syncAllContract, toSyncState
```

16 runtime symbols + `PlatformBootstrapEnv`, `VaultSyncEvent`, `VaultTier`, `VaultSyncState`, `VaultEntryPlain`, `VaultEntryEncrypted`, `SyncAgentResult`, `SyncAllRequest`, `SyncAllResponse`, `SyncAllErrorResponse`, `WorkspaceFile`, `AgentVaultedCredentials` as type-only exports.

## Verification gate (05-02-PLAN §verification)

| # | Check                                                                              | Result |
| - | ---------------------------------------------------------------------------------- | ------ |
| 1 | `pnpm vitest run src/vault tests/vault` → exit 0                                   | PASS (47 tests) |
| 2 | `pnpm test` → exit 0, total ≥ 258                                                  | PASS (287) |
| 3 | `pnpm tsc --noEmit` → exit 0                                                       | PASS |
| 4 | `pnpm build` produces `dist/vault/index.{js,d.ts}`                                 | PASS |
| 5 | Node smoke: sub-path import lists required exports                                 | PASS (16 symbols) |
| 6 | Fixtures free of real-looking secrets (synthetic `aaaa…`, `dead…`, `cafe…`)        | PASS (spot-checked; `_synthetic: true` sentinel on encrypted fixtures) |
| 7 | 05-VALIDATION.md §Per-Task Verification Map plan-02 rows now green                 | PASS |

## Deviations from Plan

None — plan executed exactly as written. All verbatim constants (AES regex, tier order, sync-state values, `toSyncState` mapping, Q1/Q2 resolutions) preserved. Task 2 dropped (as instructed) case #13 (duplicate of #7) and shipped 13 tests including regex negative cases.

## Key files

- Schemas: `src/vault/{vault-tier,vault-sync-state,vault-entry,vault-sync-event,workspace-file,agent-vaulted-credentials,platform-bootstrap-env}.ts`
- Barrel: `src/vault/index.ts`
- Tests: `tests/vault/*.test.ts` (6 test files)
- Fixtures: `tests/vault/fixtures/*.json` (9 fixtures) + `REDACTION-NOTES.md`

## Self-Check: PASSED

- 7 src + 6 test + 9 fixture + 1 notes file — all committed via atomic per-task commits.
- 4 commits (`a36400c`, `176e527`, `4cfd165`, `f056308`) present in `git log`.
- `pnpm test` = 287 tests green; `pnpm tsc --noEmit` clean; `pnpm build` produces `dist/vault/*`.
