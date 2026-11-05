import { z } from 'zod';
import { VideoResolutionSchema, VideoVoiceIdSchema } from "./brief.js";
import { VideoEngineRevisionSchema } from "./engine.js";
import { VideoFootageChoiceSchema } from "./footage.js";
/**
 * The «story» of a preset with a face (or a pure infographic): what the regia writes and the engine produces.
 * Shared by the regia delivery (`regia.json` of the session on the laptop) and by the engine operation
 * `POST /api/projects/:engineProjectId/story` (cap-video → engine).
 */
/** Output resolution of the story; the engine default is 1080p (1080×1920). */
export const VideoStoryResolutionSchema = VideoResolutionSchema;
/** Voice tags of one scene, written without brackets (`calm`, `conversational`, ...): the preset decides which are allowed. */
export const VideoStoryTagSchema = z.string().regex(/^[a-z][a-z-]{0,23}$/);
/** One scene: the text the voice says, with its optional voice tags. */
export const VideoStorySceneSchema = z.strictObject({
    text: z.string().trim().min(1).max(1200),
    tags: z.array(VideoStoryTagSchema).max(4).optional(),
});
export const VIDEO_STORY_MAX_SCENES = 12;
export const VideoStoryScenesSchema = z.array(VideoStorySceneSchema).min(1).max(VIDEO_STORY_MAX_SCENES);
/** The closing screen: a title (e.g. «In pratica») and the key line. Never an invitation to comment. */
export const VideoStoryOutroSchema = z.strictObject({
    title: z.string().trim().min(1).max(80),
    line: z.string().trim().min(1).max(240),
});
/** Upper bound of the graphic page (HTML with a deterministic `render(t)`), in characters: about 200 KB. */
export const VIDEO_GRAPHIC_HTML_MAX_CHARS = 200_000;
export const VideoGraphicHtmlSchema = z.string().min(1).max(VIDEO_GRAPHIC_HTML_MAX_CHARS);
/**
 * Body of `POST /api/projects/:engineProjectId/story` (202, idempotent on the revision). `footage` is absent for the
 * pure infographic; `resolution` defaults to `1080p`. The state is read back with GET project.
 */
export const VideoEngineStoryRequestSchema = z.strictObject({
    scenes: VideoStoryScenesSchema,
    graphicHtml: VideoGraphicHtmlSchema,
    footage: VideoFootageChoiceSchema.optional(),
    outro: VideoStoryOutroSchema,
    resolution: VideoStoryResolutionSchema.default('1080p'),
    /** Voice id of the preset catalogue; absent: the default voice of the engine's preset. */
    voice: VideoVoiceIdSchema.optional(),
    revision: VideoEngineRevisionSchema,
});
const usd = z.number().finite().min(0);
/**
 * Answer of `POST /api/projects/:engineProjectId/story/estimate` (200, no side effect): the engine's upper estimate of a
 * story, the same figure `POST .../story` compares with the budget before starting. cap-video asks it before email 1 and
 * shows `estimateUsd`, so the person never approves a cost the engine will then refuse. `availableUsd` is what is left of
 * the project budget; `serverAvailableUsd` what is left of the server's runtime limit (null when the limit is not set);
 * `fitsBudget` is true only when the estimate fits both. When `serverAvailableUsd` is null, it is false:
 * starting the story would be rejected with HTTP 503 because the server limit is not set.
 */
export const VideoEngineStoryEstimateSchema = z.strictObject({
    estimateUsd: usd,
    voiceUsd: usd,
    lipSyncUsd: usd,
    estimatedSeconds: usd,
    characters: z.number().int().min(0),
    availableUsd: usd,
    serverAvailableUsd: usd.nullable(),
    fitsBudget: z.boolean(),
    source: z.string().min(1).max(500),
});
//# sourceMappingURL=story.js.map