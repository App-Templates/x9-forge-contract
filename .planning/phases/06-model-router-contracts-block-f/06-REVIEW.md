---
phase: 06-model-router-contracts-block-f
reviewed: 2026-04-15T23:41:04Z
depth: standard
iteration: 2
files_reviewed: 34
files_reviewed_list:
  - src/capability/capability-registry-entry.ts
  - src/http/endpoints/index.ts
  - src/http/endpoints/internal-model-config-version.ts
  - src/http/endpoints/internal-model-config.ts
  - src/index.ts
  - src/model-router/index.ts
  - src/model-router/model-hot-reload.ts
  - src/model-router/model-policy.ts
  - src/model-router/model-provider.ts
  - src/model-router/model-push.ts
  - src/model-router/model-tier-mapping.ts
  - src/model-router/model-tier.ts
  - src/model-router/per-agent-model-override.ts
  - tests/capability/capability-registry-entry.test.ts
  - tests/capability/fixtures/registry-entry-with-model-policy.json
  - tests/capability/fixtures/registry-entry-without-model-policy.json
  - tests/model-router/barrel.test.ts
  - tests/model-router/fixtures.test.ts
  - tests/model-router/fixtures/SYNTHETIC-NOTES.md
  - tests/model-router/fixtures/model-hot-reload-notification-minimal.json
  - tests/model-router/fixtures/model-push-request-complete.json
  - tests/model-router/fixtures/model-push-request-minimal.json
  - tests/model-router/fixtures/model-push-response-error-internal.json
  - tests/model-router/fixtures/model-push-response-error-invalid-mapping.json
  - tests/model-router/fixtures/model-push-response-error-invalid-policy.json
  - tests/model-router/fixtures/model-push-response-error-unknown-cap.json
  - tests/model-router/fixtures/model-push-response-success.json
  - tests/model-router/model-hot-reload.test.ts
  - tests/model-router/model-policy.test.ts
  - tests/model-router/model-provider.test.ts
  - tests/model-router/model-push.test.ts
  - tests/model-router/model-tier-mapping.test.ts
  - tests/model-router/model-tier.test.ts
  - tests/model-router/per-agent-model-override.test.ts
findings:
  critical: 0
  warning: 0
  info: 3
  total: 3
status: issues_found
---

# Phase 6: Code Review Report (Iteration 2)

**Reviewed:** 2026-04-15T23:41:04Z
**Depth:** standard
**Files Reviewed:** 34
**Status:** issues_found (info-only — no blockers)

## Summary

Iteration 2 re-review of Phase 6 model-router contracts, following the fix pass for WR-01 and WR-02 flagged in iteration 1.

**Warnings resolved.** Both warnings from iteration 1 are now closed:

- **WR-01** (empty `providers` record in `ModelPushRequest`): commit `12e588c` adds the recommended `.refine()` in `src/model-router/model-push.ts:26-28` that rejects any record where every value is `undefined`, with the exact message suggested in the iteration-1 fix. Two new negative tests were added in `tests/model-router/model-push.test.ts:36-46` — one for `{ providers: {} }` and one for `{ providers: { openai: undefined } }`. Both trip the refine and assert the message regex. Matches the iteration-1 recommendation.
- **WR-02** (`tierMapping: {}` bypasses the at-least-one-of invariant in `PerAgentModelOverride`): commit `7048675` updates the superRefine in `src/model-router/per-agent-model-override.ts:29-43` to require at least one *defined* value in `tierMapping` (not just a non-empty key set). The implementation uses `Object.values(o.tierMapping).some((v) => v !== undefined)` rather than the `Object.keys(...).length > 0` suggested in iteration 1 — a stricter and more correct variant given Zod v4 `z.record` with enum keys materializes all enum keys with `undefined` for absent entries (a gotcha called out inline at lines 31-33). A new negative test covering `{ agentId, tierMapping: {} }` was added in `tests/model-router/per-agent-model-override.test.ts:33-39`. Matches the iteration-1 intent and improves on the suggested code.

**Test count.** 384/384 tests pass (up from 381 in iteration 1 — +3 tests, one each for the empty-providers, undefined-only-providers, and empty-tierMapping cases). No regressions.

**Info items carried over.** The three info items from iteration 1 (IN-01, IN-02, IN-03) were explicitly out of scope for the fix pass and remain in the code unchanged. They are re-surfaced below verbatim with their original file:line references verified against current HEAD.

No new issues introduced. No critical defects. No security concerns (the package remains a pure contract library — no I/O, no auth handling, no string concatenation beyond `toEndpoint`).

**Ship posture.** The two warnings that motivated iteration 1 are closed. The three remaining info items are style/hygiene suggestions that do not affect parse correctness or X9 Phase 35 consumability. Phase 6 is ready to ship.

## Info

### IN-01: Unused value import of `z` in `internal-model-config-version.ts`

**File:** `src/http/endpoints/internal-model-config-version.ts:1`
**Issue:** `import { z } from 'zod'` pulls `z` into the value namespace, but the file only uses it in the type position `z.infer<typeof ModelConfigVersionResponseSchema>` at line 17. TS strips this at emit, so there is no runtime cost, but ESLint `no-unused-vars` or `import/no-unused-modules` will eventually flag it, and it reads as if `z` were used at runtime.
**Fix:** Either switch to a type-only import — `import type { z } from 'zod';` — or drop the import and replace the alias with an explicit type derivation (`type ModelConfigVersionResponse = ModelHotReloadNotification;` after importing the type).

### IN-02: Redundant `.length === 0` branch in `ModelTierMappingSchema` superRefine

**File:** `src/model-router/model-tier-mapping.ts:22-30`
**Issue:** The predicate `typeof m[t] !== 'string' || (m[t] ?? '').length === 0` at line 23 is partially dead. The inner record value is `z.string().min(1).optional()`, so by the time superRefine runs, any present value is already a non-empty string — an empty string would have failed the inner parse and never reached this point. The `.length === 0` branch therefore cannot fire. Harmless but misleading: a future reader may assume empty strings are caught here when they are actually caught upstream.
**Fix:** Simplify to `const missing = MODEL_TIERS.filter((t) => typeof m[t] !== 'string');` (or `(t) => m[t] === undefined` for clarity). Behavior is identical.

### IN-03: Synthetic-fixture disclosure is good, but fixtures could embed a version tag for future drift tracking

**File:** `tests/model-router/fixtures/SYNTHETIC-NOTES.md:1-19`
**Issue:** The note correctly flags the fixtures as synthetic and explains the `_note` strip pattern. Once Phase 35 ships and staging captures replace these, there is no automated signal that a fixture was resnapshotted. Adding a field like `"_capturedFrom": "synthetic" | "staging@<sha>"` inside `_note` (or alongside it, since the test helper strips `_note` already) would make the Phase-35 handoff auditable.
**Fix:** Non-blocking. When swapping synthetics for real captures in Phase 35, adopt a convention like `"_note": "STAGING — captured 2026-MM-DD from agent-x9@<sha>"` so PR review can see at a glance that the fixture lineage changed.

---

_Reviewed: 2026-04-15T23:41:04Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Iteration: 2 (re-review after fix pass — WR-01 and WR-02 closed)_
