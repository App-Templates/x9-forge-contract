---
phase: 06-model-router-contracts-block-f
reviewed: 2026-04-15T23:34:35Z
depth: standard
files_reviewed: 32
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
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-15T23:34:35Z
**Depth:** standard
**Files Reviewed:** 32
**Status:** issues_found

## Summary

Phase 6 ships 7 Zod v4 schemas for the X9 Phase 35 model-router (tier, provider, tier-mapping, policy, per-agent override, push request/response, hot-reload notification), 2 HTTP endpoint contracts (`/internal/model-config`, `/internal/model-config/version`), an optional `modelPolicy` extension to `CapabilityRegistryEntry`, 8 synthetic fixtures, and an exhaustive barrel test. Code is tight, Zod v4 idioms are consistent with prior phases (superRefine for cross-field invariants, explicit `MODEL_*` literal tuples for exhaustiveness, discriminated union on `ok` for responses), fail-loud semantics are preserved, and the 381/381 test count matches the plan.

The review found no critical defects and no security concerns (the package is a pure contract library — no I/O, no auth handling, no string concatenation beyond `toEndpoint`). Two warnings cover contract-vs-doc mismatches where schema permissiveness exceeds documented intent (empty `providers` record, empty `tierMapping`). Three info items cover minor hygiene (unused value import, redundant branch in superRefine, empty-object semantics).

None of these items block ship. They are worth addressing before X9 Phase 35 consumes the schemas to keep producer expectations aligned with parse behavior.

## Warnings

### WR-01: `ModelPushRequestSchema.providers` allows empty `{}` despite docstring claiming "at least one provider must be present"

**File:** `src/model-router/model-push.ts:18-29`
**Issue:** The docstring above `providers` says "At least one provider must be present (deploy-time requirement)", but the schema `z.record(ModelProviderSchema, ModelTierMappingSchema.optional())` happily parses `{ providers: {} }`. A producer reading the doc would expect the schema to reject empty, but it does not. This is also untested — `tests/model-router/model-push.test.ts` only covers the `{ openai: FULL_MAPPING }` minimal case. Additionally, because inner values are `.optional()`, `{ providers: { openai: undefined } }` also parses, which is stricter-than-useless (the mapping was declared-but-absent).

**Fix:** Either tighten the schema to match the doc, or soften the doc to match the schema. Recommended: tighten with a refine so parse-time matches producer expectations:
```ts
export const ModelPushRequestSchema = z.object({
  providers: z.record(ModelProviderSchema, ModelTierMappingSchema.optional())
    .refine((p) => Object.values(p).some((v) => v !== undefined), {
      message: 'ModelPushRequest.providers must include at least one provider mapping',
    }),
  perCapPolicies: z.record(z.string().min(1), ModelPolicySchema).optional(),
  perAgentOverrides: z.array(PerAgentModelOverrideSchema).optional(),
});
```
Then add a test asserting `safeParse({ providers: {} }).success === false`. If the intent is genuinely "empty is legal at parse time, deploy-time guard lives downstream", update the docstring to say so and add a green test for `{ providers: {} }` to lock the behavior.

### WR-02: `PerAgentModelOverride` refine treats `tierMapping: {}` as "provided", bypassing the "at-least-one-of" invariant

**File:** `src/model-router/per-agent-model-override.ts:25-36`
**Issue:** The superRefine at line 29-35 only checks `o.policy === undefined && o.tierMapping === undefined`. A consumer can submit `{ agentId, tierMapping: {} }` and pass the invariant while providing zero actual overrides — defeating the point of D-20. The partial-tierMapping allowance (D-22) is legitimate, but an empty object is semantically equivalent to "no override at all" and should be treated the same as `undefined`.

**Fix:**
```ts
.superRefine((o, ctx) => {
  const hasPolicy = o.policy !== undefined;
  const hasMapping = o.tierMapping !== undefined && Object.keys(o.tierMapping).length > 0;
  if (!hasPolicy && !hasMapping) {
    ctx.addIssue({
      code: 'custom',
      message: 'PerAgentModelOverride must specify at least one of: policy, tierMapping (non-empty)',
    });
  }
});
```
Add a matching negative test: `PerAgentModelOverrideSchema.safeParse({ agentId: AGENT_IDENTITY, tierMapping: {} }).success === false`.

## Info

### IN-01: Unused value import of `z` in `internal-model-config-version.ts`

**File:** `src/http/endpoints/internal-model-config-version.ts:1`
**Issue:** `import { z } from 'zod'` pulls `z` into the value namespace, but the file only uses it in the type position `z.infer<typeof ModelConfigVersionResponseSchema>`. TS strips this at emit, so there is no runtime cost, but ESLint `no-unused-vars` or `import/no-unused-modules` will eventually flag it, and it reads as if `z` were used at runtime.
**Fix:** Either switch to a type-only import — `import type { z } from 'zod';` — or drop the import and replace the alias with an explicit type derivation (`type ModelConfigVersionResponse = ModelHotReloadNotification;` after importing the type).

### IN-02: Redundant `.length === 0` branch in `ModelTierMappingSchema` superRefine

**File:** `src/model-router/model-tier-mapping.ts:22-30`
**Issue:** The predicate `typeof m[t] !== 'string' || (m[t] ?? '').length === 0` is partially dead. The inner record value is `z.string().min(1).optional()`, so by the time superRefine runs, any present value is already a non-empty string — an empty string would have failed the inner parse and never reached this point. The `.length === 0` branch therefore cannot fire. Harmless but misleading: a future reader may assume empty strings are caught here when they are actually caught upstream.
**Fix:** Simplify to `const missing = MODEL_TIERS.filter((t) => typeof m[t] !== 'string');` (or `(t) => m[t] === undefined` for clarity). Behavior is identical.

### IN-03: Synthetic-fixture disclosure file is good, but fixtures could embed a version tag for future drift tracking

**File:** `tests/model-router/fixtures/SYNTHETIC-NOTES.md:1-19`
**Issue:** The note correctly flags the fixtures as synthetic and explains the `_note` strip pattern. Once Phase 35 ships and staging captures replace these, there is no automated signal that a fixture was resnapshotted. Adding a field like `"_capturedFrom": "synthetic" | "staging@<sha>"` inside `_note` (or alongside it, since the test helper strips `_note` already) would make the Phase-35 handoff auditable.
**Fix:** Non-blocking. When swapping synthetics for real captures in Phase 35, adopt a convention like `"_note": "STAGING — captured 2026-MM-DD from agent-x9@<sha>"` so PR review can see at a glance that the fixture lineage changed.

---

_Reviewed: 2026-04-15T23:34:35Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
