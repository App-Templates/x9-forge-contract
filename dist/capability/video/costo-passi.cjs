"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCostByStepSchema = exports.VideoCostStepSchema = exports.VideoCostEntrySchema = exports.VideoCostChapterSchema = exports.VideoCostModelSchema = exports.VideoCostBasisSchema = exports.VideoCostUnitSchema = void 0;
const zod_1 = require("zod");
const lungo_js_1 = require("./lungo.cjs");
exports.VideoCostUnitSchema = zod_1.z.enum(['token', 'char', 'second', 'image', 'clip']);
exports.VideoCostBasisSchema = zod_1.z.enum(['misurato', 'stimato', 'non-misurato']);
exports.VideoCostModelSchema = zod_1.z.strictObject({
    step: lungo_js_1.VideoLongStepSchema,
    provider: zod_1.z.string().min(1).max(64),
    model: zod_1.z.string().min(1).max(100),
    quantity: zod_1.z.number().min(0).finite(),
    unit: exports.VideoCostUnitSchema,
    costUsd: zod_1.z.number().min(0).finite(),
    basis: exports.VideoCostBasisSchema,
});
exports.VideoCostChapterSchema = zod_1.z.strictObject({
    chapterIndex: zod_1.z.number().int().min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    costUsd: zod_1.z.number().min(0).finite(),
    seconds: zod_1.z.number().int().min(0).nullable(),
    usdPerMinute: zod_1.z.number().min(0).finite().nullable(),
});
exports.VideoCostEntrySchema = exports.VideoCostModelSchema.extend({
    chapterIndex: exports.VideoCostChapterSchema.shape.chapterIndex.optional(),
    at: zod_1.z.string().min(1).max(40),
});
exports.VideoCostStepSchema = zod_1.z.strictObject({
    step: lungo_js_1.VideoLongStepSchema,
    estimatedUsd: zod_1.z.number().min(0).finite(),
    confirmedUsd: zod_1.z.number().min(0).finite(),
    entries: zod_1.z.array(exports.VideoCostEntrySchema).max(200),
});
/**
 * The engine keeps usdPerMinute null until a finished video is available,
 * and never uses zero to represent a missing cost.
 */
exports.VideoCostByStepSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema,
    steps: zod_1.z.array(exports.VideoCostStepSchema).max(5),
    totalUsd: zod_1.z.number().min(0).finite(),
    finishedSeconds: zod_1.z.number().int().min(0).nullable(),
    usdPerMinute: zod_1.z.number().min(0).finite().nullable(),
    models: zod_1.z.array(exports.VideoCostModelSchema).max(60).optional(),
    chapters: zod_1.z.array(exports.VideoCostChapterSchema).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS).optional(),
    // Any unmeasured entry takes precedence over estimated entries; measured requires all entries measured.
    usdPerMinuteBasis: exports.VideoCostBasisSchema.nullable().optional(),
    unmeasuredEntries: zod_1.z.number().int().min(0).optional(),
});
//# sourceMappingURL=costo-passi.js.map