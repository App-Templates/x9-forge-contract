"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentTurnContract = exports.INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN = exports.INTERNAL_AGENT_TURN_UNKNOWN_AGENT = exports.InternalAgentTurnErrorResponseSchema = exports.InternalAgentTurnResponseSchema = exports.InternalAgentTurnRequestSchema = exports.InternalAgentTurnParamsSchema = void 0;
exports.internalAgentTurnPath = internalAgentTurnPath;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../../capability/capability-call-identity.cjs");
const internal_memory_extract_js_1 = require("./internal-memory-extract.cjs");
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
 * memory. A primary turn additionally requires the complete trusted identity
 * to match its current loaded context; legacy primary bodies remain refused.
 *
 * Legacy bodies and responses remain valid. Only this per-agent route adds
 * optional `turn` and response `moveId` (v1.25.0) and an optional authenticated
 * caller's `userId` (v1.26.0), and the voice-led `prepare`/`exchange` turns with response
 * `lead`/`note` (v1.27.0); the personal `/internal/turn` schema is unchanged.
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
exports.InternalAgentTurnRequestSchema = internal_turn_js_1.InternalTurnRequestSchema.extend({
    turn: capability_turn_lead_js_1.AgentTurnSchema.optional(),
    /** Server-owned admission identity, matched against the current loaded context. */
    identity: capability_call_identity_js_1.CapabilityCallIdentitySchema.optional(),
    /** Trusted caller identity, never taken from model text or tool input. */
    userId: internal_memory_extract_js_1.InternalMemoryExtractRequestSchema.shape.userId,
});
/** v1.27.0: `lead` answers a `prepare` turn, `note` an `exchange` turn; both come with an empty `reply`. */
exports.InternalAgentTurnResponseSchema = internal_turn_js_1.InternalTurnResponseSchema.extend({ moveId: capability_turn_lead_js_1.AgentTurnMoveIdSchema.optional(),
    lead: capability_turn_lead_js_1.CapabilityLeadInstructionsSchema.optional(), note: capability_turn_lead_js_1.CapabilityNoteSchema.optional() });
exports.InternalAgentTurnErrorResponseSchema = internal_turn_js_1.InternalTurnErrorResponseSchema;
/** Error code returned with 404 when the agent is not loaded in agent-core. */
exports.INTERNAL_AGENT_TURN_UNKNOWN_AGENT = 'unknown_agent';
/** Error code returned with 403 for a primary turn without a scoped admission. */
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