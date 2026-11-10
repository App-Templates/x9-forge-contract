import { z } from 'zod';
import { ModelDescriptorSchema } from './model-catalog.js';
import { findModelConsumerDefinition } from './model-consumers.js';
import { ModelSlotIdSchema } from './model-slot.js';
import type { ModelCostMetadata } from './models-batch.js';
import { ModelsGenerationSchema, compareModelsGeneration } from './models-generation.js';

/** The consumer computes spaceId from the descriptor, dimensions and scope; the bridge preserves it. */
export const EmbeddingSpaceSchema = z.object({
  spaceId: z.string().min(1).max(128),
  descriptor: ModelDescriptorSchema,
  dimensions: z.number().int().positive(),
}).strict();
export type EmbeddingSpace = z.infer<typeof EmbeddingSpaceSchema>;

/** Memory and RAG persist this destination before enqueueing any rebuild work. */
export const ModelRebuildTargetSchema = z.object({
  requestId: z.string().min(1).max(128),
  slotId: ModelSlotIdSchema,
  space: EmbeddingSpaceSchema,
  generation: ModelsGenerationSchema,
  etag: z.string().min(1).max(256),
  requestedAt: z.iso.datetime({ offset: true }),
}).strict().superRefine((target, ctx) => {
  if (findModelConsumerDefinition(target.slotId)?.changeBoundary !== 'rebuild') {
    ctx.addIssue({ code: 'custom', path: ['slotId'], message: 'Rebuild targets require a registered rebuild consumer' });
  }
});
export type ModelRebuildTarget = z.infer<typeof ModelRebuildTargetSchema>;

export const ModelRebuildStateSchema = z.object({
  active: EmbeddingSpaceSchema,
  building: ModelRebuildTargetSchema.nullable(),
  progress: z.object({
    completed: z.number().int().nonnegative(),
    total: z.number().int().positive(),
  }).strict().nullable(),
}).strict().superRefine((state, ctx) => {
  if ((state.building !== null) !== (state.progress !== null)) {
    ctx.addIssue({ code: 'custom', path: ['progress'], message: 'Progress is present exactly while a target is building' });
  }
  if (state.progress !== null && state.progress.completed > state.progress.total) {
    ctx.addIssue({ code: 'custom', path: ['progress', 'completed'], message: 'Progress exceeds its denominator' });
  }
  if (state.building !== null && state.building.space.spaceId === state.active.spaceId) {
    ctx.addIssue({ code: 'custom', path: ['building', 'space', 'spaceId'], message: 'The building space must differ from the active space' });
  }
});
export type ModelRebuildState = z.infer<typeof ModelRebuildStateSchema>;

export const REBUILD_DECISIONS = ['start', 'keep', 'supersede', 'cancel', 'discard', 're-read', 'noop'] as const;
export type RebuildDecision = typeof REBUILD_DECISIONS[number];

/** Supersede and cancel stop the current job and abandon its collection; the active space stays usable. */
export function rebuildDecision(next: ModelRebuildTarget, state: ModelRebuildState): RebuildDecision {
  const building = state.building;
  if (building === null) return next.space.spaceId === state.active.spaceId ? 'noop' : 'start';
  if (next.requestId === building.requestId) return 'keep';

  const order = compareModelsGeneration(next.generation, building.generation);
  if (order === 'older') return 'discard';
  if (order === 'incomparable' || order === 'same') return 're-read';
  if (next.space.spaceId === state.active.spaceId) return 'cancel';
  if (next.space.spaceId === building.space.spaceId) return 'keep';
  return 'supersede';
}

/** Workers check the persisted state before every block so superseded or cancelled jobs stop themselves. */
export function isRebuildJobCurrent(jobRequestId: string, state: ModelRebuildState): boolean {
  return state.building?.requestId === jobRequestId;
}

const NO_TOKEN_RATE_REASON = 'tariffa per token non nota';

/**
 * What an embedding rebuild of `maxTokens` input tokens costs, always rounded up to the cent.
 * Never an invented figure: without a known per-token rate there is a reason and no amount.
 */
export function embeddingRebuildCost(
  maxTokens: number,
  cost: ModelCostMetadata,
): { amount: number | null; currency: string | null; reason: string | null } {
  if (cost.state === 'unknown') return { amount: null, currency: null, reason: cost.reason || NO_TOKEN_RATE_REASON };
  const rate = cost.rates.find(candidate => candidate.unit === 'million-input-tokens');
  if (rate === undefined) return { amount: null, currency: null, reason: NO_TOKEN_RATE_REASON };
  const amount = Math.ceil(Number(((maxTokens / 1_000_000) * rate.amount * 100).toFixed(6))) / 100;
  return { amount, currency: cost.currency, reason: null };
}
