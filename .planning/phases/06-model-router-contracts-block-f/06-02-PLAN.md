---
phase: 06-model-router-contracts-block-f
plan: 06-02
type: execute
wave: 2
depends_on: ["06-01"]
files_modified:
  - src/model-router/model-tier.ts
  - src/model-router/model-provider.ts
  - src/model-router/model-tier-mapping.ts
  - src/model-router/model-policy.ts
  - src/model-router/model-push.ts
  - src/model-router/model-hot-reload.ts
  - src/model-router/per-agent-model-override.ts
  - src/model-router/index.ts
  - src/http/endpoints/internal-model-config.ts
  - src/http/endpoints/index.ts
  - src/index.ts
  # Hot-reload transport — selected by 06-01 (default: polling per 06-RESEARCH.md):
  - src/http/endpoints/internal-model-config-version.ts  # polling variant (default)
  # - src/http/sse-frames.ts  # SSE variant (uncomment if 06-01 picks SSE)
  - tests/model-router/model-tier.test.ts
  - tests/model-router/model-provider.test.ts
  - tests/model-router/model-tier-mapping.test.ts
  - tests/model-router/model-policy.test.ts
  - tests/model-router/model-push.test.ts
  - tests/model-router/model-hot-reload.test.ts
  - tests/model-router/per-agent-model-override.test.ts
  - tests/model-router/barrel.test.ts
  - tests/model-router/fixtures.test.ts
  - tests/model-router/fixtures/SYNTHETIC-NOTES.md
  - tests/model-router/fixtures/model-push-request-minimal.json
  - tests/model-router/fixtures/model-push-request-complete.json
  - tests/model-router/fixtures/model-push-response-success.json
  - tests/model-router/fixtures/model-push-response-error-invalid-policy.json
  - tests/model-router/fixtures/model-push-response-error-unknown-cap.json
  - tests/model-router/fixtures/model-push-response-error-invalid-mapping.json
  - tests/model-router/fixtures/model-push-response-error-internal.json
  - tests/model-router/fixtures/model-hot-reload-notification-minimal.json
autonomous: true
requirements: [MDRT-01, MDRT-02, MDRT-03, MDRT-05, MDRT-06, MDRT-07, MDRT-08]
validation_ref: 06-VALIDATION.md

must_haves:
  truths:
    - "`import { ModelTierSchema, ModelProviderSchema, ModelTierMappingSchema, ModelPolicySchema, ModelPushRequestSchema, ModelPushResponseSchema, pushModelConfigContract, ModelHotReloadNotificationSchema, PerAgentModelOverrideSchema, compareTiers, MODEL_TIERS, MODEL_PROVIDERS } from '@x9-forge/contracts/model-router'` resolves from a consumer"
    - "`compareTiers('standard','reasoning') === -1`, `compareTiers('reasoning','standard') === 1`, `compareTiers('advanced','advanced') === 0`"
    - "`ModelTierSchema.safeParse('omni').success === false`"
    - "`ModelTierMappingSchema.safeParse({ standard: 'x', advanced: 'y' }).success === false` with message mentioning missing tier `reasoning`"
    - "`ModelPolicySchema.safeParse({ min: 'reasoning', max: 'standard' }).success === false` with message citing received min/max values"
    - "`ModelPolicySchema.safeParse({ min: 'standard', max: 'reasoning' }).success === true`"
    - "`ModelPushResponseSchema.parse({ ok: true, applied: 3 })` succeeds; `{ ok: true, applied: -1 }` rejected"
    - "All 4 error codes parse via `ModelPushResponseSchema`: INVALID_POLICY, UNKNOWN_CAP, INVALID_MAPPING, INTERNAL_ERROR"
    - "`PerAgentModelOverrideSchema.safeParse({ agentId: { agentId: 'stefano', ownerId: 'owner_1' } }).success === false` (must specify policy OR tierMapping — D-20)"
    - "`pushModelConfigContract.path === '/internal/model-config'`, `.method === 'POST'`, `.authType === 'secret'`"
    - "`ModelHotReloadNotificationSchema.parse({ version: 'r1', appliedAt: '2026-04-16T12:00:00Z' })` succeeds"
    - "`type ModelTierMapping` exported as `Record<ModelTier, string>` (manual type export per R-13 / 06-RESEARCH §Zod v4 API)"
    - "All 10 synthetic fixtures under `tests/model-router/fixtures/` parse as their expected green/red matrix"
    - "`pnpm test` exits 0 with new tests added (~40-50 new assertions, targeting 06-VALIDATION.md table rows)"
    - "`pnpm build` emits `dist/model-router/index.js` + `dist/model-router/index.d.ts`"
    - "`pnpm tsc --noEmit` exits 0 (exactOptionalPropertyTypes honored)"
  artifacts:
    - path: "src/model-router/model-tier.ts"
      provides: "ModelTierSchema + MODEL_TIERS + TIER_ORDER + compareTiers"
      exports: ["ModelTierSchema", "ModelTier", "MODEL_TIERS", "TIER_ORDER", "compareTiers"]
    - path: "src/model-router/model-provider.ts"
      provides: "ModelProviderSchema + MODEL_PROVIDERS"
      exports: ["ModelProviderSchema", "ModelProvider", "MODEL_PROVIDERS"]
    - path: "src/model-router/model-tier-mapping.ts"
      provides: "ModelTierMappingSchema (refine: all tiers required) + manual narrowed type"
      exports: ["ModelTierMappingSchema", "ModelTierMapping"]
    - path: "src/model-router/model-policy.ts"
      provides: "ModelPolicySchema with min<=max refine"
      exports: ["ModelPolicySchema", "ModelPolicy"]
    - path: "src/model-router/model-push.ts"
      provides: "ModelPushRequest/Response + pushModelConfigContract"
      exports: ["ModelPushRequestSchema", "ModelPushRequest", "ModelPushResponseSchema", "ModelPushResponse", "ModelPushSuccessSchema", "ModelPushErrorSchema", "pushModelConfigContract"]
    - path: "src/model-router/model-hot-reload.ts"
      provides: "ModelHotReloadNotificationSchema + (conditional) SSE frame / polling contract per 06-01 decision"
      exports: ["ModelHotReloadNotificationSchema", "ModelHotReloadNotification"]
    - path: "src/model-router/per-agent-model-override.ts"
      provides: "PerAgentModelOverrideSchema (at-least-one-of refine)"
      exports: ["PerAgentModelOverrideSchema", "PerAgentModelOverride"]
    - path: "src/model-router/index.ts"
      provides: "Barrel for @x9-forge/contracts/model-router"
      contains: "export { ModelTierSchema"
    - path: "src/http/endpoints/internal-model-config.ts"
      provides: "pushModelConfigContract re-export point (mirroring reload pattern)"
      exports: ["pushModelConfigContract"]
    - path: "tests/model-router/fixtures/SYNTHETIC-NOTES.md"
      provides: "Documentation that Phase 6 fixtures are invented (no live endpoint); replace post-Phase 35"
      contains: "SYNTHETIC"
  key_links:
    - from: "src/model-router/model-tier-mapping.ts"
      to: "src/model-router/model-tier.ts"
      via: "ESM import"
      pattern: "from './model-tier\\.js'"
    - from: "src/model-router/model-policy.ts"
      to: "src/model-router/model-tier.ts"
      via: "ESM import (uses compareTiers in refine)"
      pattern: "from './model-tier\\.js'"
    - from: "src/model-router/per-agent-model-override.ts"
      to: "src/agent/agent-identity.js (AgentIdentitySchema)"
      via: "ESM import (D-20 riuses branded Phase 2 schema)"
      pattern: "from '../agent/agent-identity\\.js'"
    - from: "src/model-router/model-push.ts"
      to: "src/model-router/{model-provider,model-tier-mapping,model-policy,per-agent-model-override}.js"
      via: "ESM composition"
      pattern: "from './model-(provider|tier-mapping|policy|per-agent-model-override)\\.js'"
    - from: "src/http/endpoints/internal-model-config.ts"
      to: "src/model-router/model-push.js"
      via: "re-export of pushModelConfigContract"
      pattern: "from '../../model-router/model-push\\.js'"
    - from: "src/index.ts"
      to: "src/model-router/index.js"
      via: "root barrel re-export (Claude-discretion 'sì, coerenza')"
      pattern: "from './model-router/index\\.js'"
---

