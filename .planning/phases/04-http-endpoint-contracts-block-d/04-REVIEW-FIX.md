---
phase: 4
phase_name: http-endpoint-contracts-block-d
iteration: 1
fix_scope: critical_warning
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
fixed_at: 2026-04-15
---

# Phase 4: Code Review Fix Report

**Fixed at:** 2026-04-15
**Source review:** `.planning/phases/04-http-endpoint-contracts-block-d/04-REVIEW.md`
**Iteration:** 1
**Base commit:** `ffed87c`

**Summary:**
- Findings in scope: 5 (all Warning severity)
- Fixed: 5
- Skipped: 0
- Test impact: 228/228 green after each fix (no regressions, no test changes required)

## Fixed Issues

### WR-01: Typed client methods never validate against their Zod schemas

**File modified:** `src/http/bridge-client.ts`
**Commit:** `e3c1173`
**Diff:** +27 / -15
**Applied fix:**
- Switched `import type` to value imports for the request/params/response Zod schemas of: reload-agent, stop-agent, internal-turn, internal-query, webhook-post-call, voice-register.
- For each of the six typed wrappers (`reloadAgent`, `stopAgent`, `internalTurn`, `internalQuery`, `postCallWebhook`, `voiceRegister`):
  - Validate input via `*ParamsSchema.parse({ agentId })` (URL-interpolated agent IDs now run the `/^[a-z0-9-]+$/` regex guard at the bridge layer) or `*RequestSchema.parse(body)`.
  - Issue the underlying `request<unknown>()` so the cast `as T` no longer hides the response shape.
  - Run `*ResponseSchema.parse(raw)` on the returned body before handing it to the caller — closes the silent shape-drift gap noted in the review.
- `listAgents` left untouched — review scope was the six typed wrappers it lists.
- Verification: `pnpm build && pnpm test` → 26 files / 228 tests green. No existing test relied on bypassing schema validation, so no test rewrite was needed.

### WR-02: Caller-supplied `headers` can override auth headers

**File modified:** `src/http/bridge-client.ts`
**Commit:** `fd8074a`
**Diff:** +2 / -2
**Applied fix:** Swapped spread order inside `request()` so `...options.headers` is first and `...auth` last. Caller-supplied `headers` can no longer overwrite the discriminated auth header. Two-line surgical change as specified.
**Note:** Verification scope was unit tests only — no integration test exercises the override path. Net effect is safe (auth header now wins), but a dedicated regression test for this guarantee is not added (out of fix scope; flagged below for triage).

### WR-03: `parseSseStream` buffer is unbounded

**File modified:** `src/http/sse-parser.ts`
**Commit:** `6f14bab`
**Diff:** +4 / -0
**Applied fix:** Added `const MAX_FRAME_BYTES = 1 << 20;` (1 MB) and an overflow check immediately after `buffer += decoder.decode(...)` that throws `Error("SSE frame exceeded ${MAX_FRAME_BYTES} bytes without terminator")`. Cap matches the value suggested in REVIEW.md.

### WR-04: SSE parser rejects dataless frames as parse_error

**File modified:** `src/http/sse-parser.ts`
**Commit:** `b677c7e`
**Diff:** +3 / -3
**Applied fix:** When `dataLines.length === 0`, unconditionally return `{ kind: 'heartbeat' }`. Suppressed the now-unused `isHeartbeatOnly` accumulator with `void isHeartbeatOnly;` rather than removing it (kept diff minimal — leaving the variable lets reviewers see the prior intent in the loop). Existing test `'returns heartbeat for an empty frame (no data lines)'` still passes; no new test was added (out of fix scope).
**Note:** A dedicated test for `id: 42\n\n`-only frames being heartbeat (rather than parse_error) would strengthen the regression guard but is out of scope per the surgical rule.

### WR-05: SSE parser does not handle CRLF frame boundaries

**File modified:** `src/http/sse-parser.ts`
**Commit:** `9d25aa7`
**Diff:** +2 / -1
**Applied fix:** Apply `.replace(/\r\n|\r/g, '\n')` to the decoder output before appending to `buffer`. `indexOf('\n\n')` is unchanged (boundary scan now sees normalized LF). Order with WR-03's `MAX_FRAME_BYTES` check is correct: `buffer.length` is checked after normalization, so CRLF-heavy input cannot mask the cap.

## Skipped Issues

None. All 5 in-scope warnings were fixed.

## New issues discovered

Flagged for the user to triage — NOT fixed in this pass:

- **Test gap (WR-02):** The header-override foot-gun fix ships without a dedicated regression test. A future refactor that re-orders the spread back could pass CI silently.
- **Test gap (WR-04):** No test exercises the spec-valid `id: 42\n\n` (or `event: …\n\n`) dataless-frame path. The fix is correct by inspection, but the existing "empty frame" test does not cover the `isHeartbeatOnly = false` branch that previously returned `parse_error`.
- **Test gap (WR-05):** No test feeds a `\r\n`-terminated SSE stream end-to-end through `parseSseStream`. The normalization is trivially correct, but a regression test would lock the behavior.
- **Stylistic (WR-04):** The `void isHeartbeatOnly;` left in `parseSseFrame` is dead code preserved only to keep the diff minimal; a follow-up cleanup could remove the variable and its `else if` branch entirely.
- **IN-02 still applies** post-WR-01: `internalTurnStream()` (lines 232–264 in updated file) still re-implements URL/auth/header plumbing inline and now also lacks the per-frame schema parsing that the typed wrappers perform. WR-01 only covered the six typed wrappers as listed in the finding; the streaming path was deliberately left out of scope.

---

_Fixed: 2026-04-15_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
