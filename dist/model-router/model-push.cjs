"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushModelConfigContract = exports.ModelPushResponseSchema = exports.ModelPushErrorSchema = exports.ModelPushSuccessSchema = exports.ModelPushRequestSchema = void 0;
const zod_1 = require("zod");
const model_provider_js_1 = require("./model-provider.cjs");
const model_tier_mapping_js_1 = require("./model-tier-mapping.cjs");
const model_policy_js_1 = require("./model-policy.cjs");
const per_agent_model_override_js_1 = require("./per-agent-model-override.cjs");
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
exports.ModelPushRequestSchema = zod_1.z.object({
    /**
     * Per-provider tier mappings. Provider scoping lives here, not in the mapping (D-09).
     * At least one provider must be present (deploy-time requirement); additional providers
     * are optional per-deployment. `.optional()` on inner value allows partial provider sets
     * (declared-but-absent is rejected — see refine below).
     */
    providers: zod_1.z.record(model_provider_js_1.ModelProviderSchema, model_tier_mapping_js_1.ModelTierMappingSchema.optional())
        .refine((p) => Object.values(p).some((v) => v !== undefined), {
        message: 'ModelPushRequest.providers must include at least one provider mapping',
    }),
    /** Capability-scoped policies keyed by capability name (opaque string, not branded). */
    perCapPolicies: zod_1.z.record(zod_1.z.string().min(1), model_policy_js_1.ModelPolicySchema).optional(),
    /** Per-agent overrides — clone X specific model config (D-20). */
    perAgentOverrides: zod_1.z.array(per_agent_model_override_js_1.PerAgentModelOverrideSchema).optional(),
});
/**
 * Model push response — discriminated union on `ok` (D-14 / 06-RESEARCH
 * §Discriminated response shape). Success arm carries `applied` count and
 * optional `reloadVersion` for correlation with ModelHotReloadNotification.
 * Error arm carries a typed `code` from 4 values + human `message` + optional
 * per-capability `details[]`.
 */
exports.ModelPushSuccessSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    applied: zod_1.z.number().int().nonnegative(),
    reloadVersion: zod_1.z.string().min(1).optional(),
});
exports.ModelPushErrorSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    code: zod_1.z.enum(['INVALID_POLICY', 'UNKNOWN_CAP', 'INVALID_MAPPING', 'INTERNAL_ERROR']),
    message: zod_1.z.string().min(1),
    details: zod_1.z.array(zod_1.z.object({
        capName: zod_1.z.string().min(1).optional(),
        reason: zod_1.z.string().min(1),
    })).optional(),
});
exports.ModelPushResponseSchema = zod_1.z.discriminatedUnion('ok', [
    exports.ModelPushSuccessSchema,
    exports.ModelPushErrorSchema,
]);
/**
 * Contract for POST /internal/model-config (D-15). Pattern mirrors
 * reloadAgentContract (Phase 4).
 */
exports.pushModelConfigContract = {
    method: 'POST',
    path: '/internal/model-config',
    authType: 'secret',
    requestSchema: exports.ModelPushRequestSchema,
    responseSchema: exports.ModelPushResponseSchema,
};
//# sourceMappingURL=model-push.js.map