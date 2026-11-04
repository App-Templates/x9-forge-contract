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
export { VideoModeSchema, VideoPresetIdSchema, VideoBriefRequestSchema, VideoProjectIdSchema, VideoProjectStateSchema, VideoBriefResponseSchema, type VideoMode, type VideoPresetId, type VideoBriefRequest, type VideoProjectId, type VideoProjectState, type VideoBriefResponse, } from "./brief.cjs";
export { VideoProviderSchema, VideoEngineSettingsSchema, VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoProjectGetRequestSchema, type VideoProvider, type VideoEngineSettings, type VideoEngineJob, type VideoEngineJobResponse, type VideoProjectGetRequest, VideoEngineRunStageSchema, VideoEngineApproveStageSchema, VideoEngineRevisionSchema, VideoEnginePlanRequestSchema, VideoEngineApproveRequestSchema, VideoEngineRunRequestSchema, VideoEngineMediaPathSchema, VideoEngineProjectSchema, type VideoEngineRunStage, type VideoEngineApproveStage, type VideoEngineApproveRequest, type VideoEngineRunRequest, type VideoEngineProject, } from "./engine.cjs";
export { VideoBriefToolInputSchema, VideoProjectGetToolInputSchema, VideoProjectStepSchema, VideoProjectViewSchema, type VideoBriefToolInput, type VideoProjectGetToolInput, type VideoProjectStep, type VideoProjectView, } from "./tools.cjs";
export { VideoFootageIdSchema, VideoFootageChoiceSchema, type VideoFootageId, type VideoFootageChoice, } from "./footage.cjs";
export { VideoStoryResolutionSchema, VideoStoryTagSchema, VideoStorySceneSchema, VIDEO_STORY_MAX_SCENES, VideoStoryScenesSchema, VideoStoryOutroSchema, VIDEO_GRAPHIC_HTML_MAX_CHARS, VideoGraphicHtmlSchema, VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema, type VideoEngineStoryEstimate, type VideoStoryResolution, type VideoStoryScene, type VideoStoryOutro, type VideoEngineStoryRequest, type VideoEngineStoryRequestInput, } from "./story.cjs";
export { VIDEO_REGIA_FILE, VIDEO_REGIA_GRAPHIC_FILE, VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES, VideoRegiaDocumentSchema, VideoRegiaMaterialSchema, VideoRegiaRequestSchema, VideoRegiaIdSchema, VideoRegiaOpenResponseSchema, VideoRegiaResultRequestSchema, VideoRegiaFileSchema, VideoRegiaResultSchema, VideoRegiaErrorCodeSchema, VideoRegiaErrorSchema, type VideoRegiaDocument, type VideoRegiaMaterial, type VideoRegiaRequest, type VideoRegiaOpenResponse, type VideoRegiaResultRequest, type VideoRegiaFile, type VideoRegiaResult, type VideoRegiaError, } from "./regia.cjs";
//# sourceMappingURL=index.d.ts.map