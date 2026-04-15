---
phase: 04-http-endpoint-contracts-block-d
plan: "04-02"
subsystem: http
tags: [sse, zod, discriminated-union, async-generator, streaming, http-05, http-12]

# Dependency graph
requires:
  - phase: 04-http-endpoint-contracts-block-d
    provides: [LLMMessageSchema, InternalTurnRequestSchema, SecretBridgeClient, internalTurnStreamContract]
provides:
  - 6 SSE frame Zod schemas (text, tool_call_start, tool_call_end, done, error, aborted)
  - SseFrameSchema discriminated union on `type` literal
  - parseSseFrame(rawFrame) pure function (heartbeat + data:lines + JSON + Zod)
  - parseSseStream(ReadableStream<Uint8Array>) async generator
  - ParsedSseEvent discriminated on `kind` (frame | heartbeat | parse_error)
  - SecretBridgeClient.internalTurnStream(body, signal?) typed method
  - 28 new real-shape unit tests (16 frame + 12 parser)
affects: [04-03-x9-consumer-migration, 04-04-forge-consumer-migration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SSE frame schema: discriminated union on `type` literal (z.discriminatedUnion) — compile-time switch-exhaustion via TS never-check"
    - "Parser separation: pure parseSseFrame (testable without streams) + parseSseStream async generator composing it"
    - "ParsedSseEvent outer discriminator (`kind`) sits above SseFrame inner discriminator (`type`) — consumer switches kind first, then frame.type"
    - "Re-use contract types across sync + streaming endpoints: SseDoneFrame imports LLMMessageSchema from internal-turn.ts (no drift)"

key-files:
  created:
    - src/http/sse-frames.ts
    - src/http/sse-parser.ts
    - tests/http/sse-frames.test.ts
    - tests/http/sse-parser.test.ts
  modified:
    - src/http/bridge-client.ts
    - src/http/index.ts

key-decisions:
  - "Parser is zero-dep (no eventsource / sse-parser library) — uses only Zod + native TextDecoder + ReadableStream"
  - "Heartbeat frames surfaced as ParsedSseEvent kind:'heartbeat' (not silently swallowed) so consumers can log/count keepalives"
  - "parse_error events include the raw frame text (truncated to 100/200 chars) for debugging without unbounded log growth"
  - "internalTurnStream() returns Promise<AsyncGenerator<ParsedSseEvent>> — method awaits headers/status before stream body is exposed"
  - "Non-2xx response on /internal/turn/stream throws BridgeHttpError BEFORE yielding any frames (error surfaced early, not inside the generator)"

patterns-established:
  - "SSE frame schema module: one file with per-frame schema + per-frame TS type + union schema + union TS type; discriminated union on `type`"
  - "SSE parser module: pair of (pure parseSseFrame + streaming parseSseStream) sharing the frame schema"
  - "Typed client streaming method: Promise<AsyncGenerator<T>> signature (await headers, iterate frames)"

requirements-completed: [HTTP-05, HTTP-12]

# Metrics
duration: 7 min
completed: 2026-04-15
---

# Phase 04 Plan 04-02: Bridge — SSE Frame Shapes for /internal/turn/stream + Parser Helper Summary

**Discriminated-union Zod schemas for all 6 TurnChunk SSE frames + a zero-dep parseSseStream async generator + typed `internalTurnStream()` method on SecretBridgeClient, making the agent-core streaming contract consumer-safe end to end.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-04-15T18:37:22Z
- **Completed:** 2026-04-15T18:41:00Z (approx)
- **Tasks:** 6
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- 6 SSE frame Zod schemas (text, tool_call_start, tool_call_end, done, error, aborted) derived from agent-core `turn-processor.ts` TurnChunk + `index.ts` writeEvent shapes
- `SseFrameSchema` discriminated union — unknown `type` values are rejected at parse time
- `parseSseFrame(rawFrame)` pure function: strips `:`-comments (heartbeats), joins multi-line `data:` payloads, JSON-parses and validates via Zod — every failure mode explicitly typed
- `parseSseStream(ReadableStream<Uint8Array>)` async generator: incremental `\n\n` boundary detection, correct TextDecoder streaming, trailing-frame handling, releaseLock in finally
- `SecretBridgeClient.internalTurnStream(body, signal?)` method: fetches with `Accept: text/event-stream`, throws `BridgeHttpError` on non-2xx before any frame is yielded, returns `AsyncGenerator<ParsedSseEvent>`
- 28 new unit tests (16 frame + 12 parser), all green; total test count **228** (200 → 228)
- Every frame test uses a real-shape fixture traceable to an agent-core source line (turn-processor.ts:41-46 or index.ts:476-500)

## Task Commits

Each task was committed atomically:

1. **Task 04-02-01: SSE frame Zod schemas as discriminated union** — `5732735` (feat)
2. **Task 04-02-02: SSE text-protocol parser helper** — `628ef36` (feat)
3. **Task 04-02-03: Add internalTurnStream() to SecretBridgeClient** — `9e6669d` (feat)
4. **Task 04-02-04: Barrel re-exports for SSE frames + parser** — `e659366` (feat)
5. **Task 04-02-05: SSE frame schema unit tests** — `d2f7282` (test)
6. **Task 04-02-06: SSE parser unit tests** — `df62f9e` (test)

_Plan metadata commit will be created by the orchestrator._

## Files Created/Modified

### Created

- `src/http/sse-frames.ts` — 6 frame Zod schemas + SseFrameSchema discriminated union, HTTP-05
- `src/http/sse-parser.ts` — parseSseFrame pure fn + parseSseStream async generator + ParsedSseEvent type
- `tests/http/sse-frames.test.ts` — 16 tests exercising every frame schema with real-shape fixtures
- `tests/http/sse-parser.test.ts` — 12 tests for the parser (pure + streaming, with a stringToStream helper)

### Modified

- `src/http/bridge-client.ts` — added `internalTurnStream(body, signal?): Promise<AsyncGenerator<ParsedSseEvent>>` on `SecretBridgeClient` interface + implementation in the secret branch of `createBridgeClient`; removed the 04-01-12 TODO comment; imports `parseSseStream` + `ParsedSseEvent` from `./sse-parser.js`
- `src/http/index.ts` — re-exports 6 frame schemas + 6 frame types + SseFrameSchema + SseFrame + parseSseFrame + parseSseStream + ParsedSseEvent

## Decisions Made

- **Zero-dep parser** — no `eventsource` or `sse-parser` package. Uses only native `TextDecoder` + `ReadableStream` + Zod (already a direct dep). Keeps bundle surface minimal for consumers.
- **Heartbeat as a typed event** — `{ kind: 'heartbeat' }` rather than silently filtered. Consumers (e.g. cap-glasses future UI) can count/log keepalives for connection-health telemetry.
- **parse_error carries raw frame text** — truncated to 100 chars for JSON-parse errors and 200 chars for Zod-schema errors, keeps logs readable and bounded while still giving debuggability.
- **internalTurnStream() signature: `Promise<AsyncGenerator<ParsedSseEvent>>`** — the `await` returns the generator only after the HTTP status is known. Non-2xx throws `BridgeHttpError` synchronously (from the caller's perspective) — no `for-await` over a stream that never starts.
- **Discriminated-union on `type` literal** — chosen over a single schema with `type: z.enum()` + conditional fields. Benefit: consumers get exhaustive switch-checking via TS `never`; also fails fast on unknown types without a separate branch.
- **LLMMessage reused** — `SseDoneFrame.updatedHistory` imports `LLMMessageSchema` directly from `internal-turn.ts` (04-01-05). No drift between the sync turn response and the streaming done frame.

## Deviations from Plan

None — plan executed exactly as written.

**Minor interpretation notes (not deviations):**

- The plan for Task 04-02-03 showed an inline snippet including re-imports of `auth` and `baseUrl` inside a standalone method. The actual implementation uses the closure variables already in scope inside `createBridgeClient`, matching the style of the other 5 secret methods (listAgents, reloadAgent, etc.). Plan semantics preserved.
- Plan said "~15 tests" for 04-02-05 — shipped 16 (added an extra positive case for `toolCalls` inside `updatedHistory` per acceptance-criteria spirit of the last enumerated test item).
- Plan said "~12 tests" for 04-02-06 — shipped exactly 12.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** None — implementation matches plan 1:1.

## Issues Encountered

None.

## Threat Model Status

| ID | Severity | Mitigation | Status |
|----|----------|-----------|--------|
| T-4-SSE-01 (malformed JSON crash) | MEDIUM | `safeParse` everywhere; `JSON.parse` wrapped in try/catch; surfaced as `parse_error` event, never thrown | MITIGATED |
| T-4-SSE-02 (unbounded buffer) | MEDIUM | Incremental `\n\n` boundary scan in `parseSseStream`; each frame sliced + buffer trimmed as boundaries arrive; no accumulation-only path | MITIGATED |
| T-4-SSE-03 (unknown frame type) | LOW | `z.discriminatedUnion` rejects unknown `type` literals → `parse_error` event; consumer can log and skip | MITIGATED |
| T-4-SSE-04 (heartbeat as data) | LOW | Lines starting with `:` skipped in `parseSseFrame`; only `data:` lines extracted | MITIGATED |

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 04-03 (X9 consumer migration):**

- `SecretBridgeClient.internalTurnStream(body, signal?)` is the drop-in replacement for the hand-rolled SSE buffer in `agent-x9/services/cap-glasses/src/agent-bridge.ts:105-168`. Migration is: `fetch → parseSseStream` becomes `client.internalTurnStream(body)`.
- Consumers should switch on `event.kind` first (frame | heartbeat | parse_error), then on `event.frame.type` (text | tool_call_start | ...). TS `never`-check ensures the inner switch stays exhaustive if future frame types are added.
- For `parse_error` handling: cap-glasses should log-and-continue (the generator keeps yielding after a bad frame). For `error` frames: surface to the channel. For `aborted` frames: reset UI streaming state without treating as error.

**Ready for Plan 04-04 (Forge consumer migration):**

- Forge does not currently consume /internal/turn/stream, so 04-04 inherits the frame schemas only if a future Forge-side streaming UI is built. The barrel export `@x9-forge/contracts/http` exposes everything needed.
- `voice-svc` remains the Forge→X9 SSE-free path; no change there.

**Things Wave 2 needs to know:**

- `parseSseStream` expects a `ReadableStream<Uint8Array>` — use the `Response.body` from `fetch`. In Node < 18 environments this requires polyfill; current X9 + Forge both run Node 20+, so no action needed.
- The typed method returns `Promise<AsyncGenerator<ParsedSseEvent>>`, not `AsyncGenerator<ParsedSseEvent>`. Callers must `await` before `for-await-of`, which catches HTTP errors synchronously and avoids a generator that never yields.
- `ParsedSseEvent` is exported from `@x9-forge/contracts/http` — consumers should type their event handler parameter with it directly; do NOT re-define the union locally.

---
*Phase: 04-http-endpoint-contracts-block-d*
*Completed: 2026-04-15*

## Self-Check: PASSED

- All 4 new files verified on disk (src/http/sse-frames.ts, src/http/sse-parser.ts, tests/http/sse-frames.test.ts, tests/http/sse-parser.test.ts)
- All 6 task commits found in `git log --oneline --all` (5732735, 628ef36, 9e6669d, e659366, d2f7282, df62f9e)
- `pnpm build` green (tsc -b, zero errors)
- `pnpm test` green (26 files, 228 tests — 200 baseline + 28 new: 16 frame + 12 parser)
- must_have #1 — `grep "discriminatedUnion" src/http/sse-frames.ts` matches 1 line ✓
- must_have #2 — all 6 frame type exports (SseTextFrame, SseToolCallStartFrame, SseToolCallEndFrame, SseDoneFrame, SseErrorFrame, SseAbortedFrame) present in sse-frames.ts ✓
- must_have #3 — `grep "heartbeat" src/http/sse-parser.ts` matches multiple lines ✓
- must_have #4 — `parseSseStream` declared as `async function*` (async generator) ✓
- must_have #5 — `internalTurnStream` declared + implemented in bridge-client.ts (interface + secret branch) ✓
- must_have #6 — build + test both green, no regressions ✓
- Threat mitigations T-4-SSE-01..04 all implemented via parser design (safeParse, incremental buffer, discriminated-union reject, `:`-comment skip)
