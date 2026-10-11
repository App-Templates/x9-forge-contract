"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsBriefingSettingsPostContract = exports.newsBriefingSettingsGetContract = exports.capNewsBriefingSettingsPath = exports.NewsBriefingCommandResultSchema = exports.NewsBriefingQuerySchema = void 0;
exports.parseNewsBriefingCommand = parseNewsBriefingCommand;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const news_briefing_js_1 = require("../../capability/configuration/news-briefing.cjs");
const agent_model_management_values_js_1 = require("../../agent/agent-model-management-values.cjs");
exports.NewsBriefingQuerySchema = capability_call_context_js_1.CapabilityAgentScopeSchema.omit({ agentId: true }).extend({ family: news_briefing_js_1.NewsBriefingFamilySchema }).strict();
exports.NewsBriefingCommandResultSchema = zod_1.z.object({
    requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    replayed: zod_1.z.boolean(),
    state: news_briefing_js_1.NewsBriefingStateSchema,
}).strict();
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