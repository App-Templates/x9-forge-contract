import { z } from 'zod';
/**
 * The «story» of a preset with a face (or a pure infographic): what the regia writes and the engine produces.
 * Shared by the regia delivery (`regia.json` of the session on the laptop) and by the engine operation
 * `POST /api/projects/:engineProjectId/story` (cap-video → engine).
 */
/** Output resolution of the story; the engine default is 1080p (1080×1920). */
export declare const VideoStoryResolutionSchema: z.ZodEnum<{
    "480p": "480p";
    "720p": "720p";
    "1080p": "1080p";
}>;
export type VideoStoryResolution = z.infer<typeof VideoStoryResolutionSchema>;
/** Voice tags of one scene, written without brackets (`calm`, `conversational`, ...): the preset decides which are allowed. */
export declare const VideoStoryTagSchema: z.ZodString;
/** One scene: the text the voice says, with its optional voice tags. */
export declare const VideoStorySceneSchema: z.ZodObject<{
    text: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type VideoStoryScene = z.infer<typeof VideoStorySceneSchema>;
export declare const VIDEO_STORY_MAX_SCENES = 12;
export declare const VideoStoryScenesSchema: z.ZodArray<z.ZodObject<{
    text: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>>;
/** The closing screen: a title (e.g. «In pratica») and the key line. Never an invitation to comment. */
export declare const VideoStoryOutroSchema: z.ZodObject<{
    title: z.ZodString;
    line: z.ZodString;
}, z.core.$strict>;
export type VideoStoryOutro = z.infer<typeof VideoStoryOutroSchema>;
/** Upper bound of the graphic page (HTML with a deterministic `render(t)`), in characters: about 200 KB. */
export declare const VIDEO_GRAPHIC_HTML_MAX_CHARS = 200000;
export declare const VideoGraphicHtmlSchema: z.ZodString;
/**
 * Body of `POST /api/projects/:engineProjectId/story` (202, idempotent on the revision). `footage` is absent for the
 * pure infographic; `resolution` defaults to `1080p`. The state is read back with GET project.
 */
export declare const VideoEngineStoryRequestSchema: z.ZodObject<{
    scenes: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    graphicHtml: z.ZodString;
    footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
    outro: z.ZodObject<{
        title: z.ZodString;
        line: z.ZodString;
    }, z.core.$strict>;
    resolution: z.ZodDefault<z.ZodEnum<{
        "480p": "480p";
        "720p": "720p";
        "1080p": "1080p";
    }>>;
    revision: z.ZodNumber;
}, z.core.$strict>;
export type VideoEngineStoryRequest = z.infer<typeof VideoEngineStoryRequestSchema>;
export type VideoEngineStoryRequestInput = z.input<typeof VideoEngineStoryRequestSchema>;
//# sourceMappingURL=story.d.ts.map