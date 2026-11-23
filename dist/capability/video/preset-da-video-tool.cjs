"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPresetFromVideoToolResponseSchema = exports.VideoPresetFromVideoToolStatusInputSchema = exports.VideoPresetFromVideoToolInputSchema = exports.VIDEO_PRESET_FROM_VIDEO_TOOL = void 0;
const zod_1 = require("zod");
const preset_da_video_js_1 = require("./preset-da-video.cjs");
exports.VIDEO_PRESET_FROM_VIDEO_TOOL = 'video_preset_da_url';
/** Identity comes only from the admitted tool envelope (R-33). */
exports.VideoPresetFromVideoToolInputSchema = zod_1.z.strictObject({
    url: preset_da_video_js_1.VideoPresetVideoUrlSchema,
    name: zod_1.z.string().trim().min(1).max(80),
});
/** Polling uses the same job id returned when the analysis starts. */
exports.VideoPresetFromVideoToolStatusInputSchema = zod_1.z.strictObject({
    jobId: preset_da_video_js_1.VideoPresetFromVideoJobSchema.shape.jobId,
});
exports.VideoPresetFromVideoToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        status: zod_1.z.literal('avviato'),
        jobId: preset_da_video_js_1.VideoPresetFromVideoJobSchema.shape.jobId,
    }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutato'),
        reason: zod_1.z.enum([
            'url_non_valida',
            'video_troppo_lungo',
            'video_troppo_grande',
            'rete_interna',
            'non_e_un_video',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('pronto'),
        presetId: preset_da_video_js_1.VideoUserPresetIdSchema,
        scenes: preset_da_video_js_1.VideoUserPresetSchema.shape.source.shape.sceneCount,
        studioUrl: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=preset-da-video-tool.js.map