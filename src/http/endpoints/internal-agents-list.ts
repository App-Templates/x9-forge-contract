import { z } from 'zod';
import { AgentInventoryCapabilitiesSchema, agentCapabilitiesOf } from '../../agent/agent-inventory-metadata.js';
import type { AgentInventoryCapability } from '../../agent/agent-inventory-metadata.js';
import { AgentWorkspaceAttestationSchema } from '../../agent/agent-workspace-attestation.js';
import { AgentRuntimeIdentitySchema, AgentRuntimeIdentitiesSchema } from '../../agent/agent-runtime-identity.js';
import { AgentRuntimeSnapshotSchema } from '../../agent/agent-runtime-state.js';
import type { AgentRuntimeState } from '../../agent/agent-runtime-state.js';
import { AgentRuntimeSourceSchema } from '../../agent/agent-runtime-source.js';

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
 *
 * Phase 22 (additive, MINOR): per-agent runtime status. agent-core enriches each
 * entry with `runtimeStatus` (+ `loaded`/`errorKind`/`lastError`) read live from
 * its AgentManager + BotSupervisor, so the Forge admin panel reflects the REAL
 * runtime state instead of the stale stored `agents.status`. All new fields are
 * `.optional()` — an OLD agent-core (pre-deploy) response without them still
 * validates, and a NEW Forge reading an old agent-core treats them as absent.
 *
 * Two status vocabularies (intentional, D2/D3):
 *   - `RuntimeAgentStatusSchema` — the 5 REAL wire states agent-core emits.
 *     agent-core imports THIS; it can never emit `unknown`.
 *   - `ForgeRuntimeStatusSchema` — the 5 states + `unknown`. Forge-side overlay
 *     value produced when agent-core is unreachable (never falls back to the
 *     stale stored value). Forge imports THIS.
 */

/**
 * The 5 real per-agent runtime states agent-core emits on the wire.
 * `bot-less` = agent loaded for internal-turn/proactive but with no Telegram bot
 * (empty token). Mirrors agent-core BotState + the bot-less discriminator.
 */
export const RuntimeAgentStatusSchema = z.enum([
  'running',
  'degraded',
  'starting',
  'stopped',
  'bot-less',
]);
export type RuntimeAgentStatus = z.infer<typeof RuntimeAgentStatusSchema>;

/**
 * Forge-side overlay union: the 5 wire states plus `unknown`. `unknown` is
 * produced by the Forge consumer when agent-core is unreachable — it is NEVER
 * emitted by agent-core and is NOT part of the wire enum above.
 */
export const ForgeRuntimeStatusSchema = z.enum([
  'running',
  'degraded',
  'starting',
  'stopped',
  'bot-less',
  'unknown',
]);
export type ForgeRuntimeStatus = z.infer<typeof ForgeRuntimeStatusSchema>;

/**
 * Why a `degraded` bot is in error — mirrors agent-core BotErrorKind. Nullable:
 * a healthy/non-degraded agent carries `null`.
 */
export const RuntimeErrorKindSchema = z
  .enum(['auth', 'poll-death', 'transient'])
  .nullable();
export type RuntimeErrorKind = z.infer<typeof RuntimeErrorKindSchema>;

export const ListAgentsAgentSchema = z.object({
  agentId: z.string().min(1),
  displayName: z.string(),
  ownerId: z.string(),
  // Phase 22 — additive-optional runtime status (agent-core enriched).
  runtimeStatus: RuntimeAgentStatusSchema.optional(),
  loaded: z.boolean().optional(),
  errorKind: RuntimeErrorKindSchema.optional(),
  lastError: z.string().nullable().optional(),
  // Canonical metadata is additive; legacy bot status is never channel evidence.
  identity: AgentRuntimeIdentitySchema.optional(),
  runtime: AgentRuntimeSnapshotSchema.optional(),
  /** Effective snapshot only; absent is legacy, null is not attested, never desired-file fallback. */
  workspace: AgentWorkspaceAttestationSchema.nullable().optional(),
  /** Registry metadata actually observed by X9 for this agent; null is unknown, [] is known empty. */
  capabilities: AgentInventoryCapabilitiesSchema.nullable().optional(),
}).superRefine((agent, ctx) => {
  if (agent.identity && agent.agentId !== agent.identity.runtimeAgentId) {
    ctx.addIssue({ code: 'custom', path: ['identity', 'runtimeAgentId'], message: 'Runtime identity must match the list row agentId' });
  }
});
export type ListAgentsAgent = z.infer<typeof ListAgentsAgentSchema>;

export const ListAgentsResponseSchema = z.object({
  agents: z.array(ListAgentsAgentSchema),
  source: AgentRuntimeSourceSchema.optional(),
}).superRefine((response, ctx) => {
  // A legacy runtime ID occupies one name for collision detection only.
  // This does not supply a missing management identity to consumers.
  const identities = response.agents.map((agent) => agent.identity ?? {
    managementAgentId: agent.agentId, runtimeAgentId: agent.agentId,
  });
  const result = AgentRuntimeIdentitiesSchema.safeParse(identities);
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({ ...issue, path: ['agents', ...issue.path] });
    }
  }
});
export type ListAgentsResponse = z.infer<typeof ListAgentsResponseSchema>;

/**
 * Resolve an exact declared management/runtime ID using current X9 evidence.
 * Missing rows, legacy bot status and unavailable sources remain unknown.
 * Invalid or ambiguous payloads throw rather than select an arbitrary agent.
 */
export function getListAgentsRuntimeState(input: unknown, agentId: string): AgentRuntimeState {
  const response = ListAgentsResponseSchema.parse(input);
  if (response.source?.availability !== 'available') return 'unknown';
  const agent = response.agents.find((candidate) => candidate.agentId === agentId
    || candidate.identity?.managementAgentId === agentId);
  return agent?.runtime?.state ?? 'unknown';
}

/**
 * Select an exact agent's registry observation from a validated available X9 source.
 * Missing, invalid or unavailable observations remain unknown. Freshness is a consumer
 * policy using source.observedAt; this helper does not invent a maximum age or readiness.
 */
export function getListAgentsCapabilities(input: unknown, agentId: string): AgentInventoryCapability[] | null {
  const response = ListAgentsResponseSchema.safeParse(input);
  if (!response.success || response.data.source?.availability !== 'available') return null;
  const agent = response.data.agents.find((candidate) => candidate.agentId === agentId
    || candidate.identity?.managementAgentId === agentId);
  return agentCapabilitiesOf(agent);
}

export const listAgentsContract = {
  method: 'GET' as const,
  path: '/internal/agents' as const,
  authType: 'secret' as const,
  responseSchema: ListAgentsResponseSchema,
} as const;
