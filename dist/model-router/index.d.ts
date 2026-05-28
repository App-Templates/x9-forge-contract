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
export { ModelTierSchema, MODEL_TIERS, TIER_ORDER, compareTiers } from "./model-tier.js";
export type { ModelTier } from "./model-tier.js";
export { ModelProviderSchema, MODEL_PROVIDERS } from "./model-provider.js";
export type { ModelProvider } from "./model-provider.js";
export { ModelTierMappingSchema } from "./model-tier-mapping.js";
export type { ModelTierMapping } from "./model-tier-mapping.js";
export { ModelPolicySchema } from "./model-policy.js";
export type { ModelPolicy } from "./model-policy.js";
export { PerAgentModelOverrideSchema } from "./per-agent-model-override.js";
export type { PerAgentModelOverride } from "./per-agent-model-override.js";
export { ModelPushRequestSchema, ModelPushSuccessSchema, ModelPushErrorSchema, ModelPushResponseSchema, pushModelConfigContract, } from "./model-push.js";
export type { ModelPushRequest, ModelPushResponse } from "./model-push.js";
export { ModelHotReloadNotificationSchema } from "./model-hot-reload.js";
export type { ModelHotReloadNotification } from "./model-hot-reload.js";
//# sourceMappingURL=index.d.ts.map