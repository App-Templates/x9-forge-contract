"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapHealthResponseSchema = exports.capHealthContract = void 0;
const health_status_js_1 = require("../../capability/health-status.cjs");
Object.defineProperty(exports, "CapHealthResponseSchema", { enumerable: true, get: function () { return health_status_js_1.HealthStatusSchema; } });
/**
 * GET /health — capability health check.
 * Direction: Forge factory-svc -> X9 capability services
 * Auth: None
 * Requirement: HTTP-10
 *
 * Response is the HealthStatus schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 */
exports.capHealthContract = {
    method: 'GET',
    path: '/health',
    authType: 'none',
    responseSchema: health_status_js_1.HealthStatusSchema,
};
//# sourceMappingURL=cap-health.js.map