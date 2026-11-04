"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoEngineStoryEstimateSchema = exports.VideoEngineStoryRequestSchema = exports.VideoGraphicHtmlSchema = exports.VIDEO_GRAPHIC_HTML_MAX_CHARS = exports.VideoStoryOutroSchema = exports.VideoStoryScenesSchema = exports.VIDEO_STORY_MAX_SCENES = exports.VideoStorySceneSchema = exports.VideoStoryTagSchema = exports.VideoStoryResolutionSchema = void 0;
const zod_1 = require("zod");
const engine_js_1 = require("./engine.cjs");
const footage_js_1 = require("./footage.cjs");
/**
 * The «story» of a preset with a face (or a pure infographic): what the regia writes and the engine produces.
 * Shared by the regia delivery (`regia.json` of the session on the laptop) and by the engine operation
 * `POST /api/projects/:engineProjectId/story` (cap-video → engine).
 */
/** Output resolution of the story; the engine default is 1080p (1080×1920). */
exports.VideoStoryResolutionSchema = zod_1.z.enum(['480p', '720p', '1080p']);
/** Voice tags of one scene, written without brackets (`calm`, `conversational`, ...): the preset decides which are allowed. */
exports.VideoStoryTagSchema = zod_1.z.string().regex(/^[a-z][a-z-]{0,23}$/);
/** One scene: the text the voice says, with its optional voice tags. */
exports.VideoStorySceneSchema = zod_1.z.strictObject({
    text: zod_1.z.string().trim().min(1).max(1200),
    tags: zod_1.z.array(exports.VideoStoryTagSchema).max(4).optional(),
});
exports.VIDEO_STORY_MAX_SCENES = 12;
exports.VideoStoryScenesSchema = zod_1.z.array(exports.VideoStorySceneSchema).min(1).max(exports.VIDEO_STORY_MAX_SCENES);
/** The closing screen: a title (e.g. «In pratica») and the key line. Never an invitation to comment. */
exports.VideoStoryOutroSchema = zod_1.z.strictObject({
    title: zod_1.z.string().trim().min(1).max(80),
    line: zod_1.z.string().trim().min(1).max(240),
});
/** Upper bound of the graphic page (HTML with a deterministic `render(t)`), in characters: about 200 KB. */
exports.VIDEO_GRAPHIC_HTML_MAX_CHARS = 200_000;
exports.VideoGraphicHtmlSchema = zod_1.z.string().min(1).max(exports.VIDEO_GRAPHIC_HTML_MAX_CHARS);
/**
 * Body of `POST /api/projects/:engineProjectId/story` (202, idempotent on the revision). `footage` is absent for the
 * pure infographic; `resolution` defaults to `1080p`. The state is read back with GET project.
 */
exports.VideoEngineStoryRequestSchema = zod_1.z.strictObject({
    scenes: exports.VideoStoryScenesSchema,
    graphicHtml: exports.VideoGraphicHtmlSchema,
    footage: footage_js_1.VideoFootageChoiceSchema.optional(),
    outro: exports.VideoStoryOutroSchema,
    resolution: exports.VideoStoryResolutionSchema.default('1080p'),
    revision: engine_js_1.VideoEngineRevisionSchema,
});
const usd = zod_1.z.number().finite().min(0);
/**
 * Answer of `POST /api/projects/:engineProjectId/story/estimate` (200, no side effect): the engine's upper estimate of a
 * story, the same figure `POST .../story` compares with the budget before starting. cap-video asks it before email 1 and
 * shows `estimateUsd`, so the person never approves a cost the engine will then refuse. `availableUsd` is what is left of
 * the project budget; `serverAvailableUsd` what is left of the server's runtime limit (null when the limit is not set);
 * `fitsBudget` is true only when the estimate fits both, i.e. when `POST .../story` would not refuse it for cost.
 */
exports.VideoEngineStoryEstimateSchema = zod_1.z.strictObject({
    estimateUsd: usd,
    voiceUsd: usd,
    lipSyncUsd: usd,
    estimatedSeconds: usd,
    characters: zod_1.z.number().int().min(0),
    availableUsd: usd,
    serverAvailableUsd: usd.nullable(),
    fitsBudget: zod_1.z.boolean(),
    source: zod_1.z.string().min(1).max(500),
});
//# sourceMappingURL=story.js.map