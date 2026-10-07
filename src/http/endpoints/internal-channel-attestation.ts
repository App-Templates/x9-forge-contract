// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { AgentChannelAttestationRequestSchema, AgentChannelAttestationSchema } from '../../agent/agent-channel-attestation.js';

/** agent-core -> cap-email/cap-voice, X-Internal-Secret as existing capability calls.
 * The service authorizes scope and observes this agent's handler on every request.
 * This adds a contract, not a route implementation or authentication bypass.
 */
export const internalChannelAttestationContract = {
  method: 'POST' as const,
  path: '/internal/channels/attest' as const,
  authType: 'secret' as const,
  bodySchema: AgentChannelAttestationRequestSchema,
  responseSchema: AgentChannelAttestationSchema,
} as const;
