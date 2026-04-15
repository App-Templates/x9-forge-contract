---
phase: 04-http-endpoint-contracts-block-d
plan: "04-01"
subsystem: http
tags: [zod, http, endpoint-contracts, bridge-client, sse, bug-15, compile-time-enforcement]

# Dependency graph
requires:
  - phase: 03-auth-headers-discriminated-block-c
    provides: [AuthInternalSecret, AuthInternalToken, AuthNone, EndpointAuthType, createBridgeClient skeleton, AuthForEndpoint mapping]
  - phase: 01-capability-contracts
    provides: [CapabilityManifestSchema, EnvSchemaDocSchema, HealthStatusSchema]
provides:
  - 11 Zod-backed endpoint contracts (request/response/auth metadata)
  - SecretBridgeClient / TokenBridgeClient typed method surfaces
  - Conditional BridgeClient<A> return type from createBridgeClient<A>
  - LLMMessageSchema shared between /internal/turn and /internal/turn/stream
  - EndpointContract<TMethod, TPath, TAuth, TParams, TBody, TResponse> structural type
  - Real-fixture unit test corpus (81 new tests) covering every endpoint contract
  - Compile-time guard: calling token-only methods on a secret client (and vice versa) is a TS2339
affects: [04-02-sse-frames, 04-03-x9-consumer-migration, 04-04-forge-consumer-migration, 05-vault-contracts, 06-model-router-contracts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Endpoint contract module: one file per endpoint with *Schema + *RequestSchema + *ResponseSchema + *ErrorResponseSchema + contract const"
    - "Contract const object with {method, path, authType, (paramsSchema?), (bodySchema?), responseSchema} literal keys — structurally conforms to EndpointContract without explicit cast"
    - "Sibling endpoint re-export pattern: /internal/turn/stream re-exports InternalTurnRequestSchema from /internal/turn"
    - "Capability discovery endpoints re-export Phase 1 schemas (CapabilityManifestSchema, EnvSchemaDocSchema, HealthStatusSchema) — no duplication"
    - "Conditional return type from factory: createBridgeClient<'secret'> => SecretBridgeClient, <'token'> => TokenBridgeClient"

key-files:
  created:
    - src/http/endpoint-contract.ts
    - src/http/endpoints/index.ts
    - src/http/endpoints/internal-agents-list.ts
    - src/http/endpoints/internal-agents-reload.ts
    - src/http/endpoints/internal-agents-stop.ts
    - src/http/endpoints/internal-turn.ts
    - src/http/endpoints/internal-turn-stream.ts
    - src/http/endpoints/internal-query.ts
    - src/http/endpoints/webhook-post-call.ts
    - src/http/endpoints/voice-register.ts
    - src/http/endpoints/cap-manifest.ts
    - src/http/endpoints/cap-env-schema.ts
    - src/http/endpoints/cap-health.ts
    - tests/http/endpoints/internal-agents-list.test.ts
    - tests/http/endpoints/internal-agents-reload.test.ts
    - tests/http/endpoints/internal-agents-stop.test.ts
    - tests/http/endpoints/internal-turn.test.ts
    - tests/http/endpoints/internal-turn-stream.test.ts
    - tests/http/endpoints/internal-query.test.ts
    - tests/http/endpoints/webhook-post-call.test.ts
    - tests/http/endpoints/voice-register.test.ts
    - tests/http/endpoints/cap-manifest.test.ts
    - tests/http/endpoints/cap-env-schema.test.ts
    - tests/http/endpoints/cap-health.test.ts
  modified:
    - src/http/bridge-client.ts
    - src/http/index.ts
    - tests/http/bridge-client.test.ts

key-decisions:
  - "Endpoint contracts type the REAL shapes (e.g. { agents: [...] }, { ok: true, agentId }) that exist today in agent-core/voice-svc; migration to standardized BridgeSuccessResponse<T> deferred to 04-03/04-04"
  - "PostCallPayload uses passthrough() and accepts both flat AND data.* nested shapes — ElevenLabs sends both; Forge voice-svc appends agentId at root (Bug #15 forwarded shape)"
  - "LLMMessageSchema defined once in internal-turn.ts and re-exported from internal-turn-stream.ts to avoid drift between sync and streaming turn APIs"
  - "internalTurnStream() method NOT added to SecretBridgeClient in this plan — it returns AsyncIterable<TurnChunk> and requires the SSE parser from Plan 04-02"
  - "Capability discovery contracts (manifest/env-schema/health) re-use Phase 1 schemas via re-export — they add only route metadata (path, method, authType: 'none') without duplicating the shape"
  - "AGENT_ID regex /^[a-z0-9-]+$/ used in both reload and stop paramsSchemas (matches agent-core AGENT_ID_SCHEMA), mitigates T-4-02 path injection"
  - "channelId/sessionId regex /^[a-z0-9-]{1,64}$/ matches agent-core internalTurnSchema exactly — prevents ID injection and bounds length"

patterns-established:
  - "EndpointContract<...>: structural interface — every endpoint file exports a `*Contract` const object conforming to it without explicit cast"
  - "BridgeClient<A> factory returns A-specific typed client (SecretBridgeClient | TokenBridgeClient); wrong-auth method access is TS2339 at compile time"
  - "Real-fixture tests pattern: every endpoint test imports a fixture derived from the source repo (agent-x9/forge-v2) file:line in the test comment for traceability"

requirements-completed: [HTTP-01, HTTP-02, HTTP-03, HTTP-04, HTTP-05, HTTP-06, HTTP-07, HTTP-08, HTTP-09, HTTP-10, HTTP-11, HTTP-12, HTTP-13, HTTP-14]

# Metrics
duration: 7 min
completed: 2026-04-15
---

# Phase 04 Plan 04-01: Bridge — 11 Endpoint Contracts + createBridgeClient Full + Unit Tests + Real Fixtures Summary

**Zod-backed request/response/auth contracts for all 11 cross-repo HTTP endpoints with discriminated SecretBridgeClient/TokenBridgeClient surfaces that make Bug #15 a compile-time error.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-15T18:26:56Z
- **Completed:** 2026-04-15T18:33:50Z
- **Tasks:** 14
- **Files created:** 24
- **Files modified:** 3

## Accomplishments

- 11 endpoint contract modules (secret: 6 internal routes; token: post-call webhook + voice-register; none: 3 capability discovery routes)
- SecretBridgeClient and TokenBridgeClient interfaces with typed method surfaces; conditional `BridgeClient<A>` return type
- LLMMessageSchema shared between /internal/turn and /internal/turn/stream
- EndpointContract<TMethod, TPath, TAuth, TParams?, TBody?, TResponse> structural type
- 81 new real-fixture unit tests (113 -> 200 green total); permanent @ts-expect-error guards for wrong-client method access
- Bug #15 coverage: /webhook/post-call contract typed `authType: 'token'`; calling it on a secret client is TS2339

## Task Commits

Each task was committed atomically:

1. **Task 04-01-01: EndpointContract type + endpoints/ barrel scaffolding** — `48d7880` (feat)
2. **Task 04-01-02: GET /internal/agents contract** — `7c3156e` (feat)
3. **Task 04-01-03: POST /internal/agents/:agentId/reload contract** — `e139ef7` (feat)
4. **Task 04-01-04: POST /internal/agents/:agentId/stop contract** — `77c2859` (feat)
5. **Task 04-01-05: POST /internal/turn contract + LLMMessageSchema** — `dc19bcd` (feat)
6. **Task 04-01-06: POST /internal/turn/stream contract (request-only, SSE deferred)** — `437dac3` (feat)
7. **Task 04-01-07: POST /internal/query contract** — `88958e3` (feat)
8. **Task 04-01-08: POST /webhook/post-call contract (Bug #15 endpoint)** — `7eede49` (feat)
9. **Task 04-01-09: POST /api/voice/register contract** — `fd5c5bc` (feat)
10. **Task 04-01-10: Capability discovery (manifest/env-schema/health) contracts** — `267b7fd` (feat)
11. **Task 04-01-11: Endpoints barrel + http/index.ts re-exports** — `0619550` (feat)
12. **Task 04-01-12: Typed endpoint methods on createBridgeClient (Secret/Token split)** — `bb37460` (feat)
13. **Task 04-01-13: 11 real-fixture test files** — `6530d4d` (test)
14. **Task 04-01-14: Compile-time type enforcement tests** — `b9bc1c8` (test)

_Note: Plan metadata commit will be created by the orchestrator._

## Files Created/Modified

### Created

- `src/http/endpoint-contract.ts` — EndpointContract structural type
- `src/http/endpoints/index.ts` — barrel export for all 11 endpoint modules
- `src/http/endpoints/internal-agents-list.ts` — HTTP-03 contract (GET, secret)
- `src/http/endpoints/internal-agents-reload.ts` — HTTP-01 contract (POST, secret, AGENT_ID regex)
- `src/http/endpoints/internal-agents-stop.ts` — HTTP-02 contract (POST, secret, AGENT_ID regex)
- `src/http/endpoints/internal-turn.ts` — HTTP-04 contract + LLMMessageSchema
- `src/http/endpoints/internal-turn-stream.ts` — HTTP-05 contract (SSE marker, frames deferred)
- `src/http/endpoints/internal-query.ts` — HTTP-06 contract (POST, secret)
- `src/http/endpoints/webhook-post-call.ts` — HTTP-07 contract (Bug #15 endpoint, token auth, passthrough)
- `src/http/endpoints/voice-register.ts` — HTTP-11 contract (only X9 -> Forge endpoint)
- `src/http/endpoints/cap-manifest.ts` — HTTP-08 contract (no auth, re-export Phase 1 schema)
- `src/http/endpoints/cap-env-schema.ts` — HTTP-09 contract (no auth, re-export Phase 1 schema)
- `src/http/endpoints/cap-health.ts` — HTTP-10 contract (no auth, re-export Phase 1 schema)
- `tests/http/endpoints/*.test.ts` — 11 real-fixture test files (81 new tests)

### Modified

- `src/http/bridge-client.ts` — added SecretBridgeClient/TokenBridgeClient interfaces, typed method wrappers, conditional `BridgeClient<A>` return type; preserves the generic `request<T>()` method
- `src/http/index.ts` — re-exports EndpointContract, SecretBridgeClient, TokenBridgeClient, BaseBridgeClient, and all endpoints
- `tests/http/bridge-client.test.ts` — added 6 new tests in "Typed endpoint method enforcement" group (runtime assertions + permanent @ts-expect-error guards for wrong-client access)

## Decisions Made

- **Real vs. standardized response shapes:** Contracts type the CURRENT shapes of agent-core / voice-svc (e.g. `{ agents: [...] }`, `{ ok: true, agentId }`, `{ answer: string }`) rather than the standard `BridgeSuccessResponse<T>`. Migration to standard shapes happens in 04-03 (X9) and 04-04 (Forge) at the boundary layer. This preserves zero-breakage during Wave 2 consumer migration.
- **Split client types:** `createBridgeClient<'secret'>` returns `SecretBridgeClient` (with listAgents/reloadAgent/stopAgent/internalTurn/internalQuery); `<'token'>` returns `TokenBridgeClient` (with postCallWebhook/voiceRegister). This makes Bug #15 (wrong auth on /webhook/post-call) a TS2339 error at compile time.
- **LLMMessageSchema location:** Defined in `internal-turn.ts` and re-exported via the endpoints barrel. Sync and streaming turn APIs share the same shape by construction (Plan 04-02 imports from here).
- **Deferred `internalTurnStream()` method:** SSE parser + TurnChunk schemas belong to Plan 04-02. A TODO comment in bridge-client.ts flags the gap.
- **PostCall passthrough:** `.passthrough()` preserves unknown ElevenLabs fields rather than stripping them — future ElevenLabs payload changes won't silently drop data.

## Deviations from Plan

None - plan executed exactly as written.

**Notes on minor interpretation choices (not deviations):**

- Plan Task 04-01-11 ActionFile 2 said "Append to the end" — I replaced the existing type-exports block in `src/http/index.ts` to add `BaseBridgeClient`, `SecretBridgeClient`, `TokenBridgeClient`, `EndpointContract`, and `endpoints/*` re-exports in a single contiguous block. The final set of exports is a strict superset of the plan's request.
- Plan Task 04-01-12 referenced `BaseBridgeClient` and `SecretBridgeClient`/`TokenBridgeClient` interfaces — I added them directly to `src/http/bridge-client.ts` as planned and also surfaced `BaseBridgeClient` in the barrel for external consumers that need the shared interface.
- All `*Contract` const objects are defined with `as const` literal typing on `method`, `path`, `authType` — they structurally conform to `EndpointContract` without explicit cast, which keeps the type preserved at import sites.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** None — plan reference matches implementation 1:1.

## Issues Encountered

None.

## Threat Model Status

| ID | Severity | Mitigation | Status |
|----|----------|-----------|--------|
| T-4-01 (wrong auth / Bug #15 class) | HIGH | SecretBridgeClient / TokenBridgeClient split; conditional return type | MITIGATED — 4 permanent @ts-expect-error guards in tests |
| T-4-02 (path param injection on /internal/agents/:agentId/*) | HIGH | AGENT_ID regex `/^[a-z0-9-]+$/` on reload and stop paramsSchema; channelId/sessionId regex `/^[a-z0-9-]{1,64}$/` on /internal/turn | MITIGATED — 6 tests exercising reject-paths |
| T-4-03 (SSE frame injection) | MEDIUM | Marker `responseType: 'sse'` in contract; actual frame schemas in Plan 04-02 | DEFERRED to 04-02 |
| T-4-04 (success/error confusion) | MEDIUM | `ok` literal discriminator on reload/stop/turn/query success + error schemas | MITIGATED |
| T-4-05 (credential leakage) | MEDIUM | No credential values in typed shapes; auth headers carry opaque strings; PostCallPayload exposes no per-agent secrets | MITIGATED by design |
| T-4-06 (unbounded strings/arrays) | LOW | `z.string().min(1)` on required strings; channelId/sessionId bounded at 64; passthrough() limited to forward-compat fields only | MITIGATED |

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 04-02 (SSE frames):**
- `InternalTurnRequestSchema` + `LLMMessageSchema` already exported — Plan 04-02 imports them directly
- `internalTurnStreamContract.responseType === 'sse'` marker reserved for frame schemas
- TODO placeholder for `internalTurnStream()` method on SecretBridgeClient

**Ready for Plan 04-03 (X9 consumer migration):**
- All 11 endpoint modules available via `@x9-forge/contracts/http`
- `SecretBridgeClient` + `TokenBridgeClient` offer drop-in typed methods that match current agent-core/cap-voice route signatures
- Consumers must import `@x9-forge/contracts` directly (agent-core already has this dep from Phase 2)

**Ready for Plan 04-04 (Forge consumer migration):**
- `VoiceRegisterRequestSchema` lives at the bridge — forge-v2 voice-svc route can `zodToJsonSchema` it for fastify once 04-04 integrates
- `voiceRegisterContract.authType === 'token'` guides Forge to use createBridgeClient<'token'> (prevents a recurrence of Bug #15 from the X9 -> Forge direction)
- `PostCallPayloadSchema` accepts both the flat (Forge-forwarded) and data.* (ElevenLabs direct) shapes — Forge voice-svc can validate inbound ElevenLabs payload before forwarding to X9

**Things Wave 2 needs to know:**
- Response shape standardization is a 04-03/04-04 responsibility. The bridge contracts type the CURRENT shapes as of 2026-04-15 (e.g. agent-core returns `{ agents: [...] }`, not `{ ok: true, data: [...] }`). Migration strategy: consumers can use the raw schemas during transition, then switch to `BridgeSuccessResponseSchema.extend({...})` once server-side routes are updated.
- `SecretBridgeClient.request<T>()` and `TokenBridgeClient.request<T>()` both still exist — for paths not yet covered by typed methods (e.g. /internal/turn/stream), consumers should use the generic `request<T>()` method with explicit type parameter.
- AGENT_ID regex is **enforced by the bridge schema**, not merely by the server. Consumers that pre-validate via the bridge contract will get an identical reject set as the server (no schema drift possible).

---
*Phase: 04-http-endpoint-contracts-block-d*
*Completed: 2026-04-15*

## Self-Check: PASSED

- All 13 new src/ files verified on disk
- All 11 new test files verified on disk
- All 14 task commits found in `git log --oneline --all`
- `pnpm build` green (tsc -b, zero errors)
- `pnpm test` green (24 files, 200 tests)
- Compile-time enforcement verified: 4 permanent `@ts-expect-error` guards in tests/http/bridge-client.test.ts (SecretBridgeClient rejects voiceRegister/postCallWebhook; TokenBridgeClient rejects listAgents/reloadAgent)
- Threat mitigations T-4-01, T-4-02, T-4-04, T-4-05, T-4-06 implemented; T-4-03 deferred to Plan 04-02 as planned
