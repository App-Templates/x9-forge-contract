# Phase 3 Research: Auth Headers Discriminated (Block C)

**Date:** 2026-04-15
**Status:** Complete

## Executive Summary

Phase 3 types the two internal auth header patterns (`X-Internal-Secret` for X9 agent-core `/internal/*` routes, `X-Internal-Token` for Forge s2s and X9 cap-voice webhook forwarding) as discriminated literal types with Zod schemas. It also delivers a skeleton typed HTTP client (`createBridgeClient`) that enforces at compile-time which auth header each endpoint requires — closing the class of bug exemplified by Bug #15 (Forge forwarded post-call webhooks without `X-Internal-Token`, causing silent 401s). The phase is small in scope (4 requirements: AUTH-01 through AUTH-04) but foundational for Phase 4 (HTTP endpoint contracts).

## Current State Analysis

### Auth Header Usage in X9

**agent-core (`services/agent-core/src/index.ts`)**
- Reads `INTERNAL_SECRET` from env (line 30): `const INTERNAL_SECRET = process.env["INTERNAL_SECRET"] ?? ""`
- `checkInternalSecret()` middleware (lines 311-319): validates `X-Internal-Secret` header on all `/internal/*` routes
- If `INTERNAL_SECRET` is empty, all requests are allowed (Docker network trust fallback)
- Uses simple `===` comparison (not timing-safe — separate concern, not bridge scope)
- Protected routes: `GET /internal/agents`, `POST /internal/agents/:agentId/reload`, `POST /internal/agents/:agentId/stop`, `POST /internal/turn`, `POST /internal/turn/stream`, `POST /internal/query`

**cap-voice (`services/cap-voice/src/webhooks/post-call.ts`)**
- Accepts Forge-forwarded post-call webhooks via `X-Internal-Token` header (lines 89-96)
- Validates against `process.env["INTERNAL_SECRET"]` (note: same env var name, different header name)
- Uses `safeCompare()` with `timingSafeEqual`
- Dual auth: direct ElevenLabs webhooks use HMAC signature; Forge-forwarded requests use `X-Internal-Token`

**cap-voice (`services/cap-voice/src/tools/voice-call.ts`)**
- Sends `X-Internal-Token: env.FORGE_VOICE_REGISTER_TOKEN` to Forge `POST /api/voice/register` (line 100)
- Direction: X9 -> Forge

**cap-glasses (`services/cap-glasses/src/agent-bridge.ts`)**
- Sends `X-Internal-Secret` header to agent-core `/internal/turn/stream` (line 66)
- Direction: X9 cap-glasses -> X9 agent-core (internal, same cluster)

### Auth Header Usage in Forge

