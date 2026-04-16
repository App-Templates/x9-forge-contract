---
phase: 3
slug: auth-headers-discriminated-block-c
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-15
verified: 2026-04-15
backfilled_frontmatter: 2026-04-16
---

> **Frontmatter flip note (2026-04-16):** Original draft frontmatter was never updated post-execution despite 03-VERIFICATION.md being authored 2026-04-15 with status:passed (12/12 must_haves). Flipped at v1.0 archival to reflect actual state.

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | AUTH-01 | — | AuthInternalSecret literal record typed | unit | `pnpm test -- auth` | ❌ W0 | ✅ green |
| 3-01-02 | 01 | 1 | AUTH-02 | — | AuthInternalToken literal record typed | unit | `pnpm test -- auth` | ❌ W0 | ✅ green |
| 3-01-03 | 01 | 1 | AUTH-03 | T-3-01 | Zod header validator rejects wrong header type | unit | `pnpm test -- auth` | ❌ W0 | ✅ green |
| 3-01-04 | 01 | 1 | AUTH-04 | T-3-02 | createBridgeClient rejects mismatched auth at compile-time | unit | `pnpm test -- http` | ❌ W0 | ✅ green |
| 3-01-05 | 01 | 1 | HTTP-12 | — | Skeleton client fetch wrapper zero-dep | unit | `pnpm test -- http` | ❌ W0 | ✅ green |
| 3-02-01 | 02 | 2 | AUTH-04 | T-3-03 | Forge X9Client uses createBridgeClient for pilot endpoint | integration | `pnpm test -- --run` | ❌ W0 | ✅ green |

*Status: ✅ green · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth/auth-headers.test.ts` — stubs for AUTH-01, AUTH-02, AUTH-03
- [ ] `tests/http/bridge-client.test.ts` — stubs for AUTH-04, HTTP-12

*Existing vitest infrastructure covers test runner needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bug #15 regression | AUTH-03 | Requires removing header from Forge x9.client.ts mock and verifying TS build failure | Remove `X-Internal-Token` header from mock call, run `tsc --noEmit`, expect error |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references — files now exist under `src/auth/`, `src/http/`, `tests/auth/`, `tests/http/`
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-15, frontmatter flip backfilled 2026-04-16 — see 03-VERIFICATION.md for 12/12 must_haves)
