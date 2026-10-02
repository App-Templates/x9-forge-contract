import { z } from 'zod';
import { AgentTurnSchema, AgentTurnMoveIdSchema } from '../../capability/capability-turn-lead.js';
import {
  InternalTurnRequestSchema,
  InternalTurnResponseSchema,
  InternalTurnErrorResponseSchema,
} from './internal-turn.js';

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

export const InternalAgentTurnParamsSchema = z.object({
  agentId: z.string().regex(/^[a-z0-9-]+$/),
});
export type InternalAgentTurnParams = z.infer<typeof InternalAgentTurnParamsSchema>;

export const InternalAgentTurnRequestSchema = InternalTurnRequestSchema.extend({ turn: AgentTurnSchema.optional() });
export type InternalAgentTurnRequest = z.infer<typeof InternalAgentTurnRequestSchema>;

export const InternalAgentTurnResponseSchema = InternalTurnResponseSchema.extend({ moveId: AgentTurnMoveIdSchema.optional() });
export type InternalAgentTurnResponse = z.infer<typeof InternalAgentTurnResponseSchema>;

export const InternalAgentTurnErrorResponseSchema = InternalTurnErrorResponseSchema;
export type InternalAgentTurnErrorResponse = z.infer<typeof InternalAgentTurnErrorResponseSchema>;

/** Error code returned with 404 when the agent is not loaded in agent-core. */
export const INTERNAL_AGENT_TURN_UNKNOWN_AGENT = 'unknown_agent' as const;
/** Error code returned with 403 when the path names the env primary agent. */
export const INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN = 'primary_agent_forbidden' as const;

/** Build the concrete path for an agent id (validated). */
export function internalAgentTurnPath(agentId: string): string {
  const { agentId: safe } = InternalAgentTurnParamsSchema.parse({ agentId });
  return `/internal/agents/${safe}/turn`;
}

export const internalAgentTurnContract = {
  method: 'POST' as const,
  path: '/internal/agents/:agentId/turn' as const,
  authType: 'secret' as const,
  paramsSchema: InternalAgentTurnParamsSchema,
  bodySchema: InternalAgentTurnRequestSchema,
  responseSchema: InternalAgentTurnResponseSchema,
} as const;
