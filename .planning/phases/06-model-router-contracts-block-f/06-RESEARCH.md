# Phase 6: Model Router Contracts — Research

**Date:** 2026-04-16
**Status:** Ready for planning
**Phase:** 06-model-router-contracts-block-f
**Consumes:** 06-CONTEXT.md (decisions D-01..D-30 LOCKED)

## Executive Summary

- **Pattern reuse is high-confidence.** Phase 5 `VaultTier` + `compareTiers` is a direct precedent for `ModelTier`; the helper signature, const-tuple, and `.indexOf()` body all transfer verbatim. Recommendation: **copy, do not extract** a shared `ordered-enum` utility (only 2 occurrences, different semantic domains, abstraction cost > DRY saving).
- **Zod v4 APIs are all confirmed.** Discriminated union on `ok` (`src/http/response.ts:30-33`), cross-field `.refine()` with diagnostic `path` (Phase 5 T-05-01 guard `vault-entry.ts:56-59`), and `z.record(enum, value)` produce `Partial<Record<Tier,…>>` at the TS level — completeness must be enforced via `.refine()`, and a `Record<ModelTier,string>` type narrowing wrapper is needed (gotcha detailed below §Zod v4 API).
- **X9 Phase 35 draft is ALIGNED on names and shape** (`agent-x9/.planning/ROADMAP.md:328-418`). Tiers = `standard | advanced | reasoning` match exactly; `modelPolicy: { min, max }` nested in registry matches exactly; env-var defaults (`LLM_TIER_STANDARD`, `LLM_TIER_ADVANCED`) are orthogonal (runtime config, not contract). **No naming divergences found.** Phase 35 has NOT been scaffolded (no phase dir under `agent-x9/.planning/phases/`), so bridge is free to freeze first per BRDG-03.
- **Hot-reload: polling wins on this evidence.** Phase 35 ROUTER-06 says "reloaded from config on every turn (file-based with mtime check, or API-pushed to in-memory store)" — there is no push-driven streaming requirement. SSE reuse is cheap but over-engineered for a per-turn poll model. **Recommendation for plan 06-01:** ship the shape (D-17) + a polling `GET /internal/model-config/version` endpoint contract; skip SSE frame addition unless 06-01 discovers Phase 35 needs push.
- **Provider list: `google` should stay.** Phase 35 draft doesn't enumerate providers, but Forge vision PROJECT.md and `AgentCredentials` `KNOWN_CREDENTIAL_KEYS` already include `GOOGLE_*` keys for calendar; mapping `reasoning → claude-opus-4-6` plus `advanced → o4-mini` implies multi-provider routing. Keep `['openai', 'anthropic', 'google']` and let Phase 35 drop the key at runtime if unused.
- **Flag for planning:** D-25 requires 2 "real fixtures captured from staging X9 pre-Phase 35" without `modelPolicy` — these are already obtainable from existing Phase 1 capability fixtures (`tests/capability/fixtures/registry-entry-*.json` if present, else carve a minimum from `CapabilityRegistryEntrySchema` synth) — no VPS SSH needed. Treat as invented-from-code-shape, same pattern as Phase 2's context.json handling.

## Pattern Reuse Analysis

### Ordered enum + compareTiers (from Phase 5 VaultTier)

**Source:** `src/vault/vault-tier.ts:10-30`
```ts
export const VAULT_TIERS = ['platform', 'owner', 'agent'] as const;
export const VaultTierSchema = z.enum(VAULT_TIERS);
export type VaultTier = z.infer<typeof VaultTierSchema>;

export function compareTiers(a: VaultTier, b: VaultTier): -1 | 0 | 1 {
  const ai = VAULT_TIERS.indexOf(a);
  const bi = VAULT_TIERS.indexOf(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}
```

**Applicability to Phase 6:** The body transfers 1:1 — only the const name, enum values, and type name change. The helper signature `compareTiers(a, b): -1 | 0 | 1` is already the target signature in D-05.

**Naming collision risk:** If both `src/vault/vault-tier.ts` and `src/model-router/model-tier.ts` export a function literally named `compareTiers`, the root barrel (`src/index.ts`) would clash. Two remediations:

1. **Do not re-export at root for helpers** — keep both `compareTiers` scoped to their sub-path (`@x9-forge/contracts/vault` vs `@x9-forge/contracts/model-router`). Current `src/index.ts` is `export {}` so this is already the default posture.
2. **Alias if re-exported** — `export { compareTiers as compareVaultTiers } from './vault'` etc. Discouraged; adds friction.

