---
phase: 3
slug: auth-headers-discriminated-block-c
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

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
| 3-01-01 | 01 | 1 | AUTH-01 | — | AuthInternalSecret literal record typed | unit | `pnpm test -- auth` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | AUTH-02 | — | AuthInternalToken literal record typed | unit | `pnpm test -- auth` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | AUTH-03 | T-3-01 | Zod header validator rejects wrong header type | unit | `pnpm test -- auth` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | AUTH-04 | T-3-02 | createBridgeClient rejects mismatched auth at compile-time | unit | `pnpm test -- http` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 1 | HTTP-12 | — | Skeleton client fetch wrapper zero-dep | unit | `pnpm test -- http` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | AUTH-04 | T-3-03 | Forge X9Client uses createBridgeClient for pilot endpoint | integration | `pnpm test -- --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
