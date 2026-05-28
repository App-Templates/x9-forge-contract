/**
 * HTTP domain — typed bridge client and response shapes for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/http
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
export { BridgeErrorResponseSchema, BridgeSuccessResponseSchema, BridgeResponseSchema, } from "./response.cjs";
export type { BridgeErrorResponse, BridgeSuccessResponse, BridgeResponse, } from "./response.cjs";
export { createBridgeClient, BridgeHttpError, } from "./bridge-client.cjs";
export type { AuthForEndpoint, BridgeClientConfig, BridgeRequestOptions, BridgeClient, BaseBridgeClient, SecretBridgeClient, TokenBridgeClient, NoAuthBridgeClient, } from "./bridge-client.cjs";
export type { EndpointContract } from "./endpoint-contract.cjs";
export * from "./endpoints/index.cjs";
export { SseTextFrameSchema, SseToolCallStartFrameSchema, SseToolCallEndFrameSchema, SseDoneFrameSchema, SseErrorFrameSchema, SseAbortedFrameSchema, SseFrameSchema, } from "./sse-frames.cjs";
export type { SseTextFrame, SseToolCallStartFrame, SseToolCallEndFrame, SseDoneFrame, SseErrorFrame, SseAbortedFrame, SseFrame, } from "./sse-frames.cjs";
export { parseSseFrame, parseSseStream } from "./sse-parser.cjs";
export type { ParsedSseEvent } from "./sse-parser.cjs";
//# sourceMappingURL=index.d.ts.map