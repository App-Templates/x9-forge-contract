// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Portable declaration emission requires z in scope.
import { z } from 'zod';
import { CapabilityTurnLeadRequestSchema, CapabilityTurnLeadResponseSchema } from '../../capability/capability-turn-lead.js';

/** POST /turn — authenticated runtime -> capability declared in the agent's registry. */
export const capTurnLeadContract = {
  method: 'POST' as const,
  path: '/turn' as const,
  authType: 'secret' as const,
  bodySchema: CapabilityTurnLeadRequestSchema,
  responseSchema: CapabilityTurnLeadResponseSchema,
} as const;
