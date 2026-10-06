"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentManagementStateContract = exports.agentCommandContract = exports.AgentManagementErrorResponseSchema = exports.AgentManagementErrorCodeSchema = exports.AgentManagementParamsSchema = void 0;
exports.agentCommandsPath = agentCommandsPath;
exports.agentManagementPath = agentManagementPath;
const zod_1 = require("zod");
const internal_agents_reload_js_1 = require("./internal-agents-reload.cjs");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
/**
 * R1b logical management (v1.31.0). Direction: Forge factory-svc -> X9 agent-core. Auth: X-Internal-Secret.
 *
 * - `POST /internal/agents/:agentId/commands` — start/stop/restart/reload one agent or apply a configuration version,
 *   idempotent by `requestId` (see `AgentManagementCommandSchema`). 200 `AgentManagementCommandResultSchema` even when
 *   targets failed (per-target outcome); errors below are for commands that were not processed at all.
 * - `GET /internal/agents/:agentId/management` — configuration versions and the actions each target supports.
 *
 * Errors (`AgentManagementErrorResponseSchema`): 400 invalid_request, 404 agent_not_found, 409 idempotency_conflict
 * (same requestId, different command) / stale_version (desired version older than the applied one, carries
 * `currentVersion`) / command_in_progress, 503 source_unavailable.
 *
 * The legacy `/reload` and `/stop` routes stay unchanged for 1.30 consumers.
 */
/** Same agent id rule as `/internal/agents/:agentId/reload|stop|turn`. */
exports.AgentManagementParamsSchema = internal_agents_reload_js_1.ReloadAgentParamsSchema;
exports.AgentManagementErrorCodeSchema = zod_1.z.enum([
    'invalid_request',
    'agent_not_found',
    'idempotency_conflict',
    'stale_version',
    'command_in_progress',
    'source_unavailable',
]);
exports.AgentManagementErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: exports.AgentManagementErrorCodeSchema,
    /** stale_version only: the version currently applied. */
    currentVersion: agent_config_js_1.AgentConfigVersionSchema.optional(),
}).superRefine((response, ctx) => {
    if ((response.error === 'stale_version') !== (response.currentVersion !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['currentVersion'], message: 'currentVersion is present exactly for stale_version' });
    }
});
exports.agentCommandContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/commands',
    authType: 'secret',
    paramsSchema: exports.AgentManagementParamsSchema,
    bodySchema: agent_management_js_1.AgentManagementCommandSchema,
    responseSchema: agent_management_js_1.AgentManagementCommandResultSchema,
};
exports.agentManagementStateContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/management',
    authType: 'secret',
    paramsSchema: exports.AgentManagementParamsSchema,
    responseSchema: agent_management_js_1.AgentManagementStateSchema,
};
function agentCommandsPath(agentId) {
    return exports.agentCommandContract.path.replace(':agentId', exports.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
function agentManagementPath(agentId) {
    return exports.agentManagementStateContract.path.replace(':agentId', exports.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agents-management.js.map