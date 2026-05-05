"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerAgentModelOverrideSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const model_tier_js_1 = require("./model-tier.cjs");
const model_policy_js_1 = require("./model-policy.cjs");
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
exports.PerAgentModelOverrideSchema = zod_1.z.object({
    agentId: agent_identity_js_1.AgentIdentitySchema,
    policy: model_policy_js_1.ModelPolicySchema.optional(),
    tierMapping: zod_1.z.record(model_tier_js_1.ModelTierSchema, zod_1.z.string().min(1).optional()).optional(),
}).superRefine((o, ctx) => {
    const hasPolicy = o.policy !== undefined;
    // Zod v4 z.record with an enum key materializes all enum keys with `undefined`
    // for absent entries, so `Object.keys` alone cannot distinguish `{}` from a
    // partially-populated mapping. Check for at least one defined value.
    const hasMapping = o.tierMapping !== undefined &&
        Object.values(o.tierMapping).some((v) => v !== undefined);
    if (!hasPolicy && !hasMapping) {
        ctx.addIssue({
            code: 'custom',
            message: 'PerAgentModelOverride must specify at least one of: policy, tierMapping (non-empty)',
        });
    }
});
//# sourceMappingURL=per-agent-model-override.js.map