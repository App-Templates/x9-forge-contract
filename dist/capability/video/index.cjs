"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRegiaErrorSchema = exports.VideoRegiaErrorCodeSchema = exports.VideoRegiaResultSchema = exports.VideoRegiaFileSchema = exports.VideoRegiaResultRequestSchema = exports.VideoRegiaOpenResponseSchema = exports.VideoRegiaIdSchema = exports.VideoRegiaRequestSchema = exports.VideoRegiaMaterialSchema = exports.VideoRegiaDocumentSchema = exports.VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES = exports.VIDEO_REGIA_GRAPHIC_FILE = exports.VIDEO_REGIA_FILE = exports.VideoEngineStoryRequestSchema = exports.VideoGraphicHtmlSchema = exports.VIDEO_GRAPHIC_HTML_MAX_CHARS = exports.VideoStoryOutroSchema = exports.VideoStoryScenesSchema = exports.VIDEO_STORY_MAX_SCENES = exports.VideoStorySceneSchema = exports.VideoStoryTagSchema = exports.VideoStoryResolutionSchema = exports.VideoFootageChoiceSchema = exports.VideoFootageIdSchema = exports.VideoProjectViewSchema = exports.VideoProjectStepSchema = exports.VideoProjectGetToolInputSchema = exports.VideoBriefToolInputSchema = exports.VideoEngineProjectSchema = exports.VideoEngineMediaPathSchema = exports.VideoEngineRunRequestSchema = exports.VideoEngineApproveRequestSchema = exports.VideoEnginePlanRequestSchema = exports.VideoEngineRevisionSchema = exports.VideoEngineApproveStageSchema = exports.VideoEngineRunStageSchema = exports.VideoProjectGetRequestSchema = exports.VideoEngineJobResponseSchema = exports.VideoEngineJobSchema = exports.VideoEngineSettingsSchema = exports.VideoProviderSchema = exports.VideoBriefResponseSchema = exports.VideoProjectStateSchema = exports.VideoProjectIdSchema = exports.VideoBriefRequestSchema = exports.VideoPresetIdSchema = exports.VideoModeSchema = void 0;
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
var brief_js_1 = require("./brief.cjs");
Object.defineProperty(exports, "VideoModeSchema", { enumerable: true, get: function () { return brief_js_1.VideoModeSchema; } });
Object.defineProperty(exports, "VideoPresetIdSchema", { enumerable: true, get: function () { return brief_js_1.VideoPresetIdSchema; } });
Object.defineProperty(exports, "VideoBriefRequestSchema", { enumerable: true, get: function () { return brief_js_1.VideoBriefRequestSchema; } });
Object.defineProperty(exports, "VideoProjectIdSchema", { enumerable: true, get: function () { return brief_js_1.VideoProjectIdSchema; } });
Object.defineProperty(exports, "VideoProjectStateSchema", { enumerable: true, get: function () { return brief_js_1.VideoProjectStateSchema; } });
Object.defineProperty(exports, "VideoBriefResponseSchema", { enumerable: true, get: function () { return brief_js_1.VideoBriefResponseSchema; } });
var engine_js_1 = require("./engine.cjs");
Object.defineProperty(exports, "VideoProviderSchema", { enumerable: true, get: function () { return engine_js_1.VideoProviderSchema; } });
Object.defineProperty(exports, "VideoEngineSettingsSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineSettingsSchema; } });
Object.defineProperty(exports, "VideoEngineJobSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineJobSchema; } });
Object.defineProperty(exports, "VideoEngineJobResponseSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineJobResponseSchema; } });
Object.defineProperty(exports, "VideoProjectGetRequestSchema", { enumerable: true, get: function () { return engine_js_1.VideoProjectGetRequestSchema; } });
Object.defineProperty(exports, "VideoEngineRunStageSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineRunStageSchema; } });
Object.defineProperty(exports, "VideoEngineApproveStageSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineApproveStageSchema; } });
Object.defineProperty(exports, "VideoEngineRevisionSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineRevisionSchema; } });
Object.defineProperty(exports, "VideoEnginePlanRequestSchema", { enumerable: true, get: function () { return engine_js_1.VideoEnginePlanRequestSchema; } });
Object.defineProperty(exports, "VideoEngineApproveRequestSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineApproveRequestSchema; } });
Object.defineProperty(exports, "VideoEngineRunRequestSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineRunRequestSchema; } });
Object.defineProperty(exports, "VideoEngineMediaPathSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineMediaPathSchema; } });
Object.defineProperty(exports, "VideoEngineProjectSchema", { enumerable: true, get: function () { return engine_js_1.VideoEngineProjectSchema; } });
var tools_js_1 = require("./tools.cjs");
Object.defineProperty(exports, "VideoBriefToolInputSchema", { enumerable: true, get: function () { return tools_js_1.VideoBriefToolInputSchema; } });
Object.defineProperty(exports, "VideoProjectGetToolInputSchema", { enumerable: true, get: function () { return tools_js_1.VideoProjectGetToolInputSchema; } });
Object.defineProperty(exports, "VideoProjectStepSchema", { enumerable: true, get: function () { return tools_js_1.VideoProjectStepSchema; } });
Object.defineProperty(exports, "VideoProjectViewSchema", { enumerable: true, get: function () { return tools_js_1.VideoProjectViewSchema; } });
var footage_js_1 = require("./footage.cjs");
Object.defineProperty(exports, "VideoFootageIdSchema", { enumerable: true, get: function () { return footage_js_1.VideoFootageIdSchema; } });
Object.defineProperty(exports, "VideoFootageChoiceSchema", { enumerable: true, get: function () { return footage_js_1.VideoFootageChoiceSchema; } });
var story_js_1 = require("./story.cjs");
Object.defineProperty(exports, "VideoStoryResolutionSchema", { enumerable: true, get: function () { return story_js_1.VideoStoryResolutionSchema; } });
Object.defineProperty(exports, "VideoStoryTagSchema", { enumerable: true, get: function () { return story_js_1.VideoStoryTagSchema; } });
Object.defineProperty(exports, "VideoStorySceneSchema", { enumerable: true, get: function () { return story_js_1.VideoStorySceneSchema; } });
Object.defineProperty(exports, "VIDEO_STORY_MAX_SCENES", { enumerable: true, get: function () { return story_js_1.VIDEO_STORY_MAX_SCENES; } });
Object.defineProperty(exports, "VideoStoryScenesSchema", { enumerable: true, get: function () { return story_js_1.VideoStoryScenesSchema; } });
Object.defineProperty(exports, "VideoStoryOutroSchema", { enumerable: true, get: function () { return story_js_1.VideoStoryOutroSchema; } });
Object.defineProperty(exports, "VIDEO_GRAPHIC_HTML_MAX_CHARS", { enumerable: true, get: function () { return story_js_1.VIDEO_GRAPHIC_HTML_MAX_CHARS; } });
Object.defineProperty(exports, "VideoGraphicHtmlSchema", { enumerable: true, get: function () { return story_js_1.VideoGraphicHtmlSchema; } });
Object.defineProperty(exports, "VideoEngineStoryRequestSchema", { enumerable: true, get: function () { return story_js_1.VideoEngineStoryRequestSchema; } });
var regia_js_1 = require("./regia.cjs");
Object.defineProperty(exports, "VIDEO_REGIA_FILE", { enumerable: true, get: function () { return regia_js_1.VIDEO_REGIA_FILE; } });
Object.defineProperty(exports, "VIDEO_REGIA_GRAPHIC_FILE", { enumerable: true, get: function () { return regia_js_1.VIDEO_REGIA_GRAPHIC_FILE; } });
Object.defineProperty(exports, "VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES", { enumerable: true, get: function () { return regia_js_1.VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES; } });
Object.defineProperty(exports, "VideoRegiaDocumentSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaDocumentSchema; } });
Object.defineProperty(exports, "VideoRegiaMaterialSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaMaterialSchema; } });
Object.defineProperty(exports, "VideoRegiaRequestSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaRequestSchema; } });
Object.defineProperty(exports, "VideoRegiaIdSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaIdSchema; } });
Object.defineProperty(exports, "VideoRegiaOpenResponseSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaOpenResponseSchema; } });
Object.defineProperty(exports, "VideoRegiaResultRequestSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaResultRequestSchema; } });
Object.defineProperty(exports, "VideoRegiaFileSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaFileSchema; } });
Object.defineProperty(exports, "VideoRegiaResultSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaResultSchema; } });
Object.defineProperty(exports, "VideoRegiaErrorCodeSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaErrorCodeSchema; } });
Object.defineProperty(exports, "VideoRegiaErrorSchema", { enumerable: true, get: function () { return regia_js_1.VideoRegiaErrorSchema; } });
//# sourceMappingURL=index.js.map