import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { ElevenLabsChannelStatusSchema, ElevenLabsProvisionRequestSchema, ElevenLabsProvisionResultSchema, } from "../../capability/agent-elevenlabs/index.js";
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
export const elevenLabsProvisionContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/elevenlabs',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: ElevenLabsProvisionRequestSchema,
    responseSchema: ElevenLabsProvisionResultSchema,
};
export const elevenLabsStatusContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/elevenlabs',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    responseSchema: ElevenLabsChannelStatusSchema,
};
export function capElevenLabsAgentPath(agentId) {
    return elevenLabsProvisionContract.path.replace(':agentId', CapabilityAgentParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-capability-elevenlabs.js.map