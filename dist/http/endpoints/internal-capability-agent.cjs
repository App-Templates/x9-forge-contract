"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordinaryCapabilityLifecyclePutContract = exports.ordinaryCapabilityAgentConfigGetContract = exports.ordinaryCapabilityAgentConfigPutContract = exports.CapabilityOrdinaryConfigQuerySchema = exports.labAgentGrowthContract = exports.AgentGrowthResponseSchema = exports.labAgentSpendContract = exports.ricercaAgentSpendContract = exports.AgentSpendResponseSchema = exports.AgentSpendQuerySchema = exports.AGENT_SPEND_MAX_DAYS = exports.labAgentConfigGetContract = exports.labAgentConfigPutContract = exports.ricercaAgentConfigGetContract = exports.ricercaAgentConfigPutContract = exports.CapabilityAgentRouteErrorSchema = exports.AgentConfigStaleSchema = exports.AgentConfigSavedSchema = exports.capAgentGrowthPath = exports.capAgentSpendPath = exports.capAgentConfigPath = exports.CapabilityAgentParamsSchema = void 0;
exports.selectCapabilityAgentConfigFormat = selectCapabilityAgentConfigFormat;
exports.parseOrdinaryCapabilityAgentConfigGet = parseOrdinaryCapabilityAgentConfigGet;
exports.parseOrdinaryCapabilityAgentConfigPut = parseOrdinaryCapabilityAgentConfigPut;
exports.parseOrdinaryCapabilityLifecyclePut = parseOrdinaryCapabilityLifecyclePut;
const zod_1 = require("zod");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const spend_js_1 = require("../../capability/ricerca/spend.cjs");
const agent_config_js_2 = require("../../capability/lab/agent-config.cjs");
const competence_js_1 = require("../../capability/lab/competence.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const ordinary_configuration_js_1 = require("../../capability/ordinary-configuration.cjs");
const ordinary_lifecycle_js_1 = require("../../capability/ordinary-lifecycle.cjs");
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
var spend_js_2 = require("../../capability/ricerca/spend.cjs");
Object.defineProperty(exports, "AGENT_SPEND_MAX_DAYS", { enumerable: true, get: function () { return spend_js_2.AGENT_SPEND_MAX_DAYS; } });
/** GET /internal/capability/agents/:agentId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — days in the agent's time zone. */
exports.AgentSpendQuerySchema = zod_1.z.object({ from: spend_js_1.AgentDaySchema, to: spend_js_1.AgentDaySchema }).strict()
    .refine(q => q.from <= q.to, { message: 'from after to' })
    .refine(q => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 < spend_js_1.AGENT_SPEND_MAX_DAYS, { message: 'window too long' });
exports.AgentSpendResponseSchema = zod_1.z.object({
    days: zod_1.z.array(spend_js_1.AgentSpendDaySchema).max(spend_js_1.AGENT_SPEND_MAX_DAYS),
    /** Jobs of the agent waiting in the queue right now. */
    queuedNow: zod_1.z.number().int().nonnegative(),
}).strict();
exports.ricercaAgentSpendContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/spend',
    authType: 'secret',
    paramsSchema: exports.CapabilityAgentParamsSchema,
    querySchema: exports.AgentSpendQuerySchema,
    responseSchema: exports.AgentSpendResponseSchema,
};
/** cap-lab reports the same per-agent spend shape and path as cap-ricerca. */
exports.labAgentSpendContract = { ...exports.ricercaAgentSpendContract };
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
/** Explicit additive format selection on the existing routes; unknown formats never fall back to legacy. */
function selectCapabilityAgentConfigFormat(method, input) {
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
exports.CapabilityOrdinaryConfigQuerySchema = capability_call_context_js_1.CapabilityAgentScopeSchema.extend({ format: zod_1.z.literal('ordinary-v2'), capability: zod_1.z.string().trim().min(1).max(100) }).strict();
function parseOrdinaryCapabilityAgentConfigGet(query, params, authority) {
    const parsed = exports.CapabilityOrdinaryConfigQuerySchema.parse(query), path = exports.CapabilityAgentParamsSchema.parse(params);
    if (path.agentId !== parsed.agentId || !(0, capability_call_context_js_1.sameCapabilityScope)(parsed, authority.scope) || parsed.capability !== authority.capability)
        throw new Error('Ordinary GET target mismatch');
    return parsed;
}
function parseOrdinaryCapabilityAgentConfigPut(body, params, authority, currentVersion, masters = []) {
    const parsed = (0, ordinary_configuration_js_1.parseCapabilityOrdinaryWrite)(body, authority, currentVersion, masters), path = exports.CapabilityAgentParamsSchema.parse(params);
    if (path.agentId !== parsed.configuration.scope.agentId)
        throw new Error('Ordinary PUT path mismatch');
    return parsed;
}
function parseOrdinaryCapabilityLifecyclePut(body, params, authority) {
    const parsed = (0, ordinary_lifecycle_js_1.parseCapabilityOrdinaryLifecycle)(body, authority), path = exports.CapabilityAgentParamsSchema.parse(params);
    if (path.agentId !== parsed.request.scope.agentId)
        throw new Error('Lifecycle PUT path mismatch');
    return parsed;
}
exports.ordinaryCapabilityAgentConfigPutContract = { ...exports.ricercaAgentConfigPutContract, bodySchema: ordinary_configuration_js_1.CapabilityOrdinaryConfigWriteSchema, responseSchema: ordinary_configuration_js_1.CapabilityOrdinaryConfigStateSchema };
exports.ordinaryCapabilityAgentConfigGetContract = { ...exports.ricercaAgentConfigGetContract, querySchema: exports.CapabilityOrdinaryConfigQuerySchema, responseSchema: ordinary_configuration_js_1.CapabilityOrdinaryConfigStateSchema };
exports.ordinaryCapabilityLifecyclePutContract = { ...exports.ricercaAgentConfigPutContract, bodySchema: ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleRequestSchema, responseSchema: ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleReceiptSchema };
//# sourceMappingURL=internal-capability-agent.js.map