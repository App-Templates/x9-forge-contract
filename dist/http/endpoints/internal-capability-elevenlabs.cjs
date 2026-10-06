"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elevenLabsStatusContract = exports.elevenLabsProvisionContract = void 0;
exports.capElevenLabsAgentPath = capElevenLabsAgentPath;
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const index_js_1 = require("../../capability/agent-elevenlabs/index.cjs");
/**
 * cap-agent-elevenlabs per-agent routes (R6, v1.31.0). Direction: Forge Apply -> cap-agent-elevenlabs.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 *
 * - `PUT  /internal/capability/agents/:agentId/elevenlabs` — provision/update the provider agent (idempotent).
 * - `GET  /internal/capability/agents/:agentId/elevenlabs` — mapping and external channel state.
 *
 * Errors: `ElevenLabsProvisionErrorResponseSchema` (400 invalid_request / agent_mismatch when `scope.agentId` differs
 * from the path, 409 idempotency_conflict / stale_version / adoption_conflict, 424 credential_missing,
 * 502 provider_rejected, 503 provider_unavailable / reconcile_pending).
 */
exports.elevenLabsProvisionContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/elevenlabs',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: index_js_1.ElevenLabsProvisionRequestSchema,
    responseSchema: index_js_1.ElevenLabsProvisionResultSchema,
};
exports.elevenLabsStatusContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/elevenlabs',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    responseSchema: index_js_1.ElevenLabsChannelStatusSchema,
};
function capElevenLabsAgentPath(agentId) {
    return exports.elevenLabsProvisionContract.path.replace(':agentId', internal_capability_agent_js_1.CapabilityAgentParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-capability-elevenlabs.js.map