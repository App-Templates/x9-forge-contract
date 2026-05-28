"use strict";
/**
 * HTTP domain — typed bridge client and response shapes for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/http
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSseStream = exports.parseSseFrame = exports.SseFrameSchema = exports.SseAbortedFrameSchema = exports.SseErrorFrameSchema = exports.SseDoneFrameSchema = exports.SseToolCallEndFrameSchema = exports.SseToolCallStartFrameSchema = exports.SseTextFrameSchema = exports.BridgeHttpError = exports.createBridgeClient = exports.BridgeResponseSchema = exports.BridgeSuccessResponseSchema = exports.BridgeErrorResponseSchema = void 0;
// Response shapes
var response_js_1 = require("./response.cjs");
Object.defineProperty(exports, "BridgeErrorResponseSchema", { enumerable: true, get: function () { return response_js_1.BridgeErrorResponseSchema; } });
Object.defineProperty(exports, "BridgeSuccessResponseSchema", { enumerable: true, get: function () { return response_js_1.BridgeSuccessResponseSchema; } });
Object.defineProperty(exports, "BridgeResponseSchema", { enumerable: true, get: function () { return response_js_1.BridgeResponseSchema; } });
// Bridge client
var bridge_client_js_1 = require("./bridge-client.cjs");
Object.defineProperty(exports, "createBridgeClient", { enumerable: true, get: function () { return bridge_client_js_1.createBridgeClient; } });
Object.defineProperty(exports, "BridgeHttpError", { enumerable: true, get: function () { return bridge_client_js_1.BridgeHttpError; } });
// All endpoint contracts (request/response schemas + contract metadata)
__exportStar(require("./endpoints/index.cjs"), exports);
// SSE frame shapes for /internal/turn/stream
var sse_frames_js_1 = require("./sse-frames.cjs");
Object.defineProperty(exports, "SseTextFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseTextFrameSchema; } });
Object.defineProperty(exports, "SseToolCallStartFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseToolCallStartFrameSchema; } });
Object.defineProperty(exports, "SseToolCallEndFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseToolCallEndFrameSchema; } });
Object.defineProperty(exports, "SseDoneFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseDoneFrameSchema; } });
Object.defineProperty(exports, "SseErrorFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseErrorFrameSchema; } });
Object.defineProperty(exports, "SseAbortedFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseAbortedFrameSchema; } });
Object.defineProperty(exports, "SseFrameSchema", { enumerable: true, get: function () { return sse_frames_js_1.SseFrameSchema; } });
// SSE parser helpers
var sse_parser_js_1 = require("./sse-parser.cjs");
Object.defineProperty(exports, "parseSseFrame", { enumerable: true, get: function () { return sse_parser_js_1.parseSseFrame; } });
Object.defineProperty(exports, "parseSseStream", { enumerable: true, get: function () { return sse_parser_js_1.parseSseStream; } });
//# sourceMappingURL=index.js.map