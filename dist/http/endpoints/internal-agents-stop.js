import { z } from 'zod';
/**
 * POST /internal/agents/:agentId/stop — stop a running agent.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-02
 *
 * Structurally identical to /internal/agents/:agentId/reload for params +
 * response shape. agent-core validates agentId via the same AGENT_ID_SCHEMA
 * regex.
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.stop(agentId)` via createBridgeClient<'secret'>
 */
export const StopAgentParamsSchema = z.object({
    agentId: z.string().regex(/^[a-z0-9-]+$/),
});
export const StopAgentResponseSchema = z.object({
    ok: z.literal(true),
    agentId: z.string().min(1),
});
export const StopAgentErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
export const stopAgentContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/stop',
    authType: 'secret',
    paramsSchema: StopAgentParamsSchema,
    responseSchema: StopAgentResponseSchema,
};
//# sourceMappingURL=internal-agents-stop.js.map