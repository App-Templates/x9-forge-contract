/**
 * HTTP domain — typed bridge client and response shapes for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/http
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
// Response shapes
export { BridgeErrorResponseSchema, BridgeSuccessResponseSchema, BridgeResponseSchema, } from "./response.js";
// Bridge client
export { createBridgeClient, BridgeHttpError, } from "./bridge-client.js";
// All endpoint contracts (request/response schemas + contract metadata)
export * from "./endpoints/index.js";
// SSE frame shapes for /internal/turn/stream
export { SseTextFrameSchema, SseToolCallStartFrameSchema, SseToolCallEndFrameSchema, SseDoneFrameSchema, SseErrorFrameSchema, SseAbortedFrameSchema, SseFrameSchema, } from "./sse-frames.js";
// SSE parser helpers
export { parseSseFrame, parseSseStream } from "./sse-parser.js";
//# sourceMappingURL=index.js.map