<objective>
Implement the 7 model-router source modules + barrel + HTTP endpoint contract file(s) + 10 synthetic fixtures + unit tests, freezing `@x9-forge/contracts/model-router` as the canonical source of truth for X9 Phase 35 and Forge Phase 10. Honors D-01..D-30 verbatim; hot-reload transport artefact (polling GET endpoint vs SSE frame variant) follows the decision recorded by plan 06-01 in `06-RESEARCH-X9-ALIGNMENT.md` §"Hot-Reload Mechanism Decision" (default per 06-RESEARCH.md recommendation: polling).

Scope:
- 7 new schema modules under `src/model-router/`.
- Barrel `src/model-router/index.ts` (replace placeholder `export {}`).
- HTTP endpoint contract file `src/http/endpoints/internal-model-config.ts` (POST push — D-15) + conditional `internal-model-config-version.ts` (GET polling, if 06-01 decided polling) or SSE frame addition (if 06-01 decided SSE).
- Register the new endpoint(s) in `src/http/endpoints/index.ts`.
- Add root re-export `export * from './model-router/index.js';` to `src/index.ts` (Claude-discretion closure: yes, per D-01 coherence).
- 10 synthetic fixtures + SYNTHETIC-NOTES.md.
- Per-schema test files + barrel smoke test + fixtures test.

Out of scope (per CONTEXT §"Out of scope"):
- Runtime implementation of `POST /internal/model-config` — Phase 35 X9.
- Forge Phase 10 UI.
- Provider adapters.
- `scripts/check-drift.ts` extension — greenfield phase, no live drift.

`package.json` exports field is already wired (entries for `./model-router` at lines 37-40). No diff expected there.
</objective>

<execution_context>
@/Users/admintemp/Downloads/Claude/.claude/get-shit-done/workflows/execute-plan.md
@/Users/admintemp/Downloads/Claude/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md
@.planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md
@.planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md
@.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
@src/vault/vault-tier.ts
@src/agent/agent-identity.ts
@src/http/response.ts
@src/http/endpoints/internal-agents-reload.ts
@src/http/endpoints/index.ts
@src/index.ts
@package.json

<interfaces>
<!-- Executor uses these verbatim — do not re-explore. -->

From `src/agent/agent-identity.ts` (Phase 2, reused D-20):
```ts
export const AgentIdSchema = z.string().min(1).brand<'AgentId'>();
export const OwnerIdSchema = z.string().min(1).brand<'OwnerId'>();
export const AgentIdentitySchema = z.object({ agentId: AgentIdSchema, ownerId: OwnerIdSchema });
```

From `src/vault/vault-tier.ts` (Phase 5 precedent — pattern for ordered enum + compareTiers):
```ts
export const VAULT_TIERS = ['platform','owner','agent'] as const;
export const VaultTierSchema = z.enum(VAULT_TIERS);
export function compareTiers(a: VaultTier, b: VaultTier): -1 | 0 | 1 {
  const ai = VAULT_TIERS.indexOf(a);
  const bi = VAULT_TIERS.indexOf(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}
```

From `src/http/endpoints/internal-agents-reload.ts` (Phase 4 precedent — contract shape):
```ts
export const reloadAgentContract = {
  method: 'POST' as const,
  path: '/internal/agents/:agentId/reload' as const,
  authType: 'secret' as const,
  paramsSchema: ReloadAgentParamsSchema,
  responseSchema: ReloadAgentResponseSchema,
} as const;
```

From `src/http/response.ts` (Phase 4 precedent — discriminated union on `ok`):
```ts
export const BridgeResponseSchema = z.discriminatedUnion('ok', [
  BridgeSuccessResponseSchema,  // ok: z.literal(true)
  BridgeErrorResponseSchema,    // ok: z.literal(false), code, message, details?
]);
```

From `package.json:37-40` (already wired — no edit needed):
```json
"./model-router": {
  "types": "./dist/model-router/index.d.ts",
  "import": "./dist/model-router/index.js"
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <task_id>06-02-01</task_id>
  <name>ModelTier + ModelProvider modules + barrel skeleton + tests (MDRT-01, D-04/D-05/D-06/D-08)</name>
  <files>
    src/model-router/model-tier.ts,
    src/model-router/model-provider.ts,
    src/model-router/index.ts,
    tests/model-router/model-tier.test.ts,
    tests/model-router/model-provider.test.ts
  </files>
  <read_first>
    - src/model-router/index.ts (current placeholder `export {};`)
    - src/vault/vault-tier.ts (pattern reference — body transfers 1:1)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-04..D-08
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Pattern Reuse Analysis" + §"Ordered enum + compareTiers"
  </read_first>
  <action>
**Create `src/model-router/model-tier.ts`** (verbatim):

```ts
import { z } from 'zod';

/**
 * Model capability tiers — ordered from lowest to highest capability.
 *
 *   standard < advanced < reasoning
 *
 * NOTE: lexical order does NOT match capability priority (unlike VaultTier).
 * Use `TIER_ORDER` / `compareTiers` for comparisons.
 *
 * Adding a new tier (e.g. 'omni') is a BREAKING semantic change — it reorders
 * TIER_ORDER and every consumer must bump. See CONTEXT D-07.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see agent-x9/.planning/ROADMAP.md (Phase 35 Model Router ROUTER-01)
 * @see forge-v2/.planning/ROADMAP.md (Phase 10 — TBD post-freeze)
 */
export const MODEL_TIERS = ['standard', 'advanced', 'reasoning'] as const;

/** Logical order — low → high capability. Source of truth for compareTiers. */
export const TIER_ORDER: readonly ModelTier[] = MODEL_TIERS;

export const ModelTierSchema = z.enum(MODEL_TIERS);

export type ModelTier = z.infer<typeof ModelTierSchema>;

/**
 * Compare two model tiers by capability order.
 * Returns -1 if `a < b`, 0 if equal, 1 if `a > b`.
 *
 * @example
 *   compareTiers('standard', 'reasoning') // -1
 *   compareTiers('advanced', 'advanced')  //  0
 *   compareTiers('reasoning', 'standard') //  1
 *
 * @see MODEL_TIERS — the canonical order.
 */
