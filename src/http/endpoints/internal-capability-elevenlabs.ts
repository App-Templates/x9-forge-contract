// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (see scripts/check-portable-dts.mjs).
import { z } from 'zod';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import {
  ElevenLabsChannelStatusSchema,
  ElevenLabsProvisionRequestSchema,
  ElevenLabsProvisionResultSchema,
} from '../../capability/agent-elevenlabs/index.js';

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
  method: 'PUT' as const,
  path: '/internal/capability/agents/:agentId/elevenlabs' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: ElevenLabsProvisionRequestSchema,
  responseSchema: ElevenLabsProvisionResultSchema,
} as const;

export const elevenLabsStatusContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/elevenlabs' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  responseSchema: ElevenLabsChannelStatusSchema,
} as const;

export function capElevenLabsAgentPath(agentId: string): string {
  return elevenLabsProvisionContract.path.replace(':agentId', CapabilityAgentParamsSchema.parse({ agentId }).agentId);
}
