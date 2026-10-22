import { z } from 'zod';
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
export declare const HealthStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        healthy: "healthy";
        degraded: "degraded";
        down: "down";
    }>;
    service: z.ZodString;
    version: z.ZodString;
    uptime: z.ZodNumber;
    timestamp: z.ZodString;
    checks: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
        error: "error";
        ok: "ok";
    }>>>;
}, z.core.$strip>;
export type HealthStatus = z.infer<typeof HealthStatusSchema>;
//# sourceMappingURL=health-status.d.ts.map