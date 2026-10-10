/**
 * HTTP domain — typed bridge client and response shapes for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/http
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
export { BridgeErrorResponseSchema, BridgeSuccessResponseSchema, BridgeResponseSchema, } from "./response.js";
export type { BridgeErrorResponse, BridgeSuccessResponse, BridgeResponse, } from "./response.js";
export { createBridgeClient, BridgeHttpError, } from "./bridge-client.js";
export type { AuthForEndpoint, BridgeClientConfig, BridgeRequestOptions, BridgeClient, BaseBridgeClient, SecretBridgeClient, TokenBridgeClient, NoAuthBridgeClient, } from "./bridge-client.js";
export type { EndpointContract } from "./endpoint-contract.js";
export * from "./endpoints/index.js";
export { SseTextFrameSchema, SseToolCallStartFrameSchema, SseToolCallEndFrameSchema, SseDoneFrameSchema, SseErrorFrameSchema, SseAbortedFrameSchema, SseFrameSchema, } from "./sse-frames.js";
export type { SseTextFrame, SseToolCallStartFrame, SseToolCallEndFrame, SseDoneFrame, SseErrorFrame, SseAbortedFrame, SseFrame, } from "./sse-frames.js";
export { parseSseFrame, parseSseStream } from "./sse-parser.js";
export type { ParsedSseEvent } from "./sse-parser.js";
export { capToolCallContract, capToolCallPath, CapToolCallParamsSchema } from "./endpoints/cap-tool-call.js";
export * from "./endpoints/forge-elevenlabs-web.js";
export * from "./endpoints/internal-agent-channel-history-content.js";
export * from "./endpoints/forge-agent-channel-history-content.js";
//# sourceMappingURL=index.d.ts.map