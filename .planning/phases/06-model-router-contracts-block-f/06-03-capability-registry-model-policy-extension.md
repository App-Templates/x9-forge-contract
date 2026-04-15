---
phase: 06-model-router-contracts-block-f
plan: 06-03
type: execute
wave: 3
depends_on: ["06-02"]
files_modified:
  - src/capability/capability-registry-entry.ts
  - tests/capability/capability-registry-entry.test.ts
  - tests/capability/fixtures/registry-entry-with-model-policy.json
  - tests/capability/fixtures/registry-entry-without-model-policy.json
autonomous: true
requirements: [MDRT-04]
validation_ref: 06-VALIDATION.md

must_haves:
  truths:
    - "`CapabilityRegistryEntrySchema` accepts entries WITH `modelPolicy: { min, max }` (D-23 happy path)"
    - "`CapabilityRegistryEntrySchema` accepts entries WITHOUT `modelPolicy` (backward compat — existing Phase 1 entries keep parsing green)"
    - "`CapabilityRegistryEntrySchema` rejects entries with invalid `modelPolicy` (min>max) via transitive propagation of ModelPolicy's refine"
    - "`toEndpoint()` / `fromEndpoint()` behavior unchanged — neither helper reads `modelPolicy` (D-25)"
    - "All pre-existing Phase 1 capability tests stay green — zero regressions"
    - "`pnpm test --run` exits 0 (Phase 6 + legacy suite together)"
  artifacts:
    - path: "src/capability/capability-registry-entry.ts"
      provides: "CapabilityRegistryEntrySchema extended with optional modelPolicy field (non-breaking)"
      contains: "modelPolicy: ModelPolicySchema.optional()"
    - path: "tests/capability/fixtures/registry-entry-with-model-policy.json"
      provides: "Fixture (f) per D-27 — happy path entry carrying modelPolicy"
      contains: "modelPolicy"
    - path: "tests/capability/fixtures/registry-entry-without-model-policy.json"
      provides: "Fixture (g) per D-27 — backward-compat entry without modelPolicy"
      contains: "enabled"
  key_links:
    - from: "src/capability/capability-registry-entry.ts"
      to: "src/model-router/model-policy.ts (ModelPolicySchema)"
      via: "ESM import — cross-module (capability -> model-router)"
      pattern: "from '../model-router/model-policy\\.js'"
---

<objective>
Extend `CapabilityRegistryEntrySchema` with an optional `modelPolicy` field (D-23) consuming `ModelPolicySchema` from the `@x9-forge/contracts/model-router` module landed by plan 06-02. This satisfies MDRT-04 ("`modelPolicy?: ModelPolicy` opzionale aggiunto a `CapabilityRegistryEntry` — backward compat"). The extension is non-breaking: entries without `modelPolicy` continue to parse green; entries with invalid policies fail via transitive `ModelPolicySchema.refine()` propagation.

Scope (single file + one test file + two fixtures):
- Add `modelPolicy: ModelPolicySchema.optional()` field to the Zod object.
- Update JSDoc on the field per D-24 — tell consumers to default to `{ min: 'standard', max: 'standard' }` when absent.
- Add 4 test cases per D-25 / 06-VALIDATION.md 06-03 rows:
  1. Entry with `modelPolicy` — parse green (fixture f).
  2. Entry without `modelPolicy` — parse green (fixture g, backward compat).
  3. Entry with invalid `modelPolicy` — parse red with D-11 message (inline object, no fixture).
  4. `toEndpoint()` / `fromEndpoint()` baseline — unchanged behavior (re-run existing tests).
- 2 new fixtures per D-27 (f) and (g).

Out of scope:
- Touching `toEndpoint()` / `fromEndpoint()` — per 06-RESEARCH.md §`toEndpoint`/`fromEndpoint` impact, both helpers use `Pick<>` of structural fields only; no changes.
- Extending the Forge `packages/types/src/capability.ts` shim — Phase 7 consolidation.
- Extending `scripts/check-drift.ts` — greenfield phase, no live drift for the new field.
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
@.planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Capability Registry Extension"
@.planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md
@src/capability/capability-registry-entry.ts
@src/model-router/model-policy.ts

