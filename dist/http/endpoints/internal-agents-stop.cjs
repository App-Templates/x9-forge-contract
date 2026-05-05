"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopAgentContract = exports.StopAgentErrorResponseSchema = exports.StopAgentResponseSchema = exports.StopAgentParamsSchema = void 0;
const zod_1 = require("zod");
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
exports.StopAgentParamsSchema = zod_1.z.object({
    agentId: zod_1.z.string().regex(/^[a-z0-9-]+$/),
});
exports.StopAgentResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    agentId: zod_1.z.string().min(1),
});
exports.StopAgentErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.stopAgentContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/stop',
    authType: 'secret',
    paramsSchema: exports.StopAgentParamsSchema,
    responseSchema: exports.StopAgentResponseSchema,
};
//# sourceMappingURL=internal-agents-stop.js.map