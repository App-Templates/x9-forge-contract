"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapEnvSchemaResponseSchema = exports.capEnvSchemaContract = void 0;
const env_schema_js_1 = require("../../capability/env-schema.cjs");
Object.defineProperty(exports, "CapEnvSchemaResponseSchema", { enumerable: true, get: function () { return env_schema_js_1.EnvSchemaDocSchema; } });
/**
 * GET /env-schema — capability env schema discovery.
 * Direction: Forge factory-svc -> X9 capability services
 * Auth: None
 * Requirement: HTTP-09
 *
 * Response is the EnvSchemaDoc schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 */
exports.capEnvSchemaContract = {
    method: 'GET',
    path: '/env-schema',
    authType: 'none',
    responseSchema: env_schema_js_1.EnvSchemaDocSchema,
};
//# sourceMappingURL=cap-env-schema.js.map