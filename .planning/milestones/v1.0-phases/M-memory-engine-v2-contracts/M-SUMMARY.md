---
plan: "M"
status: complete
started: 2026-04-15
completed: 2026-04-15
backfilled: 2026-04-16
backfill_reason: "Letter mini-phase shipped via merge 7422bdf; SUMMARY not authored at execution time. Reconstructed from M-PLAN.md, git commits cbfbe1d/7422bdf/aa6e7e3/80aedd1, on-disk src/memory/, and tests/memory.smoke.test.ts."
commits:
  - cbfbe1d feat(memory): add Memory Engine v2 cross-repo contracts (mini-phase M)
  - 7422bdf "merge: mini-phase M (Memory Engine v2 cross-repo contracts)"
  - aa6e7e3 feat(memory): extend MemoryStatus (+3) and MemoryCorrectiveAction (+4) per ADR v2.4
  - 80aedd1 refactor(memory): remove legacy 'merge' action, align enum to ADR §14.3, bump to 0.1.0
  - 3a8264c docs(M): ROADMAP + STATE update — mini-phase M shipped
tests_added: 14 (smoke suite)
tests_total_at_close: 75 (Phase 0 + Phase 1 baseline + Phase M)
requirements_completed: [MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06, MEM-07, MEM-08, MEM-09]
requirements_completed_partial: []
---

# Summary — Plan M (mini-phase letter): Memory Engine v2 Contracts

## What was delivered

Greenfield Memory Engine v2 cross-repo contracts under `src/memory/`. Bridge-only mini-phase (zero consumer touch). Sub-path export `@x9-forge/contracts/memory` available for future X9 + Forge consumption.

### Source modules (`src/memory/`)

1. **`enums.ts`** (81 lines) — 4 stable enums:
   - `MemoryScopeSchema`: `'platform' | 'owner' | 'agent' | 'user'`
   - `MemoryTypeSchema`: `'profile' | 'procedural' | 'episodic' | 'relationship'`
   - `MemoryStatusSchema`: `'active' | 'invalidated' | 'superseded' | 'redacted' | 'archived'` (extended in commit `aa6e7e3` with 3 additional values per ADR v2.4)
   - `MemoryCorrectiveActionSchema`: `'invalidate' | 'pin' | 'promote' | 'demote' | 'redact' | 'forget'` (originally 7 values; `'merge'` removed in commit `80aedd1` per ADR §14.3 alignment)

2. **`temporal.ts`** (27 lines) — `TemporalSemanticsSchema`: `{ validAt, invalidAt?, supersedes?, supersededBy? }`

3. **`identity.ts`** (32 lines) — `MemoryIdentityEnvelopeSchema`: `{ tenantId, ownerId?, agentId?, userId? }`

4. **`write-candidate.ts`** (79 lines) — `MemoryWriteCandidateSchema`: payload extractor pre-persistence with composed fields `{ scope, type, subtype?, confidence, content, identity, temporal, source, privacy }`

5. **`recall-bundle.ts`** (77 lines) — `RecallBundleSchema`: payload memory-svc → agent-core `{ profile, procedural, relationships, episodes, auditMeta }`

6. **`retention.ts`** (53 lines) — `RetentionPolicyMetadataSchema`: `{ retentionClass, ttlSeconds?, archivalPolicy, purgeEligible }`

7. **`index.ts`** (24 lines) — barrel `export * from` each module + JSDoc explaining "shape stabile, implementazione libera" principle

### Sub-path export

Added to `package.json` `exports`:
```json
"./memory": {
  "import": "./dist/memory/index.js",
  "require": "./dist/memory/index.js",
  "types": "./dist/memory/index.d.ts"
}
```

### Tests

`tests/memory.smoke.test.ts` — 14 tests:
- Zod parse success on example payload per schema
- Type inference via `z.infer` compiles
- Enum exhaustiveness verified

## Requirements addressed

This mini-phase had no formal REQ-IDs in the original v1.0 traceability table (added post-roadmap). Backfilled at v1.0 archival as **MEM-01..09**:

- **MEM-01**: `MemoryScope` enum (4 values)
- **MEM-02**: `MemoryType` enum (4 values)
- **MEM-03**: `MemoryStatus` enum (8 values post-extension)
- **MEM-04**: `MemoryCorrectiveAction` enum (6 values post-merge-removal)
- **MEM-05**: `TemporalSemantics` envelope
- **MEM-06**: `MemoryIdentityEnvelope` envelope
- **MEM-07**: `MemoryWriteCandidate` payload (composed)
- **MEM-08**: `RecallBundle` payload (composed)
- **MEM-09**: `RetentionPolicyMetadata` envelope

All 9 schemas are reachable from sub-path `@x9-forge/contracts/memory`.

## Notable implementation detail

- Mini-phase scope was deliberately bridge-only: no X9/Forge code touched, no shim added (no consumer exists yet)
- Memory v2 X9 refactor will consume from the sub-path when initiated; until then the schemas are "anticipated contracts" preventing T0-of-refactor drift
- Two post-merge updates (commits `aa6e7e3` + `80aedd1`) refined the enums per ADR v2.4 alignment — both were pre-emptive surface adjustments before any consumer exists

## Verification

- `pnpm build` — clean (`dist/memory/` populated with 7 .js + 7 .d.ts)
- `pnpm test -- --run tests/memory` — 14/14 passing in 1.24s (verified at backfill 2026-04-16)
- Sub-path import smoke: `require('./dist/memory/index.js')` resolves all 9 schemas

## Notes (backfill)

Reconstructed on 2026-04-16 from:
- `M-PLAN.md` (intent + 5 sub-tasks + binary success criteria)
- Git commits `cbfbe1d` (initial atomic commit on `mini-phase-memory-contracts` branch), `7422bdf` (merge with --no-ff preserving atomic commit per Plan), `aa6e7e3` + `80aedd1` (post-merge enum refinements per ADR v2.4), `3a8264c` (ROADMAP + STATE update)
- On-disk `src/memory/*.ts` (7 files, 528 LOC re-read at backfill)
- On-disk `tests/memory.smoke.test.ts` (14/14 green at backfill)
- `package.json` exports field (verified `./memory` sub-path present)
- Project memory: `project_bridge.md` (Phase M shipped 2026-04-15)
- ROADMAP.md "Phase M" detail line + STATE.md "Phase M (mini-phase)" detail block

The work was real, atomically committed, merged via `--no-ff` per Plan, and released as part of v1.0. Only the SUMMARY/VERIFICATION write steps were missed (mini-phase didn't trigger the standard auto-chain artifact authoring).
