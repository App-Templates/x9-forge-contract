# Plan 00-02 SUMMARY — Forge v2 zod v3 → v4 Migration

**Shipped:** 2026-04-14
**Branch:** `bridge-migration/zod-v4` (forge-v2)
**Merge:** `9512aef` (into main forge-v2, pushed origin)
**Commits:** 6 atomic
**Status:** ✅ COMPLETE

---

## Objective met

Migrated all Forge v2 server-side workspace members from `zod@^3.25.76` to `zod@^4.3.6`:

- `packages/shared` (linked by all 5 services)
- `services/vault`
- `services/factory`
- `services/workspace`
- `services/voice`
- `services/docker`

Branch pushed to origin and then merged into main via `--no-ff` preserving atomic commits.

---

## Deviations from plan (documented 2026-04-14)

### Deviation 1: Scope expansion — `packages/shared` INCLUDED (not in original plan)

Post-baseline discovery (Task 00-02.0): `pnpm why zod -r` revealed `packages/shared` has `zod ^3.0.0` as a direct dependency and is linked via `@forge/shared link:` by all 5 services. The original plan listed only 5 services + `packages/types`. Excluding `packages/shared` would have left zod@3 transitive in every service → "zero zod@3" success criteria unreachable + dual-realm zod3+zod4 risk.

**Fix applied in-flight:** Added new first task `00-02.1 packages/shared` (migrated FIRST to avoid dual-realm state during subsequent service checkpoints). Tasks 00-02.1..7 renumbered 00-02.2..8. Documented in plan `Deviation 2026-04-14` section.

### Deviation 2: Scope exclusion — `web/` SPA EXCLUDED (technical debt R-07)

`web/` has direct `zod@3` + a 3-tier peer-dep chain (`@modelcontextprotocol/sdk@1.28.0` + `zod-to-json-schema@3.25.2` + `zod-validation-error@4.0.2`) that pins `zod@3` as a hard upstream constraint. `web/` does NOT consume the `@x9-forge/contracts` bridge (bridge is server-side only). Forcing web to zod@4 would require chasing MCP SDK upstream — out of scope Phase 0.

**Accepted as technical debt R-07.** Defer web migration to a dedicated future plan (`Plan 00.2`?) once MCP SDK releases a zod@4-compatible version.

### Deviation 3: Consolidation commit skipped

Original Task 00-02.7 (renumbered) prescribed a final "lockfile consolidation" commit. Lockfile was consolidated atomically across the 6 service/package commits — no residual changes to commit. Consolidation step became a verification-only gate.

---

## Results (binary success criteria)

- [x] Branch `bridge-migration/zod-v4` exists with 6 atomic commits (shared + 5 services)
- [x] `pnpm why zod -r`: zero `zod@3.x` residual in `services/*` + `packages/shared` + `packages/types`
- [x] `zod@3.x` residual ONLY in `web/` + MCP SDK chain (R-07 debt documented)
- [x] `pnpm -r build` exit 0 at every checkpoint
- [x] `pnpm -r test` exit 0, 229/229 tests passed (51 vault + 62 factory + 79 workspace + 24 voice + 13 docker = baseline preserved)
- [x] `pnpm -r typecheck` exit 0 (via 00-03)
- [x] Staging deploy 8/8 forge-v2 containers healthy (gate 00-02.8)
- [x] 30min monitor zero error loop
- [x] Merged into main with `--no-ff` (atomic commits preserved)
- [x] Baseline test count = new count (zero regression)

---

## Metrics

| Metric | Value |
|---|---|
| Total atomic commits | 6 |
| Breaking API fixes | 0 |
| Source edits | 0 |
| Duration | ~30 min migration + 30 min deploy + 30 min monitor |
| `@ts-ignore` added | 0 |
| Test regression | 0 |
| X9 downtime | 0 (agent-core uptime 24h+ continuous across deploy) |

---

## Key insight

Zod v4.3.6 has **100% backward compatibility** on every API actually used in Forge:
- `z.object`, `z.string`, `z.number`, `z.boolean`, `z.array`
- `.safeParse`, `.optional`, `.default`, `.min`, `.max`, `.regex`
- `z.ZodObject<T>`, `z.ZodRawShape`, `z.infer`
- `result.error.message`, `result.error.issues`
- `.merge()` (1 usage in vault, deprecated but functional)
- `z.string().url()` (2 usages in vault env schema, deprecated but functional)

Zero of the potentially breaking APIs were in use (`email()`, `strict()`, `passthrough()`, `.format()`, `.flatten()`, `_def` access, `nativeEnum`, `discriminatedUnion`).

The migration was a pure `package.json` version bump × 6 files + 6 atomic commits. No cascading fixes needed.

---

## Commits

```
b244611 chore(forge-docker): migrate zod v3 → v4
61927ad chore(forge-voice): migrate zod v3 → v4
9296ae4 chore(forge-workspace): migrate zod v3 → v4
c438a65 chore(forge-factory): migrate zod v3 → v4
1900158 chore(forge-vault): migrate zod v3 → v4
4c79bd9 chore(forge-shared): migrate zod v3 → v4
```

All preserved in main via `--no-ff` merge `9512aef`.

---

## Pitfall mapping outcome

| Pitfall | Prevented via |
|---|---|
| P-02 Zod schema → TS type drift | Per-service isolated bump + test-green per step = inference consistent |
| P-03 Zod sync versions | Final `pnpm why zod -r` confirms uniform 4.3.6 on all targets |
| P-04 Version drift monorepo | Atomic commits + `pnpm install` per step |
| P-27 Snapshot drift | Baseline test log diffed to zero regression |

---

## Rollback safety net (active until 2026-04-21)

- Branch `bridge-migration/zod-v4` preserved on origin for 7d
- Tag `pre-bridge-migration-2026-04-14` on both forge-v2 and agent-x9 (pushed origin)
- VPS snapshot 2026-04-14 (Stefano hPanel)
- Rollback command (soft): `git revert -m 1 9512aef && git push origin main && rsync + rebuild`

---

*Summary written 2026-04-14 post-merge.*
