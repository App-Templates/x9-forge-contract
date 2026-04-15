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
} from './bridge-client.js';

// Endpoint contract type
export type { EndpointContract } from './endpoint-contract.js';

// All endpoint contracts (request/response schemas + contract metadata)
export * from './endpoints/index.js';
