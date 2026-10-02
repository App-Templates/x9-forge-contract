"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentTurnContract = exports.INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN = exports.INTERNAL_AGENT_TURN_UNKNOWN_AGENT = exports.InternalAgentTurnErrorResponseSchema = exports.InternalAgentTurnResponseSchema = exports.InternalAgentTurnRequestSchema = exports.InternalAgentTurnParamsSchema = void 0;
exports.internalAgentTurnPath = internalAgentTurnPath;
const zod_1 = require("zod");
const capability_turn_lead_js_1 = require("../../capability/capability-turn-lead.cjs");
const internal_turn_js_1 = require("./internal-turn.cjs");
/**
 * POST /internal/agents/:agentId/turn — synchronous turn addressed to ONE
 * specific agent loaded in agent-core (v1.22.0, Enterprise Adoption M0).
 * Direction: X9 cap-voice-live (web ingress) -> X9 agent-core (internal)
 * Auth: X-Internal-Secret
 *
 * `/internal/turn` always runs the env PRIMARY agent (Stefano's personal X9).
 * This sibling runs the turn with the deps of the agent named in the path
 * (workspace, registry, memory identity from its own context.json), so a voice
 * session bound to a Forge-created agent never touches the personal agent's
 * memory. agent-core refuses the primary agent id here (403): the personal
 * agent stays reachable only through the existing routes.
 *
 * Legacy bodies and responses remain valid. Only this per-agent route adds
 * optional `turn` and response `moveId` (v1.25.0); the personal route is unchanged.
 * agentId uses the same regex as `/internal/agents/:agentId/reload|stop`
 * (agent-core agent id; Forge factory slugs are a subset).
 *
 * Errors: 400 invalid agentId/body, 401 missing/wrong secret, 403 primary
 * agent, 404 `{ ok: false, error: 'unknown_agent' }`, 500 turn failure.
 *
 * Consumers:
 *   - agent-x9 services/agent-core (server)
 *   - agent-x9 services/cap-voice-live `x9_ask` for agent-bound web sessions (client)
 */
exports.InternalAgentTurnParamsSchema = zod_1.z.object({
    agentId: zod_1.z.string().regex(/^[a-z0-9-]+$/),
});
exports.InternalAgentTurnRequestSchema = internal_turn_js_1.InternalTurnRequestSchema.extend({ turn: capability_turn_lead_js_1.AgentTurnSchema.optional() });
exports.InternalAgentTurnResponseSchema = internal_turn_js_1.InternalTurnResponseSchema.extend({ moveId: capability_turn_lead_js_1.AgentTurnMoveIdSchema.optional() });
exports.InternalAgentTurnErrorResponseSchema = internal_turn_js_1.InternalTurnErrorResponseSchema;
/** Error code returned with 404 when the agent is not loaded in agent-core. */
exports.INTERNAL_AGENT_TURN_UNKNOWN_AGENT = 'unknown_agent';
/** Error code returned with 403 when the path names the env primary agent. */
exports.INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN = 'primary_agent_forbidden';
/** Build the concrete path for an agent id (validated). */
function internalAgentTurnPath(agentId) {
    const { agentId: safe } = exports.InternalAgentTurnParamsSchema.parse({ agentId });
    return `/internal/agents/${safe}/turn`;
}
exports.internalAgentTurnContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/turn',
    authType: 'secret',
    paramsSchema: exports.InternalAgentTurnParamsSchema,
    bodySchema: exports.InternalAgentTurnRequestSchema,
    responseSchema: exports.InternalAgentTurnResponseSchema,
};
//# sourceMappingURL=internal-agent-turn.js.map