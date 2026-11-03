"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoBriefResponseSchema = exports.VideoProjectStateSchema = exports.VideoProjectIdSchema = exports.VideoBriefRequestSchema = exports.VideoPresetIdSchema = exports.VideoModeSchema = void 0;
/**
 * cap-video contracts — sub-path `@x9-forge/contracts/capability/video`.
 *
 * Approved video briefs and project creation responses scoped to one tenant, owner and agent.
 * Presets, providers and business units remain consumer choices.
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
//# sourceMappingURL=index.js.map