**Recommendation:** Keep `compareTiers` sub-path-scoped. Consumers who need both import explicitly (`import { compareTiers as compareModelTiers } from '@x9-forge/contracts/model-router'`).

**Shared utility (`src/_shared/ordered-enum.ts`) — rejected.** With 2 call sites, different semantic domains (vault cascade priority vs LLM capability order), and a 7-line body, abstraction cost (new module, new tests, JSDoc, mental indirection) exceeds the copy-paste cost. Flag for v1.1 only if a 3rd ordered-enum emerges.

### Discriminated response shape (from Phase 4 http/response.ts)

**Canonical pattern:** `src/http/response.ts:30-33`
```ts
export const BridgeResponseSchema = z.discriminatedUnion('ok', [
  BridgeSuccessResponseSchema,   // z.object({ ok: z.literal(true), data: z.unknown() })
  BridgeErrorResponseSchema,     // z.object({ ok: z.literal(false), code, message, details? })
]);
```

**Endpoint-level specialization:** `src/http/endpoints/internal-agents-reload.ts:21-31` ships both arms as separate `const`s (`ReloadAgentResponseSchema` success-only + `ReloadAgentErrorResponseSchema`) rather than a pre-combined discriminated union. The contract object (`reloadAgentContract`) exposes `responseSchema: ReloadAgentResponseSchema` (success only).

**For `ModelPushResponseSchema` (D-14):** Both patterns are viable:
- (A) Two schemas + contract exposes success only (matches `reloadAgentContract` precedent).
- (B) One `z.discriminatedUnion('ok', [success, error])` + contract exposes that (matches `BridgeResponseSchema`).

**Recommendation for plan 06-02:** Use **(B) discriminated union**. Rationale: D-14 specifies 4 distinct error codes (`INVALID_POLICY | UNKNOWN_CAP | INVALID_MAPPING | INTERNAL_ERROR`) with optional `details[]`. A discriminated-union narrows correctly in consumer `if (res.ok) { ... } else { res.code switch }` — richer than the reload pattern which has a single opaque `error: string`. Align the error arm's `code` field with `z.enum([...])` (not plain `z.string()`) so exhaustiveness checks work downstream.

Exact proposed shape:
```ts
const ModelPushSuccessSchema = z.object({
  ok: z.literal(true),
  applied: z.number().int().nonnegative(),
  reloadVersion: z.string().min(1).optional(),
});
const ModelPushErrorSchema = z.object({
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
```

### Sub-path module layout (from Phase 5 vault, Phase M memory)

**Precedent:** `src/vault/index.ts` barrel re-exports schemas + types + helpers; each file is a single-concern module (tier, sync-state, entry, etc.). Named re-exports (`export { X, Y } from './file.js'`) not star-exports for discoverability (Phase M uses star-exports, Phase 5 migrated to named — adopt named).

**File layout (from D-01) confirmed correct:**
```
src/model-router/
  model-tier.ts           # MODEL_TIERS + ModelTierSchema + compareTiers
  model-provider.ts       # MODEL_PROVIDERS + ModelProviderSchema
  model-tier-mapping.ts   # ModelTierMappingSchema (completeness refine)
  model-policy.ts         # ModelPolicySchema (min<=max refine)
  model-push.ts           # Request/Response/Contract
  model-hot-reload.ts     # Notification + (optional) SSE frame variant
  per-agent-model-override.ts
  index.ts                # named re-exports
```

**JSDoc template (from D-03 + D-30):**
```
/**
 * <what + why, 1–3 sentences>
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see agent-x9/.planning/ROADMAP.md:328 (Phase 35 Model Router)
 * @see forge-v2/.planning/ROADMAP.md (Phase 10 — UI, TBD post-freeze)
 */
```

The `@see` path to forge-v2 is unknown (Phase 10 not yet researched); plan 06-02 can either ship with a literal "Phase 10 TBD" comment or defer to 06-01 to discover. Recommendation: ship literal path + comment — non-blocking for Phase 6 freeze.

## Zod v4 API Specifics

### z.record with enum key (MDRT-02 / D-09 / D-10)

**The shape you want in TS:** `Record<ModelTier, string>` — complete mapping.

**What `z.record(enum, value)` gives you in Zod v4:** The inferred TS type from `z.record(ModelTierSchema, z.string().min(1))` is `Partial<Record<ModelTier, string>>` in Zod v3 and behaves similarly in v4: the record is typed as "any key from the enum, value is string" but **completeness is not proven at the type level** — because `record` is an open mapping that JSON.parse can populate with only some keys.

