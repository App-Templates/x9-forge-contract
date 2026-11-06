import { z } from 'zod';
import { ModelDescriptorSchema } from "./model-catalog.js";
import { findModelConsumerDefinition } from "./model-consumers.js";
import { ModelSlotIdSchema } from "./model-slot.js";
import { ModelsGenerationSchema, compareModelsGeneration } from "./models-generation.js";
/** The consumer computes spaceId from the descriptor, dimensions and scope; the bridge preserves it. */
export const EmbeddingSpaceSchema = z.object({
    spaceId: z.string().min(1).max(128),
    descriptor: ModelDescriptorSchema,
    dimensions: z.number().int().positive(),
}).strict();
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
export const REBUILD_DECISIONS = ['start', 'keep', 'supersede', 'cancel', 'discard', 're-read', 'noop'];
/** Supersede and cancel stop the current job and abandon its collection; the active space stays usable. */
export function rebuildDecision(next, state) {
    const building = state.building;
    if (building === null)
        return next.space.spaceId === state.active.spaceId ? 'noop' : 'start';
    if (next.requestId === building.requestId)
        return 'keep';
    const order = compareModelsGeneration(next.generation, building.generation);
    if (order === 'older')
        return 'discard';
    if (order === 'incomparable' || order === 'same')
        return 're-read';
    if (next.space.spaceId === state.active.spaceId)
        return 'cancel';
    if (next.space.spaceId === building.space.spaceId)
        return 'keep';
    return 'supersede';
}
/** Workers check the persisted state before every block so superseded or cancelled jobs stop themselves. */
export function isRebuildJobCurrent(jobRequestId, state) {
    return state.building?.requestId === jobRequestId;
}
//# sourceMappingURL=model-rebuild.js.map