/**
 * Auth domain — discriminated auth header types for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/auth
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
// Header literal types + Zod schemas
export { INTERNAL_SECRET_HEADER, INTERNAL_TOKEN_HEADER, AuthInternalSecretSchema, AuthInternalTokenSchema, } from "./auth-headers.js";
// Device-signed requests (phase 59)
export { DEVICE_SIGNATURE_DOMAIN, DEVICE_MAX_SKEW_SEC, DEVICE_ID_HEADER, DEVICE_TIMESTAMP_HEADER, DEVICE_NONCE_HEADER, DEVICE_SIGNATURE_HEADER, DeviceIdSchema, DeviceTimestampSchema, DeviceNonceSchema, DeviceSignatureSchema, AuthDeviceSignatureSchema, DeviceRequestPartsSchema, canonicalDeviceRequest, deviceTimestampInWindow, } from "./device-signature.js";
//# sourceMappingURL=index.js.map