"use strict";
/**
 * Auth domain — discriminated auth header types for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/auth
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTimestampInWindow = exports.canonicalDeviceRequest = exports.DeviceRequestPartsSchema = exports.AuthDeviceSignatureSchema = exports.DeviceSignatureSchema = exports.DeviceNonceSchema = exports.DeviceTimestampSchema = exports.DeviceIdSchema = exports.DEVICE_SIGNATURE_HEADER = exports.DEVICE_NONCE_HEADER = exports.DEVICE_TIMESTAMP_HEADER = exports.DEVICE_ID_HEADER = exports.DEVICE_MAX_SKEW_SEC = exports.DEVICE_SIGNATURE_DOMAIN = exports.AuthInternalTokenSchema = exports.AuthInternalSecretSchema = exports.INTERNAL_TOKEN_HEADER = exports.INTERNAL_SECRET_HEADER = void 0;
// Header literal types + Zod schemas
var auth_headers_js_1 = require("./auth-headers.cjs");
Object.defineProperty(exports, "INTERNAL_SECRET_HEADER", { enumerable: true, get: function () { return auth_headers_js_1.INTERNAL_SECRET_HEADER; } });
Object.defineProperty(exports, "INTERNAL_TOKEN_HEADER", { enumerable: true, get: function () { return auth_headers_js_1.INTERNAL_TOKEN_HEADER; } });
Object.defineProperty(exports, "AuthInternalSecretSchema", { enumerable: true, get: function () { return auth_headers_js_1.AuthInternalSecretSchema; } });
Object.defineProperty(exports, "AuthInternalTokenSchema", { enumerable: true, get: function () { return auth_headers_js_1.AuthInternalTokenSchema; } });
// Device-signed requests (phase 59)
var device_signature_js_1 = require("./device-signature.cjs");
Object.defineProperty(exports, "DEVICE_SIGNATURE_DOMAIN", { enumerable: true, get: function () { return device_signature_js_1.DEVICE_SIGNATURE_DOMAIN; } });
Object.defineProperty(exports, "DEVICE_MAX_SKEW_SEC", { enumerable: true, get: function () { return device_signature_js_1.DEVICE_MAX_SKEW_SEC; } });
Object.defineProperty(exports, "DEVICE_ID_HEADER", { enumerable: true, get: function () { return device_signature_js_1.DEVICE_ID_HEADER; } });
Object.defineProperty(exports, "DEVICE_TIMESTAMP_HEADER", { enumerable: true, get: function () { return device_signature_js_1.DEVICE_TIMESTAMP_HEADER; } });
Object.defineProperty(exports, "DEVICE_NONCE_HEADER", { enumerable: true, get: function () { return device_signature_js_1.DEVICE_NONCE_HEADER; } });
Object.defineProperty(exports, "DEVICE_SIGNATURE_HEADER", { enumerable: true, get: function () { return device_signature_js_1.DEVICE_SIGNATURE_HEADER; } });
Object.defineProperty(exports, "DeviceIdSchema", { enumerable: true, get: function () { return device_signature_js_1.DeviceIdSchema; } });
Object.defineProperty(exports, "DeviceTimestampSchema", { enumerable: true, get: function () { return device_signature_js_1.DeviceTimestampSchema; } });
Object.defineProperty(exports, "DeviceNonceSchema", { enumerable: true, get: function () { return device_signature_js_1.DeviceNonceSchema; } });
Object.defineProperty(exports, "DeviceSignatureSchema", { enumerable: true, get: function () { return device_signature_js_1.DeviceSignatureSchema; } });
Object.defineProperty(exports, "AuthDeviceSignatureSchema", { enumerable: true, get: function () { return device_signature_js_1.AuthDeviceSignatureSchema; } });
Object.defineProperty(exports, "DeviceRequestPartsSchema", { enumerable: true, get: function () { return device_signature_js_1.DeviceRequestPartsSchema; } });
Object.defineProperty(exports, "canonicalDeviceRequest", { enumerable: true, get: function () { return device_signature_js_1.canonicalDeviceRequest; } });
Object.defineProperty(exports, "deviceTimestampInWindow", { enumerable: true, get: function () { return device_signature_js_1.deviceTimestampInWindow; } });
//# sourceMappingURL=index.js.map