**Two-step strategy (confirmed pattern for D-09 + D-10):**
```ts
const _RawModelTierMapping = z.record(ModelTierSchema, z.string().min(1));

export const ModelTierMappingSchema = _RawModelTierMapping.refine(
  (m): m is Record<ModelTier, string> => MODEL_TIERS.every((t) => typeof m[t] === 'string'),
  {
    message: `ModelTierMapping is incomplete — required tiers: ${MODEL_TIERS.join(', ')}`,
  },
);

// Narrow via infer: `z.infer<typeof ModelTierMappingSchema>` is still Partial<…>
// at the schema-level, so we export the narrowed type manually:
export type ModelTierMapping = Record<ModelTier, string>;
```

**Gotcha 1:** `z.infer<typeof ModelTierMappingSchema>` after `.refine()` does **not** narrow the TS type — `.refine` returns `ZodEffects<T>` whose `.infer` is still the input type. The type guard inside the `.refine` predicate (`(m): m is Record<ModelTier, string>`) does not propagate. **Mitigation:** export `type ModelTierMapping = Record<ModelTier, string>` manually (not `z.infer`) with a JSDoc note explaining the schema-level vs type-level narrowing. This is an accepted Zod ergonomics limitation.

**Gotcha 2:** `exactOptionalPropertyTypes: true` interacts poorly with `Record<Union, T>` because Zod's `.record(enumKey, val)` in v4 emits `{ [K in enumValue]?: T }` (with optional). Exporting `Record<ModelTier, string>` manually sidesteps this — consumer reads the type as complete.

**Alternative shape (rejected):** Encoding as `z.object({ standard: z.string().min(1), advanced: z.string().min(1), reasoning: z.string().min(1) })` gives type-level completeness for free — **but** extending tiers (D-07 breaking-change note) requires touching the schema. The `z.record + refine` pattern is more extensible at the cost of the manual type export. D-09 locks `z.record`, so keep it; ship the manual type export.

### Cross-field refine (D-11 ModelPolicy min<=max)

**Precedent:** `src/vault/vault-entry.ts:56-59` (T-05-01 guard)
```ts
.refine(
  (data) => !(data.isSecret && AES_WIRE_FORMAT_REGEX.test(data.value)),
  { message: 'Plain secret value matches AES wire format — decrypt was not performed?' },
);
```

**Applied to ModelPolicy (D-11):**
```ts
export const ModelPolicySchema = z.object({
  min: ModelTierSchema,
  max: ModelTierSchema,
}).refine(
  (p) => compareTiers(p.min, p.max) <= 0,
  {
    message: "ModelPolicy invariant violated: require compareTiers(min, max) <= 0",
    path: ['max'],   // surface the error on `max` for better diagnostics
  },
);
```

`path: ['max']` is the convention in Zod v4 to attach the error to a specific field in the error object (consumer sees `error.issues[0].path === ['max']`). The D-11 message format proposed ("...received { min: X, max: Y }") requires interpolating values:
```ts
.refine((p) => compareTiers(p.min, p.max) <= 0, (p) => ({
  message: `ModelPolicy invariant violated: min=${p.min} must be <= max=${p.max}`,
  path: ['max'],
}))
```
Zod v4 supports the function form `.refine(pred, (val) => issue)` — confirmed idiom.

### Discriminated union on literal `ok` (D-14)

Pattern already documented in §Discriminated response shape above. Confirmed exact call: `z.discriminatedUnion('ok', [successSchema, errorSchema])`. The arms MUST use `z.literal(true)` and `z.literal(false)` (not `z.boolean()`) or the discriminator fails to narrow.

### Optional with `exactOptionalPropertyTypes: true`

All optional fields must be declared `field: Schema.optional()` (which yields TS `field?: T | undefined`). `CapabilityRegistryEntrySchema.modelPolicy` (D-23) follows suit:
```ts
modelPolicy: ModelPolicySchema.optional(),
```
Consumer spreading object literal must use the conditional-spread pattern seen in `fromEndpoint()` (`src/capability/capability-registry-entry.ts:73-80`):
```ts
...(modelPolicy !== undefined ? { modelPolicy } : {}),
```

## Hot-Reload Mechanism Analysis (D-18)

### SSE option (reuse Phase 4 sse-frames.ts)

