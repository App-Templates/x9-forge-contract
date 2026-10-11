"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsBriefingSettingsPostContract = exports.newsBriefingSettingsGetContract = exports.capNewsBriefingSettingsPath = exports.newsBriefingPropagationContract = exports.capNewsBriefingPropagationPath = exports.NewsBriefingPropagationRequestSchema = exports.NewsBriefingCommandResultSchema = exports.NewsBriefingPropagationSchema = exports.NewsBriefingQuerySchema = void 0;
exports.parseNewsBriefingCommand = parseNewsBriefingCommand;
const zod_1 = require("zod");
const agent_runtime_identity_js_1 = require("../../agent/agent-runtime-identity.cjs");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const news_briefing_js_1 = require("../../capability/configuration/news-briefing.cjs");
const agent_model_management_values_js_1 = require("../../agent/agent-model-management-values.cjs");
exports.NewsBriefingQuerySchema = capability_call_context_js_1.CapabilityAgentScopeSchema.omit({ agentId: true }).extend({ family: news_briefing_js_1.NewsBriefingFamilySchema }).strict();
/** Derived from canonical producer journals; failures remain visible on an idempotent Save retry. */
exports.NewsBriefingPropagationSchema = zod_1.z.object({
    sourceVersion: agent_config_js_1.AgentConfigVersionSchema,
    status: zod_1.z.enum(['complete', 'pending', 'superseded', 'not-applicable']),
    targets: zod_1.z.array(zod_1.z.object({
        scope: capability_call_context_js_1.CapabilityAgentScopeSchema, identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
        outcome: zod_1.z.enum(['updated', 'pending', 'failed', 'superseded']),
        version: agent_config_js_1.AgentConfigVersionSchema.optional(),
    }).strict().refine(value => value.identity.runtimeAgentId === value.scope.agentId, 'Follower identity mismatch')).max(1000),
}).strict().superRefine((value, ctx) => {
    if (new Set(value.targets.map(target => JSON.stringify(target.scope))).size !== value.targets.length)
        ctx.addIssue({ code: 'custom', path: ['targets'], message: 'Duplicate follower' });
    if (value.status === 'complete' && value.targets.some(target => target.outcome !== 'updated'))
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'Incomplete propagation cannot be complete' });
    if (value.status === 'not-applicable' && value.targets.length)
        ctx.addIssue({ code: 'custom', path: ['targets'], message: 'Unexpected propagation targets' });
});
exports.NewsBriefingCommandResultSchema = zod_1.z.object({
    requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    replayed: zod_1.z.boolean(),
    state: news_briefing_js_1.NewsBriefingStateSchema,
    propagation: exports.NewsBriefingPropagationSchema.optional(),
}).strict().superRefine((value, ctx) => {
    if (value.propagation && (value.propagation.sourceVersion !== value.state.version || value.propagation.targets.some(target => target.scope.tenantId !== value.state.scope.tenantId || target.scope.ownerId !== value.state.scope.ownerId || target.scope.agentId === value.state.scope.agentId)))
        ctx.addIssue({ code: 'custom', path: ['propagation'], message: 'Propagation source or follower mismatch' });
});
exports.NewsBriefingPropagationRequestSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema, family: news_briefing_js_1.NewsBriefingFamilySchema,
    requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema, version: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
const capNewsBriefingPropagationPath = (agentId) => `${(0, exports.capNewsBriefingSettingsPath)(agentId)}/propagation`;
exports.capNewsBriefingPropagationPath = capNewsBriefingPropagationPath;
exports.newsBriefingPropagationContract = {
    method: 'POST', path: '/internal/capability/agents/:agentId/settings/propagation',
    authType: 'secret', paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: exports.NewsBriefingPropagationRequestSchema, responseSchema: exports.NewsBriefingPropagationSchema,
};
const capNewsBriefingSettingsPath = (agentId) => `/internal/capability/agents/${internal_capability_agent_js_1.CapabilityAgentParamsSchema.parse({ agentId }).agentId}/settings`;
exports.capNewsBriefingSettingsPath = capNewsBriefingSettingsPath;
exports.newsBriefingSettingsGetContract = {
    method: 'GET', path: '/internal/capability/agents/:agentId/settings',
    authType: 'secret', paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.NewsBriefingQuerySchema, responseSchema: news_briefing_js_1.NewsBriefingStateSchema,
};
exports.newsBriefingSettingsPostContract = {
    method: 'POST', path: exports.newsBriefingSettingsGetContract.path,
    authType: 'secret', paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: news_briefing_js_1.NewsBriefingCommandSchema, responseSchema: exports.NewsBriefingCommandResultSchema,
};
/** Resolve identity and scope on the server; check durable request replay before calling this CAS validator. */
function parseNewsBriefingCommand(input, authority) {
    const command = news_briefing_js_1.NewsBriefingCommandSchema.parse(input);
    capability_call_context_js_1.CapabilityAgentScopeSchema.parse(authority.scope);
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(command.scope, authority.scope) || command.family !== authority.family) {
        throw new Error('News/Briefing command target mismatch');
    }
    if (command.expectedVersion !== authority.currentVersion)
        throw new Error('News/Briefing CAS conflict');
    return command;
}
//# sourceMappingURL=internal-capability-news-briefing.js.map