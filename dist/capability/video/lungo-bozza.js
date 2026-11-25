import { z } from 'zod';
import { VideoEngineRevisionSchema } from "./engine.js";
import { VIDEO_LONG_MAX_CHAPTERS, VIDEO_LONG_MAX_SECONDS } from "./lungo.js";
export const VideoLongChapterSchema = z.strictObject({
    index: z.number().int().min(1).max(VIDEO_LONG_MAX_CHAPTERS),
    title: z.string().min(1).max(120),
    summary: z.string().min(1).max(600),
    targetSeconds: z.number().int().min(10).max(600),
});
/** Consumption of the draft step; `measured: false` means the numbers are estimates. */
export const VideoLongUsageSchema = z.strictObject({
    provider: z.string().min(1).max(64),
    model: z.string().min(1).max(100),
    inputTokens: z.number().int().min(0),
    outputTokens: z.number().int().min(0),
    measured: z.boolean(),
});
/**
 * What the director writes and the engine receives. The engine checks that the
 * chapter total equals `totalSeconds` and that indexes are consecutive.
 */
export const VideoLongDraftDocumentSchema = z.strictObject({
    logline: z.string().min(1).max(300),
    thesis: z.string().min(1).max(600),
    paragraphs: z.array(z.string().min(1).max(1200)).min(1).max(40),
    chapters: z.array(VideoLongChapterSchema).min(1).max(VIDEO_LONG_MAX_CHAPTERS),
    usage: VideoLongUsageSchema.nullable(),
});
export const VideoLongDraftStatusSchema = z.enum(['bozza', 'approvata']);
const VideoLongDigestSchema = z.string().regex(/^[0-9a-f]{64}$/);
export const VideoLongDraftSchema = z.strictObject({
    revision: VideoEngineRevisionSchema,
    status: VideoLongDraftStatusSchema,
    logline: z.string().min(1).max(300),
    thesis: z.string().min(1).max(600),
    paragraphs: z.array(z.string().min(1).max(1200)).min(1).max(40),
    chapters: z.array(VideoLongChapterSchema).min(1).max(VIDEO_LONG_MAX_CHAPTERS),
    usage: VideoLongUsageSchema.nullable(),
    totalSeconds: z.number().int().min(10).max(VIDEO_LONG_MAX_SECONDS),
    digest: VideoLongDigestSchema,
    approvedAt: z.string().min(1).max(40).nullable(),
});
/** The approval names the revision and the digest the person has seen. */
export const VideoLongDraftApproveRequestSchema = z.strictObject({
    revision: VideoEngineRevisionSchema,
    digest: VideoLongDigestSchema,
});
//# sourceMappingURL=lungo-bozza.js.map