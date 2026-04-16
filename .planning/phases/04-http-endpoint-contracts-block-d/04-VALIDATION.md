---
phase: 4
slug: http-endpoint-contracts-block-d
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-15
verified: 2026-04-15
backfilled: true
backfill_reason: "Phase 4 ran with VERIFICATION.md authored 2026-04-15 (PASSED 14/14 must_haves) but VALIDATION.md was never created. Backfilled at v1.0 archival to formalize Nyquist compliance on disk."
---

# Phase 4 — Validation Strategy

> Per-phase validation contract. Backfilled 2026-04-16 — Phase 4 shipped 2026-04-15 with 4 per-plan SUMMARYs + VERIFICATION (14/14 PASSED) + REVIEW + REVIEW-FIX. Nyquist compliance verified post-hoc.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 (bridge) + vitest in agent-x9 + Forge |
| **Config file** | `vitest.config.ts` (bridge); per-service in consumers |
| **Quick run command** | `pnpm test -- --run tests/http` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~3s http suite alone; ~95s full bridge; ~2min cross-repo |

---

## Sampling Rate

- **After every task commit:** `pnpm test -- --run tests/http` + `pnpm build`
- **After every plan wave:** Full bridge suite + cross-repo affected services (cap-voice, agent-core, factory, voice)
- **Before phase close:** Full bridge + X9 agent-core + X9 cap-voice + Forge factory + Forge voice — all green
- **Max feedback latency:** 10s (bridge); cross-repo waves accept ~2min

---

## Per-Plan Verification Map

| Plan | Wave | Requirement | Verification | Test Type | Status |
|------|------|-------------|--------------|-----------|--------|
| 04-01 | 1 | HTTP-01..14 | `pnpm test -- --run tests/http/endpoints` (115 new tests + 11 endpoint contracts + real fixtures) | unit | ✅ green |
| 04-02 | 1 | HTTP-05, HTTP-12 | `pnpm test -- --run tests/http/sse-frames + sse-parser` (28 new tests) | unit | ✅ green |
| 04-03 | 2 | HTTP-01..14 (X9 consumer) | X9 cap-voice + agent-core test suites + Fastify schema integration + contract drift guard | integration | ✅ green (8/9 tasks; 04-03-09 staging deploy operator-deferred) |
| 04-04 | 2 | HTTP-01..11 (Forge consumer subset) | Forge factory + voice test suites; `x9.client.ts`, `voice.ts`, `factory.ts` use createBridgeClient | integration | ✅ green (8/10 tasks; 04-04-09/10 staging fixture+smoke operator-deferred) |

---

## Wave 0 Requirements

- [x] vitest already installed (Phase 0)
- [x] `tests/http/` + `tests/http/endpoints/` + `tests/http/fixtures/` directories created during 04-01 execution
- [x] 11 real fixtures captured from staging logs/curl per HTTP-01..11
- [x] SSE frame fixtures for HTTP-05

---

## Manual-Only Verifications

| Behavior | Plan | Why Manual | Status |
|----------|------|------------|--------|
| Cross-repo drift guard CONFIRMED (X9 agent-core contract test catches bridge schema drift) | 04-03 | Manual test by introducing intentional bridge schema change | ✅ Verified per Phase 4 closure |
| X9 staging deploy 8/8 healthy | 04-03 | VPS SSH + container observation | ⌛ Operator-deferred (04-03-09) |
| Forge staging fixture capture (live JSON from staging) | 04-04 | Requires staging access | ⌛ Operator-deferred (04-04-09) |
| Forge e2e staging smoke (briefing + voice + webhook + internal/turn streaming) | 04-04 | Requires multi-service orchestration on staging | ⌛ Operator-deferred (04-04-10) |

The 3 operator-deferred items are documented in `deferred-items.md` and explicitly accepted as v1.0 scope for operator action (not blockers — bridge code is complete and tested).

---

## Code Review Closure

- `04-REVIEW.md`: 0 critical / 5 warning / 4 info (per Phase 4 review)
- `04-REVIEW-FIX.md`: closure trail (some fixes applied immediately, some deferred to Phase 4.1 R-09 closure, some accepted as documented v1.0 trade-offs)

---

## Validation Sign-Off

- [x] All plans have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: every plan ends with cross-repo or full-suite verification
- [x] Wave 0 covers all infrastructure (vitest + fixtures + endpoints directory)
- [x] No watch-mode flags
- [x] Feedback latency < 10s (bridge); cross-repo waves accept longer
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-15, VALIDATION.md backfilled 2026-04-16 — see 04-VERIFICATION.md for PASSED 14/14 must_haves)
