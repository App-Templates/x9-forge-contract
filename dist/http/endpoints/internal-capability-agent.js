import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema, ResearchAgentConfigSchema } from "../../capability/ricerca/agent-config.js";
import { AgentDaySchema, AgentSpendDaySchema } from "../../capability/ricerca/spend.js";
import { LabAgentConfigSchema } from "../../capability/lab/agent-config.js";
import { CompetenceGapSchema, CompetenceNodeViewSchema } from "../../capability/lab/competence.js";
/**
 * A capability's routes for ONE agent it serves (v1.28.0, Phase 54).
 * Direction: Forge (agent management) or an ops script -> the capability (cap-ricerca, cap-lab, …).
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), as `POST /call/:tool`.
 *
 * Every capability keeps the configuration of each agent it is attached to, keyed by `agentId`; the capability
 * identity is conveyed by the caller's `baseUrl`, not by the path. A configuration only moves forward: a `PUT` whose
 * `version` is not above the stored one is refused with 409 {@link AgentConfigStaleSchema}, never applied silently.
 * Errors: 400 {@link CapabilityAgentRouteErrorSchema} (`invalid_request`, `agent_mismatch`), 401 missing/wrong secret,
 * 404 `not_configured`, 409 stale version, 422 `invalid_config` / `unknown_model_rate`.
 *
 * Consumers (planned): agent-x9 services/cap-ricerca, services/cap-lab (servers); forge-v2 agent management (client).
 */
export const CapabilityAgentParamsSchema = z.object({ agentId: CapabilityAgentIdSchema });
function agentPath(agentId, tail) {
    return `/internal/capability/agents/${CapabilityAgentParamsSchema.parse({ agentId }).agentId}/${tail}`;
}
/** Build the concrete paths for an agent id (validated). */
export const capAgentConfigPath = (agentId) => agentPath(agentId, 'config');
export const capAgentSpendPath = (agentId) => agentPath(agentId, 'spend');
export const capAgentGrowthPath = (agentId) => agentPath(agentId, 'growth');
export const AgentConfigSavedSchema = z.object({ ok: z.literal(true), version: AgentConfigVersionSchema }).strict();
export const AgentConfigStaleSchema = z.object({
    ok: z.literal(false),
    error: z.literal('stale_version'),
    currentVersion: AgentConfigVersionSchema,
}).strict();
export const CapabilityAgentRouteErrorSchema = z.object({
    ok: z.literal(false),
    error: z.enum(['invalid_request', 'agent_mismatch', 'not_configured', 'invalid_config', 'unknown_model_rate']),
}).strict();
/** cap-ricerca's configuration of an agent: budget, models, research parameters, source rule. */
export const ricercaAgentConfigPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: ResearchAgentConfigSchema,
    responseSchema: AgentConfigSavedSchema,
};
export const ricercaAgentConfigGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    responseSchema: ResearchAgentConfigSchema,
};
/** cap-lab's configuration of an agent: the wiki's domain, conventions, kinds of pages and links. */
export const labAgentConfigPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: LabAgentConfigSchema,
    responseSchema: AgentConfigSavedSchema,
};
export const labAgentConfigGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    responseSchema: LabAgentConfigSchema,
};
/** Longest window of one spend request, days (inclusive). */
export const AGENT_SPEND_MAX_DAYS = 400;
/** GET /internal/capability/agents/:agentId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — days in the agent's time zone. */
export const AgentSpendQuerySchema = z.object({ from: AgentDaySchema, to: AgentDaySchema }).strict()
    .refine(q => q.from <= q.to, { message: 'from after to' })
    .refine(q => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 < AGENT_SPEND_MAX_DAYS, { message: 'window too long' });
export const AgentSpendResponseSchema = z.object({ days: z.array(AgentSpendDaySchema).max(AGENT_SPEND_MAX_DAYS) }).strict();
export const ricercaAgentSpendContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/spend',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    querySchema: AgentSpendQuerySchema,
    responseSchema: AgentSpendResponseSchema,
};
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
    method: 'GET',
    path: '/internal/capability/agents/:agentId/growth',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    responseSchema: AgentGrowthResponseSchema,
};
//# sourceMappingURL=internal-capability-agent.js.map