export function compareTiers(a: ModelTier, b: ModelTier): -1 | 0 | 1 {
  const ai = TIER_ORDER.indexOf(a);
  const bi = TIER_ORDER.indexOf(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}
```

**Create `src/model-router/model-provider.ts`** (verbatim):

```ts
import { z } from 'zod';

/**
 * LLM provider enum — v1 supports OpenAI, Anthropic, and Google (Gemini).
 *
 * `'google'` is reserved for Gemini tier — no live consumer in Phase 35 initial
 * cut; add matching credential key to AGENT_CREDENTIAL_KEYS when consumed.
 *
 * Extending this enum is a breaking change for consumers that pattern-match.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see agent-x9/.planning/ROADMAP.md (Phase 35 Model Router ROUTER-01 examples)
 * @see CONTEXT D-08
 */
export const MODEL_PROVIDERS = ['openai', 'anthropic', 'google'] as const;

export const ModelProviderSchema = z.enum(MODEL_PROVIDERS);

export type ModelProvider = z.infer<typeof ModelProviderSchema>;
```

**Replace `src/model-router/index.ts`** (currently `export {};`) with the initial barrel — subsequent tasks APPEND to this file:

```ts
/**
 * Model Router — cross-repo contracts for tier/policy-based LLM routing.
 *
 * Sub-path: `@x9-forge/contracts/model-router`.
 *
 * @module @x9-forge/contracts/model-router
 * @status greenfield — consumers planned (X9 Phase 35, Forge Phase 10); no live
 *   endpoint yet. Fixtures under tests/model-router/fixtures/ are synthetic.
 *
 * @see .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md
 * @see .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
 */

// Tier
export { ModelTierSchema, MODEL_TIERS, TIER_ORDER, compareTiers } from './model-tier.js';
export type { ModelTier } from './model-tier.js';

// Provider
export { ModelProviderSchema, MODEL_PROVIDERS } from './model-provider.js';
export type { ModelProvider } from './model-provider.js';
```

**Create `tests/model-router/model-tier.test.ts`** with the following cases:

```ts
import { describe, it, expect } from 'vitest';
import { ModelTierSchema, MODEL_TIERS, TIER_ORDER, compareTiers, type ModelTier } from '../../src/model-router/model-tier.js';

describe('ModelTierSchema', () => {
  it('accepts every literal in MODEL_TIERS', () => {
    for (const t of MODEL_TIERS) expect(ModelTierSchema.parse(t)).toBe(t);
  });
  it('rejects unknown values', () => {
    expect(ModelTierSchema.safeParse('omni').success).toBe(false);
    expect(ModelTierSchema.safeParse('').success).toBe(false);
  });
});

describe('MODEL_TIERS + TIER_ORDER', () => {
  it('MODEL_TIERS equals the locked order', () => {
    expect([...MODEL_TIERS]).toEqual(['standard', 'advanced', 'reasoning']);
  });
  it('TIER_ORDER === MODEL_TIERS (referential, low→high)', () => {
    expect(TIER_ORDER).toBe(MODEL_TIERS);
  });
});

describe('compareTiers — all 9 combinations (3×3)', () => {
  const cases: Array<[ModelTier, ModelTier, -1 | 0 | 1]> = [
    ['standard','standard', 0],  ['standard','advanced', -1], ['standard','reasoning', -1],
    ['advanced','standard', 1],  ['advanced','advanced', 0],  ['advanced','reasoning', -1],
    ['reasoning','standard', 1], ['reasoning','advanced', 1], ['reasoning','reasoning', 0],
  ];
  for (const [a,b,exp] of cases) {
    it(`compareTiers('${a}','${b}') === ${exp}`, () => {
      expect(compareTiers(a,b)).toBe(exp);
    });
  }
  it('reflexive: compareTiers(t,t) === 0 for every t', () => {
    for (const t of MODEL_TIERS) expect(compareTiers(t,t)).toBe(0);
  });
});
```

**Create `tests/model-router/model-provider.test.ts`** with the following cases:

```ts
import { describe, it, expect } from 'vitest';
import { ModelProviderSchema, MODEL_PROVIDERS } from '../../src/model-router/model-provider.js';

describe('ModelProviderSchema', () => {
  it('accepts every literal in MODEL_PROVIDERS', () => {
    for (const p of MODEL_PROVIDERS) expect(ModelProviderSchema.parse(p)).toBe(p);
  });
  it('rejects unknown providers', () => {
    expect(ModelProviderSchema.safeParse('mistral').success).toBe(false);
  });
  it('MODEL_PROVIDERS equals the locked list', () => {
    expect([...MODEL_PROVIDERS]).toEqual(['openai','anthropic','google']);
  });
});
```

Commit message: `feat(model-router): add ModelTier + ModelProvider schemas + compareTiers helper (06-02-01)`
  </action>
  <acceptance_criteria>
    - `src/model-router/model-tier.ts` exports `ModelTierSchema`, `MODEL_TIERS`, `TIER_ORDER`, `compareTiers`, `type ModelTier`.
    - `src/model-router/model-provider.ts` exports `ModelProviderSchema`, `MODEL_PROVIDERS`, `type ModelProvider`.
    - `src/model-router/index.ts` barrel re-exports both modules.
    - `pnpm vitest run tests/model-router/model-tier.test.ts tests/model-router/model-provider.test.ts` exits 0.
    - `compareTiers` test file contains all 9 combinations + reflexive test.
    - `grep -q "@status greenfield" src/model-router/model-tier.ts` exits 0.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/model-tier.test.ts tests/model-router/model-provider.test.ts</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-02</task_id>
  <name>ModelTierMapping with completeness refine + manual narrowed type + tests (MDRT-02, D-09/D-10)</name>
  <files>
    src/model-router/model-tier-mapping.ts,
    src/model-router/index.ts,
    tests/model-router/model-tier-mapping.test.ts
  </files>
  <read_first>
    - src/model-router/model-tier.ts (from 06-02-01)
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Zod v4 API Specifics" §"z.record with enum key"
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-09, D-10
  </read_first>
  <action>
**Create `src/model-router/model-tier-mapping.ts`** (verbatim — apply R-13 gotcha mitigation with manual type export):

```ts
import { z } from 'zod';
import { ModelTierSchema, MODEL_TIERS, type ModelTier } from './model-tier.js';

/**
 * Complete tier → modelId mapping for a single provider.
 *
 *   { standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'o3' }
 *
 * Completeness is enforced via `.refine()` — a partial mapping is rejected.
 * Rationale (D-10): a partial mapping at runtime is fragile (fallback
 * ambiguous). Force full coverage contractually.
 *
 * NOTE: Provider scoping lives at the `ModelPushRequest` level (D-09), not
 * inside this mapping. Each provider gets its own `ModelTierMapping` in
 * `ModelPushRequest.providers`.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-09, D-10
 */
const _RawModelTierMappingSchema = z.record(ModelTierSchema, z.string().min(1));

export const ModelTierMappingSchema = _RawModelTierMappingSchema.refine(
  (m) => MODEL_TIERS.every((t) => typeof m[t] === 'string' && m[t]!.length > 0),
  (m) => {
    const missing = MODEL_TIERS.filter((t) => typeof m[t] !== 'string' || (m[t] ?? '').length === 0);
    return {
      message: `ModelTierMapping is incomplete — missing mapping for tier(s): ${missing.join(', ')}`,
    };
  },
);

/**
 * Narrowed type — the schema refine proves completeness at parse time, but
 * `z.infer<typeof ModelTierMappingSchema>` is `Partial<Record<ModelTier,string>>`.
 * We export the narrowed `Record<ModelTier, string>` manually (gotcha R-13 per
 * 06-RESEARCH §Zod v4 API Specifics — `.refine` type guard does not propagate
 * through `z.infer`). Consumers should read this type as complete.
 */
export type ModelTierMapping = Record<ModelTier, string>;
```

**Append to `src/model-router/index.ts`** (before/after the Task 06-02-01 exports — do not delete existing lines):

```ts
// Tier mapping
export { ModelTierMappingSchema } from './model-tier-mapping.js';
export type { ModelTierMapping } from './model-tier-mapping.js';
```

**Create `tests/model-router/model-tier-mapping.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { ModelTierMappingSchema } from '../../src/model-router/model-tier-mapping.js';

describe('ModelTierMappingSchema', () => {
  it('accepts a complete mapping', () => {
    const m = { standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'o3' };
    expect(ModelTierMappingSchema.parse(m)).toEqual(m);
  });
  it('rejects partial mapping (missing reasoning) with diagnostic message', () => {
    const res = ModelTierMappingSchema.safeParse({ standard: 'x', advanced: 'y' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/missing mapping for tier\(s\): reasoning/);
    }
  });
  it('rejects empty object (missing all tiers)', () => {
    const res = ModelTierMappingSchema.safeParse({});
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/missing mapping for tier\(s\): standard, advanced, reasoning/);
    }
  });
  it('rejects empty-string model ids (z.string().min(1))', () => {
    const res = ModelTierMappingSchema.safeParse({ standard: '', advanced: 'y', reasoning: 'z' });
    expect(res.success).toBe(false);
  });
  it('rejects unknown tier keys (strict enum keys)', () => {
    // z.record(enum) rejects unknown keys at parse time
    const res = ModelTierMappingSchema.safeParse({ standard: 'a', advanced: 'b', reasoning: 'c', omni: 'd' });
    expect(res.success).toBe(false);
  });
});
```

Commit message: `feat(model-router): add ModelTierMapping schema with completeness refine (06-02-02)`
  </action>
  <acceptance_criteria>
    - `src/model-router/model-tier-mapping.ts` exports `ModelTierMappingSchema` + `type ModelTierMapping`.
    - `grep -q "Record<ModelTier, string>" src/model-router/model-tier-mapping.ts` — manual narrowed type present.
    - `pnpm vitest run tests/model-router/model-tier-mapping.test.ts` exits 0.
    - Error path tests assert diagnostic message contains `missing mapping for tier(s):`.
    - `src/model-router/index.ts` re-exports the schema + type.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/model-tier-mapping.test.ts</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-03</task_id>
  <name>ModelPolicy schema with min&lt;=max refine + tests (MDRT-03, D-11/D-12 — threat T-06-01)</name>
  <files>
    src/model-router/model-policy.ts,
    src/model-router/index.ts,
    tests/model-router/model-policy.test.ts
  </files>
  <read_first>
    - src/model-router/model-tier.ts (from 06-02-01 — imports compareTiers)
    - src/vault/vault-entry.ts (Phase 5 T-05-01 guard — cross-field refine precedent)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-11, D-12
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Cross-field refine"
  </read_first>
  <action>
**Create `src/model-router/model-policy.ts`** (verbatim — Zod v4 function-form refine for value interpolation per 06-RESEARCH §Cross-field refine):

```ts
import { z } from 'zod';
import { ModelTierSchema, compareTiers } from './model-tier.js';

