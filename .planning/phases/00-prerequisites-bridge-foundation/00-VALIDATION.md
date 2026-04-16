---
phase: 0
slug: prerequisites-bridge-foundation
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-14
verified: 2026-04-16
backfilled: true
backfill_reason: "Phase 0 ran before VALIDATION.md was a hard-required artifact. Authored at v1.0 archival to formalize Nyquist compliance on disk."
---

# Phase 0 — Validation Strategy

> Per-phase validation contract. Backfilled 2026-04-16 — Phase 0 shipped 2026-04-14 with full per-plan SUMMARY trail; Nyquist gate verified post-hoc against 00-VERIFICATION.md (12/12 must_haves passed).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 (installed in Plan 00-01) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | <1s end-of-Phase-0 (smoke 2/2); ~95s post-v1.0 (full 384 tests) |

---

## Sampling Rate

- **After every task commit:** `pnpm build && pnpm test`
- **After every plan wave:** Full bridge suite + Forge `pnpm -r typecheck && pnpm -r test`
- **Before phase close:** Forge staging deploy 8/8 healthy + 30min monitor zero errors
- **Max feedback latency:** 10s (bridge); ~5min (Forge full multi-repo)

---

## Per-Plan Verification Map

| Plan | Wave | Requirement | Verification | Test Type | Status |
|------|------|-------------|--------------|-----------|--------|
| 00-01 | 1 | BRDG-01..05, OBS-01..03 | `pnpm install && pnpm build && pnpm test` (smoke 2/2 green) | unit + build | ✅ green |
| 00-02 | 2 | MGRT-01 | `pnpm why zod -r` (zero zod@3 in Forge server-side); 229/229 Forge tests | integration | ✅ green |
| 00-03 | 3 | MGRT-02, MGRT-03 | `pnpm -r build && pnpm -r test && pnpm -r typecheck` (Forge); staging deploy + 30min monitor | integration + e2e | ✅ green |
| 00-04 | 4 | BRDG-06 | Dev-loop round-trip <5s (X9 full; Forge partial → R-08 closed in Phase 1) | manual + automated | ✅ green (Forge promoted from partial after Phase 1) |

---

## Wave 0 Requirements

- [x] vitest 3.2.4 installed (Plan 00-01)
- [x] Initial smoke test in `tests/smoke.test.ts` (2 tests baseline)
- [x] CI workflow (GitHub Actions) — Plan 00-01

---

## Manual-Only Verifications

| Behavior | Plan | Why Manual | Verified |
|----------|------|------------|----------|
| Forge staging deploy 8/8 healthy + 30min monitor zero errors | 00-03 | Requires VPS SSH + container observation | ✅ Verified per 00-03 SUMMARY |
| Dev-loop round-trip propagation timing | 00-04 | Requires interactive bridge edit + consumer typecheck observation | ✅ Verified per 00-04 SUMMARY (<5s X9) |

---

## Validation Sign-Off

- [x] All plans have build + test gates
- [x] Sampling continuity: every plan ends with cross-repo or build verification
- [x] Wave 0 covers all infrastructure prerequisites
- [x] No watch-mode flags
- [x] Feedback latency < 10s (bridge); cross-repo waves accept longer
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-16, backfilled — see 00-VERIFICATION.md)