**Cost to add:**
1. New Zod schema `SseModelConfigReloadedFrameSchema = z.object({ type: z.literal('model-config-reloaded'), payload: ModelHotReloadNotificationSchema })` in `src/http/sse-frames.ts`.
2. Add to `SseFrameSchema = z.discriminatedUnion('type', [...])` variants list (`sse-frames.ts:65-72`).
3. Test the variant parses in `tests/http/sse-frames.test.ts`.
4. Document a distinct endpoint (e.g., `GET /internal/model-config/stream`) in a new contract file — or reuse `/internal/turn/stream` (no, different semantic channel).

**Pros:**
- Push-driven — X9 can invalidate cache instantly when Forge pushes new config.
- Zero polling overhead on agent-core.
- Reuses hardened SSE parser (`src/http/sse-parser.ts`) including the WR-04/WR-05 heartbeat/CRLF fixes already in prod.

**Cons:**
- Requires a persistent connection channel from X9 to Forge (or Forge to X9) dedicated to model-config events.
- Phase 35 ROUTER-06 explicitly says "per turn ... mtime check, or API-pushed to in-memory store" — pull-on-turn fits the described semantics; SSE overshoots.
- Adds one more SSE variant to maintain (cross-repo contract test surface).

### Polling option (new endpoint)

**Cost to add:**
1. New file `src/http/endpoints/internal-model-config-version.ts` exporting a contract:
   ```ts
   export const ModelConfigVersionResponseSchema = z.object({
     version: z.string().min(1),
     appliedAt: z.iso.datetime(),
     providersChanged: z.array(ModelProviderSchema).optional(),
     capsChanged: z.array(z.string().min(1)).optional(),
   });
   export const modelConfigVersionContract = {
     method: 'GET' as const,
     path: '/internal/model-config/version' as const,
     authType: 'secret' as const,
     responseSchema: ModelConfigVersionResponseSchema,
   } as const;
   ```
2. Register in `src/http/endpoints/index.ts`.
3. Add a `modelConfigVersion()` method to `SecretBridgeClient` (mirror `listAgents()` shape — simple GET, no params).
4. Test parse + contract shape.

**Pros:**
- Simpler: single endpoint, no long-lived connection, no frame multiplexing.
- Matches ROUTER-06 ("per turn mtime/API check") literally.
- Response shape IS `ModelHotReloadNotification` — D-17 already locks the shape, just a payload reuse.

