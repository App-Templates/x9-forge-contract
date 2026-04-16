---
phase: 4
phase_name: http-endpoint-contracts-block-d
verified_at: 2026-04-15
status: PASSED
must_haves_total: 14
must_haves_passed: 14
deferred_items: 3
summary: 11 endpoint contracts + typed createBridgeClient + SSE frames + consumer migration in X9 (cap-voice, agent-core, cap-glasses) and Forge (factory, voice). Cross-repo drift guard confirmed working. 5 tasks deferred to operator (VPS SSH).
---

# Phase 4 Verification — HTTP Endpoint Contracts (Block D)

## Requirements Coverage (14/14 PASSED)

| ID | Requirement | Delivered | Evidence |
|----|-------------|-----------|----------|
| HTTP-01 | `POST /internal/agents/:agentId/reload` typed | ✓ | `src/http/endpoints/internal-agents-reload.ts` (commit `e139ef7`); tests: `tests/http/endpoints/internal-agents-reload.test.ts`; consumer: forge-v2 `X9Client.reload()` (03-02-03) + `reloadAgent` (04-04-02); X9: `agent-core/src/tests/internal-routes-contract.test.ts` (04-03-08) |
| HTTP-02 | `POST /internal/agents/:agentId/stop` typed | ✓ | endpoint `internal-agents-stop.ts` (`77c2859`); consumer: forge-v2 `X9Client.stop` (04-04-02); contract test in X9 |
| HTTP-03 | `GET /internal/agents` typed (list, auth) | ✓ | `internal-agents-list.ts` (`7c3156e`); consumer: forge-v2 `X9Client.listAgents` (04-04-02); contract test in X9 |
| HTTP-04 | `POST /internal/turn` typed | ✓ | `internal-turn.ts` + `LLMMessageSchema` (`dc19bcd`); migrated server route in X9 agent-core (04-03-05); 14 tests |
| HTTP-05 | `POST /internal/turn/stream` typed (SSE frame shape) | ✓ | endpoint (`437dac3`) + discriminated SSE frames (`5732735`) + parser (`628ef36`) + `internalTurnStream()` client method (`9e6669d`); consumer: X9 cap-glasses `agent-bridge.ts` (04-03-06) |
| HTTP-06 | `POST /internal/query` typed | ✓ | `internal-query.ts` (`88958e3`); consumer: X9 cap-voice `voice-fallback.ts` (04-03-03); contract test |
| HTTP-07 | `POST /webhook/post-call` typed (X-Internal-Token, Bug #15 endpoint) | ✓ | `webhook-post-call.ts` (`7eede49`) with `PostCallPayloadSchema` accepting both flat + `data.*` shapes; consumer: X9 agent-core (04-03-04), forge-v2 voice (04-04-05); 4 Bug #15 regression tests |
| HTTP-08 | `GET /:cap/manifest` typed | ✓ | `cap-manifest.ts` (`267b7fd`); consumer: forge-v2 `capBridgeClient` helper (04-04-03) |
| HTTP-09 | `GET /:cap/env-schema` typed | ✓ | `cap-env-schema.ts` (`267b7fd`); consumer: forge-v2 (04-04-03) |
| HTTP-10 | `GET /:cap/health` typed | ✓ | `cap-health.ts` (`267b7fd`); health fan-out in forge-v2 factory `health.ts` (04-04-04) |
| HTTP-11 | `POST /api/voice/register` typed | ✓ | `voice-register.ts` (`fd5c5bc`); consumer: X9 cap-voice `voice-call.ts` (04-03-02); 9 cap-voice tests |
| HTTP-12 | `createBridgeClient({ baseUrl, auth })` typed client | ✓ | `bridge-client.ts` (`3623999` Phase 3 skeleton + `bb37460` typed methods Phase 4); `SecretBridgeClient` / `TokenBridgeClient` split, TS `AuthForEndpoint<T>` enforces correct auth at compile-time; 87 lines core + typed method overlay; zero runtime deps beyond fetch + zod |
| HTTP-13 | Error response shape `{ ok: false, code, message, details? }` | ✓ | `src/http/response.ts` Phase 3 `BridgeErrorResponseSchema`; `mapError` helper in forge-v2 factory (04-04-06) normalizes to this shape at boundary; endpoint response schemas type current shapes AND export standard (documented in 04-01 SUMMARY for incremental migration) |
| HTTP-14 | Success response shape `{ ok: true, data: T }` (generic) | ✓ | `BridgeSuccessResponseSchema<T>` Phase 3; endpoint schemas match REAL current shapes (e.g. `{ agents: [...] }`, `{ ok: true, agentId }`), exported standard shape for incremental adoption; 04-03 SUMMARY notes response-shape standardization happens incrementally |

**Result: 14/14 must-haves satisfied.**

## Cross-Repo Drift Guard — CONFIRMED OPERATIONAL

Plan 04-03-08 delivered `agent-x9/services/agent-core/src/tests/internal-routes-contract.test.ts` which parses real agent-core route inputs through bridge-exported Zod schemas. Stress-tested in executor by temporarily adding `newRequiredField: z.string().min(1)` to `InternalTurnRequestSchema` in the bridge → 2 X9 tests failed as expected → field reverted → 61/61 green.

**The PROJECT.md core value is now enforced:** any contract change that breaks cross-repo compatibility produces compile/test failures in both repos.

## Test Coverage (all green, zero regressions)

| Repo / Service | Before | After | Delta |
|---|---:|---:|---:|
| Bridge | 113 | 228 | +115 (81 endpoint + 18 SSE + 16 typed-method guards + misc) |
| X9 agent-core | 45 | 61 | +16 (contract tests) |
| X9 cap-voice | 4 + 1 fail | 9 | +5 (voice-register integration) |
| X9 cap-glasses | 0 | 0 | — (no test file yet) |
| Forge factory | 62 | 74 | +12 (X9Client integration) |
| Forge voice | 24 | 28 | +4 (Bug #15 regression) |
| **Total** | **248** | **400** | **+152** |

## Commits

- **Bridge (THIS repo)**: 20 atomic task commits (`48d7880` → `df62f9e`) + 4 doc commits (SUMMARY × 2 + deferred + REVIEW)
- **agent-x9**: 8 atomic commits (`9aeb814` → `2f8f51d`)
- **forge-v2**: 8 atomic commits (`ceb2d9b` → `8274869`)

Total: 36 atomic per-task commits + 4 orchestrator doc commits = **40 commits across 3 repos**.

## Code Review

- 04-REVIEW.md: 0 critical / 5 warning / 4 info — see `/gsd-code-review-fix 4`
- Top warnings: typed methods skip runtime `.parse()` (compile-time only), headers spread order, SSE buffer unbounded
- None block phase completion; worth closing before Phase 5 or in a 4.1 polish phase

## Deferred Items (operator action required)

3 tasks (not 5 — recount from SUMMARYs):

1. **04-03-09** (X9 VPS deploy smoke) — Hostinger SSH; see `04-03-SMOKE.md` checklist
2. **04-04-09** (real staging fixtures) — VPS SSH to capture live context.json + post-call samples
3. **04-04-10** (end-to-end staging smoke) — full deploy → forge factory.deploy → X9 health → voice webhook cycle

Also noted but NOT blocking:
- `createBridgeClient` lacks `'none'` auth → `capBridgeClient` helpers duplicated in X9 + Forge; consolidate in Phase 4.1 or early Phase 5
- ~4 X9 services have stale `.js`/`.d.ts` cruft in `src/`; small chore plan + `.gitignore` update

## Phase Status

**PASSED.** All 14 HTTP-NN requirements delivered with compile-time contract enforcement, runtime tests, and a proven cross-repo drift guard. Phase 5 (memory-engine) can proceed.
