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
export { ModelTierSchema, MODEL_TIERS, TIER_ORDER, compareTiers } from "./model-tier.cjs";
export type { ModelTier } from "./model-tier.cjs";
export { ModelProviderSchema, MODEL_PROVIDERS } from "./model-provider.cjs";
export type { ModelProvider } from "./model-provider.cjs";
export { ModelTierMappingSchema } from "./model-tier-mapping.cjs";
export type { ModelTierMapping } from "./model-tier-mapping.cjs";
export { ModelPolicySchema } from "./model-policy.cjs";
export type { ModelPolicy } from "./model-policy.cjs";
export { PerAgentModelOverrideSchema } from "./per-agent-model-override.cjs";
export type { PerAgentModelOverride } from "./per-agent-model-override.cjs";
export { ModelPushRequestSchema, ModelPushSuccessSchema, ModelPushErrorSchema, ModelPushResponseSchema, pushModelConfigContract, } from "./model-push.cjs";
export type { ModelPushRequest, ModelPushResponse } from "./model-push.cjs";
export { ModelHotReloadNotificationSchema } from "./model-hot-reload.cjs";
export type { ModelHotReloadNotification } from "./model-hot-reload.cjs";
//# sourceMappingURL=index.d.ts.map