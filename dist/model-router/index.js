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
export { ModelTierSchema, MODEL_TIERS, TIER_ORDER, compareTiers } from "./model-tier.js";
// Provider
export { ModelProviderSchema, MODEL_PROVIDERS } from "./model-provider.js";
// Tier mapping
export { ModelTierMappingSchema } from "./model-tier-mapping.js";
// Policy
export { ModelPolicySchema } from "./model-policy.js";
// Per-agent override
export { PerAgentModelOverrideSchema } from "./per-agent-model-override.js";
// Push request/response + contract
export { ModelPushRequestSchema, ModelPushSuccessSchema, ModelPushErrorSchema, ModelPushResponseSchema, pushModelConfigContract, } from "./model-push.js";
// Hot reload
export { ModelHotReloadNotificationSchema } from "./model-hot-reload.js";
// Attested catalogs and capability-owned settings (M1a); no model ids or credentials embedded here.
export * from "./model-catalog.js";
export * from "./capability-model-settings.js";
export * from "./agent-model-configuration.js";
export * from "./models-batch.js";
// Canonical server-owned model consumer bindings; no runtime installation is inferred.
export * from "./model-consumers.js";
//# sourceMappingURL=index.js.map