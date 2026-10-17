"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentDeletionContract = exports.AgentDeletionErrorResponseSchema = exports.AgentDeletionErrorCodeSchema = exports.AgentDeletionParamsSchema = void 0;
exports.agentDeletionPath = agentDeletionPath;
const zod_1 = require("zod");
const agent_deletion_js_1 = require("../../agent/agent-deletion.cjs");
const internal_agents_reload_js_1 = require("./internal-agents-reload.cjs");
/**
 * Forge factory -> X9 agent-core. Secret authentication is enforced by the server.
 * POST /internal/agents/:agentId/deletion processes durable removal of one logical agent.
 * The address must equal body.identity.managementAgentId; X9 independently validates its
 * current mapping and protects the primary/Master, including concurrent lifecycle commands.
 * Forge owns user authorization and exact authoritative-name confirmation.
 * 200 carries complete OR partial per-piece results; the caller must correlate the response.
 * Same key/body resumes unfinished work. A changed body under the same key is a 409 conflict.
 * No container, shared runtime, owner memory or owner credentials are in this endpoint's scope.
 * Not-processed errors: 400 invalid_request/confirmation_mismatch, 403 protected_agent,
 * 404 agent_not_found, 409 identity_mismatch/idempotency_conflict/command_in_progress,
 * 503 source_unavailable. No raw diagnostics are serialized.
 */
exports.AgentDeletionParamsSchema = internal_agents_reload_js_1.ReloadAgentParamsSchema.strict();
exports.AgentDeletionErrorCodeSchema = zod_1.z.enum([
    'invalid_request', 'agent_not_found', 'protected_agent', 'confirmation_mismatch',
    'identity_mismatch', 'idempotency_conflict', 'command_in_progress', 'source_unavailable',
]);
exports.AgentDeletionErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false), error: exports.AgentDeletionErrorCodeSchema,
}).strict();
exports.agentDeletionContract = {
    method: 'POST', path: '/internal/agents/:agentId/deletion', authType: 'secret',
    paramsSchema: exports.AgentDeletionParamsSchema,
    bodySchema: agent_deletion_js_1.AgentDeletionCommandSchema,
    responseSchema: agent_deletion_js_1.AgentDeletionResultSchema,
};
function agentDeletionPath(agentId) {
    return exports.agentDeletionContract.path.replace(':agentId', exports.AgentDeletionParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agents-deletion.js.map