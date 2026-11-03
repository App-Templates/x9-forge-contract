import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { AgentManagementRequestIdSchema, AgentManagementReasonSchema } from "../../agent/agent-management.js";
import { AgentConfigVersionSchema } from "../../capability/ricerca/agent-config.js";
import { AgentModelsConfigurationSchema } from "../../model-router/agent-model-configuration-values.js";
import { ModelsTargetSchema, ModelsApplyJobSchema } from "../../model-router/models-target.js";
export const ModelsApplyHeirSchema = z.union([AgentIdSchema, z.object({
        agentId: AgentIdSchema, requestId: AgentManagementRequestIdSchema,
        desiredVersion: AgentConfigVersionSchema, configuration: AgentModelsConfigurationSchema,
    }).strict()]);
export const ModelsApplyRequestSchema = z.object({
    requestId: AgentManagementRequestIdSchema, target: ModelsTargetSchema,
    desiredVersion: AgentConfigVersionSchema, configuration: AgentModelsConfigurationSchema,
    heirs: z.array(ModelsApplyHeirSchema).max(2048).optional(),
}).strict().superRefine((request, ctx) => {
    if (request.heirs && new Set(request.heirs.map(heir => typeof heir === 'string' ? heir : heir.agentId)).size !== request.heirs.length)
        ctx.addIssue({ code: 'custom', path: ['heirs'], message: 'An heir occurs once per apply request' });
});
/** Accepted means queued; this receipt never claims consumer installation. */
export const ModelsApplyResponseSchema = z.object({
    ok: z.boolean(), requestId: AgentManagementRequestIdSchema,
    outcome: z.enum(['accepted', 'error']), reason: AgentManagementReasonSchema.optional(),
}).strict().superRefine((result, ctx) => {
    if (result.ok !== (result.outcome === 'accepted'))
        ctx.addIssue({ code: 'custom', path: ['ok'], message: 'Only accepted admission is successful' });
});
export const internalModelsApplyContract = {
    method: 'POST', path: '/internal/models/apply',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: ModelsApplyRequestSchema, responseSchema: ModelsApplyResponseSchema,
};
export const internalModelsApplyJobContract = {
    method: 'GET', path: '/internal/models/apply/:requestId',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: z.object({ requestId: AgentManagementRequestIdSchema }).strict(), responseSchema: ModelsApplyJobSchema,
};
export function modelsApplyJobPath(requestId) {
    return internalModelsApplyJobContract.path.replace(':requestId', internalModelsApplyJobContract.paramsSchema.parse({ requestId }).requestId);
}
//# sourceMappingURL=internal-models-apply.js.map