/**
 * Model policy — capability-scoped bound on allowed tier range.
 *
 *   { min: 'standard', max: 'reasoning' }  // any tier allowed
 *   { min: 'advanced', max: 'advanced' }   // force advanced
 *
 * Invariant (D-11): compareTiers(min, max) <= 0 — i.e. min must not exceed max.
 * Enforced via `.refine()`; violation produces a diagnostic message citing the
 * received min/max values.
 *
 * Default convention (D-12): `{ min: 'standard', max: 'standard' }` when a
 * consumer needs an implicit fallback. The bridge does NOT export a
 * DEFAULT_MODEL_POLICY const — defaults are a consumer decision.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-11, D-12
 * @see compareTiers
 */
export const ModelPolicySchema = z.object({
  min: ModelTierSchema,
  max: ModelTierSchema,
}).refine(
  (p) => compareTiers(p.min, p.max) <= 0,
  (p) => ({
    message: `ModelPolicy invariant violated: min=${p.min} must be <= max=${p.max}`,
    path: ['max'],
  }),
);

export type ModelPolicy = z.infer<typeof ModelPolicySchema>;
```

**Append to `src/model-router/index.ts`**:

```ts
// Policy
export { ModelPolicySchema } from './model-policy.js';
export type { ModelPolicy } from './model-policy.js';
```

**Create `tests/model-router/model-policy.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { ModelPolicySchema } from '../../src/model-router/model-policy.js';
import { MODEL_TIERS, compareTiers, type ModelTier } from '../../src/model-router/model-tier.js';

describe('ModelPolicySchema — valid (min<=max)', () => {
  // 6 valid orderings: {s,s},{s,a},{s,r},{a,a},{a,r},{r,r}
  const validPairs: Array<[ModelTier, ModelTier]> = [];
  for (const a of MODEL_TIERS) for (const b of MODEL_TIERS) {
    if (compareTiers(a,b) <= 0) validPairs.push([a,b]);
  }
  for (const [min,max] of validPairs) {
    it(`accepts { min:'${min}', max:'${max}' }`, () => {
      expect(ModelPolicySchema.parse({ min, max })).toEqual({ min, max });
    });
  }
});

describe('ModelPolicySchema — invalid (min>max, T-06-01 guard)', () => {
  const invalidPairs: Array<[ModelTier, ModelTier]> = [
    ['advanced','standard'], ['reasoning','standard'], ['reasoning','advanced'],
  ];
  for (const [min,max] of invalidPairs) {
    it(`rejects { min:'${min}', max:'${max}' } with diagnostic citing values`, () => {
      const res = ModelPolicySchema.safeParse({ min, max });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]!.message).toMatch(new RegExp(`min=${min}.*max=${max}`));
        expect(res.error.issues[0]!.path).toEqual(['max']);
      }
    });
  }
});

describe('ModelPolicySchema — rejects unknown tier values', () => {
  it('rejects { min:\'omni\', max:\'standard\' }', () => {
    expect(ModelPolicySchema.safeParse({ min: 'omni', max: 'standard' }).success).toBe(false);
  });
});
```

Commit message: `feat(model-router): add ModelPolicy schema with min<=max invariant refine (06-02-03)`
  </action>
  <acceptance_criteria>
    - `src/model-router/model-policy.ts` exports `ModelPolicySchema` + `type ModelPolicy`.
    - Refine error message matches regex `min=.*must be <= max=`.
    - All 6 valid orderings + all 3 invalid orderings covered in tests.
    - `res.error.issues[0].path === ['max']` (diagnostic field attribution).
    - `pnpm vitest run tests/model-router/model-policy.test.ts` exits 0.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/model-policy.test.ts</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-04</task_id>
  <name>PerAgentModelOverride schema + at-least-one refine + tests (MDRT-08, D-20/D-21/D-22)</name>
  <files>
    src/model-router/per-agent-model-override.ts,
    src/model-router/index.ts,
    tests/model-router/per-agent-model-override.test.ts
  </files>
  <read_first>
    - src/agent/agent-identity.ts (Phase 2 — AgentIdentitySchema branded)
    - src/model-router/model-tier.ts + model-policy.ts (from prior tasks)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-20, D-21, D-22
  </read_first>
  <action>
**Create `src/model-router/per-agent-model-override.ts`** (verbatim — D-20 locks `AgentIdentitySchema` usage + at-least-one-of refine; D-22 locks partial tierMapping):

```ts
import { z } from 'zod';
import { AgentIdentitySchema } from '../agent/agent-identity.js';
import { ModelTierSchema } from './model-tier.js';
import { ModelPolicySchema } from './model-policy.js';

/**
 * Per-agent override for Model Router config — cristallizza la visione
 * "clone X su Opus 4.6" (Stefano): pin a specific agent to a tier or a
 * specific model id, independent of the global mapping.
 *
 * Semantic note (D-21): an override here is equivalent to `VaultTier === 'agent'`
 * in the vault domain — but stored in the model config, not the vault (avoids
 * recursion + allows independent hot-reload).
 *
 * Invariant (D-20): must specify at least one of `policy` or `tierMapping`.
 *
 * Partial tierMapping (D-22): unlike the global `ModelTierMapping` which
 * requires all tiers, per-agent overrides may specify a subset. Tiers not
 * overridden fall back to the provider's global mapping.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-20, D-21, D-22
 * @see AgentIdentitySchema (branded — Phase 2)
 */
export const PerAgentModelOverrideSchema = z.object({
  agentId: AgentIdentitySchema,
  policy: ModelPolicySchema.optional(),
  tierMapping: z.record(ModelTierSchema, z.string().min(1)).optional(),
}).refine(
  (o) => o.policy !== undefined || o.tierMapping !== undefined,
  { message: 'PerAgentModelOverride must specify at least one of: policy, tierMapping' },
);

export type PerAgentModelOverride = z.infer<typeof PerAgentModelOverrideSchema>;
```

**Append to `src/model-router/index.ts`**:

```ts
// Per-agent override
export { PerAgentModelOverrideSchema } from './per-agent-model-override.js';
export type { PerAgentModelOverride } from './per-agent-model-override.js';
```

**Create `tests/model-router/per-agent-model-override.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { PerAgentModelOverrideSchema } from '../../src/model-router/per-agent-model-override.js';

const AGENT_IDENTITY = { agentId: 'stefano', ownerId: 'owner_1' };

describe('PerAgentModelOverrideSchema — valid', () => {
  it('accepts override with policy only', () => {
    const o = { agentId: AGENT_IDENTITY, policy: { min: 'reasoning', max: 'reasoning' } };
    expect(PerAgentModelOverrideSchema.parse(o)).toMatchObject(o);
  });
  it('accepts override with tierMapping only (partial allowed per D-22)', () => {
    const o = { agentId: AGENT_IDENTITY, tierMapping: { reasoning: 'claude-opus-4-6' } };
    expect(PerAgentModelOverrideSchema.parse(o)).toMatchObject(o);
  });
  it('accepts override with both policy and tierMapping', () => {
    const o = {
      agentId: AGENT_IDENTITY,
      policy: { min: 'advanced', max: 'reasoning' },
      tierMapping: { reasoning: 'claude-opus-4-6', advanced: 'o4-mini' },
    };
    expect(PerAgentModelOverrideSchema.parse(o)).toMatchObject(o);
  });
});

