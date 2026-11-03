import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema, ResearchAgentConfigSchema } from "../../capability/ricerca/agent-config.js";
import { AGENT_SPEND_MAX_DAYS, AgentDaySchema, AgentSpendDaySchema } from "../../capability/ricerca/spend.js";
import { LabAgentConfigSchema } from "../../capability/lab/agent-config.js";
import { CompetenceGapSchema, CompetenceNodeViewSchema } from "../../capability/lab/competence.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { CapabilityOrdinaryConfigWriteSchema, CapabilityOrdinaryConfigStateSchema, parseCapabilityOrdinaryWrite } from "../../capability/ordinary-configuration.js";
import { CapabilityOrdinaryLifecycleRequestSchema, CapabilityOrdinaryLifecycleReceiptSchema, parseCapabilityOrdinaryLifecycle } from "../../capability/ordinary-lifecycle.js";
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
    error: z.enum(['invalid_request', 'agent_mismatch', 'not_configured', 'invalid_config', 'unknown_model_rate', 'budget_below_minimum']),
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
export { AGENT_SPEND_MAX_DAYS } from "../../capability/ricerca/spend.js";
/** GET /internal/capability/agents/:agentId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — days in the agent's time zone. */
export const AgentSpendQuerySchema = z.object({ from: AgentDaySchema, to: AgentDaySchema,
    tenantId: CapabilityAgentScopeSchema.shape.tenantId.optional(), ownerId: CapabilityAgentScopeSchema.shape.ownerId.optional(),
}).strict()
    .refine(q => (q.tenantId === undefined) === (q.ownerId === undefined), { message: 'Incomplete managed spend scope' })
    .refine(q => q.from <= q.to, { message: 'from after to' })
    .refine(q => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 < AGENT_SPEND_MAX_DAYS, { message: 'window too long' });
export const AgentSpendResponseSchema = z.object({
    days: z.array(AgentSpendDaySchema).max(AGENT_SPEND_MAX_DAYS),
    /** Jobs of the agent waiting in the queue right now. */
    queuedNow: z.number().int().nonnegative(),
}).strict();
export const ricercaAgentSpendContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/spend',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    querySchema: AgentSpendQuerySchema,
    responseSchema: AgentSpendResponseSchema,
};
/** cap-lab reports the same per-agent spend shape and path as cap-ricerca. */
export const labAgentSpendContract = { ...ricercaAgentSpendContract };
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
/** Explicit additive format selection on the existing routes; unknown formats never fall back to legacy. */
export function selectCapabilityAgentConfigFormat(method, input) {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        throw new Error('Invalid configuration envelope');
    const data = input;
    if (Object.hasOwn(data, 'format')) {
        if (method === 'GET' && data.format === 'ordinary-v2')
            return 'ordinary-v2';
        if (method === 'PUT' && data.format === 'ordinary-lifecycle-v1')
            return 'ordinary-lifecycle-v1';
        throw new Error('Unsupported configuration format');
    }
    if (method === 'PUT' && Object.hasOwn(data, 'configuration')) {
        const config = data.configuration;
        if (config && typeof config === 'object' && !Array.isArray(config) && config.format === 'ordinary-v2')
            return 'ordinary-v2';
        throw new Error('Unsupported configuration format');
    }
    return 'legacy';
}
export const CapabilityOrdinaryConfigQuerySchema = CapabilityAgentScopeSchema.extend({ format: z.literal('ordinary-v2'), capability: z.string().trim().min(1).max(100) }).strict();
export function parseOrdinaryCapabilityAgentConfigGet(query, params, authority) {
    const parsed = CapabilityOrdinaryConfigQuerySchema.parse(query), path = CapabilityAgentParamsSchema.parse(params);
    if (path.agentId !== parsed.agentId || !sameCapabilityScope(parsed, authority.scope) || parsed.capability !== authority.capability)
        throw new Error('Ordinary GET target mismatch');
    return parsed;
}
export function parseOrdinaryCapabilityAgentConfigPut(body, params, authority, currentVersion, masters = []) {
    const parsed = parseCapabilityOrdinaryWrite(body, authority, currentVersion, masters), path = CapabilityAgentParamsSchema.parse(params);
    if (path.agentId !== parsed.configuration.scope.agentId)
        throw new Error('Ordinary PUT path mismatch');
    return parsed;
}
export function parseOrdinaryCapabilityLifecyclePut(body, params, authority) {
    const parsed = parseCapabilityOrdinaryLifecycle(body, authority), path = CapabilityAgentParamsSchema.parse(params);
    if (path.agentId !== parsed.request.scope.agentId)
        throw new Error('Lifecycle PUT path mismatch');
    return parsed;
}
export const ordinaryCapabilityAgentConfigPutContract = { ...ricercaAgentConfigPutContract, bodySchema: CapabilityOrdinaryConfigWriteSchema, responseSchema: CapabilityOrdinaryConfigStateSchema };
export const ordinaryCapabilityAgentConfigGetContract = { ...ricercaAgentConfigGetContract, querySchema: CapabilityOrdinaryConfigQuerySchema, responseSchema: CapabilityOrdinaryConfigStateSchema };
export const ordinaryCapabilityLifecyclePutContract = { ...ricercaAgentConfigPutContract, bodySchema: CapabilityOrdinaryLifecycleRequestSchema, responseSchema: CapabilityOrdinaryLifecycleReceiptSchema };
//# sourceMappingURL=internal-capability-agent.js.map