<interfaces>
<!-- Current CapabilityRegistryEntrySchema (Phase 1, verbatim from src/capability/capability-registry-entry.ts:24-32). -->

```ts
export const CapabilityRegistryEntrySchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  host: z.string().min(1),
  port: z.number().int().positive(),
  version: z.string().min(1),
  protocol: z.enum(['http', 'https']).optional(),
  tools: z.array(CapabilityToolSchema).optional(),
});
```

<!-- ModelPolicySchema from plan 06-02 (landed by task 06-02-03). Referentially the object with the min<=max refine. -->

```ts
export const ModelPolicySchema = z.object({
  min: ModelTierSchema,
  max: ModelTierSchema,
}).refine((p) => compareTiers(p.min, p.max) <= 0, (p) => ({
  message: `ModelPolicy invariant violated: min=${p.min} must be <= max=${p.max}`,
  path: ['max'],
}));
```

<!-- toEndpoint / fromEndpoint (verbatim) — NEITHER reads modelPolicy, no changes required. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <task_id>06-03-01</task_id>
  <name>Extend CapabilityRegistryEntrySchema with optional modelPolicy + fixtures + 4 test cases (MDRT-04 / D-23/D-24/D-25)</name>
  <files>
    src/capability/capability-registry-entry.ts,
    tests/capability/capability-registry-entry.test.ts,
    tests/capability/fixtures/registry-entry-with-model-policy.json,
    tests/capability/fixtures/registry-entry-without-model-policy.json
  </files>
  <read_first>
    - src/capability/capability-registry-entry.ts (current shape — Phase 1)
    - src/model-router/model-policy.ts (from plan 06-02)
    - tests/capability/capability-registry-entry.test.ts (existing baseline tests — do not break)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-23, D-24, D-25
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"Capability Registry Extension"
    - .planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md rows 06-03-XX (4 test verifications)
  </read_first>
  <action>
**Edit `src/capability/capability-registry-entry.ts`** — add the import, extend the schema, and update JSDoc. Keep ALL existing lines intact (JSDoc block, `toEndpoint`, `fromEndpoint`).

1. Add import at the top (after the existing `CapabilityToolSchema` import):

```ts
import { ModelPolicySchema } from '../model-router/model-policy.js';
```

2. Replace the `CapabilityRegistryEntrySchema` block with the extended shape. Add the `modelPolicy` field as the last property (after `tools`):

```ts
export const CapabilityRegistryEntrySchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  host: z.string().min(1),
  port: z.number().int().positive(),
  version: z.string().min(1),
  protocol: z.enum(['http', 'https']).optional(),
  tools: z.array(CapabilityToolSchema).optional(),
  /**
   * Optional Model Router policy — capability-scoped tier bound.
   *
   * Consumer MUST default to `{ min: 'standard', max: 'standard' }` when
   * absent (D-24). The bridge does NOT supply a runtime default — that is
   * intentionally a consumer decision to force an explicit fallback.
   *
   * Backward compat (D-23): entries without `modelPolicy` continue to parse
   * green. This field is a non-breaking extension added in Phase 6.
   *
   * @see @x9-forge/contracts/model-router (ModelPolicySchema)
   * @see CONTEXT D-23, D-24 (MDRT-04)
   */
  modelPolicy: ModelPolicySchema.optional(),
});
```

3. Augment the class-level JSDoc (the block at lines 4-23) — append to the existing bullet list a new line before the closing `*/`:

```
 * - `modelPolicy`: optional. Added in Phase 6 (MDRT-04). Consumer defaults
 *   to { min: 'standard', max: 'standard' } when absent. See
 *   @x9-forge/contracts/model-router.
```

4. Leave `toEndpoint()` and `fromEndpoint()` COMPLETELY untouched — they do not read `modelPolicy` (06-RESEARCH §`toEndpoint`/`fromEndpoint` impact).

**Create `tests/capability/fixtures/registry-entry-with-model-policy.json`** (fixture f per D-27):

