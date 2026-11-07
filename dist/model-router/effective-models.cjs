"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalModelsEffectiveContract = exports.EffectiveModelsParamsSchema = exports.EffectiveModelsResponseSchema = exports.EffectiveModelSlotSchema = exports.EffectiveSlotOriginSchema = exports.EFFECTIVE_SLOT_ORIGINS = exports.EffectiveSlotRetirementSchema = exports.EffectiveSlotRetirementReasonSchema = exports.EffectiveModelSlotStatusSchema = exports.EFFECTIVE_MODEL_SLOT_STATUSES = void 0;
exports.modelsEffectivePath = modelsEffectivePath;
const zod_1 = require("zod");
const index_js_1 = require("../auth/index.cjs");
const capability_call_identity_js_1 = require("../capability/capability-call-identity.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const credential_key_js_1 = require("../vault/credential-key.cjs");
const agent_model_configuration_values_js_1 = require("./agent-model-configuration-values.cjs");
const model_choice_js_1 = require("./model-choice.cjs");
const model_consumers_js_1 = require("./model-consumers.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const models_generation_js_1 = require("./models-generation.cjs");
/**
 * active with upgradedFrom: a retired model was replaced; show an "updated from" label and warning.
 * retired: a successor is being applied.
 * retired-no-successor: show a red row, keep the choice menu enabled and notify the user.
 */
exports.EFFECTIVE_MODEL_SLOT_STATUSES = ['active', 'retired', 'retired-no-successor'];
exports.EffectiveModelSlotStatusSchema = zod_1.z.enum(exports.EFFECTIVE_MODEL_SLOT_STATUSES);
exports.EffectiveSlotRetirementReasonSchema = zod_1.z.enum(['registry', 'provider-inventory', 'provider-error']);
exports.EffectiveSlotRetirementSchema = zod_1.z.object({
    modelId: agent_config_js_1.CapabilityModelIdSchema,
    reason: exports.EffectiveSlotRetirementReasonSchema,
    observedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict();
/** Own row of the agent, or the row of its preset. */
exports.EFFECTIVE_SLOT_ORIGINS = ['agent', 'preset'];
exports.EffectiveSlotOriginSchema = zod_1.z.enum(exports.EFFECTIVE_SLOT_ORIGINS);
/** Effective choice metadata; credential references never contain credential values. */
exports.EffectiveModelSlotSchema = zod_1.z.object({
    choice: model_choice_js_1.ModelChoiceSchema,
    origin: exports.EffectiveSlotOriginSchema,
    version: zod_1.z.number().int().positive(),
    status: exports.EffectiveModelSlotStatusSchema,
    upgradedFrom: zod_1.z.string().min(1).max(256).optional(),
    upgradedAt: zod_1.z.iso.datetime({ offset: true }).optional(),
    /** A retired model is replaced even when the previous choice was manually pinned. */
    upgradedWhilePinned: zod_1.z.literal(true).optional(),
    retirement: exports.EffectiveSlotRetirementSchema.optional(),
    credentialKey: credential_key_js_1.CredentialKeySchema.nullable(),
    credentialVersion: zod_1.z.number().int().positive().nullable(),
}).strict().superRefine((slot, ctx) => {
    if ((slot.credentialKey === null) !== (slot.credentialVersion === null)) {
        ctx.addIssue({ code: 'custom', path: ['credentialVersion'], message: 'Credential key and version must be present together or both null' });
    }
    if (slot.upgradedAt !== undefined && slot.upgradedFrom === undefined) {
        ctx.addIssue({ code: 'custom', path: ['upgradedAt'], message: 'Upgrade time requires the previous model' });
    }
    if (slot.upgradedWhilePinned !== undefined && slot.upgradedFrom === undefined) {
        ctx.addIssue({ code: 'custom', path: ['upgradedWhilePinned'], message: 'Pinned upgrade metadata requires the previous model' });
    }
    const retired = slot.status === 'retired' || slot.status === 'retired-no-successor';
    if (retired !== (slot.retirement !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['retirement'], message: 'Retirement metadata must be present exactly for retired statuses' });
    }
});
/** One declared agent and one generation, with choices for registered consumers only. */
exports.EffectiveModelsResponseSchema = zod_1.z.object({
    identity: agent_model_configuration_values_js_1.CompleteModelIdentitySchema,
    scope: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    mode: models_generation_js_1.ModelsModeSchema,
    generation: models_generation_js_1.ModelsGenerationSchema,
    etag: zod_1.z.string().min(1).max(256),
    slots: zod_1.z.record(model_slot_js_1.ModelSlotIdSchema, exports.EffectiveModelSlotSchema),
}).strict().superRefine((response, ctx) => {
    if (response.scope.agentId !== response.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['scope', 'agentId'], message: 'Model scope must name the declared runtime' });
    }
    // A failed nested generation refinement already rejects the response; do not pass it to a throwing parser.
    if (models_generation_js_1.ModelsGenerationSchema.safeParse(response.generation).success && response.etag !== (0, models_generation_js_1.modelsEtag)(response)) {
        ctx.addIssue({ code: 'custom', path: ['etag'], message: 'ETag must match the declared mode, identity and generation' });
    }
    for (const [slotId, slot] of Object.entries(response.slots)) {
        const consumer = (0, model_consumers_js_1.findModelConsumer)(slotId);
        if (consumer === undefined) {
            ctx.addIssue({ code: 'custom', path: ['slots', slotId], message: 'Unknown model consumer slot' });
            continue;
        }
        if (slot.choice.function !== consumer.function) {
            ctx.addIssue({ code: 'custom', path: ['slots', slotId, 'choice', 'function'], message: 'Model function must match the registered consumer' });
        }
        if (slot.choice.capability !== consumer.capability) {
            ctx.addIssue({ code: 'custom', path: ['slots', slotId, 'choice', 'capability'], message: 'Model capability must match the registered consumer' });
        }
    }
    if (response.mode === 'v1' && Object.keys(response.slots).length !== 0) {
        ctx.addIssue({ code: 'custom', path: ['slots'], message: 'Legacy v1 agents have no effective preset slots' });
    }
});
exports.EffectiveModelsParamsSchema = zod_1.z.object({
    vaultAgentId: zod_1.z.string().regex(/^[1-9][0-9]{0,9}$/),
}).strict();
/**
 * Token-authenticated effective choices for the declared Vault agent.
 * If-None-Match may carry the last HTTP ETag; a match returns 304 without a body.
 * A 200 response is validated with EffectiveModelsResponseSchema.
 */
exports.internalModelsEffectiveContract = {
    method: 'GET',
    path: '/internal/models/effective/:vaultAgentId',
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    paramsSchema: exports.EffectiveModelsParamsSchema,
    responseSchema: exports.EffectiveModelsResponseSchema,
};
function modelsEffectivePath(vaultAgentId) {
    const params = exports.EffectiveModelsParamsSchema.parse({ vaultAgentId: String(vaultAgentId) });
    return exports.internalModelsEffectiveContract.path.replace(':vaultAgentId', params.vaultAgentId);
}
//# sourceMappingURL=effective-models.js.map