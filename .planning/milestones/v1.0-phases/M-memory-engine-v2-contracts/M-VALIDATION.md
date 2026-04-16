---
phase: M
slug: memory-engine-v2-contracts
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-15
verified: 2026-04-16
backfilled: true
backfill_reason: "Letter mini-phase format didn't trigger VALIDATION.md authoring. Backfilled at v1.0 archival to formalize Nyquist compliance on disk."
---

# Phase M — Validation Strategy

> Per-mini-phase validation contract. Backfilled 2026-04-16 — Phase M shipped 2026-04-15 with single-PLAN execution + smoke-test gate; Nyquist compliance verified post-hoc against M-VERIFICATION.md (7/7 must_haves passed).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 (existing, bridge pattern Phase 0) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- --run tests/memory` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~1.2s memory smoke alone; ~95s full bridge |

---

## Sampling Rate

- **After every task commit:** `pnpm test -- --run tests/memory` (smoke) + `pnpm build`
- **Before merge:** Full bridge suite + sub-path import smoke (`require('./dist/memory/index.js')`)
- **Max feedback latency:** 5s (memory smoke alone)

---

## Per-Task Verification Map

| Task | Wave | Requirement | Verification | Test Type | Status |
|------|------|-------------|--------------|-----------|--------|
| M-01.1 (enums) | 1 | MEM-01..04 | `pnpm test -- --run tests/memory` (parse + exhaustiveness) | unit | ✅ green |
| M-01.2 (temporal + identity) | 1 | MEM-05, MEM-06 | Same | unit | ✅ green |
| M-01.3 (write-candidate + recall + retention) | 1 | MEM-07..09 | Same (composed schemas verified) | unit | ✅ green |
| M-01.4 (barrel + sub-path export) | 2 | infra | `pnpm build` + sub-path require smoke | build | ✅ green |
| M-01.5 (smoke test) | 2 | all MEM | Smoke covers all 9 schemas | unit | ✅ green |
| M-01.6 (atomic commit + --no-ff merge) | 3 | process | `git log` confirms cbfbe1d + 7422bdf shape | manual | ✅ green |

---

## Wave 0 Requirements

- [x] vitest 3.2.4 already installed (Phase 0 baseline)
- [x] `tests/` directory already configured
- [x] No new framework install needed

---

## Manual-Only Verifications

| Behavior | Why Manual | Verified |
|----------|------------|----------|
| Atomic commit + `--no-ff` merge per Plan strategy | git history shape verification | ✅ Verified — `cbfbe1d` preserved as separate node via `7422bdf` |
| Zero consumer X9/Forge touched | Cross-repo grep + commit-scope review | ✅ Verified — none of the 5 Phase M commits touched X9 or Forge |

---

## Validation Sign-Off

- [x] All tasks have build + test gates
- [x] Sampling continuity: every task ends with smoke + build
- [x] Wave 0 covers infrastructure (no new install needed)
- [x] No watch-mode flags
- [x] Feedback latency < 5s (memory smoke)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-16, backfilled — see M-VERIFICATION.md)
