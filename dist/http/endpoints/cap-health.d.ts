import { z } from 'zod';
import { HealthStatusSchema } from "../../capability/health-status.js";
/**
 * GET /health — capability health check.
 * Direction: Forge factory-svc -> X9 capability services
 * Auth: None
 * Requirement: HTTP-10
 *
 * Response is the HealthStatus schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 */
export declare const capHealthContract: {
    readonly method: "GET";
    readonly path: "/health";
    readonly authType: "none";
    readonly responseSchema: z.ZodObject<{
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
};
export { HealthStatusSchema as CapHealthResponseSchema };
export type { HealthStatus as CapHealthResponse } from "../../capability/health-status.js";
//# sourceMappingURL=cap-health.d.ts.map