**Cons:**
- N extra HTTP round-trips per N turns (negligible — gRPC'ish overhead on localhost / docker bridge).
- Polling cadence lives in X9 (acceptable — it's the consumer's policy).

### Recommendation for plan 06-01

**Ship polling only.** Rationale:
1. Phase 35 ROUTER-06 text is explicit about a pull model.
2. Polling is simpler, lower surface area, and — crucially — the contract (D-17 `ModelHotReloadNotification` shape) is transport-agnostic: if Phase 35 later needs push, the same shape drops into an SSE frame without a breaking contract change.
3. Avoids forcing X9 to open a persistent connection for a configuration channel (cleaner lifecycle: config fetch is idempotent and can be retried/cached).

**Caveat for plan 06-01:** Read Phase 35 ROUTER-06 closely and, if X9 authors express intent for push semantics, switch to SSE or ship both. D-18 authorises both. This research recommends the polling baseline + SSE deferred to 06-02-followup only if 06-01 flags a push requirement.

## X9 Phase 35 Alignment

### What X9 Phase 35 draft says

Source: `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md:328-418`. Phase 35 is defined as a design draft in ROADMAP.md — **no phase folder has been scaffolded** under `agent-x9/.planning/phases/` (confirmed via directory listing — phases jump from `34-voice-realtime-stack` to `36-memory-engine-v2-adr-foundation`, no 35). Draft content summary:

- **ROUTER-01 Model Tier Registry:** Tiers `standard < advanced < reasoning` fixed ordered. Config via env (`LLM_TIER_STANDARD`, `LLM_TIER_ADVANCED`) + Forge push.
- **ROUTER-02 Capability Model Policy:** `{ "modelPolicy": { "min": "standard", "max": "advanced" } }` in registry.json. Default `{ min: standard, max: standard }`.
- **ROUTER-03 Turn-Level LLM Classifier:** 50–100 token LLM call to pick tier within policy range.
- **ROUTER-04 Routing Flow:** effective policy = union of candidate caps' policies; floor = strictest min; ceiling = most permissive max.
- **ROUTER-05 Forge Model Push:** DEFERRED to forge-v2 repo. Agent-core side only in Phase 35.
- **ROUTER-06 Hot-Reload:** per-turn mtime check OR API-push in-memory store; no restart.
- **ROUTER-07 Observability:** log `{ selectedTier, classifierUsed, classifierLatencyMs?, candidateCaps, effectivePolicy }`.
- **ROUTER-08 Backward Compat:** missing `modelPolicy` → defaults to `{ standard, standard }`.

### Naming / shape matches or divergences vs bridge

| Bridge name (D-01..) | X9 Phase 35 name | Match? | Action |
|---|---|---|---|
| `ModelTier` (D-04) | "model tier" — values `standard \| advanced \| reasoning` | ✅ exact | None |
| `MODEL_TIERS` (D-06) const | N/A (X9 uses env vars) | N/A | Bridge-only convenience |
| `compareTiers()` (D-05) | Ordering is described, helper not named | ✅ compatible | Bridge is canonical |
| `ModelPolicy { min, max }` (D-11) | `modelPolicy: { min, max }` | ✅ exact | None |
| `ModelTierMapping` (D-09) | "Model tier → model ID mapping" | ✅ exact | None |
| `ModelProvider` (D-08) | Not enumerated; implied via model IDs (`gpt-4.1-mini`, `o4-mini`, `claude-opus-4-6`) | ⚠ inferred | Bridge decides; see §Provider below |
| `ModelPushRequest` (D-13) | ROUTER-05 DEFERRED to forge-v2 | ⚠ no draft | Bridge is canonical (BRDG-03) |
| `ModelPushResponse` (D-14) | Same — deferred | ⚠ no draft | Bridge is canonical |
| `ModelHotReloadNotification` (D-17) | ROUTER-06 describes semantics, no shape | ⚠ no draft | Bridge is canonical |
| `PerAgentModelOverride` (D-20) | Not in ROUTER-01..08 | ⚠ missing | Bridge introduces new — Phase 35 must consume |
| `CapabilityRegistryEntry.modelPolicy?` (D-23) | ROUTER-02 + ROUTER-08 | ✅ exact | None |

**Summary:** Zero hard divergences. Five areas are "bridge introduces; X9 has no counter-draft" (`ModelProvider` enum, `ModelPushRequest/Response`, `ModelHotReloadNotification` shape, `PerAgentModelOverride`). All are green per BRDG-03 "bridge has precedence" — the bridge freezes, Phase 35 consumes.

### Provider list: openai / anthropic / google — validate or trim

Phase 35 doesn't enumerate providers. **Signals favoring keeping all 3:**
- ROUTER-01 examples: `gpt-4.1-mini` (openai), `o4-mini` (openai), `o3` (openai) — primary OpenAI.
- Trigger scenario names `claude-opus-4-6` in the bridge CONTEXT D-09 example (Anthropic).
- X9 `AgentCredentials` KNOWN_CREDENTIAL_KEYS already includes `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_CALENDAR_CLIENT_ID` (but google calendar ≠ Gemini LLM).
- User memory: Stefano's visione includes multi-provider routing — `claude-opus-4-6` for reasoning tier is explicit.

**Signal against `google`:**
- No Gemini model id in Phase 35 examples.
- No `GOOGLE_API_KEY` / `GEMINI_API_KEY` in `KNOWN_CREDENTIAL_KEYS`.

**Recommendation:** **Keep `['openai', 'anthropic', 'google']`** per D-08. Rationale: (a) provider enum extension is a breaking change (D-07 semantic); adding `google` now is cheap, removing it later is not; (b) the cost of a never-used enum value is near zero; (c) Phase 35 explicit defer of model-ID specifics to runtime config means the bridge's provider enum is forward-looking, not retrospective. Document in `ModelProvider` JSDoc: "`google` reserved for Gemini tier — no live consumer in Phase 35 initial cut; add credential key to `AGENT_CREDENTIAL_KEYS` when consumed."

### Flags for plan 06-01 coordinator

1. **Phase 35 has no phase folder.** Plan 06-01 cannot read `agent-x9/.planning/phases/35-*/PLAN.md` — it does not exist. Must rely solely on ROADMAP.md:328-418 draft.
2. **Update Phase 35 ROADMAP.md post-freeze (MDRT-07).** After Phase 6 merges, 06-01 (or a follow-up task) adds a preamble to Phase 35: "Consumes types from `@x9-forge/contracts/model-router` — see `.planning/phases/06-model-router-contracts-block-f/` for the canonical contract freeze." This closes success criterion #7 in ROADMAP.md:205.
3. **Forge Phase 10 is undocumented.** No `forge-v2/.planning/ROADMAP.md` §Phase 10 section was cited in CONTEXT. Plan 06-01 should confirm the path exists or flag "Forge Phase 10 roadmap entry TBD post-Phase-6 freeze." Bridge JSDoc `@see forge-v2/...` paths remain placeholder strings until Forge side produces its roadmap.
4. **Hot-reload mechanism decision is 06-01's to make.** This research recommends **polling** (above). 06-01 must confirm by reading Phase 35 intent once more; if unclear, ship polling + leave SSE variant in deferred.
5. **`PerAgentModelOverride` is bridge-originated.** Phase 35 draft does not mention per-agent overrides. 06-01 should note this in the alignment research for X9 awareness — X9 consumers will need to decide how to apply overrides (likely in `agent-core` identity resolution; out of Phase 35 scope as drafted).

## Fixture Strategy

### File layout

Precedent from Phase 5: `tests/vault/fixtures/*.json`. Adopt the same pattern under `tests/model-router/fixtures/*.json`. Header in each fixture: `// SYNTHETIC — no live endpoint, will be replaced with staging capture once Phase 35 X9 ships` per D-26 (note: JSON doesn't allow comments — use a top-level `"_note"` field or pair with a sibling `REDACTION-NOTES.md` like `tests/vault/fixtures/REDACTION-NOTES.md`).

**Recommended final layout:**
```
tests/model-router/
  fixtures/
    SYNTHETIC-NOTES.md                          # explains invented-fixture status
    model-push-request-minimal.json             # D-27 (a)
    model-push-request-complete.json            # D-27 (b)
    model-push-response-success.json            # D-27 (c)
    model-push-response-error-invalid-policy.json    # D-27 (d1)
    model-push-response-error-unknown-cap.json       # D-27 (d2)
    model-push-response-error-invalid-mapping.json   # D-27 (d3)
    model-push-response-error-internal.json          # D-27 (d4)
    model-hot-reload-notification-minimal.json  # D-27 (e)
    registry-entry-with-model-policy.json       # D-27 (f)
    registry-entry-without-model-policy.json    # D-27 (g)
  model-tier.test.ts
  model-provider.test.ts
  model-tier-mapping.test.ts
  model-policy.test.ts
  model-push.test.ts
  model-hot-reload.test.ts
  per-agent-model-override.test.ts
  capability-registry-entry-extension.test.ts  # MDRT-04 / D-25 migration test
```

### 7 minimum synthetic fixtures (from CONTEXT D-27)

| # | Filename | Purpose | Shape summary |
|---|---|---|---|
| a | `model-push-request-minimal.json` | Minimal valid push: only providers, no overrides | `{ providers: { openai: { standard: "gpt-4.1-mini", advanced: "o4-mini", reasoning: "o3" } } }` |
| b | `model-push-request-complete.json` | All optional fields | Above + `perCapPolicies: { briefing: { min: "standard", max: "advanced" } }` + `perAgentOverrides: [{ agentId: "stefano", policy: { min: "reasoning", max: "reasoning" } }]` |
| c | `model-push-response-success.json` | Success path | `{ ok: true, applied: 12, reloadVersion: "2026-04-16T12:00:00Z/r1" }` |
| d | `model-push-response-error-invalid-policy.json` | Error — bad policy | `{ ok: false, code: "INVALID_POLICY", message: "...", details: [{ capName: "briefing", reason: "min > max" }] }` |
| d2 | `model-push-response-error-unknown-cap.json` | Error — unknown cap name | `{ ok: false, code: "UNKNOWN_CAP", message: "...", details: [{ capName: "xyz", reason: "not in registry" }] }` |
| d3 | `model-push-response-error-invalid-mapping.json` | Error — mapping issue | `{ ok: false, code: "INVALID_MAPPING", message: "..." }` |
| d4 | `model-push-response-error-internal.json` | Error — internal | `{ ok: false, code: "INTERNAL_ERROR", message: "..." }` |
| e | `model-hot-reload-notification-minimal.json` | Hot-reload payload | `{ version: "r1", appliedAt: "2026-04-16T12:00:00Z" }` |
| f | `registry-entry-with-model-policy.json` | MDRT-04 happy path | Existing `CapabilityRegistryEntry` + `modelPolicy: { min: "standard", max: "reasoning" }` |
| g | `registry-entry-without-model-policy.json` | MDRT-04 backward compat | `CapabilityRegistryEntry` with no `modelPolicy` field |

10 fixtures total (d split across 4 error codes). Matches the "7 minimum" floor in D-27 with the error code expansion.

## Package.json Wiring

### Current exports field shape

Already wired — `package.json:37-40`:
```json
"./model-router": {
  "types": "./dist/model-router/index.d.ts",
  "import": "./dist/model-router/index.js"
}
```

**This entry exists from Phase 0 scaffolding** — `src/model-router/index.ts` is the placeholder `export {}`. No `package.json` change needed for Phase 6. Plan 06-02 just populates `src/model-router/*.ts` with real modules.

### New entry required for ./model-router

**None.** Plan 06-02 scope shrinks accordingly — no `package.json` diff.

### Root `src/index.ts` re-export

Current state: `export {};`. Per D's Claude-discretion note "default: sì, coerenza" — add `export * from './model-router/index.js';` (mirror Phase 5 pattern). Plan 06-02 can include this in the barrel update.

## Capability Registry Extension (MDRT-04 / plan 06-03)

### Migration path

Add `modelPolicy: ModelPolicySchema.optional()` to `CapabilityRegistryEntrySchema` (`src/capability/capability-registry-entry.ts:24-32`).

**Import cycle risk:** `ModelPolicySchema` lives in `src/model-router/model-policy.ts`. Importing from `capability/capability-registry-entry.ts` creates a cross-module import. Two options:
1. **Direct import** `import { ModelPolicySchema } from '../model-router/model-policy.js';` — simple, no cycle (vault has similar cross-module imports via re-exports).
2. **Type-only import** (if TS can infer) — not applicable since Zod needs runtime.

**Recommendation:** Direct import (option 1). Verify no circular reference by running `tsc --noEmit` in plan 06-03 — the registry does not import anything model-router transitively, so no cycle risk.

### Fixture cases (from D-25)

Plan 06-03 ships **4 migration fixture cases**:
1. Legacy registry entry (no `modelPolicy`) → `parse()` green. Fixture `g` above.
2. New registry entry (valid `modelPolicy`) → `parse()` green. Fixture `f` above.
3. Invalid policy entry (`{ min: 'reasoning', max: 'standard' }`) → `parse()` red with D-11 message. No fixture file — inline in `capability-registry-entry-extension.test.ts`.
4. Existing Phase 1 fixtures — re-run under new schema, must still pass. Locate existing registry fixtures via `tests/capability/fixtures/` if present, otherwise skip (the contract test at Phase 1 already covers this).

### `toEndpoint()`/`fromEndpoint()` impact

**None.** Both helpers use `Pick<CapabilityRegistryEntry, 'host' | 'port' | 'protocol'>` or an explicit `meta` parameter (`capability-registry-entry.ts:46-81`) — neither reads `modelPolicy`. Extension is fully non-breaking at the helper surface. Plan 06-03 does NOT need to touch `toEndpoint`/`fromEndpoint` tests.

## Validation Architecture

Contracts-only phase; validation = compile-time + Zod parse tests + fixture parse tests. No runtime behavior to validate.

**Concrete validation checkpoints that plans 06-01, 06-02, 06-03 MUST include:**

1. **Schema parse green (one per schema):**
   - `ModelTierSchema.parse('standard' | 'advanced' | 'reasoning')` → pass
   - `ModelProviderSchema.parse('openai' | 'anthropic' | 'google')` → pass
   - `ModelTierMappingSchema.parse(complete record)` → pass
   - `ModelPolicySchema.parse({ min, max }) where min<=max` → pass (all 6 non-empty orderings)
   - `ModelPushRequestSchema.parse(fixture-a)` and `...parse(fixture-b)` → pass
   - `ModelPushResponseSchema.parse(fixture-c)` and 4× `...parse(fixture-d*)` → pass
   - `ModelHotReloadNotificationSchema.parse(fixture-e)` → pass
   - `PerAgentModelOverrideSchema.parse(override-with-policy)` and `...parse(override-with-tierMapping)` → pass

2. **Schema parse red (one per schema — negative):**
   - `ModelTierSchema.safeParse('unknown')` → `success: false`
   - `ModelTierMappingSchema.safeParse({ standard: 'x', advanced: 'y' })` → fail with D-10 message (missing `reasoning`)
   - `ModelPolicySchema.safeParse({ min: 'reasoning', max: 'standard' })` → fail with D-11 message
   - `PerAgentModelOverrideSchema.safeParse({ agentId: 'x' })` → fail (must specify policy OR tierMapping per D-20)
   - `ModelPushResponseSchema.safeParse({ ok: true, applied: -1 })` → fail (nonnegative int)

3. **Cross-test — `compareTiers` unit test (D-05):** all 9 combinations (3×3 matrix) + reflexive `compareTiers(t,t) === 0` for each t.

4. **Type-level assertions (optional — no test-types lib currently in package.json deps):** Skip formal `Expect<Equal<...>>` assertions; rely on `tsc --noEmit` in the build step as the compile-time check. Manually assert via a `*.test-d.ts` file only if plan 06-02 elects — recommendation: **skip** to avoid adding a dep.

5. **Fixture parse suite:** Each of the 10 fixtures (§Fixture Strategy) has a dedicated `.parse()` call in a test that fails loudly if the fixture drifts.

6. **Non-breaking guard for `CapabilityRegistryEntry` (D-23 / plan 06-03):**
   - Parse fixture `g` (no `modelPolicy`) → green.
   - Parse any pre-existing Phase 1 `registry-entry-*.json` fixture → green (no regression).
   - Parse fixture `f` (with valid `modelPolicy`) → green.
   - Parse inline object `{ ..., modelPolicy: { min: 'reasoning', max: 'standard' } }` → red with D-11 message (propagation from nested refine).

7. **Barrel export completeness:** `src/model-router/index.ts` re-exports every schema + type + helper listed in §Sub-path module layout. A simple `import * as M from './src/model-router/index.js'` smoke test (pattern `tests/smoke.test.ts`) asserts all expected exports exist.

8. **Discriminated union narrowing (compile-time via tsc):** Write a no-op consumer function in a test file that takes `ModelPushResponse` and in both branches uses branch-specific fields — relies on `tsc --noEmit` to catch narrowing regressions.

## Requirements Coverage Matrix

| REQ-ID | Status in bridge | Plan target |
|--------|------------------|-------------|
| MDRT-01 (ModelTier ordered enum + compareTiers) | Bridge contract required | 06-02 |
| MDRT-02 (ModelTierMapping `Record<Tier,string>`) | Bridge contract required | 06-02 |
| MDRT-03 (ModelPolicy `{min,max}` + invariant) | Bridge contract required | 06-02 |
| MDRT-04 (`modelPolicy?` extension to CapabilityRegistryEntry) | Non-breaking extension | 06-03 |
| MDRT-05 (ModelPushRequest for POST /internal/model-config) | Bridge contract required | 06-02 |
| MDRT-06 (ModelPushResponse — success + errors) | Bridge contract required | 06-02 |
| MDRT-07 (ModelHotReloadNotification — SSE/polling shape) | Bridge contract required (shape locked, transport decided 06-01) | 06-01 decides, 06-02 implements |
| MDRT-08 (PerAgentModelOverride) | Bridge contract required | 06-02 |

All 8 MDRT requirements fully covered across the 3 plans. No requirement is deferred or out of scope.

## Risks & Unknowns

- **R-11 (new, low):** Phase 35 has no scaffolded phase folder — only the ROADMAP.md draft. If X9 author materially rewrites Phase 35 after bridge freeze, amendments may be needed. Mitigation: D-29 fallback (amend before freeze if 06-01 discovers hard divergences). Non-blocking; bridge is authoritative per BRDG-03.
- **R-12 (new, low):** Forge Phase 10 has no referenced roadmap entry. Bridge JSDoc `@see forge-v2/...` paths are placeholder. Mitigation: ship literal "TBD" comment, update post-Forge-Phase-10 planning.
- **R-13 (new, medium):** `z.record(enum, value)` does not narrow to `Record<Enum, Value>` at the type level via `.refine()`. Mitigation: manual `export type ModelTierMapping = Record<ModelTier, string>` with JSDoc (documented in §Zod v4 API). This is a Zod ergonomics limitation, not a bridge defect.
- **R-14 (new, low):** `compareTiers` exists in both `@x9-forge/contracts/vault` and `@x9-forge/contracts/model-router`. Consumer that imports both must alias. Mitigation: document in README "How to add a new contract" + each sub-path's JSDoc. Acceptable cost.
- **Unknown-1:** Whether Phase 35 X9 will implement polling (ROUTER-06 "mtime check") or push (ROUTER-06 "API-pushed to in-memory store") — plan 06-01 must read closely. This research recommends polling.
- **Unknown-2:** Whether `reloadVersion` (D-14 success arm) should be required or optional. Current D-14 says optional. Mitigation: keep optional; can tighten in v1.1 without breaking.
- **No VPS / external-access dependencies.** All research-phase inputs are code-resident. Phase 6 is fully greenfield; no staging capture blocks progress.

## RESEARCH COMPLETE
