---
phase: 06-model-router-contracts-block-f
fixed_at: 2026-04-15T23:39:09Z
review_path: .planning/phases/06-model-router-contracts-block-f/06-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 6: Code Review Fix Report

**Fixed at:** 2026-04-15T23:39:09Z
**Source review:** .planning/phases/06-model-router-contracts-block-f/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2 (WR-01, WR-02; info items IN-01/02/03 out of scope for `critical_warning`)
- Fixed: 2
- Skipped: 0
- Test suite: 384/384 passing (381 baseline + 3 new tests added alongside fixes)

## Fixed Issues

### WR-01: `ModelPushRequestSchema.providers` allows empty `{}` despite docstring claiming "at least one provider must be present"

**Files modified:** `src/model-router/model-push.ts`, `tests/model-router/model-push.test.ts`
**Commit:** 12e588c
**Applied fix:** Added a `.refine` on the `providers` record asserting at least one defined provider value (`Object.values(p).some((v) => v !== undefined)`). This rejects both `{ providers: {} }` and `{ providers: { openai: undefined } }` — matching the docstring's "at least one provider must be present" intent. Updated the docstring to mention the declared-but-absent case. Added two negative tests locking the new behavior.

### WR-02: `PerAgentModelOverride` refine treats `tierMapping: {}` as "provided", bypassing the "at-least-one-of" invariant

**Files modified:** `src/model-router/per-agent-model-override.ts`, `tests/model-router/per-agent-model-override.test.ts`
**Commit:** 7048675
**Applied fix:** Strengthened the superRefine to reject `tierMapping: {}` (or any tierMapping with no defined values) as equivalent to "not provided". Computed `hasMapping` via `Object.values(o.tierMapping).some((v) => v !== undefined)` instead of `=== undefined` check.

**Zod v4 gotcha discovered during fix:** The REVIEW.md suggested `Object.keys(o.tierMapping).length > 0`, but in Zod v4 a `z.record(ModelTierSchema, z.string().min(1).optional())` with an enum key pre-materializes all enum keys set to `undefined` when parsing `{}` — so `Object.keys({}).length` returns 3 (`standard`, `advanced`, `reasoning`), not 0, and the key-count check would have falsely passed the invariant. Switched to `Object.values(...).some((v) => v !== undefined)` which correctly distinguishes a truly empty override from a partially-populated one. Added an inline comment documenting the gotcha for future readers, plus a negative test covering `{ agentId, tierMapping: {} }`.

The updated error message is `PerAgentModelOverride must specify at least one of: policy, tierMapping (non-empty)` — the existing test regex `/must specify at least one of: policy, tierMapping/` still matches.

---

_Fixed: 2026-04-15T23:39:09Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