```json
{
  "_note": "SYNTHETIC — Phase 6 / MDRT-04 happy path",
  "name": "briefing",
  "enabled": true,
  "host": "cap-briefing",
  "port": 3000,
  "version": "1.0.0",
  "modelPolicy": { "min": "standard", "max": "reasoning" }
}
```

**Create `tests/capability/fixtures/registry-entry-without-model-policy.json`** (fixture g per D-27 — backward compat):

```json
{
  "_note": "SYNTHETIC — Phase 6 / MDRT-04 backward-compat (pre-Phase-6 registry shape)",
  "name": "calendar",
  "enabled": true,
  "host": "cap-calendar",
  "port": 3001,
  "version": "1.0.0",
  "protocol": "http"
}
```

**Edit `tests/capability/capability-registry-entry.test.ts`** — APPEND a new `describe` block (do NOT remove existing tests). Read the existing file first to locate the right append point.

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// existing imports retained above

const FIXTURES_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures');
function loadFixture(name: string): Record<string, unknown> {
  const raw = JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8')) as Record<string, unknown>;
  const { _note: _ignored, ...rest } = raw;
  return rest;
}

describe('CapabilityRegistryEntrySchema — modelPolicy extension (MDRT-04)', () => {
  it('accepts entry with valid modelPolicy (fixture f)', () => {
    const entry = loadFixture('registry-entry-with-model-policy.json');
    const parsed = CapabilityRegistryEntrySchema.parse(entry);
    expect(parsed.modelPolicy).toEqual({ min: 'standard', max: 'reasoning' });
  });

  it('accepts entry without modelPolicy — backward-compat (fixture g)', () => {
    const entry = loadFixture('registry-entry-without-model-policy.json');
    const parsed = CapabilityRegistryEntrySchema.parse(entry);
    expect(parsed.modelPolicy).toBeUndefined();
  });

  it('rejects entry with invalid modelPolicy (min > max) — transitive refine', () => {
    const bad = {
      name: 'x', enabled: true, host: 'h', port: 1, version: '1',
      modelPolicy: { min: 'reasoning', max: 'standard' },
    };
    const res = CapabilityRegistryEntrySchema.safeParse(bad);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/min=reasoning.*max=standard/);
    }
  });

  it('toEndpoint / fromEndpoint baselines unchanged (modelPolicy does not affect helpers)', () => {
    const entry = CapabilityRegistryEntrySchema.parse(loadFixture('registry-entry-with-model-policy.json'));
    expect(toEndpoint(entry)).toBe('http://cap-briefing:3000');
    const round = fromEndpoint('http://cap-briefing:3000', { name: 'briefing', enabled: true, version: '1.0.0' });
    expect(round.modelPolicy).toBeUndefined();  // helper does not fabricate the field
  });
});
```

Imports at the top of the test file must include `CapabilityRegistryEntrySchema`, `toEndpoint`, `fromEndpoint` — these are already imported in the existing baseline tests. If the baseline test file uses a different import structure, adapt the new block accordingly but do NOT reorder existing imports.

Commit message: `feat(capability): extend CapabilityRegistryEntry with optional modelPolicy (06-03-01, MDRT-04)`
  </action>
  <acceptance_criteria>
    - `src/capability/capability-registry-entry.ts` contains `modelPolicy: ModelPolicySchema.optional()`.
    - `src/capability/capability-registry-entry.ts` imports from `'../model-router/model-policy.js'`.
    - `toEndpoint` and `fromEndpoint` function bodies are unchanged vs git HEAD (`git diff src/capability/capability-registry-entry.ts` should show only additive hunks).
    - Both fixtures exist under `tests/capability/fixtures/` and parse green.
    - `tests/capability/capability-registry-entry.test.ts` contains a new `describe` block with at least 4 tests covering: with-policy, without-policy, invalid-policy, helper-baselines.
    - `pnpm vitest run tests/capability/capability-registry-entry.test.ts` exits 0 (old tests still pass + new ones added).
    - Overall `pnpm test --run` exits 0 — no regression in any other suite.
    - `pnpm tsc --noEmit` exits 0.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm vitest run tests/capability/capability-registry-entry.test.ts &amp;&amp; pnpm tsc --noEmit</automated>
</task>

<task type="auto" tdd="false">
  <task_id>06-03-02</task_id>
  <name>Full-suite regression check — Phase 1 capability + Phase 6 model-router co-green (plan closure)</name>
  <files>
    (no new files — final verification only)
  </files>
  <read_first>
    - .planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md §"Sampling Rate"
    - .planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md rows 06-03-XX
  </read_first>
  <action>
Run the phase-level closure gate and assert the full bridge suite is green after the extension:

```bash
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
pnpm test --run
pnpm build
pnpm tsc --noEmit
```

Assertions:
- `pnpm test --run` reports 294 (Phase 5 baseline) + ~50 new Phase 6 tests, all green.
- No module other than `src/capability/capability-registry-entry.ts` is changed vs plan 06-02's final state (check `git diff --stat HEAD~1` after the 06-03-01 commit — only the four files listed in `files_modified`).
- `pnpm build` emits updated `dist/capability/capability-registry-entry.js` + `.d.ts` referencing `ModelPolicy` type.
- `pnpm tsc --noEmit` green.

No commit — the plan-level sign-off. The per-task commit from 06-03-01 is the atomic artefact for MDRT-04.
  </action>
  <acceptance_criteria>
    - `pnpm test --run` exits 0 across ALL test files (capability baseline + model-router new + any other existing suite).
    - `pnpm build` exits 0.
    - `pnpm tsc --noEmit` exits 0.
    - `grep -q "modelPolicy" dist/capability/capability-registry-entry.d.ts` — extension emitted in the declaration file.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; pnpm test --run &amp;&amp; pnpm build &amp;&amp; pnpm tsc --noEmit &amp;&amp; grep -q "modelPolicy" dist/capability/capability-registry-entry.d.ts</automated>
</task>

</tasks>

<threat_model>
This plan's only attack surface is the `modelPolicy` field's cross-module refine propagation. Threat carry-over from plan 06-02:

- **T-06-01 (carry) — malformed ModelPolicy bypasses min<=max invariant via CapabilityRegistryEntry.** Mitigation: the optional field is typed as `ModelPolicySchema.optional()` — when present, Zod recursively applies the `.refine()` from `src/model-router/model-policy.ts`. Test coverage: task 06-03-01 test #3 (invalid `{ min: 'reasoning', max: 'standard' }` rejected with the D-11 message). No separate refine at the CapabilityRegistryEntry level is needed — propagation is automatic and was verified in the PerAgentModelOverride case (plan 06-02-04) as well.

No new runtime behavior, no new endpoint, no credential handling. The extension is purely schema-level.
</threat_model>

<verification>
Phase-level must-haves covered by this plan:

- **SC #5** (`modelPolicy?: ModelPolicy` added to `CapabilityRegistryEntry` with backward compat) → task 06-03-01.

Plan-level closure commands (task 06-03-02):
```
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
pnpm test --run && pnpm build && pnpm tsc --noEmit
grep -q "modelPolicy" dist/capability/capability-registry-entry.d.ts
```

VALIDATION.md row-for-row coverage:
- Row 06-03-XX "parses with `modelPolicy` present" → task 06-03-01 test #1.
- Row 06-03-XX "parses without `modelPolicy` (backward compat)" → task 06-03-01 test #2.
- Row 06-03-XX "rejects invalid `modelPolicy` via transitive refine" → task 06-03-01 test #3.
- Row 06-03-XX "toEndpoint/fromEndpoint unchanged" → task 06-03-01 test #4 + untouched helper bodies.

After 06-03-02 green: MDRT-04 is closed. Phase 6 goals SC #1..#7 are all covered across the 3 plans (SC #1/#2/#3/#4/#6 by 06-02, SC #5 by 06-03, SC #7 by 06-01).
</verification>

<phase_goal_sc_mapping>
- SC #5 → 06-03-01 (only SC in this plan's scope)
- All other SCs land in plans 06-01 and 06-02.
</phase_goal_sc_mapping>
