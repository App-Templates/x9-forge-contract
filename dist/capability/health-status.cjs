"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatusSchema = void 0;
const zod_1 = require("zod");
/**
 * Health check response returned by GET /health on every service
 * (capability identity is conveyed by the caller's baseUrl, not a path prefix).
 *
 * - `status`: coarse-grained liveness signal.
 *   - `healthy`: all subsystems nominal.
 *   - `degraded`: service is running but a non-critical subsystem has issues.
 *   - `down`: service is not operational.
 * - `checks`: optional fine-grained per-subsystem status map (e.g. `{ db: 'ok', cache: 'error' }`).
 * - `uptime`: seconds since process start.
 * - `timestamp`: ISO 8601 timestamp of when this response was generated.
 */
exports.HealthStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['healthy', 'degraded', 'down']),
    service: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    uptime: zod_1.z.number().nonnegative(),
    timestamp: zod_1.z.string().min(1),
    checks: zod_1.z.record(zod_1.z.string(), zod_1.z.enum(['ok', 'error'])).optional(),
});
//# sourceMappingURL=health-status.js.map