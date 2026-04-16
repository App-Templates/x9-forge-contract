# Phase 6 — X9 Phase 35 Alignment Research

**Date:** 2026-04-16
**Status:** FINAL
**Author:** gsd-executor (plan 06-01)
**Consumes:** 06-CONTEXT.md (D-01..D-30 LOCKED), 06-RESEARCH.md §X9 Phase 35 Alignment

## Phase 35 Draft Summary

Source: `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md` §"Phase 35: Model Router — Two-Level Routing (Cap Policy + Turn Classifier)" (lines 328-429). Requirements ROUTER-01..08:

- **ROUTER-01 Model Tier Registry** — Ordered tier list `standard | advanced | reasoning` (fixed order, classifier selection space). Tier→model-id mapping via env vars `LLM_TIER_STANDARD`, `LLM_TIER_ADVANCED`, overridable by Forge push.
- **ROUTER-02 Capability Model Policy** — `modelPolicy: { min, max }` in `registry.json` per capability. Default `{ min: standard, max: standard }` when absent. When `min == max` → classifier skipped (zero overhead).
- **ROUTER-03 Turn-Level LLM Classifier** — Runs only when effective policy has `min != max`. Selects minimum sufficient tier. Runtime-only (agent-core), bridge-irrelevant.
- **ROUTER-04 Routing Flow** — Runtime logic (tool-router → effective policy → optional classifier → main LLM call → tool dispatch). Bridge-irrelevant.
- **ROUTER-05 Forge Model Push** — Explicitly **DEFERRED to forge-v2 repo** (separate phase). Phase 35 implements agent-core side only (env vars + config file). Bridge `pushModelConfigContract` (D-15) is the contract freeze; implementations land later.
- **ROUTER-06 Hot-Reload** — "file-based with mtime check, or API-pushed to in-memory store". Primary strategy: per-turn mtime check (polling semantics). No container restart. Propagation: Forge UI → API → agent-core config → next turn.
- **ROUTER-07 Observability** — Per-turn logging of `{ selectedTier, classifierUsed, classifierLatencyMs, candidateCaps, effectivePolicy }`. Runtime-only, bridge-irrelevant.
- **ROUTER-08 Backward Compatibility** — Missing `modelPolicy` → default `{ standard, standard }` → identical to current behavior. Zero breaking changes.

## Name Mapping Table

