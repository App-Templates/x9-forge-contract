import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema, ResearchAgentConfigSchema } from '../../capability/ricerca/agent-config.js';
import { AGENT_SPEND_MAX_DAYS, AgentDaySchema, AgentSpendDaySchema } from '../../capability/ricerca/spend.js';
import { LabAgentConfigSchema } from '../../capability/lab/agent-config.js';
import { CompetenceGapSchema, CompetenceNodeViewSchema } from '../../capability/lab/competence.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../../capability/capability-call-context.js';
import { CapabilityOrdinaryConfigWriteSchema, CapabilityOrdinaryConfigStateSchema, parseCapabilityOrdinaryWrite, type CapabilityOrdinaryTarget, type CapabilityOrdinaryConfiguration } from '../../capability/ordinary-configuration.js';
import { CapabilityOrdinaryLifecycleRequestSchema, CapabilityOrdinaryLifecycleReceiptSchema, parseCapabilityOrdinaryLifecycle, type CapabilityOrdinaryLifecycleAuthority } from '../../capability/ordinary-lifecycle.js';

/**
 * A capability's routes for ONE agent it serves (v1.28.0, Phase 54).
 * Direction: Forge (agent management) or an ops script -> the capability (cap-ricerca, cap-lab, …).
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), as `POST /call/:tool`.
 *
 * Every capability keeps the configuration of each agent it is attached to, keyed by `agentId`; the capability
 * identity is conveyed by the caller's `baseUrl`, not by the path. A configuration only moves forward: a `PUT` whose
 * `version` is not above the stored one is refused with 409 {@link AgentConfigStaleSchema}, never applied silently.
 * Errors: 400 {@link CapabilityAgentRouteErrorSchema} (`invalid_request`, `agent_mismatch`), 401 missing/wrong secret,
 * 404 `not_configured`, 409 stale version, 422 `invalid_config` / `unknown_model_rate` / `budget_below_minimum` (a budget
 * too small for even one research in the worst case: refused instead of stopping every research).
 *
 * Consumers (planned): agent-x9 services/cap-ricerca, services/cap-lab (servers); forge-v2 agent management (client).
 */

export const CapabilityAgentParamsSchema = z.object({ agentId: CapabilityAgentIdSchema });

function agentPath(agentId: string, tail: 'config' | 'spend' | 'growth'): string {
  return `/internal/capability/agents/${CapabilityAgentParamsSchema.parse({ agentId }).agentId}/${tail}`;
}
/** Build the concrete paths for an agent id (validated). */
export const capAgentConfigPath = (agentId: string) => agentPath(agentId, 'config');
export const capAgentSpendPath = (agentId: string) => agentPath(agentId, 'spend');
export const capAgentGrowthPath = (agentId: string) => agentPath(agentId, 'growth');

export const AgentConfigSavedSchema = z.object({ ok: z.literal(true), version: AgentConfigVersionSchema }).strict();
export const AgentConfigStaleSchema = z.object({
  ok: z.literal(false),
  error: z.literal('stale_version'),
  currentVersion: AgentConfigVersionSchema,
}).strict();
export const CapabilityAgentRouteErrorSchema = z.object({
  ok: z.literal(false),
  error: z.enum(['invalid_request', 'agent_mismatch', 'not_configured', 'invalid_config', 'unknown_model_rate', 'budget_below_minimum']),
}).strict();
export type CapabilityAgentRouteError = z.infer<typeof CapabilityAgentRouteErrorSchema>;

/** cap-ricerca's configuration of an agent: budget, models, research parameters, source rule. */
export const ricercaAgentConfigPutContract = {
  method: 'PUT' as const,
  path: '/internal/capability/agents/:agentId/config' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: ResearchAgentConfigSchema,
  responseSchema: AgentConfigSavedSchema,
} as const;
export const ricercaAgentConfigGetContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/config' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  responseSchema: ResearchAgentConfigSchema,
} as const;

/** cap-lab's configuration of an agent: the wiki's domain, conventions, kinds of pages and links. */
export const labAgentConfigPutContract = {
  method: 'PUT' as const,
  path: '/internal/capability/agents/:agentId/config' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: LabAgentConfigSchema,
  responseSchema: AgentConfigSavedSchema,
} as const;
export const labAgentConfigGetContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/config' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  responseSchema: LabAgentConfigSchema,
} as const;

export { AGENT_SPEND_MAX_DAYS } from '../../capability/ricerca/spend.js';

/** GET /internal/capability/agents/:agentId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — days in the agent's time zone. */
export const AgentSpendQuerySchema = z.object({ from: AgentDaySchema, to: AgentDaySchema }).strict()
  .refine(q => q.from <= q.to, { message: 'from after to' })
  .refine(q => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 < AGENT_SPEND_MAX_DAYS, { message: 'window too long' });
export const AgentSpendResponseSchema = z.object({
  days: z.array(AgentSpendDaySchema).max(AGENT_SPEND_MAX_DAYS),
  /** Jobs of the agent waiting in the queue right now. */
  queuedNow: z.number().int().nonnegative(),
}).strict();
export const ricercaAgentSpendContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/spend' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  querySchema: AgentSpendQuerySchema,
  responseSchema: AgentSpendResponseSchema,
} as const;

