"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongDraftApproveRequestSchema = exports.VideoLongDraftSchema = exports.VideoLongDraftStatusSchema = exports.VideoLongDraftDocumentSchema = exports.VideoLongUsageSchema = exports.VideoLongChapterSchema = void 0;
const zod_1 = require("zod");
const engine_js_1 = require("./engine.cjs");
const lungo_js_1 = require("./lungo.cjs");
exports.VideoLongChapterSchema = zod_1.z.strictObject({
    index: zod_1.z.number().int().min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    title: zod_1.z.string().min(1).max(120),
    summary: zod_1.z.string().min(1).max(600),
    targetSeconds: zod_1.z.number().int().min(10).max(600),
});
/** Consumption of the draft step; `measured: false` means the numbers are estimates. */
exports.VideoLongUsageSchema = zod_1.z.strictObject({
    provider: zod_1.z.string().min(1).max(64),
    model: zod_1.z.string().min(1).max(100),
    inputTokens: zod_1.z.number().int().min(0),
    outputTokens: zod_1.z.number().int().min(0),
    measured: zod_1.z.boolean(),
});
/**
 * What the director writes and the engine receives. The engine checks that the
 * chapter total equals `totalSeconds` and that indexes are consecutive.
 */
exports.VideoLongDraftDocumentSchema = zod_1.z.strictObject({
    logline: zod_1.z.string().min(1).max(300),
    thesis: zod_1.z.string().min(1).max(600),
    paragraphs: zod_1.z.array(zod_1.z.string().min(1).max(1200)).min(1).max(40),
    chapters: zod_1.z.array(exports.VideoLongChapterSchema).min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    usage: exports.VideoLongUsageSchema.nullable(),
});
exports.VideoLongDraftStatusSchema = zod_1.z.enum(['bozza', 'approvata']);
const VideoLongDigestSchema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
exports.VideoLongDraftSchema = zod_1.z.strictObject({
    revision: engine_js_1.VideoEngineRevisionSchema,
    status: exports.VideoLongDraftStatusSchema,
    logline: zod_1.z.string().min(1).max(300),
    thesis: zod_1.z.string().min(1).max(600),
    paragraphs: zod_1.z.array(zod_1.z.string().min(1).max(1200)).min(1).max(40),
    chapters: zod_1.z.array(exports.VideoLongChapterSchema).min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    usage: exports.VideoLongUsageSchema.nullable(),
    totalSeconds: zod_1.z.number().int().min(10).max(lungo_js_1.VIDEO_LONG_MAX_SECONDS),
    digest: VideoLongDigestSchema,
    approvedAt: zod_1.z.string().min(1).max(40).nullable(),
});
/** The approval names the revision and the digest the person has seen. */
exports.VideoLongDraftApproveRequestSchema = zod_1.z.strictObject({
    revision: engine_js_1.VideoEngineRevisionSchema,
    digest: VideoLongDigestSchema,
});
//# sourceMappingURL=lungo-bozza.js.map