| Bridge name (D-XX) | X9 Phase 35 name | Match / Divergence | Resolution (bridge wins per BRDG-03) |
|---|---|---|---|
| `ModelTier` (D-04) | no explicit type name; tiers literal `standard \| advanced \| reasoning` in ROUTER-01 | ✅ shape match (identical literal set, identical order) | Bridge-canonical: `z.enum(['standard', 'advanced', 'reasoning'])`. X9 imports from `@x9-forge/contracts/model-router`. |
| `MODEL_TIERS` / `TIER_ORDER` (D-06) | implicit ordered list in ROUTER-01 ("standard < advanced < reasoning") | ✅ match | Bridge-canonical: `TIER_ORDER: readonly ModelTier[]`. |
| `compareTiers` (D-05) | not named; implied by ROUTER-03/04 (classifier clamp `[min, max]`) | ✅ match (bridge provides helper, X9 consumes) | Bridge-canonical helper. |
| `ModelPolicy` (D-11) | `modelPolicy: { min, max }` literal shape in ROUTER-02 | ✅ **exact match** including field names | Bridge-canonical: `z.object({ min, max }).refine(min<=max)`. Min<=max invariant is implicit in X9 (policy is operator-set) — bridge enforces fail-loud. |
| `ModelTierMapping` (D-09) | env-var driven tier→model-id mapping in ROUTER-01 (`LLM_TIER_STANDARD=gpt-4.1-mini`, etc.) | ✅ shape match | Bridge-canonical: `z.record(ModelTier, string)`. X9 env vars feed into runtime mapping; bridge tipizes the wire/config shape. |
| `ModelProvider` (D-08) | not explicit; Phase 35 examples reference `gpt-4.1-mini`, `o4-mini`, `o3` (OpenAI) only | ⚠ implicit divergence — X9 Phase 35 is OpenAI-only in v1 | Bridge keeps `['openai', 'anthropic', 'google']` per D-08 (extensible, anticipates Stefano's "clone X su Opus 4.6" vision per PROJECT.md line 58). X9 runtime only uses what its env vars name; enum extension is non-breaking to X9. |
| `ModelPushRequest` (D-13) | ROUTER-05 "Forge Model Push — DEFERRED" (no payload defined) | ✅ no conflict (X9 doesn't define shape; bridge does) | Bridge-canonical. X9 Phase 35 does NOT implement the push endpoint; only reads config file + env vars. Push is forge-v2 future phase. |
| `ModelPushResponse` (D-14) | not defined in Phase 35 | ✅ no conflict | Bridge-canonical. |
| `pushModelConfigContract` (D-15) | implicit — "Config API endpoint or reads from config file" (ROUTER-05) | ✅ bridge wins (contract first, endpoint later) | Bridge-canonical. Endpoint dechant dichiarato in contract file `src/http/endpoints/internal-model-config.ts`; NOT implemented in Phase 6. |
| `ModelHotReloadNotification` (D-17) | ROUTER-06 describes propagation, no payload shape | ✅ bridge-canonical shape (version, appliedAt, providersChanged?, capsChanged?) | X9 reads polling endpoint response via bridge schema. |
| `PerAgentModelOverride` (D-20) | not explicit in Phase 35; PROJECT.md line 58 vision ("clone X su Opus 4.6") | ✅ bridge-originated (no conflicting X9 draft) | Bridge-canonical. Phase 35 v1 may not consume per-agent override initially; shape is available for when cloning lands. |
| `CapabilityRegistryEntry.modelPolicy?` (D-23) | ROUTER-02 `modelPolicy` in `registry.json` per cap | ✅ **exact match** | Bridge-canonical extension (plan 06-03). |

## Hot-Reload Mechanism Decision (D-18)

**Decision:** polling

**Rationale:** Phase 35 ROUTER-06 is explicit: "reloaded from config on every turn (file-based with mtime check, or API-pushed to in-memory store)". The primary strategy described is **per-turn mtime check**, which is polling semantics (X9 pulls latest config each turn). The secondary alternative ("API-pushed to in-memory store") is a performance optimization where Forge mutates X9's in-memory store directly — this is out-of-scope for Phase 6 because it requires no cross-repo wire protocol (Forge writes, X9 reads). SSE for hot-reload is not mentioned in Phase 35 and would require X9 to hold an open server stream connection, contradicting the pull-on-turn model.

06-RESEARCH.md §Hot-Reload Mechanism Analysis arrived at the same recommendation independently.

**Implications for plan 06-02:**
- **Polling path (this decision)** → plan 06-02 creates `src/http/endpoints/internal-model-config-version.ts` with contract:
  - method: `GET`
  - path: `/internal/model-config/version`
  - authType: `secret` (X-Internal-Secret, same as push for consistency)
  - responseSchema: `ModelHotReloadNotificationSchema`
- **SSE path (NOT selected)** → would have added `type: 'model-config-reloaded'` frame to `src/http/sse-frames.ts`. Skipped.
- **Both (NOT selected)** → would have shipped both artifacts. Skipped.

D-17 shape (`version`, `appliedAt`, `providersChanged?`, `capsChanged?`) is transport-agnostic; if a later amendment adds SSE push, the same schema is reused as frame payload. No breaking change path.

## Provider List Decision (D-08)

**Decision:** Keep `['openai', 'anthropic', 'google']` unchanged.

**Rationale:**
- Phase 35 examples reference only OpenAI models in v1 (`gpt-4.1-mini`, `o4-mini`, `o3`), but this reflects X9's current runtime deployment, not the contract's extensibility ceiling.
- Stefano's product vision (PROJECT.md line 58: "clone X su Opus 4.6") REQUIRES Anthropic provider support — the `PerAgentModelOverride` shape (D-20) is the precise cristallization of that vision. Removing `anthropic` from the enum would invalidate D-20's use case before it ships.
- `google` is a placeholder for Gemini (bridge is extensible-by-design per BRDG-03). Adding it later is a breaking change (existing parsed configs without `google` in the enum would need migration); keeping it costs zero runtime bytes (enum literal only, no runtime resolver). Conservative inclusion.
- BRDG-03 precedence: bridge freezes the contract surface; X9 and Forge implementations bridge-subset what they actually support. An enum with 3 values that X9 currently uses 1 of is cleaner than re-extending the enum in v1.1.

06-RESEARCH.md §Provider enum arrived at the same recommendation.

## Divergences & Amendments

No amendments to CONTEXT D-01..D-30 are required.

The single implicit divergence surfaced — X9 Phase 35 v1 targets OpenAI models only while bridge `ModelProvider` enum includes `anthropic` and `google` — is NOT a LOCKED decision conflict. X9 is free to populate `ModelTierMapping` with OpenAI-only values at runtime; the enum ceiling is a contract future-proofing concern, not a runtime requirement. Bridge precedence (BRDG-03) + Stefano's clone vision (PROJECT.md line 58) both support keeping the provider enum as D-08 specified.

All name/shape/semantics comparisons resolve in favor of the bridge as written, with X9 Phase 35 either matching exactly (ROUTER-01 tiers, ROUTER-02 policy, ROUTER-08 backward-compat default) or being silent on the bridge-originated shape (ROUTER-05 deferral, no `ModelPushRequest` definition; no `PerAgentModelOverride` in Phase 35 v1).

**Status:** No amendments required. D-01..D-30 stand. Plan 06-02 may execute against CONTEXT as-is.

## Plan 06-02 Inputs

Summary handoff:
- Sub-path: `@x9-forge/contracts/model-router` (already wired in `package.json:37-40` per 06-RESEARCH.md §Package.json Wiring)
- Files to create (bridge schemas): `model-tier.ts`, `model-provider.ts`, `model-tier-mapping.ts`, `model-policy.ts`, `model-push.ts`, `model-hot-reload.ts`, `per-agent-model-override.ts`, `index.ts`
- Endpoint contract files: `src/http/endpoints/internal-model-config.ts` (POST push — declared, not implemented) + `src/http/endpoints/internal-model-config-version.ts` (GET version polling — hot-reload mechanism confirmed as **polling**)
- Provider list: `['openai', 'anthropic', 'google']` (D-08 confirmed)
- Hot-reload transport artefact: polling endpoint only (no SSE frame addition to `src/http/sse-frames.ts`)
- 10 synthetic fixtures under `tests/model-router/fixtures/` per 06-RESEARCH.md §Fixture Strategy + CONTEXT D-27
- Manual `type ModelTierMapping = Record<ModelTier, string>` export (R-13 Zod v4 gotcha — `z.record(enum, value).refine(...)` inference does not narrow; plan 06-02 task 2 already encodes this mitigation)

## Plan 06-03 Inputs

- Extend `src/capability/capability-registry-entry.ts` with `modelPolicy: ModelPolicySchema.optional()` (D-23)
- Import path: `../model-router/model-policy.js`
- Backward-compat: entries without `modelPolicy` continue to parse green (X9 Phase 35 ROUTER-08 requirement, bridge D-23)
- Transitive refine propagation: invalid policies (`min > max`) fail via `ModelPolicySchema.refine()` (D-11) — no separate guard needed at registry entry level
- Four test cases per D-25 + 06-VALIDATION.md table rows 06-03-XX:
  1. Entry with valid `modelPolicy` → green
  2. Entry without `modelPolicy` → green (backward compat, matches ROUTER-08)
  3. Entry with invalid `modelPolicy` (`{ min: 'reasoning', max: 'standard' }`) → red with D-11 diagnostic
  4. `toEndpoint`/`fromEndpoint` baseline fixtures continue to parse green (helpers don't touch `modelPolicy`)

## Cross-Repo Handoff Record

Populated by task 06-01-03 after agent-x9 ROADMAP commit.

- agent-x9 branch: `chore/bridge-v1.0-resync-and-mdrt07` (off main `8fb75ca`)
- agent-x9 commit SHA: `43adee5`
- agent-x9 commit message: `docs(phase-35): cite bridge @x9-forge/contracts/model-router as SSOT (from x9-forge-contract-bridge 06-01-03)`
- Companion commit (re-vendor): `29bc2c1` `chore(vendor): resync bridge to b4863ab (v1.0 + IN-02/03 cleanup)`
- Bridge SHA cited / vendored: `b4863ab` (v1.0 + IN-02 + IN-03)
- Date: 2026-04-16
- PR: not yet opened — branch pushed to origin; opening PR is operator's call

## RESEARCH-X9-ALIGNMENT COMPLETE
