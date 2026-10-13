"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalModelsApplyJobContract = exports.internalModelsApplyContract = exports.ModelsApplyResponseSchema = exports.ModelsApplyRequestSchema = exports.ModelsApplyHeirSchema = void 0;
exports.modelsApplyJobPath = modelsApplyJobPath;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const agent_model_configuration_values_js_1 = require("../../model-router/agent-model-configuration-values.cjs");
const models_target_js_1 = require("../../model-router/models-target.cjs");
exports.ModelsApplyHeirSchema = zod_1.z.union([agent_identity_js_1.AgentIdSchema, zod_1.z.object({
        agentId: agent_identity_js_1.AgentIdSchema, requestId: agent_management_js_1.AgentManagementRequestIdSchema,
        desiredVersion: agent_config_js_1.AgentConfigVersionSchema, configuration: agent_model_configuration_values_js_1.AgentModelsConfigurationSchema,
    }).strict()]);
exports.ModelsApplyRequestSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, target: models_target_js_1.ModelsTargetSchema,
    desiredVersion: agent_config_js_1.AgentConfigVersionSchema, configuration: agent_model_configuration_values_js_1.AgentModelsConfigurationSchema,
    heirs: zod_1.z.array(exports.ModelsApplyHeirSchema).max(2048).optional(),
}).strict().superRefine((request, ctx) => {
    if (request.heirs && new Set(request.heirs.map(heir => typeof heir === 'string' ? heir : heir.agentId)).size !== request.heirs.length)
        ctx.addIssue({ code: 'custom', path: ['heirs'], message: 'An heir occurs once per apply request' });
});
/** Accepted means queued; this receipt never claims consumer installation. */
exports.ModelsApplyResponseSchema = zod_1.z.object({
    ok: zod_1.z.boolean(), requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    outcome: zod_1.z.enum(['accepted', 'error']), reason: agent_management_js_1.AgentManagementReasonSchema.optional(),
}).strict().superRefine((result, ctx) => {
    if (result.ok !== (result.outcome === 'accepted'))
        ctx.addIssue({ code: 'custom', path: ['ok'], message: 'Only accepted admission is successful' });
});
exports.internalModelsApplyContract = {
    method: 'POST', path: '/internal/models/apply',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: exports.ModelsApplyRequestSchema, responseSchema: exports.ModelsApplyResponseSchema,
};
exports.internalModelsApplyJobContract = {
    method: 'GET', path: '/internal/models/apply/:requestId',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: zod_1.z.object({ requestId: agent_management_js_1.AgentManagementRequestIdSchema }).strict(), responseSchema: models_target_js_1.ModelsApplyJobSchema,
};
function modelsApplyJobPath(requestId) {
    return exports.internalModelsApplyJobContract.path.replace(':requestId', exports.internalModelsApplyJobContract.paramsSchema.parse({ requestId }).requestId);
}
//# sourceMappingURL=internal-models-apply.js.map