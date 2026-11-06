"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REBUILD_DECISIONS = exports.ModelRebuildStateSchema = exports.ModelRebuildTargetSchema = exports.EmbeddingSpaceSchema = void 0;
exports.rebuildDecision = rebuildDecision;
exports.isRebuildJobCurrent = isRebuildJobCurrent;
const zod_1 = require("zod");
const model_catalog_js_1 = require("./model-catalog.cjs");
const model_consumers_js_1 = require("./model-consumers.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const models_generation_js_1 = require("./models-generation.cjs");
/** The consumer computes spaceId from the descriptor, dimensions and scope; the bridge preserves it. */
exports.EmbeddingSpaceSchema = zod_1.z.object({
    spaceId: zod_1.z.string().min(1).max(128),
    descriptor: model_catalog_js_1.ModelDescriptorSchema,
    dimensions: zod_1.z.number().int().positive(),
}).strict();
/** Memory and RAG persist this destination before enqueueing any rebuild work. */
exports.ModelRebuildTargetSchema = zod_1.z.object({
    requestId: zod_1.z.string().min(1).max(128),
    slotId: model_slot_js_1.ModelSlotIdSchema,
    space: exports.EmbeddingSpaceSchema,
    generation: models_generation_js_1.ModelsGenerationSchema,
    etag: zod_1.z.string().min(1).max(256),
    requestedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict().superRefine((target, ctx) => {
    if ((0, model_consumers_js_1.findModelConsumerDefinition)(target.slotId)?.changeBoundary !== 'rebuild') {
        ctx.addIssue({ code: 'custom', path: ['slotId'], message: 'Rebuild targets require a registered rebuild consumer' });
    }
});
exports.ModelRebuildStateSchema = zod_1.z.object({
    active: exports.EmbeddingSpaceSchema,
    building: exports.ModelRebuildTargetSchema.nullable(),
    progress: zod_1.z.object({
        completed: zod_1.z.number().int().nonnegative(),
        total: zod_1.z.number().int().positive(),
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
exports.REBUILD_DECISIONS = ['start', 'keep', 'supersede', 'cancel', 'discard', 're-read', 'noop'];
/** Supersede and cancel stop the current job and abandon its collection; the active space stays usable. */
function rebuildDecision(next, state) {
    const building = state.building;
    if (building === null)
        return next.space.spaceId === state.active.spaceId ? 'noop' : 'start';
    if (next.requestId === building.requestId)
        return 'keep';
    const order = (0, models_generation_js_1.compareModelsGeneration)(next.generation, building.generation);
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
function isRebuildJobCurrent(jobRequestId, state) {
    return state.building?.requestId === jobRequestId;
}
//# sourceMappingURL=model-rebuild.js.map