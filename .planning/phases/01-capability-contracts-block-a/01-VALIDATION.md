---
phase: 1
slug: capability-contracts-block-a
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-15
verified: 2026-04-15
backfilled: true
backfill_reason: "Phase 1 ran with VERIFICATION.md authored 2026-04-15 (passed 17/17 must_haves) but VALIDATION.md was never created. Backfilled at v1.0 archival to formalize Nyquist compliance on disk."
---

# Phase 1 — Validation Strategy

> Per-phase validation contract. Backfilled 2026-04-16 — Phase 1 shipped 2026-04-15 with full per-plan SUMMARY trail + VERIFICATION.md (17/17 must_haves). Nyquist compliance verified post-hoc.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- --run tests/capability` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~2s capability suite alone; ~95s full bridge |

---

## Sampling Rate

- **After every task commit:** `pnpm test -- --run tests/capability` + `pnpm build`
- **After every plan wave:** Full bridge suite + cross-repo (X9 typecheck + Forge typecheck on plans 01-02 + 01-03)
- **Before phase close:** Full bridge + X9 + Forge test suites green
- **Max feedback latency:** 10s (bridge); ~1min (cross-repo)

---

## Per-Plan Verification Map

| Plan | Wave | Requirement | Verification | Test Type | Status |
|------|------|-------------|--------------|-----------|--------|
| 01-01 | 1 | CAPA-01..06, TEST-01,02,03,05 | `pnpm test -- --run tests/capability` (57 tests + real fixtures) | unit | ✅ green |
| 01-02 | 2 | MGRT-04 | X9 `packages/types/` re-export + `pnpm typecheck` (X9-side); `scripts/generate-registry.ts` produces canonical shape | integration | ✅ green |
| 01-03 | 3 | CAPA-01, CAPA-04, CAPA-05, MGRT-05, TEST-02, TEST-05 | Forge `packages/types/src/x9.ts` re-export + `pnpm test` Forge factory + contract test end-to-end | integration | ✅ green |

---

## Wave 0 Requirements

- [x] vitest 3.2.4 already installed (Phase 0)
- [x] `tests/capability/` directory created during 01-01 execution
- [x] Real production fixtures captured under `tests/capability/fixtures/`
- [x] Cross-repo: agent-x9 + forge-v2 already on bridge-compatible TS/Zod baseline (Phase 0)

---

## Manual-Only Verifications

| Behavior | Plan | Why Manual | Verified |
|----------|------|------------|----------|
| Real-fixture parse on staging-captured `GET /cap-calendar/manifest` JSON | 01-01 | Requires staging X9 + curl | ✅ Verified per 01-01 SUMMARY (real fixture from cap-calendar) |
| X9 + Forge build + test + deploy staging green post-migration | 01-02, 01-03 | Multi-repo, multi-runtime | ✅ Verified per 01-VERIFICATION (cross-repo test counts) |

---

## Validation Sign-Off

- [x] All plans have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: every plan ends with cross-repo or full-suite verification
- [x] Wave 0 covers all infrastructure
- [x] No watch-mode flags
- [x] Feedback latency < 10s (bridge); cross-repo accepts longer
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-15, VALIDATION.md backfilled 2026-04-16 — see 01-VERIFICATION.md for 17/17 must_haves)
