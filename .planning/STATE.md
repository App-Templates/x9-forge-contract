---
gsd_state_version: 1.0
milestone: null
milestone_name: null
status: between_milestones
last_completed_milestone: v1.0
last_completed_milestone_name: Bridge Foundation
last_completed_milestone_date: 2026-04-16
last_updated: "2026-04-16T15:35:00.000Z"
last_activity: 2026-04-16 -- v1.0 Bridge Foundation milestone closed (PR #1 merged, git tag v1.0)
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-16 after v1.0 close)

**Core value:** Un cambio di contratto cross-repo che rompe la compatibilità DEVE generare errore di compilazione in entrambi i repo.
**Current focus:** Between milestones — ready to plan v1.1 (Shim Cleanup + Bookkeeping) when user is ready.

## Current Position

**Status:** Between milestones
**Last completed:** v1.0 Bridge Foundation (2026-04-16, PR #1 merged, git tag `v1.0`)

To start the next milestone: `/clear` then `/gsd-new-milestone`.

## Last Milestone Summary (v1.0)

- **Phases:** 8 (0, 1, 2, 3, 4, 04.1, 5, 6) + Phase M letter mini-phase — all archived under `.planning/milestones/v1.0-phases/`
- **Plans:** 24 + 1
- **Tests:** 384/384 pass across 42 files
- **Sub-paths built:** 8/8 (`./capability`, `./agent`, `./auth`, `./http`, `./vault`, `./model-router`, `./memory`, root)
- **Closing PR:** #1 (code commit `1d709a1` on `main`)
- **Audit history:** initial `gaps_found` (bookkeeping) → re-audit `passed` after 11-commit chirurgico backfill (2026-04-16). Verdict: 65/66 in-scope satisfied + 1 operator-deferred (TEST-04); 0 partial/unsatisfied/orphaned.
- **Tag:** `v1.0` re-anchored at HEAD `cccb722` (full archive bundle) — local-only, push pending OK

## v1.7.0 Hotfix Release (2026-05-05)

**Status:** Released locally on `phase/37.7-bridge-rag-contracts`; pushed to origin pending Stefano R-05 OK.

**Trigger:** forge-v2 Phase 19 Plan 02 deploy attempt 2026-05-04 — vault-svc crashed with `ERR_PACKAGE_PATH_NOT_EXPORTED` on `@x9-forge/contracts/auth` because bridge was full-ESM and forge-v2 services compile to CJS. Phase 19 PAUSED; Phase 18.1 opened to fix the structural bug in the bridge.

**Scope (6 atomic commits ahead of `4f2da00` v1.6.3 baseline):**
1. `build(bridge)`: dual ESM+CJS via zshy + back-fill `./capability/stt` source (Plan 00 Task 1) — `5b7e9c7`
2. `chore(scripts)`: extend `check-portable-dts.mjs` walker to `.d.cts` + `.d.mts` (Plan 00 Task 2) — `60a0598`
3. `test(bridge)`: add CJS + ESM smoke tests for every public subpath (Plan 01 Task 1) — `2aeafb8`
4. `chore(deps,scripts)`: wire publint + ATTW + cjs-smoke into `pnpm test/check:pack` (Plan 01 Task 2) — `10bcae8`
5. `docs(changelog)`: v1.7.0 entry (Plan 02 Task 1) — `db881ab`
6. `release: 1.6.3 → 1.7.0` (Plan 02 Task 2) — `8fa71b0`

**Tags:**
- `v1.7.0` → `8fa71b0` (release commit)
- `pre-phase-18.1-2026-05-05` → `4f2da00` (rollback anchor)

**Validation:** All four layers green — `cjs/smoke.cjs` 13/13, `esm/smoke.test.ts` 11/11 (vitest 711/711 total), `publint`, `attw --pack . --profile node16 --ignore-rules false-cjs` (per RESEARCH.md Pattern 4 — documented benign).

**Consumer follow-up:** forge-v2 `pnpm.overrides["@x9-forge/contracts"]` must bump to v1.7.0 release SHA `8fa71b0` (forge-v2 Phase 18.1 Plan 02 Tasks 4-5).

**No breaking changes for ESM consumers.** Public API surface byte-identical for the 9 pre-existing subpaths (R-14 invariant verified). Net-new exports come only from back-filled `./capability/stt`.

**v1.1 milestone status:** still pending. v1.7.0 is a hotfix release outside the v1.1 scope; v1.1 carry-forward items (Phase 7 Shim Removal, etc.) remain un-started.

---

## v1.1 Carry-Forward (when ready)

**Active scope:**
- Phase 7 "Shim Removal + Final Consolidation" (opzionale — was original v1.0 stretch, deferred): MGRT-06, OBS-04, OBS-05
- Optional bookkeeping cleanup: back-fill VERIFICATION.md for Phases 0/2/6/M, fix stale VALIDATION frontmatter, add CHANGELOG.md (RLSE-04), document RLSE-02/03

**External cross-repo follow-ups:**
- MDRT-07 SC#7 — agent-x9 Phase 35 ROADMAP cross-repo cite (operator action in agent-x9 repo)
- agent-x9 vendor re-sync via `scripts/sync-bridge.sh` on `fix/docker-bridge-build-context` branch

**Operator-deferred staging tasks (carried from v1.0):**
- 04-03-09 X9 staging deploy
- 04-04-09 staging fixture capture
- 04-04-10 e2e staging smoke
- 05-03 vault sync-all live smoke

## Open Risks Carried Forward

- **R-07** — `web/` workspace stuck on zod@3 (MCP SDK upstream peer-dep chain). Defer until MCP SDK releases zod@4-compatible version.
- **R-08** — Forge `moduleResolution=node` legacy (partial close in v1.0 Phase 1). Stretches when next consumer migrates.
- Cosmetic: REQUIREMENTS.md said `HealthStatus = 'unhealthy'`, code uses `'down'` (CAPA-06 — fix in v1.1 bookkeeping pass).
- Legacy endpoint success responses keep domain-specific shapes (not standardized to `{ok, data}`) — documented v1.0 trade-off, revisit at next SHA bump.

## Blockers/Concerns

None active. v1.0 closed cleanly with explicit Known Gaps recorded.

## Session Continuity

Last session: 2026-04-16T15:35:00Z
Stopped at: v1.0 milestone closed via `/gsd-complete-milestone` (Path B).
Next action: `/clear` then `/gsd-new-milestone` (when ready to plan v1.1).

## Remote & baseline

- Bridge remote: `https://github.com/App-Templates/x9-forge-contract.git` (privato)
- Bridge tag: `v1.0` (commit `1d709a1` on `main`)
- Baseline tag agent-x9: `pre-bridge-migration-2026-04-14` (origin)
- Baseline tag forge-v2: `pre-bridge-migration-2026-04-14` (origin)
- VPS Hostinger snapshot: 2026-04-14 by Stefano via hPanel