/** cap-lab reports the same per-agent spend shape and path as cap-ricerca. */
export const labAgentSpendContract = { ...ricercaAgentSpendContract } as const;

/** GET /internal/capability/agents/:agentId/growth — cap-lab: the graph, the open gaps and the wiki's size. */
export const AgentGrowthResponseSchema = z.object({
  agentId: CapabilityAgentIdSchema,
  nodes: z.array(CompetenceNodeViewSchema).max(5000),
  gaps: z.array(CompetenceGapSchema).max(200),
  wiki: z.object({
    pages: z.number().int().nonnegative(),
    claims: z.number().int().nonnegative(),
    /** Claims resting on at least two sources (reliability). */
    claimsMultiSource: z.number().int().nonnegative(),
    contradictions: z.number().int().nonnegative(),
    sources: z.number().int().nonnegative(),
  }).strict(),
}).strict();
export const labAgentGrowthContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/growth' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  responseSchema: AgentGrowthResponseSchema,
} as const;

export type AgentConfigSaved = z.infer<typeof AgentConfigSavedSchema>;
export type AgentConfigStale = z.infer<typeof AgentConfigStaleSchema>;
export type AgentSpendQuery = z.infer<typeof AgentSpendQuerySchema>;
export type AgentSpendResponse = z.infer<typeof AgentSpendResponseSchema>;
export type AgentGrowthResponse = z.infer<typeof AgentGrowthResponseSchema>;

/** Explicit additive format selection on the existing routes; unknown formats never fall back to legacy. */
export function selectCapabilityAgentConfigFormat(method: 'GET' | 'PUT', input: unknown): 'legacy' | 'ordinary-v2' | 'ordinary-lifecycle-v1' {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid configuration envelope');
  const data = input as Record<string, unknown>;
  if (Object.hasOwn(data, 'format')) {
    if (method === 'GET' && data.format === 'ordinary-v2') return 'ordinary-v2';
    if (method === 'PUT' && data.format === 'ordinary-lifecycle-v1') return 'ordinary-lifecycle-v1';
    throw new Error('Unsupported configuration format');
  }
  if (method === 'PUT' && Object.hasOwn(data, 'configuration')) {
    const config = data.configuration;
    if (config && typeof config === 'object' && !Array.isArray(config) && (config as Record<string, unknown>).format === 'ordinary-v2') return 'ordinary-v2';
    throw new Error('Unsupported configuration format');
  }
  return 'legacy';
}
export const CapabilityOrdinaryConfigQuerySchema = CapabilityAgentScopeSchema.extend({ format: z.literal('ordinary-v2'), capability: z.string().trim().min(1).max(100) }).strict();
export function parseOrdinaryCapabilityAgentConfigGet(query: unknown, params: unknown, authority: Pick<CapabilityOrdinaryTarget, 'scope' | 'capability'>): z.infer<typeof CapabilityOrdinaryConfigQuerySchema> {
  const parsed = CapabilityOrdinaryConfigQuerySchema.parse(query), path = CapabilityAgentParamsSchema.parse(params);
  if (path.agentId !== parsed.agentId || !sameCapabilityScope(parsed, authority.scope) || parsed.capability !== authority.capability) throw new Error('Ordinary GET target mismatch');
  return parsed;
}
export function parseOrdinaryCapabilityAgentConfigPut(body: unknown, params: unknown, authority: CapabilityOrdinaryTarget, currentVersion: number | null, masters: readonly CapabilityOrdinaryConfiguration[] = []): z.infer<typeof CapabilityOrdinaryConfigWriteSchema> {
  const parsed = parseCapabilityOrdinaryWrite(body, authority, currentVersion, masters), path = CapabilityAgentParamsSchema.parse(params);
  if (path.agentId !== parsed.configuration.scope.agentId) throw new Error('Ordinary PUT path mismatch');
  return parsed;
}
export function parseOrdinaryCapabilityLifecyclePut(body: unknown, params: unknown, authority: CapabilityOrdinaryLifecycleAuthority): ReturnType<typeof parseCapabilityOrdinaryLifecycle> {
  const parsed = parseCapabilityOrdinaryLifecycle(body, authority), path = CapabilityAgentParamsSchema.parse(params);
  if (path.agentId !== parsed.request.scope.agentId) throw new Error('Lifecycle PUT path mismatch');
  return parsed;
}
export const ordinaryCapabilityAgentConfigPutContract = { ...ricercaAgentConfigPutContract, bodySchema: CapabilityOrdinaryConfigWriteSchema, responseSchema: CapabilityOrdinaryConfigStateSchema } as const;
export const ordinaryCapabilityAgentConfigGetContract = { ...ricercaAgentConfigGetContract, querySchema: CapabilityOrdinaryConfigQuerySchema, responseSchema: CapabilityOrdinaryConfigStateSchema } as const;
export const ordinaryCapabilityLifecyclePutContract = { ...ricercaAgentConfigPutContract, bodySchema: CapabilityOrdinaryLifecycleRequestSchema, responseSchema: CapabilityOrdinaryLifecycleReceiptSchema } as const;
