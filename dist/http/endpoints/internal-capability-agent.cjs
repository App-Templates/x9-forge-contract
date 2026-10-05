"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labAgentGrowthContract = exports.AgentGrowthResponseSchema = exports.ricercaAgentSpendContract = exports.AgentSpendResponseSchema = exports.AgentSpendQuerySchema = exports.AGENT_SPEND_MAX_DAYS = exports.labAgentConfigGetContract = exports.labAgentConfigPutContract = exports.ricercaAgentConfigGetContract = exports.ricercaAgentConfigPutContract = exports.CapabilityAgentRouteErrorSchema = exports.AgentConfigStaleSchema = exports.AgentConfigSavedSchema = exports.capAgentGrowthPath = exports.capAgentSpendPath = exports.capAgentConfigPath = exports.CapabilityAgentParamsSchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const spend_js_1 = require("../../capability/ricerca/spend.cjs");
const agent_config_js_2 = require("../../capability/lab/agent-config.cjs");
const competence_js_1 = require("../../capability/lab/competence.cjs");
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
exports.CapabilityAgentParamsSchema = zod_1.z.object({ agentId: agent_config_js_1.CapabilityAgentIdSchema });
function agentPath(agentId, tail) {
    return `/internal/capability/agents/${exports.CapabilityAgentParamsSchema.parse({ agentId }).agentId}/${tail}`;
}
/** Build the concrete paths for an agent id (validated). */
const capAgentConfigPath = (agentId) => agentPath(agentId, 'config');
exports.capAgentConfigPath = capAgentConfigPath;
const capAgentSpendPath = (agentId) => agentPath(agentId, 'spend');
exports.capAgentSpendPath = capAgentSpendPath;
const capAgentGrowthPath = (agentId) => agentPath(agentId, 'growth');
exports.capAgentGrowthPath = capAgentGrowthPath;
exports.AgentConfigSavedSchema = zod_1.z.object({ ok: zod_1.z.literal(true), version: agent_config_js_1.AgentConfigVersionSchema }).strict();
exports.AgentConfigStaleSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.literal('stale_version'),
    currentVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
exports.CapabilityAgentRouteErrorSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.enum(['invalid_request', 'agent_mismatch', 'not_configured', 'invalid_config', 'unknown_model_rate', 'budget_below_minimum']),
}).strict();
/** cap-ricerca's configuration of an agent: budget, models, research parameters, source rule. */
exports.ricercaAgentConfigPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    bodySchema: agent_config_js_1.ResearchAgentConfigSchema,
    responseSchema: exports.AgentConfigSavedSchema,
};
exports.ricercaAgentConfigGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    responseSchema: agent_config_js_1.ResearchAgentConfigSchema,
};
/** cap-lab's configuration of an agent: the wiki's domain, conventions, kinds of pages and links. */
exports.labAgentConfigPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    bodySchema: agent_config_js_2.LabAgentConfigSchema,
    responseSchema: exports.AgentConfigSavedSchema,
};
exports.labAgentConfigGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/config',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    responseSchema: agent_config_js_2.LabAgentConfigSchema,
};
/** Longest window of one spend request, days (inclusive). */
exports.AGENT_SPEND_MAX_DAYS = 400;
/** GET /internal/capability/agents/:agentId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — days in the agent's time zone. */
exports.AgentSpendQuerySchema = zod_1.z.object({ from: spend_js_1.AgentDaySchema, to: spend_js_1.AgentDaySchema }).strict()
    .refine(q => q.from <= q.to, { message: 'from after to' })
    .refine(q => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 < exports.AGENT_SPEND_MAX_DAYS, { message: 'window too long' });
exports.AgentSpendResponseSchema = zod_1.z.object({ days: zod_1.z.array(spend_js_1.AgentSpendDaySchema).max(exports.AGENT_SPEND_MAX_DAYS) }).strict();
exports.ricercaAgentSpendContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/spend',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    querySchema: exports.AgentSpendQuerySchema,
    responseSchema: exports.AgentSpendResponseSchema,
};
/** GET /internal/capability/agents/:agentId/growth — cap-lab: the graph, the open gaps and the wiki's size. */
exports.AgentGrowthResponseSchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    nodes: zod_1.z.array(competence_js_1.CompetenceNodeViewSchema).max(5000),
    gaps: zod_1.z.array(competence_js_1.CompetenceGapSchema).max(200),
    wiki: zod_1.z.object({
        pages: zod_1.z.number().int().nonnegative(),
        claims: zod_1.z.number().int().nonnegative(),
        /** Claims resting on at least two sources (reliability). */
        claimsMultiSource: zod_1.z.number().int().nonnegative(),
        contradictions: zod_1.z.number().int().nonnegative(),
        sources: zod_1.z.number().int().nonnegative(),
    }).strict(),
}).strict();
exports.labAgentGrowthContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/growth',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    responseSchema: exports.AgentGrowthResponseSchema,
};
//# sourceMappingURL=internal-capability-agent.js.map