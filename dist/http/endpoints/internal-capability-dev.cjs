"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devBusinessUnitProjectEnableContract = exports.DevBusinessUnitProjectEnableResponseSchema = exports.DevBusinessUnitProjectEnableRequestSchema = exports.devStateGetContract = exports.devConfigPutContract = exports.devConfigGetContract = void 0;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const config_state_js_1 = require("../../capability/dev/config-state.cjs");
const capability_call_identity_js_1 = require("../../capability/capability-call-identity.cjs");
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
exports.DevBusinessUnitProjectEnableRequestSchema = zod_1.z.strictObject({
    tenantId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.tenantId,
    ownerId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.ownerId,
    projectId: zod_1.z.string().min(1).max(64),
});
exports.DevBusinessUnitProjectEnableResponseSchema = zod_1.z.strictObject({
    status: zod_1.z.enum(['enabled', 'already']),
    configVersion: zod_1.z.number().int().min(1),
    allowedProjectIds: zod_1.z.array(zod_1.z.string().min(1)).min(1),
});
/**
 * Platform → cap-dev. cap-dev composes the lead's configuration from its own deployment
 * (board = SESSION_BOARD_REPO) and adds the project; idempotent. Refusals: 403 not a
 * business unit lead or foreign scope, 409 disabled by the owner, 503 sessions switched off.
 */
exports.devBusinessUnitProjectEnableContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/business-unit-project',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: exports.DevBusinessUnitProjectEnableRequestSchema,
    responseSchema: exports.DevBusinessUnitProjectEnableResponseSchema,
};
//# sourceMappingURL=internal-capability-dev.js.map