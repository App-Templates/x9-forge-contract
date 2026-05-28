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
export const capHealthContract = {
    method: 'GET',
    path: '/health',
    authType: 'none',
    responseSchema: HealthStatusSchema,
};
export { HealthStatusSchema as CapHealthResponseSchema };
//# sourceMappingURL=cap-health.js.map