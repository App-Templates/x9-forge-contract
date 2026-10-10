import { z } from 'zod';
import { CapabilityCallIdentitySchema } from "../../capability/capability-call-identity.js";
import { InternalMemoryExtractRequestSchema } from "./internal-memory-extract.js";
import { AgentTurnSchema, AgentTurnMoveIdSchema, CapabilityLeadInstructionsSchema, CapabilityNoteSchema } from "../../capability/capability-turn-lead.js";
import { InternalTurnRequestSchema, InternalTurnResponseSchema, InternalTurnErrorResponseSchema, } from "./internal-turn.js";
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
export const InternalAgentTurnParamsSchema = z.object({
    agentId: z.string().regex(/^[a-z0-9-]+$/),
});
export const InternalAgentTurnRequestSchema = InternalTurnRequestSchema.extend({
    turn: AgentTurnSchema.optional(),
    /** Trusted server scope, checked against the current admitted agent. */
    identity: CapabilityCallIdentitySchema.optional(),
    /** Trusted caller identity, never taken from model text or tool input. */
    userId: InternalMemoryExtractRequestSchema.shape.userId,
});
/** v1.27.0: `lead` answers a `prepare` turn, `note` an `exchange` turn; both come with an empty `reply`. */
export const InternalAgentTurnResponseSchema = InternalTurnResponseSchema.extend({ moveId: AgentTurnMoveIdSchema.optional(),
    lead: CapabilityLeadInstructionsSchema.optional(), note: CapabilityNoteSchema.optional() });
export const InternalAgentTurnErrorResponseSchema = InternalTurnErrorResponseSchema;
/** Error code returned with 404 when the agent is not loaded in agent-core. */
export const INTERNAL_AGENT_TURN_UNKNOWN_AGENT = 'unknown_agent';
/** Error code returned with 403 when the path names the env primary agent. */
export const INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN = 'primary_agent_forbidden';
/** Build the concrete path for an agent id (validated). */
export function internalAgentTurnPath(agentId) {
    const { agentId: safe } = InternalAgentTurnParamsSchema.parse({ agentId });
    return `/internal/agents/${safe}/turn`;
}
export const internalAgentTurnContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/turn',
    authType: 'secret',
    paramsSchema: InternalAgentTurnParamsSchema,
    bodySchema: InternalAgentTurnRequestSchema,
    responseSchema: InternalAgentTurnResponseSchema,
};
//# sourceMappingURL=internal-agent-turn.js.map