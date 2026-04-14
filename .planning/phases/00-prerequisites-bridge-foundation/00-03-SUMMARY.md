# Plan 00-03 SUMMARY — Forge v2 TypeScript 6.0.2 + exactOptionalPropertyTypes

**Shipped:** 2026-04-14 (same session as 00-02)
**Branch:** `bridge-migration/zod-v4` (piggyback with 00-02)
**Merge:** `9512aef` (into main forge-v2, pushed origin)
**Commits:** 2 atomic
**Status:** ✅ COMPLETE

---

## Objective met

Bumped TypeScript from `^5.9.3` / `^5.0.0` to `^6.0.2` across 8 Forge v2 workspace members, and enabled `exactOptionalPropertyTypes: true` in `packages/types/tsconfig.json` to prevent pitfall P-14 (semantic asymmetry between Forge and the bridge `@x9-forge/contracts` which already uses this flag).

---

## Deviations from plan

### Deviation 1: `ignoreDeprecations: "6.0"` flag added (plan said "not in scope")

Plan 00-03 explicitly declared `noUncheckedIndexedAccess` and `ignoreDeprecations` as **NOT in scope** — only `exactOptionalPropertyTypes` + TS bump.

However, the TS 6 bump surfaced `TS5107 moduleResolution=node10 deprecation` errors in `packages/db` + `packages/types`, blocking `pnpm -r typecheck`. Resolution options were:
- (A) Add `ignoreDeprecations: "6.0"` — minor deviation, aligned with bridge (00-01 SUMMARY documented same flag)
- (B) Migrate `moduleResolution` to `"node16"` / `"bundler"` — larger change, introduces its own cascade

**Chose (A)** as surgical fix. Documented in commit message. Bridge `@x9-forge/contracts` already uses the same flag, so Forge is now fully aligned.

### Deviation 2: `packages/shared` tsconfig gained `"types": ["node"]`

TS 6 is stricter about auto-resolving `@types/node` when `"lib"` is explicitly declared. `packages/shared` had `lib: ["ES2022"]` without `types`, and TS 6 emitted `TS2591 Cannot find name 'process'` / `TS2584 Cannot find name 'console'` on `validate-env.ts`. Adding `"types": ["node"]` resolves the cascade (4 errors → 0). Zero-risk fix.

### Deviation 3: `web/` excluded (continuity with 00-02 R-07)

`web/` kept on `typescript@~5.9.3`, consistent with the zod v3 exclusion rationale (R-07). Web does not consume the bridge.

---

## Results (binary success criteria)

- [x] `pnpm why typescript`: `6.0.2` on 8/8 targets (db, shared, types + 5 services). `5.9.3` residual only in `web/` (R-07 debt).
- [x] `packages/types/tsconfig.json` contains `"exactOptionalPropertyTypes": true` (line 12)
- [x] `pnpm -r build` exit 0
- [x] `pnpm -r test` exit 0, 229/229 passed
- [x] `pnpm -r typecheck` exit 0
- [x] Zero `@ts-ignore` added
- [x] Zero `@ts-expect-error` added
- [x] Staging deploy 8/8 forge-v2 containers healthy (gate 00-03.4)
- [x] 30min monitor zero error loop
- [x] Branch merged into main forge-v2 with merge commit `9512aef`

---

## Metrics

| Metric | Value |
|---|---|
| Atomic commits | 2 |
| TS 6 errors surfaced | 6 |
| Fixes applied | 3 tsconfig edits (`ignoreDeprecations` x2 + `types: [node]` x1) |
| `exactOptionalPropertyTypes` cascade errors | **0** |
| `@ts-ignore` / `@ts-expect-error` added | 0 |
| Test regression | 0 (229/229) |
| Duration | ~20 min migration + 30 min deploy + 30 min monitor |

---

## Key insight

`exactOptionalPropertyTypes: true` had **zero cascade impact** because `packages/types` source was already written using the correct pattern (`{ foo?: T }` instead of `{ foo?: T | undefined }`). Similarly, no consumer service was passing `{ foo: undefined }` to optional-property targets. The flag enabled with zero code edits is evidence of disciplined prior work.

TS 6 surfaced only 6 errors — all minor, all resolved with 3 tsconfig additions. No source `.ts` file was modified.

---

## Commits

```
86ec9f5 feat(forge-types): enable exactOptionalPropertyTypes: true
0de81ee chore(forge): bump typescript ^5 → ^6.0.2 + TS6 tsconfig fixes
```

Preserved in main via `--no-ff` merge `9512aef`.

---

## Pitfall mapping outcome

| Pitfall | Prevented via |
|---|---|
| P-14 `exactOptionalPropertyTypes` asymmetry Forge ↔ bridge | Flag now enabled on `packages/types/tsconfig.json` → matches bridge (00-01) and agent-x9 |
| P-09 `any` slipping in | Zero `any` / `@ts-ignore` added (audit confirms) |
| P-02 Zod type drift | TS 6 cross-service typecheck exercised zod v4 inference — zero drift emerged |
| P-27 Snapshot drift | Baseline typecheck log diffed to zero new errors (post-fix) |

---

## Rollback safety net (active until 2026-04-21)

Same as 00-02. Rollback post-merge: `git revert -m 1 9512aef && git push origin main && rsync + rebuild`.

---

## Downstream unlocks

Plan 00-03 closes Phase 0 requirements MGRT-02 + MGRT-03. Combined with 00-02 (MGRT-01) and 00-01 (BRDG + OBS + doc), Forge v2 is now a legitimate consumer of `@x9-forge/contracts`:

- `zod@^4` ✓ (peer dep of bridge)
- `typescript@^6.0.2` ✓ (matches bridge build toolchain)
- `exactOptionalPropertyTypes: true` ✓ (matches bridge strict semantics)

**Phase 1 (Capability Contracts) can now start** — Forge can `import` from `@x9-forge/contracts` with aligned zod v4 + TS 6 + eopt semantics.

Only 00-04 (dev-loop verification) remains to close Phase 0.

---

*Summary written 2026-04-14 post-merge.*