**factory-svc `x9.client.ts`**
- `X9Client` class sends `X-Internal-Secret` to X9 agent-core `/internal/*` endpoints
- Constructor takes optional `internalSecret` param, injected via `internalHeaders()` helper
- Env var: `X9_INTERNAL_SECRET` (note: different env name from X9's `INTERNAL_SECRET`)
- Used by: `reload()`, `stop()`, `listAgents()` — NOT by `discoverCapabilities()` or `getEnvSchema()` (capability endpoints, no auth)

**factory-svc `health.ts`**
- Sends `X-Internal-Secret` to X9 agent-core `/internal/agents` (line 112)
- Sends `X-Internal-Token` to docker-svc `/agents` (line 125) — env var: `INTERNAL_SERVICE_TOKEN`

**factory-svc `mc-env.routes.ts`**
- `requireAuthOrInternal()` middleware: accepts either `X-Internal-Token` (s2s) OR Clerk JWT (frontend)
- Env var: `INTERNAL_SERVICE_TOKEN`

**docker-svc `require-internal-auth.ts`**
- Validates `X-Internal-Token` against `INTERNAL_SERVICE_TOKEN`
- timingSafeEqual comparison

**vault-svc `require-internal-auth.ts`**
- Validates `X-Internal-Token` against `INTERNAL_SERVICE_TOKEN`
- timingSafeEqual comparison

**voice-svc `require-internal-token.ts`**
- Validates `X-Internal-Token` against `VOICE_REGISTER_TOKEN` / `FORGE_VOICE_REGISTER_TOKEN`
- timingSafeEqual comparison

**voice-svc `voice.ts` (webhook route)**
- Forwards post-call webhooks to X9 cap-voice with `X-Internal-Token: x9InternalSecret` (line 110)
- Secret resolved per-agent from vault (`X9_INTERNAL_SECRET` key)

### Bug #15 Context

**What happened:** Forge voice-svc forwarded ElevenLabs post-call webhooks to X9 cap-voice at `/webhook/post-call` WITHOUT including the `X-Internal-Token` header. X9 cap-voice validated the header, got a mismatch, returned 401. The 401 was silently swallowed — call recaps never reached Telegram. Users had no indication calls were being processed but recaps were lost.

**Root cause:** The Forge voice.ts webhook route was missing the header injection entirely. There was no compile-time enforcement that the header was required. The fix (commit `2519aec` in forge-v2, later commit `7f05803` for X9Client) was a 2-line change adding `"X-Internal-Token": x9InternalSecret` to the fetch headers.

**How discriminated types prevent it:** With AUTH-03/AUTH-04, each endpoint contract declares its required auth type (`AuthInternalSecret | AuthInternalToken | null`). The typed HTTP client (`createBridgeClient`) refuses to compile a call without the matching header. If voice.ts used the bridge client, the missing `X-Internal-Token` would be a TypeScript error at build time, not a runtime 401 discovered weeks later.

## Endpoint Auth Matrix

| Endpoint | Direction | Auth Type | Header | Env Var (caller side) |
|----------|-----------|-----------|--------|-----------------------|
| `GET /internal/agents` | Forge -> X9 agent-core | Secret | `X-Internal-Secret` | `X9_INTERNAL_SECRET` |
| `POST /internal/agents/:agentId/reload` | Forge -> X9 agent-core | Secret | `X-Internal-Secret` | `X9_INTERNAL_SECRET` |
| `POST /internal/agents/:agentId/stop` | Forge -> X9 agent-core | Secret | `X-Internal-Secret` | `X9_INTERNAL_SECRET` |
| `POST /internal/turn` | X9 internal | Secret | `X-Internal-Secret` | `INTERNAL_SECRET` |
| `POST /internal/turn/stream` | X9 internal | Secret | `X-Internal-Secret` | `INTERNAL_SECRET` |
| `POST /internal/query` | X9 internal | Secret | `X-Internal-Secret` | `INTERNAL_SECRET` |
| `POST /webhook/post-call` | Forge -> X9 cap-voice | Token | `X-Internal-Token` | `X9_INTERNAL_SECRET` (vault) |
| `POST /api/voice/register` | X9 -> Forge voice-svc | Token | `X-Internal-Token` | `FORGE_VOICE_REGISTER_TOKEN` |
| `POST /api/voice/webhook` | ElevenLabs -> Forge | HMAC | `elevenlabs-signature` | N/A (webhook secret) |
| `GET /:cap/manifest` | Forge/X9 -> cap-svc | None | — | — |
| `GET /:cap/env-schema` | Forge/X9 -> cap-svc | None | — | — |
| `GET /:cap/health` | Forge/X9 -> cap-svc | None | — | — |
| Forge docker-svc routes | Forge s2s | Token | `X-Internal-Token` | `INTERNAL_SERVICE_TOKEN` |
| Forge vault-svc routes | Forge s2s / X9 | Token | `X-Internal-Token` | `INTERNAL_SERVICE_TOKEN` |
| Forge mc-env routes | Forge s2s / Clerk | Token (or Clerk) | `X-Internal-Token` | `INTERNAL_SERVICE_TOKEN` |

**Key insight:** Two distinct auth patterns exist:
1. **`X-Internal-Secret`** — Forge factory -> X9 agent-core `/internal/*` routes. Shared secret between Forge and X9.
2. **`X-Internal-Token`** — Inter-service calls within Forge (factory->docker, factory->vault) AND cross-repo X9<->Forge voice flows. Different secrets per use case (`INTERNAL_SERVICE_TOKEN`, `FORGE_VOICE_REGISTER_TOKEN`, `X9_INTERNAL_SECRET` from vault).

## Bridge Pattern Analysis

Existing Phase 1/2 contracts follow a consistent pattern:

1. **Zod schema as source of truth** in a dedicated file (e.g., `capability-tool.ts`)
2. **TypeScript type derived** via `z.infer<typeof Schema>` — zero drift
3. **Barrel re-export** from domain `index.ts` (e.g., `src/capability/index.ts`)
4. **Sub-path export** in `package.json` (`"./auth"` already scaffolded in Phase 0)
5. **Tests** validate parse of fixtures (valid + invalid)

Phase 3 auth contracts should follow the same pattern:
- `src/auth/auth-headers.ts` — Zod schemas for `AuthInternalSecret` and `AuthInternalToken`
- `src/auth/auth-type.ts` — Discriminated auth type union
- `src/http/bridge-client.ts` — Typed HTTP client (or in `src/auth/` if HTTP is reserved for Phase 4)
- `src/auth/index.ts` — Barrel exports (currently placeholder `export {}`)

## createBridgeClient Design

Per AUTH-04 and HTTP-12, the client should:

```typescript
// Conceptual design — not final implementation

// Literal header types (AUTH-01, AUTH-02)
type AuthInternalSecret = { 'X-Internal-Secret': string };
type AuthInternalToken = { 'X-Internal-Token': string };
type AuthNone = Record<string, never>;  // or null
type AuthHeaders = AuthInternalSecret | AuthInternalToken | AuthNone;

// Endpoint contract declares required auth (AUTH-03)
type EndpointAuth = 'secret' | 'token' | 'none';

// Client config
interface BridgeClientConfig {
  baseUrl: string;
  auth: AuthInternalSecret | AuthInternalToken;
}

// The client function (~80 lines per HTTP-12, zero-dep, native fetch)
function createBridgeClient(config: BridgeClientConfig): BridgeClient;
```

**Design decisions to resolve in planning:**

1. **Scope boundary:** Phase 3 creates the auth types + a skeleton client. Phase 4 adds the 11 endpoint contracts that USE the client. The client in Phase 3 should have a generic `request<T>()` method, not endpoint-specific methods yet.

2. **Auth enforcement mechanism:** Two approaches:
   - **Option A (recommended):** Client is parameterized by auth type at construction. A `secret`-client can only call Secret-authed endpoints. A `token`-client can only call Token-authed endpoints. Callers create the right client.
   - **Option B:** Single client, each method declares its auth requirement. Requires conditional types or overloads.

3. **Error shape:** HTTP-13 defines `{ ok: false; code: string; message: string; details?: unknown }`. Phase 3 should import/define this shape for the client's error handling, or defer to Phase 4. Recommend: define `BridgeErrorResponse` and `BridgeSuccessResponse<T>` schemas in Phase 3 since the client needs them.

4. **Location:** `createBridgeClient` conceptually belongs in `src/http/` (HTTP-12), but Phase 4 owns that sub-path. Options:
   - Put auth types in `src/auth/`, put client in `src/http/` (Phase 3 populates both)
   - Put everything in `src/auth/` and move client to `src/http/` in Phase 4
   - **Recommended:** Auth types in `src/auth/`, client skeleton in `src/http/` — Phase 4 adds endpoint-specific wrappers. The `./http` sub-path is already scaffolded.

## Risks and Edge Cases

1. **Env var naming asymmetry.** X9 uses `INTERNAL_SECRET`, Forge uses `X9_INTERNAL_SECRET` for the same shared secret. The bridge types the *header* names (compile-time safety), not the env vars (runtime config). This is explicitly out of scope per REQUIREMENTS.md "Out of Scope" table. Document the mapping but do not attempt rename.

2. **Token vs Secret semantics confusion.** The `X-Internal-Token` header is used with at least 3 different env var sources (`INTERNAL_SERVICE_TOKEN`, `FORGE_VOICE_REGISTER_TOKEN`, `X9_INTERNAL_SECRET` from vault). The bridge discriminates on header name, not on which secret backs it. This is correct — the compile-time safety is about "did you send the right header type," not "did you use the right secret value."

3. **`checkInternalSecret` in agent-core uses `===` not `timingSafeEqual`.** This is a security concern but NOT bridge scope. The bridge contract only types the header shape; the validation implementation stays in each service.

4. **HMAC auth (`elevenlabs-signature`).** This is a third auth pattern (ElevenLabs -> Forge direct webhooks). It should NOT be modeled in the bridge auth types — it's external-provider auth, not internal s2s. Mention but exclude.

5. **`AuthNone` for capability endpoints.** `GET /:cap/manifest`, `/env-schema`, `/health` have no auth. Phase 4 endpoint contracts will reference `AuthNone` from Phase 3.

6. **Dual auth middleware** (`requireAuthOrInternal` in mc-env.routes.ts). Some Forge routes accept either `X-Internal-Token` OR Clerk JWT. The bridge should model this as `AuthInternalToken | null` (the Clerk auth is Forge-internal, not cross-repo).

## Validation Architecture

1. **Unit tests (Zod parse):**
   - `AuthInternalSecretSchema` parses `{ 'X-Internal-Secret': 'abc' }` -> pass
   - `AuthInternalSecretSchema` rejects `{ 'X-Internal-Token': 'abc' }` -> fail (wrong key)
   - `AuthInternalTokenSchema` parses `{ 'X-Internal-Token': 'abc' }` -> pass
   - Empty object rejected by both
   - Additional key in object tolerated (Zod passthrough vs strict — decide in plan)

2. **Type-level tests (compile-time):**
   - Assign `AuthInternalSecret` to `AuthInternalToken` -> TS error (tsd or expect-type)
   - `createBridgeClient({ baseUrl, auth: { 'X-Internal-Secret': 'x' } })` compiles
   - `createBridgeClient({ baseUrl, auth: {} })` does NOT compile (for authenticated endpoints)

3. **Integration (deferred to Phase 4):**
   - Each endpoint contract declares its auth type; client enforces it

4. **Cross-repo verification:**
   - X9 typecheck green (no consumer changes needed in Phase 3 — auth types are additive)
   - Forge typecheck green (same)
   - Bridge `pnpm build && pnpm test` green

## Dependencies

### What Phase 3 needs from earlier phases

- **Phase 0:** Package scaffolding, `./auth` sub-path export, Zod v4, strict tsconfig — all DONE
- **Phase 2:** `AgentCredentials` includes `INTERNAL_SECRET` and `X9_INTERNAL_SECRET` as known keys — DONE (verified in `src/agent/agent-credentials.ts`)
- No consumer migration needed in Phase 3 (auth types are new, not replacing existing types)

### What Phase 4 needs from Phase 3

- `AuthInternalSecret` and `AuthInternalToken` types to annotate each endpoint contract's auth requirement
- `AuthNone` type for unauthenticated capability endpoints
- `createBridgeClient` skeleton with generic `request<T>()` method
- `BridgeErrorResponse` and `BridgeSuccessResponse<T>` response shapes (or Phase 4 adds these)
- The `./auth` sub-path export populated and importable

### What consumers need

- Phase 3 is **bridge-only** — no consumer changes required
- Consumers adopt auth types when they adopt Phase 4 endpoint contracts
- Forge's `X9Client` is eventually replaced by bridge client (Phase 4+), not Phase 3

## File Plan (Estimated)

```
src/auth/
  auth-headers.ts       — AuthInternalSecretSchema, AuthInternalTokenSchema, Zod + inferred types
  index.ts              — barrel re-exports (replace placeholder)
src/http/
  response.ts           — BridgeErrorResponseSchema, BridgeSuccessResponseSchema<T> (maybe Phase 4)
  bridge-client.ts      — createBridgeClient skeleton (~80 lines)
  index.ts              — barrel re-exports (replace placeholder)
tests/
  auth/auth-headers.test.ts  — Zod parse + reject fixtures
  http/bridge-client.test.ts — construction + type safety smoke
```

Estimated scope: ~200 lines of code + ~100 lines of tests. Small phase, high leverage for Phase 4.
