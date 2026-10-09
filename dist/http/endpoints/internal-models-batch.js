import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { ModelSlotIdSchema } from "../../model-router/model-slot.js";
import { ModelConsumerStateRequestSchema, ModelConsumerRuntimeStateSchema, ModelConsumerInstallRequestSchema, ModelConsumerInstallReceiptSchema } from "../../model-router/model-consumer-execution.js";
import { AgentModelsStateSchema } from "../../model-router/agent-model-configuration.js";
import { AgentModelsOverviewSchema, AgentModelsBatchPreviewRequestSchema, AgentModelsBatchPreviewSchema, AgentModelsBatchRequestSchema, AgentModelsBatchResultSchema } from "../../model-router/models-batch.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
/** Control-plane aggregation contracts; the authenticated Forge browser facade reuses these DTOs.
 * Producers must use existing slot writers and per-agent commands. This bridge does not install handlers.
 */
export const internalModelsOverviewContract = {
    method: 'GET', path: '/internal/models/overview',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    responseSchema: AgentModelsOverviewSchema,
};
export const internalModelsPreviewContract = {
    method: 'POST', path: '/internal/models/preview',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: AgentModelsBatchPreviewRequestSchema, responseSchema: AgentModelsBatchPreviewSchema,
};
export const internalModelsBatchContract = {
    method: 'POST', path: '/internal/models/batch',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: AgentModelsBatchRequestSchema, responseSchema: AgentModelsBatchResultSchema,
};
export const internalAgentModelsStateContract = {
    method: 'GET', path: '/internal/agents/:agentId/models/state',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: AgentManagementParamsSchema, responseSchema: AgentModelsStateSchema,
};
export function agentModelsStatePath(agentId) {
    return internalAgentModelsStateContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
/** Same metadata contract in each consumer service; registry binding chooses the trusted service URL. */
export const internalModelConsumerStateContract = {
    method: 'POST', path: '/internal/models/consumers/:slotId/state',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: z.object({ slotId: ModelSlotIdSchema }).strict(),
    bodySchema: ModelConsumerStateRequestSchema, responseSchema: ModelConsumerRuntimeStateSchema,
};
export const internalModelConsumerInstallContract = {
    method: 'POST', path: '/internal/models/consumers/:slotId/install',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: z.object({ slotId: ModelSlotIdSchema }).strict(),
    bodySchema: ModelConsumerInstallRequestSchema, responseSchema: ModelConsumerInstallReceiptSchema,
};
//# sourceMappingURL=internal-models-batch.js.map