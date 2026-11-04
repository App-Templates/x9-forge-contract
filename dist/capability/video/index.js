/**
 * cap-video contracts — sub-path `@x9-forge/contracts/capability/video`.
 *
 * Approved briefs, decided engine jobs and project reads scoped to one tenant, owner and agent.
 * The TypeScript facade resolves presets, budgets and production settings before calling the engine.
 *
 * Consumers (planned): agent-x9 services/cap-video (facade), Officina video engine (project creation).
 *
 * Strict internal boundary (R-14): unknown fields are rejected.
 */
export { VideoModeSchema, VideoPresetIdSchema, VideoBriefRequestSchema, VideoProjectIdSchema, VideoProjectStateSchema, VideoBriefResponseSchema, } from "./brief.js";
export { VideoProviderSchema, VideoEngineSettingsSchema, VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoProjectGetRequestSchema, VideoEngineRunStageSchema, VideoEngineApproveStageSchema, VideoEngineRevisionSchema, VideoEnginePlanRequestSchema, VideoEngineApproveRequestSchema, VideoEngineRunRequestSchema, VideoEngineMediaPathSchema, VideoEngineProjectSchema, } from "./engine.js";
export { VideoBriefToolInputSchema, VideoProjectGetToolInputSchema, VideoProjectStepSchema, VideoProjectViewSchema, } from "./tools.js";
export { VideoFootageIdSchema, VideoFootageChoiceSchema, } from "./footage.js";
export { VideoStoryResolutionSchema, VideoStoryTagSchema, VideoStorySceneSchema, VIDEO_STORY_MAX_SCENES, VideoStoryScenesSchema, VideoStoryOutroSchema, VIDEO_GRAPHIC_HTML_MAX_CHARS, VideoGraphicHtmlSchema, VideoEngineStoryRequestSchema, } from "./story.js";
export { VIDEO_REGIA_FILE, VIDEO_REGIA_GRAPHIC_FILE, VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES, VideoRegiaDocumentSchema, VideoRegiaMaterialSchema, VideoRegiaRequestSchema, VideoRegiaIdSchema, VideoRegiaOpenResponseSchema, VideoRegiaResultRequestSchema, VideoRegiaFileSchema, VideoRegiaResultSchema, VideoRegiaErrorCodeSchema, VideoRegiaErrorSchema, } from "./regia.js";
//# sourceMappingURL=index.js.map