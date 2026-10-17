"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devStateGetContract = exports.devConfigPutContract = exports.devConfigGetContract = void 0;
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const config_state_js_1 = require("../../capability/dev/config-state.cjs");
/**
 * cap-dev per-agent routes (P04-d). Direction: Forge / X9 -> cap-dev.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 */
/** GET the agent's cap-dev configuration. */
exports.devConfigGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/config',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    responseSchema: config_state_js_1.DevAgentConfigSchema,
};
/** PUT the agent's cap-dev configuration. */
exports.devConfigPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/dev/config',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: config_state_js_1.DevAgentConfigSchema,
    responseSchema: internal_capability_agent_js_1.AgentConfigSavedSchema,
};
/** GET the agent's cap-dev configuration together with its reported state. */
exports.devStateGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/state',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    responseSchema: config_state_js_1.DevAgentConfigStateSchema,
};
//# sourceMappingURL=internal-capability-dev.js.map