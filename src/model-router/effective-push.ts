import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../auth/index.js';
import { AgentManagementParamsSchema } from '../http/endpoints/internal-agents-management.js';
import { EffectiveModelsResponseSchema } from './effective-models.js';
import { EffectiveSlotReadRequestSchema, EffectiveSlotStateSchema } from './effective-slot-state.js';
import type { EffectiveSlotReadRequest } from './effective-slot-state.js';
import { ModelSlotIdSchema } from './model-slot.js';

/** What agent-core did with a pushed effective response, compared with the one it already holds. */
export const ModelsPushOutcomeSchema = z.enum(['accepted', 'same', 'older', 'incomparable']);
export type ModelsPushOutcome = z.infer<typeof ModelsPushOutcomeSchema>;

/** `etag` is the one agent-core keeps AFTER the push; null when it holds none. */
export const ModelsPushAckSchema = z.object({
  ok: z.literal(true),
  outcome: ModelsPushOutcomeSchema,
  etag: z.string().min(1).max(256).nullable(),
}).strict();
export type ModelsPushAck = z.infer<typeof ModelsPushAckSchema>;

/**
 * Vault → agent-core: delivers the effective choices of one agent.
 * The choice is "in force" only when `ack.etag === body.etag`.
 * 409 `{ ok: false, error: 'identity_mismatch' }` when agent-core does not know that agent
 * with that `vaultAgentId`.
 */
export const internalModelsPushContract = {
  method: 'POST' as const, path: '/internal/models/effective' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: EffectiveModelsResponseSchema, responseSchema: ModelsPushAckSchema,
} as const;

/** Emergency invalidation: agent-core drops what it holds for the agent and fetches again. */
export const internalModelsInvalidateContract = {
  method: 'POST' as const, path: '/internal/models/invalidate/:agentId' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: AgentManagementParamsSchema,
  responseSchema: z.object({ ok: z.literal(true) }).strict(),
} as const;
export function modelsInvalidatePath(agentId: string): string {
  return internalModelsInvalidateContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}

export const ModelsReturnWindowRequestSchema = z.object({
  vaultAgentId: z.number().int().positive(),
  ttlMs: z.number().int().min(1000).max(900000),
}).strict();
export type ModelsReturnWindowRequest = z.infer<typeof ModelsReturnWindowRequestSchema>;

/**
 * For `ttlMs` agent-core admits a v1 publication for the agent even though it is on v2:
 * the return is prepared once the new one is on (Astra 13). `until` is when the window closes.
 */
export const internalModelsReturnWindowContract = {
  method: 'POST' as const, path: '/internal/models/return-window/:agentId' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: AgentManagementParamsSchema,
  bodySchema: ModelsReturnWindowRequestSchema,
  responseSchema: z.object({ ok: z.literal(true), until: z.string().datetime() }).strict(),
} as const;
export function modelsReturnWindowPath(agentId: string): string {
  return internalModelsReturnWindowContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}

export const EffectiveSlotPathParamsSchema = z.object({
  agentId: AgentManagementParamsSchema.shape.agentId,
  slotId: ModelSlotIdSchema,
}).strict();

/**
 * Services → agent-core: reads one slot with the complete identity triple in the body.
 * `params.agentId` and `params.slotId` must match `body.scope.agentId` and `body.slotId`;
 * a mismatch returns 400.
 * `If-None-Match` equal to a configured state's `etag` returns 304 without a body.
 * All other states have no ETag and always return 200.
 */
export const internalAgentModelSlotContract = {
  method: 'POST' as const, path: '/internal/agents/:agentId/models/slots/:slotId' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: EffectiveSlotPathParamsSchema,
  bodySchema: EffectiveSlotReadRequestSchema,
  responseSchema: EffectiveSlotStateSchema,
} as const;

export function agentModelSlotPath(agentId: string, slotId: string): string {
  const params = EffectiveSlotPathParamsSchema.parse({ agentId, slotId });
  return internalAgentModelSlotContract.path
    .replace(':agentId', params.agentId)
    .replace(':slotId', params.slotId);
}

/** Compare the path and body after each has passed its boundary schema. */
export function slotRequestMatchesPath(
  params: z.infer<typeof EffectiveSlotPathParamsSchema>,
  body: EffectiveSlotReadRequest,
): boolean {
  return params.agentId === body.scope.agentId && params.slotId === body.slotId;
}