describe('PerAgentModelOverrideSchema — invalid', () => {
  it('rejects override with neither policy nor tierMapping (D-20 refine)', () => {
    const res = PerAgentModelOverrideSchema.safeParse({ agentId: AGENT_IDENTITY });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/must specify at least one of: policy, tierMapping/);
    }
  });
  it('rejects missing agentId', () => {
    const res = PerAgentModelOverrideSchema.safeParse({ policy: { min: 'standard', max: 'standard' } });
    expect(res.success).toBe(false);
  });
  it('uses branded AgentIdentity — agentId must be { agentId, ownerId }', () => {
    const res = PerAgentModelOverrideSchema.safeParse({
      agentId: 'stefano',  // wrong shape — AgentIdentitySchema needs object
      policy: { min: 'standard', max: 'standard' },
    });
    expect(res.success).toBe(false);
  });
  it('propagates ModelPolicy invariant (nested refine)', () => {
    const res = PerAgentModelOverrideSchema.safeParse({
      agentId: AGENT_IDENTITY,
      policy: { min: 'reasoning', max: 'standard' },
    });
    expect(res.success).toBe(false);
  });
});
```

Commit message: `feat(model-router): add PerAgentModelOverride with at-least-one refine (06-02-04)`
  </action>
  <acceptance_criteria>
    - `src/model-router/per-agent-model-override.ts` imports from `../agent/agent-identity.js` (branded reuse).
    - Refine message matches `must specify at least one of: policy, tierMapping`.
    - Tests cover 3 valid shapes + 4 invalid paths (neither-of, missing agentId, wrong-shape agentId, nested-policy-invariant).
    - `pnpm vitest run tests/model-router/per-agent-model-override.test.ts` exits 0.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/per-agent-model-override.test.ts</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-05</task_id>
  <name>ModelPushRequest/Response + pushModelConfigContract + endpoint wiring + tests (MDRT-05, MDRT-06, D-13/D-14/D-15 — threat T-06-02)</name>
  <files>
    src/model-router/model-push.ts,
    src/model-router/index.ts,
    src/http/endpoints/internal-model-config.ts,
    src/http/endpoints/index.ts,
    tests/model-router/model-push.test.ts
  </files>
  <read_first>
    - src/model-router/{model-provider,model-tier-mapping,model-policy,per-agent-model-override}.ts (from prior tasks)
    - src/http/endpoints/internal-agents-reload.ts (contract shape template)
    - src/http/response.ts (discriminated union precedent)
    - src/http/endpoints/index.ts (barrel)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-13, D-14, D-15, D-16
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Discriminated response shape"
  </read_first>
  <action>
**Create `src/model-router/model-push.ts`** (verbatim — D-13 request + D-14 discriminated response + D-15 contract):

```ts
import { z } from 'zod';
import { ModelProviderSchema } from './model-provider.js';
import { ModelTierMappingSchema } from './model-tier-mapping.js';
import { ModelPolicySchema } from './model-policy.js';
import { PerAgentModelOverrideSchema } from './per-agent-model-override.js';

/**
 * POST /internal/model-config — Forge → X9 model config push.
 *
 * Auth: X-Internal-Secret (same direction as reloadAgentContract; D-16).
 * Endpoint is declared here but NOT implemented in Phase 6 — X9 Phase 35 wires
 * the runtime; Forge Phase 10 builds the UI.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-13, D-14, D-15, D-16
 * @see src/http/endpoints/internal-agents-reload.ts (pattern template)
 */
export const ModelPushRequestSchema = z.object({
  /** Per-provider tier mappings. Provider scoping lives here, not in the mapping (D-09). */
  providers: z.record(ModelProviderSchema, ModelTierMappingSchema),
  /** Capability-scoped policies keyed by capability name (opaque string, not branded). */
  perCapPolicies: z.record(z.string().min(1), ModelPolicySchema).optional(),
  /** Per-agent overrides — clone X specific model config (D-20). */
  perAgentOverrides: z.array(PerAgentModelOverrideSchema).optional(),
});
export type ModelPushRequest = z.infer<typeof ModelPushRequestSchema>;

/**
 * Model push response — discriminated union on `ok` (D-14 / 06-RESEARCH
 * §Discriminated response shape). Success arm carries `applied` count and
 * optional `reloadVersion` for correlation with ModelHotReloadNotification.
 * Error arm carries a typed `code` from 4 values + human `message` + optional
 * per-capability `details[]`.
 */
export const ModelPushSuccessSchema = z.object({
  ok: z.literal(true),
  applied: z.number().int().nonnegative(),
  reloadVersion: z.string().min(1).optional(),
});

export const ModelPushErrorSchema = z.object({
  ok: z.literal(false),
  code: z.enum(['INVALID_POLICY', 'UNKNOWN_CAP', 'INVALID_MAPPING', 'INTERNAL_ERROR']),
  message: z.string().min(1),
  details: z.array(z.object({
    capName: z.string().min(1).optional(),
    reason: z.string().min(1),
  })).optional(),
});

export const ModelPushResponseSchema = z.discriminatedUnion('ok', [
  ModelPushSuccessSchema,
  ModelPushErrorSchema,
]);
export type ModelPushResponse = z.infer<typeof ModelPushResponseSchema>;

/**
 * Contract for POST /internal/model-config (D-15). Pattern mirrors
 * reloadAgentContract (Phase 4).
 */
export const pushModelConfigContract = {
  method: 'POST' as const,
  path: '/internal/model-config' as const,
  authType: 'secret' as const,
  requestSchema: ModelPushRequestSchema,
  responseSchema: ModelPushResponseSchema,
} as const;
```

**Append to `src/model-router/index.ts`**:

```ts
// Push request/response + contract
export {
  ModelPushRequestSchema,
  ModelPushSuccessSchema,
  ModelPushErrorSchema,
  ModelPushResponseSchema,
  pushModelConfigContract,
} from './model-push.js';
export type { ModelPushRequest, ModelPushResponse } from './model-push.js';
```

**Create `src/http/endpoints/internal-model-config.ts`** (thin re-export — pattern Phase 4 registration in endpoints barrel):

```ts
/**
 * POST /internal/model-config — Forge -> X9 agent-core.
 * Auth: X-Internal-Secret. Direction: Forge control plane pushes model config.
 *
 * Endpoint declared but NOT implemented in Phase 6 — X9 Phase 35 runtime wires.
 *
 * Re-export of `pushModelConfigContract` from the model-router sub-path, so
 * consumers that import from `@x9-forge/contracts/http` (endpoints) can reach
 * it via the same barrel as reloadAgentContract / stopAgentContract.
 *
 * @see @x9-forge/contracts/model-router (canonical definition site)
 */
export {
  pushModelConfigContract,
  ModelPushRequestSchema,
  ModelPushResponseSchema,
} from '../../model-router/model-push.js';
export type { ModelPushRequest, ModelPushResponse } from '../../model-router/model-push.js';
```

**Edit `src/http/endpoints/index.ts`** — add the new endpoint to the secret-auth block:

```ts
// Secret-auth endpoints (Forge -> X9 agent-core /internal/*)
export * from './internal-agents-list.js';
export * from './internal-agents-reload.js';
export * from './internal-agents-stop.js';
export * from './internal-turn.js';
export * from './internal-turn-stream.js';
export * from './internal-query.js';
export * from './internal-model-config.js';  // Phase 6 — MDRT-05 / D-15
```

**Create `tests/model-router/model-push.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import {
  ModelPushRequestSchema,
  ModelPushResponseSchema,
  ModelPushSuccessSchema,
  ModelPushErrorSchema,
  pushModelConfigContract,
  type ModelPushResponse,
} from '../../src/model-router/model-push.js';

const FULL_MAPPING = { standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'o3' };

describe('ModelPushRequestSchema', () => {
  it('accepts minimal request (providers only)', () => {
    expect(ModelPushRequestSchema.parse({ providers: { openai: FULL_MAPPING } })).toMatchObject({
      providers: { openai: FULL_MAPPING },
    });
  });
  it('accepts full request (providers + perCapPolicies + perAgentOverrides)', () => {
    const req = {
      providers: { openai: FULL_MAPPING, anthropic: FULL_MAPPING, google: FULL_MAPPING },
      perCapPolicies: { briefing: { min: 'standard', max: 'advanced' } },
      perAgentOverrides: [{ agentId: { agentId: 'stefano', ownerId: 'owner_1' }, policy: { min: 'reasoning', max: 'reasoning' } }],
    };
    expect(ModelPushRequestSchema.parse(req)).toMatchObject(req);
  });
  it('rejects unknown provider (T-06-02 — enum gate)', () => {
    const res = ModelPushRequestSchema.safeParse({ providers: { mistral: FULL_MAPPING } });
    expect(res.success).toBe(false);
  });
  it('rejects request with incomplete mapping (propagates ModelTierMapping refine)', () => {
    const res = ModelPushRequestSchema.safeParse({ providers: { openai: { standard: 'x' } } });
    expect(res.success).toBe(false);
  });
});

