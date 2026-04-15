---
phase: 4
phase_name: http-endpoint-contracts-block-d
depth: standard
files_reviewed: 31
reviewed_at: 2026-04-15
status: issues
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
---

# Phase 4 Code Review

## Summary

Phase 4 delivers 11 endpoint contracts + SSE frame schemas + discriminated bridge client with strong compile-time enforcement (Bug #15 is indeed a TS2339). Test coverage is good (228 green, real-shape fixtures traceable to agent-core/voice-svc source lines, negative tests present for most schemas). No critical security issues or broken contract enforcement. Five warnings concentrate on runtime defense gaps in `bridge-client.ts` and `sse-parser.ts` — the Zod schemas exist but the typed methods never call `.parse()` on inputs or outputs, so path-injection on `agentId`, header-override via `options.headers`, and unbounded SSE buffer growth are not fail-closed at the bridge layer.

## Findings

### WR-01: Typed client methods never validate against their Zod schemas

**File:** `src/http/bridge-client.ts:209-225`
**Severity:** Warning
**Category:** Contract

`reloadAgent(agentId)`, `stopAgent(agentId)`, `internalTurn(body)`, `internalQuery(body)`, `postCallWebhook(body)`, `voiceRegister(body)` accept their arguments and interpolate / forward them without running the corresponding `*RequestSchema.parse(...)` / `*ParamsSchema.parse(...)`. Responses are likewise cast (`as T`) with no `*ResponseSchema.parse(...)`. The Phase 04-01 SUMMARY claims "Consumers that pre-validate via the bridge contract will get an identical reject set as the server (no schema drift possible)" — but pre-validation only happens if the consumer manually calls `.parse()`. The typed wrappers do not.

**Impact:** Consumers relying on the bridge client alone get only TS compile-time shape enforcement; at runtime a wrong-shape input or a server shape drift passes through silently. For `reloadAgent`/`stopAgent` specifically, the `agentId` param is interpolated into the URL at L212/L218 without the `/^[a-z0-9-]+$/` regex check — a caller passing `'../../../internal/agents/foo/reload'` would produce a malformed URL that the server rejects (defense in depth works) but the bridge itself does not fail closed.
**Fix:** Invoke the schema before use, e.g.:
```ts
async reloadAgent(agentId: string) {
  const { agentId: safe } = ReloadAgentParamsSchema.parse({ agentId });
  return request<ReloadAgentResponse>({ method: 'POST', path: `/internal/agents/${safe}/reload` });
}
```
Apply the same pattern (parse-in, parse-out with `ResponseSchema.parse(raw)`) to every typed wrapper. Alternatively, document explicitly in the file header that wrappers are type-only and consumers must validate separately.

---

### WR-02: Caller-supplied `headers` can override auth headers

**File:** `src/http/bridge-client.ts:166-170`
**Severity:** Warning
**Category:** Security

```ts
const headers: Record<string, string> = {
  ...auth,
  ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  ...options.headers,
};
```
Because `...options.headers` is spread last, a caller passing `headers: { 'X-Internal-Secret': 'attacker-value' }` silently replaces the auth header the client was constructed with. Defeats the point of the discriminated `auth` field.
**Impact:** Low in practice (internal API, callers are trusted repos), but the type guarantee that "a secret client always sends the configured secret" is violated by one line of user code. If a future consumer composes headers from untrusted input, this is a credential-handling foot-gun.
**Fix:** Spread `options.headers` first and `...auth` last, or merge with a check that rejects headers whose keys match known auth header names:
```ts
const headers = {
  ...options.headers,
  ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  ...auth,
};
```

---

### WR-03: `parseSseStream` buffer is unbounded

**File:** `src/http/sse-parser.ts:97-113`
**Severity:** Warning
**Category:** Security / Bug

The `buffer += decoder.decode(...)` loop has no maximum size. A malicious or buggy server that emits data without ever sending `\n\n` causes `buffer` to grow until out-of-memory. Plan 04-02 threat-model lists T-4-SSE-02 "unbounded buffer" as MITIGATED by "incremental `\n\n` boundary scan" — but incremental scanning does not cap the buffer; it only trims when a boundary arrives.
**Impact:** DoS via memory exhaustion. Low likelihood in production (Forge/X9 are trusted), but the mitigation claim in the phase summary is inaccurate.
**Fix:** Add an explicit cap:
```ts
const MAX_FRAME_BYTES = 1 << 20; // 1 MB
// ...
if (buffer.length > MAX_FRAME_BYTES) {
  throw new Error(`SSE frame exceeded ${MAX_FRAME_BYTES} bytes without terminator`);
}
```

---

### WR-04: SSE parser rejects frames with only `event:`/`id:`/`retry:` lines as parse_error

**File:** `src/http/sse-parser.ts:36-45`
**Severity:** Warning
**Category:** Bug

The loop sets `isHeartbeatOnly = false` for any non-empty, non-`data:`, non-`:` line (doc comment says "event:, id:, retry: are ignored"). When the frame contains only such lines and no `data:` line, the function returns `{ kind: 'parse_error', error: 'No data: lines found' }` even though per SSE spec these are legitimate dataless events (e.g. `id: 42\n\n` is a valid frame that updates the last event ID).
**Impact:** Consumer code sees `parse_error` for spec-valid keepalive-style frames and may log noise or misclassify connection health. Low-severity because agent-core does not currently emit such frames.
**Fix:** Treat dataless frames as `{ kind: 'heartbeat' }` (or introduce a `kind: 'dataless'`). Concretely: if `dataLines.length === 0`, return heartbeat regardless of `isHeartbeatOnly`, or only flag `parse_error` when a `data:` line is present but JSON/Zod fails.

---

### WR-05: SSE parser does not handle `\r\n\r\n` frame boundaries

**File:** `src/http/sse-parser.ts:106`
**Severity:** Warning
**Category:** Bug

`buffer.indexOf('\n\n')` only detects LF-terminated boundaries. SSE spec (WHATWG HTML Living Standard §server-sent events) accepts `\r\n\r\n` and `\r\r` as well. A proxy or server that rewrites line endings produces a stream the parser cannot split, causing the entire response to accumulate in the buffer (see WR-03).
**Impact:** Interop bug if agent-core or any intermediary normalizes to CRLF.
**Fix:** Split on a regex accepting `\r\n|\r|\n` for line detection and `(\r\n\r\n|\r\r|\n\n)` for frame boundaries. Alternatively, normalize CRLF to LF once per `decoder.decode()` output.

---

### IN-01: `BridgeHttpError` missing for SSE non-JSON error bodies; plain `Error` thrown for empty body

**File:** `src/http/bridge-client.ts:259-261`
**Severity:** Info
**Category:** Quality

`if (!res.body) throw new Error('SSE response has no body stream')` uses a bare `Error`, whereas the rest of the client throws `BridgeHttpError`. Consumers switching on `instanceof BridgeHttpError` will miss this case.
**Fix:** Throw `new BridgeHttpError(res.status, null)` with a synthetic code, or add a dedicated `BridgeStreamError` subclass. Minor.

---

### IN-02: Duplicated request plumbing between `request()` and `internalTurnStream()`

**File:** `src/http/bridge-client.ts:165-196, 227-263`
**Severity:** Info
**Category:** Quality

URL normalization, auth-header merge, body serialization, and error-response parsing are re-implemented inline in `internalTurnStream`. A future change to `request()` (e.g. response-schema validation from WR-01) would need to be mirrored manually.
**Fix:** Extract a small helper like `buildInit(method, path, body, signal, extraHeaders?)` or have `internalTurnStream` call through a lower-level helper that returns `Response` instead of parsed JSON.

---

### IN-03: `BridgeClient<A>` return cast uses `as BridgeClient<A>`

**File:** `src/http/bridge-client.ts:266, 285`
**Severity:** Info
**Category:** Types

`return secretClient as BridgeClient<A>;` and `return tokenClient as BridgeClient<A>;` are unavoidable without a more elaborate conditional-type proof, but they are a type-system escape hatch. If the `AuthForEndpoint<A>` constraint is ever loosened, the cast would silently produce the wrong client shape.
**Fix:** Add a brief comment justifying the cast (the runtime branch on `'X-Internal-Secret' in auth` matches the type-level constraint from `AuthForEndpoint<A>`). Optional.

---

### IN-04: `LLMMessageSchema.toolCalls[].input` uses `z.record(z.string(), z.unknown())`

**File:** `src/http/endpoints/internal-turn.ts:32`
**Severity:** Info
**Category:** Contract

`z.unknown()` is pragmatic here (tool input shapes are tool-specific), but it violates the phase's "narrow everything" spirit. Not actionable for Phase 4 — tool-specific input schemas belong to each capability's manifest. Flagged so it is not forgotten when Phase 5/6 extends the capability-side contracts.
**Fix:** No change required. When per-tool input schemas land, `toolCalls[].input` could be parameterized or validated at the tool-dispatch boundary.

---

## Files Reviewed

- src/http/bridge-client.ts
- src/http/endpoint-contract.ts
- src/http/endpoints/cap-env-schema.ts
- src/http/endpoints/cap-health.ts
- src/http/endpoints/cap-manifest.ts
- src/http/endpoints/index.ts
- src/http/endpoints/internal-agents-list.ts
- src/http/endpoints/internal-agents-reload.ts
- src/http/endpoints/internal-agents-stop.ts
- src/http/endpoints/internal-query.ts
- src/http/endpoints/internal-turn-stream.ts
- src/http/endpoints/internal-turn.ts
- src/http/endpoints/voice-register.ts
- src/http/endpoints/webhook-post-call.ts
- src/http/index.ts
- src/http/sse-frames.ts
- src/http/sse-parser.ts
- tests/http/bridge-client.test.ts
- tests/http/endpoints/cap-env-schema.test.ts
- tests/http/endpoints/cap-health.test.ts
- tests/http/endpoints/cap-manifest.test.ts
- tests/http/endpoints/internal-agents-list.test.ts
- tests/http/endpoints/internal-agents-reload.test.ts
- tests/http/endpoints/internal-agents-stop.test.ts
- tests/http/endpoints/internal-query.test.ts
- tests/http/endpoints/internal-turn-stream.test.ts
- tests/http/endpoints/internal-turn.test.ts
- tests/http/endpoints/voice-register.test.ts
- tests/http/endpoints/webhook-post-call.test.ts
- tests/http/sse-frames.test.ts
- tests/http/sse-parser.test.ts

## Positive Notes

- **Compile-time Bug #15 guard is real**: 4 `@ts-expect-error` directives in `tests/http/bridge-client.test.ts:183-190` create a permanent regression trap — if either client ever exposes the other's methods, the directive becomes unused and `tsc` fails.
- **Discriminated unions everywhere appropriate**: `SseFrameSchema` (type discriminator), `BridgeResponseSchema` (ok discriminator), response/error schemas on reload/stop/turn/turn-stream/voice-register all use `z.literal(true)` / `z.literal(false)` — exhaustive switch-checks are compile-enforced.
- **Regex-bounded identifiers**: `channelId`/`sessionId` `/^[a-z0-9-]{1,64}$/` with positive and negative test cases (uppercase, special chars, >64 chars) mitigates T-4-02 path/ID injection at the schema layer.
- **Real-shape fixtures**: Every endpoint test cites the agent-core/voice-svc source file:line in comments (e.g. `agent-core/src/index.ts:328-333`, `voice-svc/routes/voice.ts:23-26`). Fixtures are traceable and will catch server-side shape drift when re-verified against the real source.
- **Zero-dep SSE parser**: `parseSseFrame` + `parseSseStream` use only native `TextDecoder` + `ReadableStream` + Zod; no `eventsource` dep. `safeParse` + try/catch around `JSON.parse` mean a bad frame never throws.
- **`passthrough()` scoped appropriately**: Used only on `PostCallPayloadSchema` and its nested ElevenLabs sub-objects where forward-compat with a third-party payload is the explicit design goal. Not applied gratuitously.
