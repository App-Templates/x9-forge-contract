import { AgentChannelAttestationRequestSchema, AgentChannelAttestationSchema } from "../../agent/agent-channel-attestation.js";
/** agent-core -> cap-email/cap-voice, X-Internal-Secret as existing capability calls.
 * The service authorizes scope and observes this agent's handler on every request.
 * This adds a contract, not a route implementation or authentication bypass.
 */
export const internalChannelAttestationContract = {
    method: 'POST',
    path: '/internal/channels/attest',
    authType: 'secret',
    bodySchema: AgentChannelAttestationRequestSchema,
    responseSchema: AgentChannelAttestationSchema,
};
//# sourceMappingURL=internal-channel-attestation.js.map