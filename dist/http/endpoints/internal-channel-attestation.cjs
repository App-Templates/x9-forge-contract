"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalChannelAttestationContract = void 0;
const agent_channel_attestation_js_1 = require("../../agent/agent-channel-attestation.cjs");
/** agent-core -> cap-email/cap-voice, X-Internal-Secret as existing capability calls.
 * The service authorizes scope and observes this agent's handler on every request.
 * This adds a contract, not a route implementation or authentication bypass.
 */
exports.internalChannelAttestationContract = {
    method: 'POST',
    path: '/internal/channels/attest',
    authType: 'secret',
    bodySchema: agent_channel_attestation_js_1.AgentChannelAttestationRequestSchema,
    responseSchema: agent_channel_attestation_js_1.AgentChannelAttestationSchema,
};
//# sourceMappingURL=internal-channel-attestation.js.map