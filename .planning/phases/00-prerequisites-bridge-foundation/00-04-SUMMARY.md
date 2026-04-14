# Plan 00-04 SUMMARY — Dev-Loop Verification End-to-End

**Shipped:** 2026-04-14 (same session as 00-02 + 00-03)
**Branches used:** `dev-loop-verify` on all 3 repos (all deleted post-verify)
**Status:** ✅ COMPLETE with **partial Forge verification** — R-08 documented for Phase 1

---

## Objective met (partially)

Empirically validated the dev-loop pattern `pnpm.overrides` + `link:` + `exports` field:

- ✅ **X9 (full verify):** symlink creation, probe import, round-trip break/restore propagation
- ✅ **Forge (partial verify):** symlink creation OK, but TS resolver rejected bridge's `exports` field due to `moduleResolution: node` (classic). Identified as **R-08** — blocker for Phase 1 Forge bridge consumption, not Phase 0.

---

## Results

### X9 dev-loop — EMPIRICAL VERIFY PASSED ✅

1. **Symlink created:** `agent-x9/node_modules/@x9-forge/contracts → ../../../x9-forge-contract-bridge` (via `pnpm.overrides` + explicit `dependencies["@x9-forge/contracts"]: link:...` fallback — overrides-alone was not sufficient in pnpm 9.15.9)
2. **Probe import resolved:** `packages/types/src/__dev-loop-probe.ts` importing `DummyProbe` type from `@x9-forge/contracts` → typecheck exit 0
3. **Round-trip test:**
   - Modified `DummyProbe = { ok: true }` → `{ ok: true; version: number }` in bridge, rebuilt
   - X9 `packages/types` typecheck detected change immediately: `error TS2741: Property 'version' is missing in type '{ ok: true; }'`
   - Zero `pnpm install` between bridge change and consumer detection — pure filesystem symlink resolution
   - Restored original shape → typecheck green again
   - **Round-trip timing: <5s** (well under 10s success criterion)

### Forge dev-loop — PARTIAL VERIFY ✅+

1. **Symlink created:** identical fallback pattern worked. `forge-v2/node_modules/@x9-forge/contracts → ../../../x9-forge-contract-bridge`
2. **Probe file created:** `packages/types/src/__dev-loop-probe.ts`
3. **Typecheck FAILED with `TS2307`:**
   ```
   Cannot find module '@x9-forge/contracts' or its corresponding type
   declarations. There are types at '[...]/node_modules/@x9-forge/
   contracts/dist/index.d.ts', but this result could not be resolved
   under your current 'moduleResolution' setting. Consider updating
   to 'node16', 'nodenext', or 'bundler'.
   ```
4. **Root cause identified:** Forge `packages/types/tsconfig.json` uses `moduleResolution: "node"` (classic) which does NOT read the `exports` field of the bridge `package.json`. X9 works because `tsconfig.base.json` uses `moduleResolution: "NodeNext"`.
5. **Finding promoted to R-08** (blocker for Phase 1 Forge, not Phase 0).

---

## New risk documented: R-08

**R-08: Forge `packages/types` + 5 services use `moduleResolution: node` (classic) which cannot resolve the bridge's `exports` field.**

| Field | Value |
|---|---|
| Blocker for | Phase 1 Forge bridge consumption |
| Scope of fix | Update `moduleResolution` in Forge `packages/types/tsconfig.json` + 5 `services/*/tsconfig.json` to `node16` (or `nodenext` / `bundler`) |
| Side effect risk | `node16` requires `.js` extension in import statements (ESM-compatible). Forge source currently uses extensionless imports → cascade fix needed |
| Alternative | Add explicit `paths` mapping in consumer tsconfig (bypass `exports` field) — less clean |
| Phase 1 task insertion | Pre-requisite task for any Phase 1 plan that imports types from `@x9-forge/contracts` in Forge. Plan title suggestion: `phase-1-00-forge-moduleresolution-upgrade` |

---

## Cleanup (Task 00-04.5) — Zero residual

All 3 repos verified clean post-cleanup:

- **Bridge:** `src/index.ts` restored to baseline (only `export {};`). `dev-loop-verify` branch deleted. `git status` clean.
- **X9:** `packages/types/src/__dev-loop-probe.ts` deleted. `package.json` restored (no `dependencies["@x9-forge/contracts"]`, no `pnpm.overrides`). `pnpm install` reconciled lockfile to main. `dev-loop-verify` branch deleted. `git status` clean (except pre-existing `.planning/reference/openclaw-test2` submodule drift unrelated to this plan).
- **Forge:** `packages/types/src/__dev-loop-probe.ts` deleted. `package.json` restored. `dev-loop-verify` branch deleted. `git status` shows only pre-existing `packages/{db,shared}/dist/*` artifacts (rebuild noise, not related to dev-loop).

Final sanity:
- Bridge `pnpm typecheck`: exit 0
- X9 `packages/types` typecheck: exit 0
- Forge: 8/8 workspace typecheck exit 0, 229/229 tests passed (same baseline as pre-00-04)

---

## Deviations from plan

### Deviation 1: Explicit `dependencies` + `pnpm.overrides` both needed

Plan 00-04.1 step 7 documented this as fallback B. `pnpm@9.15.9` does not materialize a symlink in `node_modules` based on `overrides` alone — it requires either an explicit `dependencies["@x9-forge/contracts"]: link:...` or a workspace-declared dep. Used fallback B (dep + override both on branch, cleaned up at 00-04.5). Fallback worked identically on X9 and Forge.

### Deviation 2: Round-trip test on X9 only (Forge blocked by R-08)

Plan 00-04.4 specified round-trip on both consumers. Forge blocked at step 00-04.3 due to R-08. X9 round-trip verified the pattern empirically; Forge round-trip **unreachable** until R-08 resolved (Phase 1).

The pattern itself is validated on X9; Forge's issue is a config lag, not a pattern flaw.

---

## Success criteria (plan-level, binari)

- [x] Dev-loop X9: verifica empirica positiva (round-trip break/restore < 5s)
- [x] Dev-loop Forge: verifica **partial** (symlink ✓, resolution fails due to R-08)
- [x] Timing round-trip X9 < 10s
- [x] Cleanup completo: zero residuo in main di X9, Forge, bridge
- [x] README del bridge (da 00-01) descrive correttamente il pattern — confermato su X9
- [x] Branch `dev-loop-verify` cancellati in tutti e 3 i repo
- [x] BRDG-06 marcato verified (X9) / partial (Forge with R-08 path documented)

---

## Pitfall mapping outcome

| Pitfall | Outcome |
|---|---|
| P-01 Compat shim loop | ✓ Bridge has only `export {}` + `DummyProbe` — zero loop risk |
| P-04 Version drift monorepo hoisting | ✓ Fallback B (explicit link dep) worked consistently on both consumers |
| P-15 Docker build | Out of scope 00-04, carried to Phase 1 prerequisite |
| P-26 pnpm link stale cache | ✓ Round-trip < 5s — cache behaves correctly |
| P-28 README drift vs pratica | ⚠️ README correct for X9 pattern, but should note Forge moduleResolution prerequisite. Suggested: append a "Consumer prerequisites" section to bridge README in Phase 1 |

---

## Phase 0 CLOSURE

With 00-04 shipped, **Phase 0 is COMPLETE** (4/4 plans):

- ✅ 00-01 Bridge scaffolding
- ✅ 00-02 Forge zod v3→v4
- ✅ 00-03 Forge TS 5→6 + exactOptionalPropertyTypes
- ✅ 00-04 Dev-loop verification (X9 full, Forge partial with R-08)

**Requirements completed (12/12):**
- BRDG-01..05 (bridge scaffolding via 00-01)
- BRDG-06 verified X9, partial Forge (R-08 documented) via 00-04
- MGRT-01 via 00-02
- MGRT-02 via 00-03
- MGRT-03 via 00-03
- OBS-01..03 via 00-01

**Risks open carried to Phase 1:**
- R-07 web/ MCP SDK zod@3 debt (documented in 00-02)
- R-08 Forge moduleResolution upgrade (new, documented in 00-04)

**Branches preserved for 7d safety net (do not delete before 2026-04-21):**
- forge-v2: `bridge-migration/zod-v4`

---

## Next

Phase 1 (Capability Contracts) ready to start. Prerequisites for Phase 1 Forge plans:
1. Pre-plan task: `phase-1-00-forge-moduleresolution-upgrade` (resolves R-08)
2. Pre-plan task: Dockerfile `COPY packages/<bridge>` pattern (resolves P-15)

---

*Summary written 2026-04-14 post-cleanup.*
