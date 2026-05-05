"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelHotReloadNotificationSchema = exports.pushModelConfigContract = exports.ModelPushResponseSchema = exports.ModelPushErrorSchema = exports.ModelPushSuccessSchema = exports.ModelPushRequestSchema = exports.PerAgentModelOverrideSchema = exports.ModelPolicySchema = exports.ModelTierMappingSchema = exports.MODEL_PROVIDERS = exports.ModelProviderSchema = exports.compareTiers = exports.TIER_ORDER = exports.MODEL_TIERS = exports.ModelTierSchema = void 0;
// Tier
var model_tier_js_1 = require("./model-tier.cjs");
Object.defineProperty(exports, "ModelTierSchema", { enumerable: true, get: function () { return model_tier_js_1.ModelTierSchema; } });
Object.defineProperty(exports, "MODEL_TIERS", { enumerable: true, get: function () { return model_tier_js_1.MODEL_TIERS; } });
Object.defineProperty(exports, "TIER_ORDER", { enumerable: true, get: function () { return model_tier_js_1.TIER_ORDER; } });
Object.defineProperty(exports, "compareTiers", { enumerable: true, get: function () { return model_tier_js_1.compareTiers; } });
// Provider
var model_provider_js_1 = require("./model-provider.cjs");
Object.defineProperty(exports, "ModelProviderSchema", { enumerable: true, get: function () { return model_provider_js_1.ModelProviderSchema; } });
Object.defineProperty(exports, "MODEL_PROVIDERS", { enumerable: true, get: function () { return model_provider_js_1.MODEL_PROVIDERS; } });
// Tier mapping
var model_tier_mapping_js_1 = require("./model-tier-mapping.cjs");
Object.defineProperty(exports, "ModelTierMappingSchema", { enumerable: true, get: function () { return model_tier_mapping_js_1.ModelTierMappingSchema; } });
// Policy
var model_policy_js_1 = require("./model-policy.cjs");
Object.defineProperty(exports, "ModelPolicySchema", { enumerable: true, get: function () { return model_policy_js_1.ModelPolicySchema; } });
// Per-agent override
var per_agent_model_override_js_1 = require("./per-agent-model-override.cjs");
Object.defineProperty(exports, "PerAgentModelOverrideSchema", { enumerable: true, get: function () { return per_agent_model_override_js_1.PerAgentModelOverrideSchema; } });
// Push request/response + contract
var model_push_js_1 = require("./model-push.cjs");
Object.defineProperty(exports, "ModelPushRequestSchema", { enumerable: true, get: function () { return model_push_js_1.ModelPushRequestSchema; } });
Object.defineProperty(exports, "ModelPushSuccessSchema", { enumerable: true, get: function () { return model_push_js_1.ModelPushSuccessSchema; } });
Object.defineProperty(exports, "ModelPushErrorSchema", { enumerable: true, get: function () { return model_push_js_1.ModelPushErrorSchema; } });
Object.defineProperty(exports, "ModelPushResponseSchema", { enumerable: true, get: function () { return model_push_js_1.ModelPushResponseSchema; } });
Object.defineProperty(exports, "pushModelConfigContract", { enumerable: true, get: function () { return model_push_js_1.pushModelConfigContract; } });
// Hot reload
var model_hot_reload_js_1 = require("./model-hot-reload.cjs");
Object.defineProperty(exports, "ModelHotReloadNotificationSchema", { enumerable: true, get: function () { return model_hot_reload_js_1.ModelHotReloadNotificationSchema; } });
//# sourceMappingURL=index.js.map