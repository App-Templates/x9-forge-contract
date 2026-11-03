import { z } from 'zod';
import { AgentDeletionCommandSchema, AgentDeletionResultSchema } from "../../agent/agent-deletion.js";
import { ReloadAgentParamsSchema } from "./internal-agents-reload.js";
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
export const AgentDeletionParamsSchema = ReloadAgentParamsSchema.strict();
export const AgentDeletionErrorCodeSchema = z.enum([
    'invalid_request', 'agent_not_found', 'protected_agent', 'confirmation_mismatch',
    'identity_mismatch', 'idempotency_conflict', 'command_in_progress', 'source_unavailable',
]);
export const AgentDeletionErrorResponseSchema = z.object({
    ok: z.literal(false), error: AgentDeletionErrorCodeSchema,
}).strict();
export const agentDeletionContract = {
    method: 'POST', path: '/internal/agents/:agentId/deletion', authType: 'secret',
    paramsSchema: AgentDeletionParamsSchema,
    bodySchema: AgentDeletionCommandSchema,
    responseSchema: AgentDeletionResultSchema,
};
export function agentDeletionPath(agentId) {
    return agentDeletionContract.path.replace(':agentId', AgentDeletionParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agents-deletion.js.map