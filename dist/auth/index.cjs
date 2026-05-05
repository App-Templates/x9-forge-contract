"use strict";
/**
 * Auth domain — discriminated auth header types for cross-repo HTTP calls.
 *
 * @module @x9-forge/contracts/auth
 * @see .planning/phases/03-auth-headers-discriminated-block-c/03-RESEARCH.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthInternalTokenSchema = exports.AuthInternalSecretSchema = exports.INTERNAL_TOKEN_HEADER = exports.INTERNAL_SECRET_HEADER = void 0;
// Header literal types + Zod schemas
var auth_headers_js_1 = require("./auth-headers.cjs");
Object.defineProperty(exports, "INTERNAL_SECRET_HEADER", { enumerable: true, get: function () { return auth_headers_js_1.INTERNAL_SECRET_HEADER; } });
Object.defineProperty(exports, "INTERNAL_TOKEN_HEADER", { enumerable: true, get: function () { return auth_headers_js_1.INTERNAL_TOKEN_HEADER; } });
Object.defineProperty(exports, "AuthInternalSecretSchema", { enumerable: true, get: function () { return auth_headers_js_1.AuthInternalSecretSchema; } });
Object.defineProperty(exports, "AuthInternalTokenSchema", { enumerable: true, get: function () { return auth_headers_js_1.AuthInternalTokenSchema; } });
//# sourceMappingURL=index.js.map