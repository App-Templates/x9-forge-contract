/**
 * HTTP domain — typed bridge client and response shapes for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/http
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */

// Response shapes
export {
  BridgeErrorResponseSchema,
  BridgeSuccessResponseSchema,
  BridgeResponseSchema,
} from './response.js';
export type {
  BridgeErrorResponse,
  BridgeSuccessResponse,
  BridgeResponse,
} from './response.js';

// Bridge client
export {
  createBridgeClient,
  BridgeHttpError,
} from './bridge-client.js';
export type {
  AuthForEndpoint,
  BridgeClientConfig,
  BridgeRequestOptions,
  BridgeClient,
  BaseBridgeClient,
  SecretBridgeClient,
  TokenBridgeClient,
} from './bridge-client.js';

// Endpoint contract type
export type { EndpointContract } from './endpoint-contract.js';

// All endpoint contracts (request/response schemas + contract metadata)
export * from './endpoints/index.js';

// SSE frame shapes for /internal/turn/stream
export {
  SseTextFrameSchema,
  SseToolCallStartFrameSchema,
  SseToolCallEndFrameSchema,
  SseDoneFrameSchema,
  SseErrorFrameSchema,
  SseAbortedFrameSchema,
  SseFrameSchema,
} from './sse-frames.js';
export type {
  SseTextFrame,
  SseToolCallStartFrame,
  SseToolCallEndFrame,
  SseDoneFrame,
  SseErrorFrame,
  SseAbortedFrame,
  SseFrame,
} from './sse-frames.js';

// SSE parser helpers
export { parseSseFrame, parseSseStream } from './sse-parser.js';
export type { ParsedSseEvent } from './sse-parser.js';
