# Plan 06-02: Bridge Model Router Schemas — Summary

**Completed:** 2026-04-16
**Status:** Complete — 9/9 tasks green, full suite + build + tsc all pass

## What was built

7 new Zod schema modules under `src/model-router/` + 2 HTTP endpoint contract files + 10 synthetic fixtures + 8 test files. Sub-path `@x9-forge/contracts/model-router` exports 15 symbols from `dist/`.

### Source modules (src/model-router/)

- `model-tier.ts` — `MODEL_TIERS`, `ModelTierSchema`, `TIER_ORDER`, `compareTiers` helper.
- `model-provider.ts` — `MODEL_PROVIDERS`, `ModelProviderSchema`.
- `model-tier-mapping.ts` — `ModelTierMappingSchema` with completeness `superRefine` + manual narrowed `type ModelTierMapping = Record<ModelTier, string>` (R-13 Zod v4 gotcha mitigation).
- `model-policy.ts` — `ModelPolicySchema` with min<=max `superRefine` citing received values (T-06-01 guard).
- `per-agent-model-override.ts` — `PerAgentModelOverrideSchema` using branded `AgentIdentitySchema` (Phase 2 reuse) + at-least-one-of `superRefine`. Partial tierMapping allowed per D-22.
- `model-push.ts` — `ModelPushRequestSchema`, `ModelPushSuccessSchema`, `ModelPushErrorSchema`, `ModelPushResponseSchema` (discriminated union on `ok`), `pushModelConfigContract` (POST `/internal/model-config`, authType secret).
- `model-hot-reload.ts` — `ModelHotReloadNotificationSchema` (version, appliedAt, optional providersChanged/capsChanged).
- `index.ts` — barrel re-export.

### HTTP endpoint contracts (src/http/endpoints/)

- `internal-model-config.ts` — re-exports `pushModelConfigContract` from model-router/model-push.js.
- `internal-model-config-version.ts` — new `modelConfigVersionContract` (GET `/internal/model-config/version`, secret auth) for polling hot-reload per 06-01 decision.

### Root barrel

- `src/index.ts` — added `export * from './model-router/index.js';` per D-01 coherence.

### Synthetic fixtures (tests/model-router/fixtures/)

8 JSON fixtures covering: push-request-minimal, push-request-complete, push-response-success, 4 error-code variants (INVALID_POLICY, UNKNOWN_CAP, INVALID_MAPPING, INTERNAL_ERROR), hot-reload-notification-minimal. `SYNTHETIC-NOTES.md` documents Phase 6 greenfield origin.

### Tests

- model-tier.test.ts (14 tests — all 9 compareTiers combos + reflexive + enum + MODEL_TIERS shape)
- model-provider.test.ts (3 tests)
- model-tier-mapping.test.ts (5 tests — completeness + refine diagnostic + unknown keys)
- model-policy.test.ts (10 tests — 6 valid orderings + 3 invalid + unknown tier)
- per-agent-model-override.test.ts (7 tests — policy-only, mapping-only, both, 4 invalid paths incl. branded agentId + nested refine)
- model-push.test.ts (16 tests — request min/full, 4 error codes, narrowing, contract shape)
- model-hot-reload.test.ts (5 tests)
- barrel.test.ts (15 exhaustiveness tests)
- fixtures.test.ts (8 fixture parse tests)

## Key findings / deviations

1. **Zod v4 `z.record(enum, value)` strict-completeness**: `z.record` with an enum key requires ALL enum keys at base-schema level (inner value is NOT auto-optional). Wherever D-22 required partial mapping (`PerAgentModelOverride.tierMapping`) or where minimal API shapes were expected (`ModelPushRequest.providers`), wrapped the inner value in `.optional()` so the refine (or natural shape) could emit its diagnostic.

2. **Zod v4 `.refine(fn, messageBuilderFn)` second-arg function form is not honored** — the custom message builder never fired and returned a generic "Invalid input". Migrated to `superRefine((val, ctx) => ctx.addIssue({...}))` pattern across ModelTierMapping, ModelPolicy, and PerAgentModelOverride. All diagnostic tests pass. Phase 5 `.refine(fn, { message: '...' })` static-object form still works; the function-form message builder appears broken in Zod v4.3.6. Documented in CONTEXT D-11/D-18 adjacent notes via code comments on each superRefine.

3. **R-13 Zod v4 type gotcha**: `z.record(enum, value.optional())` inferred type is `Partial<Record<ModelTier, string>>`. Manual `type ModelTierMapping = Record<ModelTier, string>` export preserved in `model-tier-mapping.ts` per 06-RESEARCH recommendation.

## Requirements addressed

- MDRT-01, MDRT-02, MDRT-03, MDRT-05, MDRT-06, MDRT-07, MDRT-08 (all via 06-02)

## Commits (8 per-task + 1 SUMMARY)

- `c15ca25` feat(model-router): add ModelTier + ModelProvider schemas + compareTiers helper (06-02-01)
- `3b5b725` feat(model-router): add ModelTierMapping schema with completeness refine (06-02-02)
- `853c885` feat(model-router): add ModelPolicy schema with min<=max invariant refine (06-02-03)
- `76b3f60` feat(model-router): add PerAgentModelOverride with at-least-one refine (06-02-04)
- `87db32b` feat(model-router): add ModelPushRequest/Response + pushModelConfigContract (06-02-05)
- `b152149` feat(model-router): add ModelHotReloadNotification shape + polling version contract (06-02-06)
- `cd2c2b0` feat(model-router): barrel closure + root re-export + exhaustiveness test (06-02-07)
- `6a6fcb0` test(model-router): add 8 synthetic fixtures + parse suite (06-02-08)

## Closure gate (06-02-09)

- `pnpm test`: 377/377 green (Phase 5 baseline 287 + 90 new across Phase 6 so far)
- `pnpm build`: emits `dist/model-router/index.js` + `dist/model-router/index.d.ts`
- `pnpm tsc --noEmit`: clean
- Sub-path smoke: `import('./dist/model-router/index.js')` resolves 15 exports