describe('ModelPushResponseSchema — success arm', () => {
  it('accepts minimal success', () => {
    expect(ModelPushResponseSchema.parse({ ok: true, applied: 0 })).toEqual({ ok: true, applied: 0 });
  });
  it('accepts success with reloadVersion', () => {
    const r = { ok: true, applied: 3, reloadVersion: '2026-04-16T12:00:00Z/r1' };
    expect(ModelPushResponseSchema.parse(r)).toEqual(r);
  });
  it('rejects negative applied count', () => {
    expect(ModelPushResponseSchema.safeParse({ ok: true, applied: -1 }).success).toBe(false);
  });
});

describe('ModelPushResponseSchema — error arm (4 error-code cases)', () => {
  const codes = ['INVALID_POLICY','UNKNOWN_CAP','INVALID_MAPPING','INTERNAL_ERROR'] as const;
  for (const code of codes) {
    it(`accepts error with code=${code}`, () => {
      const r = { ok: false, code, message: `failure: ${code}` };
      expect(ModelPushResponseSchema.parse(r)).toMatchObject(r);
    });
  }
  it('accepts error with details[]', () => {
    const r = { ok: false, code: 'INVALID_POLICY' as const, message: 'x', details: [{ capName: 'briefing', reason: 'min > max' }] };
    expect(ModelPushResponseSchema.parse(r)).toMatchObject(r);
  });
  it('rejects unknown error code', () => {
    expect(ModelPushResponseSchema.safeParse({ ok: false, code: 'NOT_A_CODE', message: 'x' }).success).toBe(false);
  });
});

describe('ModelPushResponseSchema — discriminated union narrowing (compile-time via tsc)', () => {
  it('narrows on ok=true', () => {
    // No-op runtime, relies on tsc --noEmit to catch narrowing regressions.
    const fn = (r: ModelPushResponse): number => r.ok ? r.applied : 0;
    expect(fn({ ok: true, applied: 5 })).toBe(5);
    expect(fn({ ok: false, code: 'INTERNAL_ERROR', message: 'x' })).toBe(0);
  });
});

describe('pushModelConfigContract — D-15 shape', () => {
  it('has locked method/path/authType', () => {
    expect(pushModelConfigContract.method).toBe('POST');
    expect(pushModelConfigContract.path).toBe('/internal/model-config');
    expect(pushModelConfigContract.authType).toBe('secret');
  });
  it('exposes request + response schemas', () => {
    expect(pushModelConfigContract.requestSchema).toBe(ModelPushRequestSchema);
    expect(pushModelConfigContract.responseSchema).toBe(ModelPushResponseSchema);
  });
});
```

Commit message: `feat(model-router): add ModelPushRequest/Response + pushModelConfigContract (06-02-05)`
  </action>
  <acceptance_criteria>
    - `src/model-router/model-push.ts` exports request, response (discriminated union), success, error schemas + contract + types.
    - `src/http/endpoints/internal-model-config.ts` re-exports from the model-router module (no duplicate schema definition).
    - `src/http/endpoints/index.ts` contains `export * from './internal-model-config.js';`.
    - All 4 error codes covered by tests.
    - `pushModelConfigContract.path === '/internal/model-config'`, `.method === 'POST'`, `.authType === 'secret'` verified in test.
    - `pnpm vitest run tests/model-router/model-push.test.ts` exits 0.
    - `pnpm tsc --noEmit` exits 0 (discriminated-union narrowing preserved).
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/model-push.test.ts &amp;&amp; pnpm tsc --noEmit</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-06</task_id>
  <name>ModelHotReloadNotification shape + transport artefact (polling default; SSE or both per 06-01 decision) + tests (MDRT-07, D-17/D-18/D-19)</name>
  <files>
    src/model-router/model-hot-reload.ts,
    src/model-router/index.ts,
    src/http/endpoints/internal-model-config-version.ts,
    src/http/endpoints/index.ts,
    tests/model-router/model-hot-reload.test.ts
  </files>
  <read_first>
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism Decision" (from 06-01)
    - src/model-router/model-provider.ts (from 06-02-01)
    - src/http/endpoints/internal-agents-reload.ts (polling endpoint contract template)
    - src/http/sse-frames.ts (only if SSE decided — add frame variant)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-17, D-18, D-19
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Hot-Reload Mechanism Analysis"
  </read_first>
  <action>
**Create `src/model-router/model-hot-reload.ts`** (verbatim — shape is locked D-17 regardless of transport):

```ts
import { z } from 'zod';
import { ModelProviderSchema } from './model-provider.js';

/**
 * Hot-reload notification payload — transport-agnostic.
 *
 * Emitted (or polled) when Forge pushes a new model config and X9 must
 * refresh its in-memory routing table. The shape is stable regardless of
 * transport (polling vs SSE) so consumers pattern-match one payload.
 *
 * Mechanism decision lives in 06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism
 * Decision" (plan 06-01 output). Default per research recommendation: polling
 * via GET /internal/model-config/version returning this shape.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-17, D-18, D-19
 * @see agent-x9/.planning/ROADMAP.md §Phase 35 ROUTER-06
 */
export const ModelHotReloadNotificationSchema = z.object({
  version: z.string().min(1),
  appliedAt: z.iso.datetime(),
  providersChanged: z.array(ModelProviderSchema).optional(),
  capsChanged: z.array(z.string().min(1)).optional(),
});

export type ModelHotReloadNotification = z.infer<typeof ModelHotReloadNotificationSchema>;
```

**If 06-01 decided POLLING (default expected path):** Create `src/http/endpoints/internal-model-config-version.ts`:

```ts
import { z } from 'zod';
import { ModelHotReloadNotificationSchema } from '../../model-router/model-hot-reload.js';

/**
 * GET /internal/model-config/version — X9 polls Forge for the current model
 * config version. Response shape = ModelHotReloadNotification (D-17).
 * Auth: X-Internal-Secret.
 *
 * Decision rationale: per 06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism
 * Decision" — ROUTER-06 describes a pull model; polling fits best. If Phase 35
 * later needs push, the same payload shape drops into an SSE frame without
 * a breaking contract change.
 *
 * @see @x9-forge/contracts/model-router (ModelHotReloadNotificationSchema)
 */
export const ModelConfigVersionResponseSchema = ModelHotReloadNotificationSchema;
export type ModelConfigVersionResponse = z.infer<typeof ModelConfigVersionResponseSchema>;

export const modelConfigVersionContract = {
  method: 'GET' as const,
  path: '/internal/model-config/version' as const,
  authType: 'secret' as const,
  responseSchema: ModelConfigVersionResponseSchema,
} as const;
```

**Register in `src/http/endpoints/index.ts`** (append to secret-auth block):

```ts
export * from './internal-model-config-version.js';  // Phase 6 — MDRT-07 polling
```

**If 06-01 decided SSE instead:** skip `internal-model-config-version.ts` and instead extend `src/http/sse-frames.ts` with a `type: 'model-config-reloaded'` frame variant whose payload is `ModelHotReloadNotificationSchema`. Follow existing variant shape in `sse-frames.ts` and add it to the `SseFrameSchema` discriminated union. Add a parse test to `tests/http/sse-frames.test.ts` mirroring existing variants.

**If 06-01 decided BOTH:** ship both artefacts above.

**Append to `src/model-router/index.ts`**:

```ts
// Hot reload
export { ModelHotReloadNotificationSchema } from './model-hot-reload.js';
export type { ModelHotReloadNotification } from './model-hot-reload.js';
```

**Create `tests/model-router/model-hot-reload.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { ModelHotReloadNotificationSchema } from '../../src/model-router/model-hot-reload.js';

