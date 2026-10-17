import { z } from 'zod';
import { CapabilityCallIdentitySchema } from '../../capability/capability-call-identity.js';
import { InternalMemoryExtractRequestSchema } from './internal-memory-extract.js';
import { AgentTurnSchema, AgentTurnMoveIdSchema, CapabilityLeadInstructionsSchema, CapabilityNoteSchema } from '../../capability/capability-turn-lead.js';
import { OrganizationRunContextSchema } from '../../organization/run-context.js';
import { RunAttemptSchema, RunOutcomeSchema } from '../../organization/run-outcome.js';
import { ConnectionCardSchema } from './connection-card.js';
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
 * memory. A primary turn additionally requires the complete trusted identity
 * to match its current loaded context; legacy primary bodies remain refused.
 *
 * Legacy bodies and responses remain valid. Only this per-agent route adds
 * optional `turn` and response `moveId` (v1.25.0) and an optional authenticated
 * caller's `userId` (v1.26.0), and the voice-led `prepare`/`exchange` turns with response
 * `lead`/`note` (v1.27.0), and the optional trusted `organizationRun`
 * (run context + attempt, additive); the personal `/internal/turn` schema is unchanged.
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

/** Trusted run context and attempt of the calling organization run; both must name the same run. */
export const InternalAgentTurnOrganizationRunSchema = z
  .strictObject({
    context: OrganizationRunContextSchema,
    attempt: RunAttemptSchema,
  })
  .superRefine((run, ctx) => {
    if (run.attempt.runId !== run.context.runId) {
      ctx.addIssue({
        code: 'custom',
        message: 'attempt.runId must equal context.runId',
        path: ['attempt', 'runId'],
      });
    }
  });
export type InternalAgentTurnOrganizationRun = z.infer<typeof InternalAgentTurnOrganizationRunSchema>;

export const InternalAgentTurnRequestSchema = InternalTurnRequestSchema.extend({
  turn: AgentTurnSchema.optional(),
  /** Server-owned admission identity, matched against the current loaded context. */
  identity: CapabilityCallIdentitySchema.optional(),
  /** Trusted caller identity, never taken from model text or tool input. */
  userId: InternalMemoryExtractRequestSchema.shape.userId,
  /** Trusted run context and attempt from the caller; absent on legacy bodies. */
  organizationRun: InternalAgentTurnOrganizationRunSchema.optional(),
});
export type InternalAgentTurnRequest = z.infer<typeof InternalAgentTurnRequestSchema>;

/** v1.27.0: `lead` answers a `prepare` turn, `note` an `exchange` turn; both come with an empty `reply`. */
export const InternalAgentTurnResponseSchema = InternalTurnResponseSchema.extend({ moveId: AgentTurnMoveIdSchema.optional(),
  lead: CapabilityLeadInstructionsSchema.optional(), note: CapabilityNoteSchema.optional(),
  /** Connection cards produced by the turn; absent on legacy responses. */
  connectionCards: z.array(ConnectionCardSchema).max(5).optional(),
  /** Outcome of an organization run; absent on legacy responses. */
  outcome: RunOutcomeSchema.optional(),
  /** True when the run was already admitted and this is the stored answer. */
  duplicate: z.literal(true).optional() });
export type InternalAgentTurnResponse = z.infer<typeof InternalAgentTurnResponseSchema>;

export const InternalAgentTurnErrorResponseSchema = InternalTurnErrorResponseSchema;
export type InternalAgentTurnErrorResponse = z.infer<typeof InternalAgentTurnErrorResponseSchema>;

/** Typed admission refusals of an organization run (`error` of a refused turn). */
export const ORGANIZATION_ADMISSION_REFUSAL_CODES = [
  'organization_context_missing',
  'organization_context_invalid',
  'organization_attempt_invalid',
  'run_correlation_mismatch',
  'issuer_not_authorized',
  'context_expired',
  'organization_binding_unavailable',
  'organization_binding_missing',
  'tenant_mismatch',
  'owner_mismatch',
  'agent_identity_mismatch',
  'agent_target_mismatch',
  'organization_admission_unavailable',
  'organization_tenant_unknown',
] as const;
export const OrganizationAdmissionRefusalCodeSchema = z.enum(ORGANIZATION_ADMISSION_REFUSAL_CODES);
export type OrganizationAdmissionRefusalCode = z.infer<typeof OrganizationAdmissionRefusalCodeSchema>;

/** `error` values of an organization run that was admitted but did not succeed. */
export const INTERNAL_AGENT_TURN_RUN_ERRORS = ['run_failed', 'run_cancelled', 'run_uncertain'] as const;
export const InternalAgentTurnRunErrorSchema = z.enum(INTERNAL_AGENT_TURN_RUN_ERRORS);
export type InternalAgentTurnRunError = z.infer<typeof InternalAgentTurnRunErrorSchema>;

/** Error body of an organization run: refusal message, failure code and outcome are all optional. */
export const InternalAgentTurnRunErrorResponseSchema = InternalAgentTurnErrorResponseSchema.extend({
  code: z.string().min(1).optional(),
  message: z.string().optional(),
  outcome: RunOutcomeSchema.optional(),
});
export type InternalAgentTurnRunErrorResponse = z.infer<typeof InternalAgentTurnRunErrorResponseSchema>;

/** Error code returned with 404 when the agent is not loaded in agent-core. */
export const INTERNAL_AGENT_TURN_UNKNOWN_AGENT = 'unknown_agent' as const;
/** Error code returned with 403 for a primary turn without a scoped admission. */
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
