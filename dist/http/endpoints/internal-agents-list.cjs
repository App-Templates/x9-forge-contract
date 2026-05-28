"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAgentsContract = exports.ListAgentsResponseSchema = exports.ListAgentsAgentSchema = void 0;
const zod_1 = require("zod");
/**
 * GET /internal/agents — list all loaded agents.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-03
 *
 * Real response shape from agent-core (services/agent-core/src/index.ts:328-333):
 *   { agents: [{ agentId: string, displayName: string, ownerId: string }] }
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.listAgents()` reads `data.agents.map(a => a.agentId)`
 *   - forge-v2 factory health route checks `data.agents.some(a => a.agentId === slug)`
 *
 * NOTE: This is the current shape. Does NOT yet conform to standard
 * BridgeSuccessResponse format. Standardization tracked for 04-03.
 */
exports.ListAgentsAgentSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    displayName: zod_1.z.string(),
    ownerId: zod_1.z.string(),
});
exports.ListAgentsResponseSchema = zod_1.z.object({
    agents: zod_1.z.array(exports.ListAgentsAgentSchema),
});
exports.listAgentsContract = {
    method: 'GET',
    path: '/internal/agents',
    authType: 'secret',
    responseSchema: exports.ListAgentsResponseSchema,
};
//# sourceMappingURL=internal-agents-list.js.map