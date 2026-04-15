# Plan 06-03: CapabilityRegistryEntry.modelPolicy? Extension — Summary

**Completed:** 2026-04-16
**Status:** Complete — 1/1 autonomous task green, closure gate green

## What was built

Single non-breaking extension of `src/capability/capability-registry-entry.ts`:
- Added `import { ModelPolicySchema } from '../model-router/model-policy.js';`
- Added `modelPolicy: ModelPolicySchema.optional()` field to `CapabilityRegistryEntrySchema`
- Updated JSDoc on the field (D-24 consumer-default note) + augmented the class-level JSDoc with the new field description
- `toEndpoint()` and `fromEndpoint()` bodies untouched (neither helper reads `modelPolicy` — verified by test)

### 2 new fixtures (tests/capability/fixtures/)

- `registry-entry-with-model-policy.json` (fixture f per D-27) — happy path
- `registry-entry-without-model-policy.json` (fixture g per D-27) — backward compat

### 4 new tests appended to capability-registry-entry.test.ts

- accepts entry with valid modelPolicy (fixture f)
- accepts entry without modelPolicy — backward-compat (fixture g)
- rejects entry with invalid modelPolicy (min > max) — transitive ModelPolicySchema.superRefine propagation (T-06-01 carry)
- toEndpoint / fromEndpoint baselines unchanged

## Requirements addressed

- MDRT-04 (`modelPolicy?: ModelPolicy` opzionale aggiunto a `CapabilityRegistryEntry` — backward compat)

## Commits

- `66f0efd` feat(capability): extend CapabilityRegistryEntry with optional modelPolicy (06-03-01, MDRT-04)

## Closure gate (06-03-02)

- `pnpm test`: **381/381 green** (+4 new vs plan 06-02 closure state)
- `pnpm build`: clean
- `pnpm tsc --noEmit`: clean
- `grep -c "modelPolicy" dist/capability/capability-registry-entry.d.ts` → 2 (emitted in .d.ts)

## Notes

Transitive ModelPolicy refine propagation works as expected: invalid `{ min: 'reasoning', max: 'standard' }` in a CapabilityRegistryEntry fails parsing with the same diagnostic used by PerAgentModelOverride.policy and perCapPolicies — no separate guard code needed at the capability level.
