"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalModelConsumerReportContract = exports.internalModelConsumerInstallContract = exports.internalModelConsumerStateContract = exports.internalAgentModelsStateContract = exports.internalModelsBatchContract = exports.internalModelsPreviewContract = exports.internalModelsOverviewContract = void 0;
exports.agentModelsStatePath = agentModelsStatePath;
exports.modelConsumerReportPath = modelConsumerReportPath;
exports.isModelConsumerReportMatching = isModelConsumerReportMatching;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const model_slot_js_1 = require("../../model-router/model-slot.cjs");
const model_consumer_execution_js_1 = require("../../model-router/model-consumer-execution.cjs");
const agent_model_configuration_js_1 = require("../../model-router/agent-model-configuration.cjs");
const models_batch_js_1 = require("../../model-router/models-batch.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Control-plane aggregation contracts; the authenticated Forge browser facade reuses these DTOs.
 * Producers must use existing slot writers and per-agent commands. This bridge does not install handlers.
 */
exports.internalModelsOverviewContract = {
    method: 'GET', path: '/internal/models/overview',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    responseSchema: models_batch_js_1.AgentModelsOverviewSchema,
};
exports.internalModelsPreviewContract = {
    method: 'POST', path: '/internal/models/preview',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: models_batch_js_1.AgentModelsBatchPreviewRequestSchema, responseSchema: models_batch_js_1.AgentModelsBatchPreviewSchema,
};
exports.internalModelsBatchContract = {
    method: 'POST', path: '/internal/models/batch',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: models_batch_js_1.AgentModelsBatchRequestSchema, responseSchema: models_batch_js_1.AgentModelsBatchResultSchema,
};
exports.internalAgentModelsStateContract = {
    method: 'GET', path: '/internal/agents/:agentId/models/state',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema, responseSchema: agent_model_configuration_js_1.AgentModelsStateSchema,
};
function agentModelsStatePath(agentId) {
    return exports.internalAgentModelsStateContract.path.replace(':agentId', internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
/** Same metadata contract in each consumer service; registry binding chooses the trusted service URL. */
exports.internalModelConsumerStateContract = {
    method: 'POST', path: '/internal/models/consumers/:slotId/state',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema }).strict(),
    bodySchema: model_consumer_execution_js_1.ModelConsumerStateRequestSchema, responseSchema: model_consumer_execution_js_1.ModelConsumerRuntimeStateSchema,
};
exports.internalModelConsumerInstallContract = {
    method: 'POST', path: '/internal/models/consumers/:slotId/install',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema }).strict(),
    bodySchema: model_consumer_execution_js_1.ModelConsumerInstallRequestSchema, responseSchema: model_consumer_execution_js_1.ModelConsumerInstallReceiptSchema,
};
/** Consumer-to-core notification, distinct from endpoints hosted by consumer services. */
exports.internalModelConsumerReportContract = {
    method: 'POST', path: '/internal/models/consumer-reports/:slotId',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema }).strict(),
    bodySchema: model_consumer_execution_js_1.ModelConsumerRuntimeStateSchema,
    responseSchema: zod_1.z.object({ ok: zod_1.z.literal(true) }).strict(),
};
function modelConsumerReportPath(slotId) {
    const params = exports.internalModelConsumerReportContract.paramsSchema.parse({ slotId });
    return exports.internalModelConsumerReportContract.path.replace(':slotId', params.slotId);
}
/** Both boundaries must parse before comparing the reported consumer with the route. */
function isModelConsumerReportMatching(params, body) {
    const route = exports.internalModelConsumerReportContract.paramsSchema.safeParse(params);
    const report = exports.internalModelConsumerReportContract.bodySchema.safeParse(body);
    return route.success && report.success && route.data.slotId === report.data.slotId;
}
//# sourceMappingURL=internal-models-batch.js.map