describe('ModelHotReloadNotificationSchema', () => {
  it('accepts minimal (version + appliedAt)', () => {
    const n = { version: 'r1', appliedAt: '2026-04-16T12:00:00Z' };
    expect(ModelHotReloadNotificationSchema.parse(n)).toEqual(n);
  });
  it('accepts full (version + appliedAt + providersChanged + capsChanged)', () => {
    const n = {
      version: 'r2',
      appliedAt: '2026-04-16T13:00:00Z',
      providersChanged: ['openai', 'anthropic'],
      capsChanged: ['briefing', 'calendar'],
    };
    expect(ModelHotReloadNotificationSchema.parse(n)).toEqual(n);
  });
  it('rejects missing version', () => {
    expect(ModelHotReloadNotificationSchema.safeParse({ appliedAt: '2026-04-16T12:00:00Z' }).success).toBe(false);
  });
  it('rejects invalid appliedAt (not ISO datetime)', () => {
    expect(ModelHotReloadNotificationSchema.safeParse({ version: 'r1', appliedAt: 'yesterday' }).success).toBe(false);
  });
  it('rejects unknown provider in providersChanged', () => {
    expect(ModelHotReloadNotificationSchema.safeParse({
      version: 'r1', appliedAt: '2026-04-16T12:00:00Z', providersChanged: ['mistral'],
    }).success).toBe(false);
  });
});
```

Commit message: `feat(model-router): add ModelHotReloadNotification shape + polling version contract (06-02-06)`

(If 06-01 chose SSE or both: adjust commit message accordingly and include the sse-frames edit.)
  </action>
  <acceptance_criteria>
    - `src/model-router/model-hot-reload.ts` exports `ModelHotReloadNotificationSchema` + type.
    - IF polling chosen: `src/http/endpoints/internal-model-config-version.ts` exists with `modelConfigVersionContract` (GET, secret, responseSchema = notification).
    - IF SSE chosen: `src/http/sse-frames.ts` has new `'model-config-reloaded'` variant.
    - `src/http/endpoints/index.ts` registers the new file(s).
    - `pnpm vitest run tests/model-router/model-hot-reload.test.ts` exits 0.
    - `grep -qE "(modelConfigVersionContract|model-config-reloaded)" src/http/endpoints/*.ts src/http/sse-frames.ts 2>/dev/null` — at least one transport artefact landed.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/model-hot-reload.test.ts</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-07</task_id>
  <name>Root barrel re-export + sub-path build smoke test + barrel exhaustiveness test</name>
  <files>
    src/index.ts,
    tests/model-router/barrel.test.ts
  </files>
  <read_first>
    - src/index.ts (currently `export {};`)
    - src/model-router/index.ts (after all prior tasks — complete barrel)
    - package.json §exports (already wired; verify no diff needed)
  </read_first>
  <action>
**Edit `src/index.ts`** — add the root re-export per CONTEXT Claude-discretion closure "default: sì, coerenza":

```ts
/**
 * @x9-forge/contracts — single source of truth per i contratti cross-repo
 * tra agent-x9 (runtime) e forge-v2 (control plane).
 *
 * Non importare direttamente da qui nei consumer: usare sub-path export
 * (es. `import { ... } from '@x9-forge/contracts/capability'`).
 *
 * @see README.md
 */
export * from './model-router/index.js';
```

(Keep the existing JSDoc header; replace the placeholder `export {};` with the re-export line.)

**Create `tests/model-router/barrel.test.ts`** — asserts every schema + type + helper is reachable from the sub-path barrel:

```ts
import { describe, it, expect } from 'vitest';
import * as M from '../../src/model-router/index.js';

describe('@x9-forge/contracts/model-router — barrel exhaustiveness', () => {
  const expectedExports = [
    // Tier
    'ModelTierSchema', 'MODEL_TIERS', 'TIER_ORDER', 'compareTiers',
    // Provider
    'ModelProviderSchema', 'MODEL_PROVIDERS',
    // Mapping
    'ModelTierMappingSchema',
    // Policy
    'ModelPolicySchema',
    // Per-agent override
    'PerAgentModelOverrideSchema',
    // Push
    'ModelPushRequestSchema', 'ModelPushSuccessSchema', 'ModelPushErrorSchema',
    'ModelPushResponseSchema', 'pushModelConfigContract',
    // Hot reload
    'ModelHotReloadNotificationSchema',
  ];
  for (const name of expectedExports) {
    it(`exports ${name}`, () => {
      expect((M as Record<string, unknown>)[name]).toBeDefined();
    });
  }
});
```

Commit message: `feat(model-router): barrel closure + root re-export + exhaustiveness test (06-02-07)`
  </action>
  <acceptance_criteria>
    - `src/index.ts` contains `export * from './model-router/index.js';`.
    - `tests/model-router/barrel.test.ts` exists and tests all 14 expected export names.
    - `pnpm vitest run tests/model-router/barrel.test.ts` exits 0.
    - `pnpm build &amp;&amp; node -e "import('./dist/model-router/index.js').then(m => console.log(Object.keys(m).length))"` prints a non-zero number (sub-path resolves after build — BRDG-02 gate).
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/barrel.test.ts &amp;&amp; pnpm build &amp;&amp; node -e "import('./dist/model-router/index.js').then(m =&gt; { if (Object.keys(m).length &lt; 10) throw new Error('barrel empty'); })"</automated>
</task>

<task type="auto" tdd="true">
  <task_id>06-02-08</task_id>
  <name>Synthetic fixtures (10 files) + SYNTHETIC-NOTES.md + fixtures parse test</name>
  <files>
    tests/model-router/fixtures/SYNTHETIC-NOTES.md,
    tests/model-router/fixtures/model-push-request-minimal.json,
    tests/model-router/fixtures/model-push-request-complete.json,
    tests/model-router/fixtures/model-push-response-success.json,
    tests/model-router/fixtures/model-push-response-error-invalid-policy.json,
    tests/model-router/fixtures/model-push-response-error-unknown-cap.json,
    tests/model-router/fixtures/model-push-response-error-invalid-mapping.json,
    tests/model-router/fixtures/model-push-response-error-internal.json,
    tests/model-router/fixtures/model-hot-reload-notification-minimal.json,
    tests/model-router/fixtures.test.ts
  </files>
  <read_first>
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Fixture Strategy" (10-row table)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-26, D-27
    - tests/vault/fixtures/REDACTION-NOTES.md (precedent for SYNTHETIC header file)
    - All model-router schemas (from 06-02-01..06)
  </read_first>
  <action>
**Create `tests/model-router/fixtures/SYNTHETIC-NOTES.md`**:

```markdown
# Phase 6 Model Router Fixtures — SYNTHETIC

All fixtures in this directory are **invented**. Phase 6 is greenfield — there
is no live `POST /internal/model-config` endpoint at fixture-capture time.

Will be replaced with staging captures once Phase 35 X9 ships and a live
endpoint exists.

Per CONTEXT D-26/D-27:
- 2 push requests (minimal, complete)
- 5 push responses (1 success, 4 error codes)
- 1 hot-reload notification (minimal)
- 2 registry entries — live under `tests/capability/fixtures/` and are added
  by plan 06-03 (`registry-entry-with-model-policy.json`, `registry-entry-without-model-policy.json`).

