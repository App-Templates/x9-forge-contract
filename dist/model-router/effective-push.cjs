"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentModelSlotContract = exports.EffectiveSlotPathParamsSchema = exports.internalModelsReturnWindowContract = exports.ModelsReturnWindowRequestSchema = exports.internalModelsInvalidateContract = exports.internalModelsPushContract = exports.ModelsPushAckSchema = exports.ModelsPushOutcomeSchema = void 0;
exports.modelsInvalidatePath = modelsInvalidatePath;
exports.modelsReturnWindowPath = modelsReturnWindowPath;
exports.agentModelSlotPath = agentModelSlotPath;
exports.slotRequestMatchesPath = slotRequestMatchesPath;
const zod_1 = require("zod");
const index_js_1 = require("../auth/index.cjs");
const internal_agents_management_js_1 = require("../http/endpoints/internal-agents-management.cjs");
const effective_models_js_1 = require("./effective-models.cjs");
const effective_slot_state_js_1 = require("./effective-slot-state.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
/** What agent-core did with a pushed effective response, compared with the one it already holds. */
exports.ModelsPushOutcomeSchema = zod_1.z.enum(['accepted', 'same', 'older', 'incomparable']);
/** `etag` is the one agent-core keeps AFTER the push; null when it holds none. */
exports.ModelsPushAckSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    outcome: exports.ModelsPushOutcomeSchema,
    etag: zod_1.z.string().min(1).max(256).nullable(),
}).strict();
/**
 * Vault → agent-core: delivers the effective choices of one agent.
 * The choice is "in force" only when `ack.etag === body.etag`.
 * 409 `{ ok: false, error: 'identity_mismatch' }` when agent-core does not know that agent
 * with that `vaultAgentId`.
 */
exports.internalModelsPushContract = {
    method: 'POST', path: '/internal/models/effective',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: effective_models_js_1.EffectiveModelsResponseSchema, responseSchema: exports.ModelsPushAckSchema,
};
/** Emergency invalidation: agent-core drops what it holds for the agent and fetches again. */
exports.internalModelsInvalidateContract = {
    method: 'POST', path: '/internal/models/invalidate/:agentId',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema,
    responseSchema: zod_1.z.object({ ok: zod_1.z.literal(true) }).strict(),
};
function modelsInvalidatePath(agentId) {
    return exports.internalModelsInvalidateContract.path.replace(':agentId', internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
exports.ModelsReturnWindowRequestSchema = zod_1.z.object({
    vaultAgentId: zod_1.z.number().int().positive(),
    ttlMs: zod_1.z.number().int().min(1000).max(900000),
}).strict();
/**
 * For `ttlMs` agent-core admits a v1 publication for the agent even though it is on v2:
 * the return is prepared once the new one is on (Astra 13). `until` is when the window closes.
 */
exports.internalModelsReturnWindowContract = {
    method: 'POST', path: '/internal/models/return-window/:agentId',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema,
    bodySchema: exports.ModelsReturnWindowRequestSchema,
    responseSchema: zod_1.z.object({ ok: zod_1.z.literal(true), until: zod_1.z.string().datetime() }).strict(),
};
function modelsReturnWindowPath(agentId) {
    return exports.internalModelsReturnWindowContract.path.replace(':agentId', internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
exports.EffectiveSlotPathParamsSchema = zod_1.z.object({
    agentId: internal_agents_management_js_1.AgentManagementParamsSchema.shape.agentId,
    slotId: model_slot_js_1.ModelSlotIdSchema,
}).strict();
/**
 * Services → agent-core: reads one slot with the complete identity triple in the body.
 * `params.agentId` and `params.slotId` must match `body.scope.agentId` and `body.slotId`;
 * a mismatch returns 400.
 * `If-None-Match` equal to a configured state's `etag` returns 304 without a body.
 * All other states have no ETag and always return 200.
 */
exports.internalAgentModelSlotContract = {
    method: 'POST', path: '/internal/agents/:agentId/models/slots/:slotId',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: exports.EffectiveSlotPathParamsSchema,
    bodySchema: effective_slot_state_js_1.EffectiveSlotReadRequestSchema,
    responseSchema: effective_slot_state_js_1.EffectiveSlotStateSchema,
};
function agentModelSlotPath(agentId, slotId) {
    const params = exports.EffectiveSlotPathParamsSchema.parse({ agentId, slotId });
    return exports.internalAgentModelSlotContract.path
        .replace(':agentId', params.agentId)
        .replace(':slotId', params.slotId);
}
/** Compare the path and body after each has passed its boundary schema. */
function slotRequestMatchesPath(params, body) {
    return params.agentId === body.scope.agentId && params.slotId === body.slotId;
}
//# sourceMappingURL=effective-push.js.map