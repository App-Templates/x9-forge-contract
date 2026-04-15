/**
 * Auth domain — discriminated auth header types for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/auth
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */

// Header literal types + Zod schemas
export {
  INTERNAL_SECRET_HEADER,
  INTERNAL_TOKEN_HEADER,
  AuthInternalSecretSchema,
  AuthInternalTokenSchema,
} from './auth-headers.js';
export type {
  AuthInternalSecret,
  AuthInternalToken,
  AuthNone,
  AuthHeaders,
  EndpointAuthType,
} from './auth-headers.js';