Fixtures embed a `"_note"` field at root level (top-level JSON permits it; schemas use `.passthrough()` or `.strict()` per module — see test file for parse handling).
```

**Create the 8 JSON fixtures** (registry entries are added by plan 06-03). The shapes below are derived verbatim from 06-RESEARCH.md §Fixture Strategy table.

`model-push-request-minimal.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture, see SYNTHETIC-NOTES.md",
  "providers": {
    "openai": { "standard": "gpt-4.1-mini", "advanced": "o4-mini", "reasoning": "o3" }
  }
}
```

`model-push-request-complete.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture, see SYNTHETIC-NOTES.md",
  "providers": {
    "openai":    { "standard": "gpt-4.1-mini", "advanced": "o4-mini", "reasoning": "o3" },
    "anthropic": { "standard": "claude-haiku", "advanced": "claude-sonnet", "reasoning": "claude-opus-4-6" },
    "google":    { "standard": "gemini-flash", "advanced": "gemini-pro", "reasoning": "gemini-ultra" }
  },
  "perCapPolicies": {
    "briefing": { "min": "standard", "max": "advanced" },
    "calendar": { "min": "standard", "max": "standard" }
  },
  "perAgentOverrides": [
    {
      "agentId": { "agentId": "stefano", "ownerId": "owner_1" },
      "policy": { "min": "reasoning", "max": "reasoning" },
      "tierMapping": { "reasoning": "claude-opus-4-6" }
    }
  ]
}
```

`model-push-response-success.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture",
  "ok": true,
  "applied": 12,
  "reloadVersion": "2026-04-16T12:00:00Z/r1"
}
```

`model-push-response-error-invalid-policy.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture",
  "ok": false,
  "code": "INVALID_POLICY",
  "message": "ModelPolicy invariant violated for capability 'briefing': min=reasoning must be <= max=standard",
  "details": [{ "capName": "briefing", "reason": "min > max" }]
}
```

`model-push-response-error-unknown-cap.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture",
  "ok": false,
  "code": "UNKNOWN_CAP",
  "message": "perCapPolicies references capabilities not found in registry",
  "details": [{ "capName": "xyz", "reason": "not in registry" }]
}
```

`model-push-response-error-invalid-mapping.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture",
  "ok": false,
  "code": "INVALID_MAPPING",
  "message": "ModelTierMapping for provider 'openai' is incomplete — missing mapping for tier(s): reasoning"
}
```

`model-push-response-error-internal.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture",
  "ok": false,
  "code": "INTERNAL_ERROR",
  "message": "Unexpected server error during model config apply"
}
```

`model-hot-reload-notification-minimal.json`:
```json
{
  "_note": "SYNTHETIC — Phase 6 fixture",
  "version": "r1",
  "appliedAt": "2026-04-16T12:00:00Z"
}
```

**Create `tests/model-router/fixtures.test.ts`** — strips `_note` helper then parses each fixture:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModelPushRequestSchema, ModelPushResponseSchema } from '../../src/model-router/model-push.js';
import { ModelHotReloadNotificationSchema } from '../../src/model-router/model-hot-reload.js';

const FIXTURES_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures');

function load(name: string): Record<string, unknown> {
  const raw = JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8')) as Record<string, unknown>;
  const { _note: _ignored, ...rest } = raw;
  return rest;
}

describe('Phase 6 fixtures — green parses', () => {
  it('model-push-request-minimal.json parses', () => {
    expect(ModelPushRequestSchema.safeParse(load('model-push-request-minimal.json')).success).toBe(true);
  });
  it('model-push-request-complete.json parses', () => {
    expect(ModelPushRequestSchema.safeParse(load('model-push-request-complete.json')).success).toBe(true);
  });
  it('model-push-response-success.json parses', () => {
    expect(ModelPushResponseSchema.safeParse(load('model-push-response-success.json')).success).toBe(true);
  });
  it.each([
    'model-push-response-error-invalid-policy.json',
    'model-push-response-error-unknown-cap.json',
    'model-push-response-error-invalid-mapping.json',
    'model-push-response-error-internal.json',
  ])('%s parses', (name) => {
    expect(ModelPushResponseSchema.safeParse(load(name)).success).toBe(true);
  });
  it('model-hot-reload-notification-minimal.json parses', () => {
    expect(ModelHotReloadNotificationSchema.safeParse(load('model-hot-reload-notification-minimal.json')).success).toBe(true);
  });
});
```

Note: schemas do NOT have `.passthrough()` by default; Zod v4 `z.object()` strips unknown keys without error. The `_note` field will be stripped silently. If a schema is written strict, the helper must strip it (which this helper does).

Commit message: `test(model-router): add 8 synthetic fixtures + parse suite (06-02-08)`
  </action>
  <acceptance_criteria>
    - 8 JSON fixture files exist under `tests/model-router/fixtures/` (registry entries belong to plan 06-03).
    - `tests/model-router/fixtures/SYNTHETIC-NOTES.md` exists and contains the literal string `SYNTHETIC`.
    - Each fixture parses green via its matching schema — verified by `tests/model-router/fixtures.test.ts`.
    - `pnpm vitest run tests/model-router/fixtures.test.ts` exits 0.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/model-router/fixtures.test.ts</automated>
</task>

<task type="auto" tdd="false">
  <task_id>06-02-09</task_id>
  <name>Full-suite green + build emits dist/model-router/* + tsc noEmit (plan closure)</name>
  <files>
    (no new files — final verification only)
  </files>
  <read_first>
    - .planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md §"Sampling Rate"
  </read_first>
  <action>
Run the plan-wave closure commands and assert all three gates pass:

```bash
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
pnpm test --run
pnpm build
pnpm tsc --noEmit
test -f dist/model-router/index.js
test -f dist/model-router/index.d.ts
```

If any command fails, debug and fix in the relevant earlier task — do NOT paper over failures here. This task creates no new files; it is the plan-level sign-off.

No commit. The per-task commits from 06-02-01..08 are the atomic artefacts.
  </action>
  <acceptance_criteria>
    - `pnpm test --run` exits 0 with 294 prior tests still green + all new Phase 6 tests passing.
    - `pnpm build` exits 0 and emits `dist/model-router/index.js` + `dist/model-router/index.d.ts`.
    - `pnpm tsc --noEmit` exits 0.
    - No test count regression — Phase 5 closed at 294; Phase 6 adds ~40-50 new tests.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm test --run &amp;&amp; pnpm build &amp;&amp; pnpm tsc --noEmit &amp;&amp; test -f dist/model-router/index.js &amp;&amp; test -f dist/model-router/index.d.ts</automated>
</task>

</tasks>

<threat_model>
Phase 6 is a contracts package — the primary attack surface is parse-time validation of untrusted request payloads hitting `POST /internal/model-config`. Two threats apply:

- **T-06-01 — malformed ModelPolicy bypasses min<=max invariant.** Mitigation: Zod `.refine()` on `ModelPolicySchema` (D-11) with diagnostic message citing received values; `path: ['max']` attributes the error to the offending field. Test coverage: all 3 invalid orderings rejected (task 06-02-03). Propagation: transitive refine catches invalid policies inside `perCapPolicies` (task 06-02-05) and `PerAgentModelOverride.policy` (task 06-02-04) and `CapabilityRegistryEntry.modelPolicy` (plan 06-03).
- **T-06-02 — unknown provider/enum value accepted in mapping.** Mitigation: `z.enum()` is strict in Zod v4 — any value outside `MODEL_PROVIDERS` / `MODEL_TIERS` causes parse failure. Test coverage: task 06-02-01 (tier/provider reject tests) + task 06-02-05 (push request with `mistral` rejected).

No crypto / secret handling in this phase — auth is declarative (`authType: 'secret'`), runtime Forge/X9 validates the header. No credential fields in any Phase 6 schema. The `@status greenfield` JSDoc marker on every export signals consumers that the contract is frozen but the endpoint is not yet wired.
</threat_model>

<verification>
Phase-level must-haves (whole Phase 6 — this plan covers SC #1..#6):

1. **SC #1** — ModelTier ordered enum + compareTiers helper: task 06-02-01. Verify: `pnpm vitest run tests/model-router/model-tier.test.ts`.
2. **SC #2** — ModelPolicy runtime check `min <= max` fail-loud: task 06-02-03. Verify: `pnpm vitest run tests/model-router/model-policy.test.ts`.
3. **SC #3** — ModelTierMapping typed (provider scoping at ModelPushRequest per D-09): tasks 06-02-02 + 06-02-05. Verify: both test files pass.
4. **SC #4** — `POST /internal/model-config` endpoint contract defined (not implemented): task 06-02-05. Verify: `grep -q "'/internal/model-config'" src/model-router/model-push.ts && grep -q "'/internal/model-config'" src/http/endpoints/internal-model-config.ts`.
5. **SC #5** — `modelPolicy?` added to `CapabilityRegistryEntry`: DEFERRED to plan 06-03 (MDRT-04).
6. **SC #6** — PerAgentModelOverride typed: task 06-02-04. Verify: `pnpm vitest run tests/model-router/per-agent-model-override.test.ts`.
7. **SC #7** — agent-x9 roadmap updated: handled by plan 06-01-03.

Plan-level closure commands (task 06-02-09):
```
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
pnpm test --run && pnpm build && pnpm tsc --noEmit
test -f dist/model-router/index.js && test -f dist/model-router/index.d.ts
```

Sub-path export smoke (BRDG-02 gate):
```
node -e "import('./dist/model-router/index.js').then(m => {
  const required = ['ModelTierSchema','ModelProviderSchema','ModelTierMappingSchema','ModelPolicySchema','ModelPushRequestSchema','ModelPushResponseSchema','pushModelConfigContract','ModelHotReloadNotificationSchema','PerAgentModelOverrideSchema','compareTiers','MODEL_TIERS','MODEL_PROVIDERS'];
  const missing = required.filter(n => m[n] === undefined);
  if (missing.length) throw new Error('missing barrel exports: ' + missing.join(', '));
})"
```
</verification>

<phase_goal_sc_mapping>
- SC #1 → 06-02-01
- SC #2 → 06-02-03 (ModelPolicy invariant)
- SC #3 → 06-02-02 + 06-02-05 (mapping + provider scoping at request level per D-09)
- SC #4 → 06-02-05 (pushModelConfigContract declared, endpoint not implemented)
- SC #5 → plan 06-03 (out of this plan's scope)
- SC #6 → 06-02-04
- SC #7 → plan 06-01 (handoff)
</phase_goal_sc_mapping>
