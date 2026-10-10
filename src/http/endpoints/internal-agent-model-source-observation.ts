// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { AgentModelSourceObservationSchema } from '../../model-router/agent-model-configuration.js';
import { ModelConsumerStateRequestSchema, ModelConsumerRuntimeStateSchema } from '../../model-router/model-consumer-execution.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';

/** Local loaded generation, available before priming without querying aggregate consumer state.
 * This observation grants no Master role; producers must recheck the generation after awaits.
 */
export const internalAgentModelSourceObservationContract = {
  method: 'GET' as const,
  path: '/internal/agents/:agentId/models/local-source' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: AgentManagementParamsSchema,
  responseSchema: AgentModelSourceObservationSchema,
} as const;

export function agentModelSourceObservationPath(agentId: string): string {
  return internalAgentModelSourceObservationContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}

/** Personal voice sessions resolve the executing primary on the server, never from a guessed agent ID. */
export const internalPrimaryModelSourceObservationContract = {
  method: 'GET' as const,
  path: '/internal/models/primary/local-source' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  responseSchema: AgentModelSourceObservationSchema,
} as const;

/** cap-voice observes the server value used by its outgoing GPT-Live phone dispatcher. */
export const internalPhoneBackendModelSourceContract = {
  method: 'POST' as const,
  path: '/internal/live/phone-backend-source' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  requestSchema: ModelConsumerStateRequestSchema.refine(value => value.slotId === 'voice_phone_delegation'),
  responseSchema: ModelConsumerRuntimeStateSchema,
} as const;
