// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (`z.ZodObject<...>` named ref instead of synthesized `import("zod").ZodObject<...>`). See scripts/check-portable-dts.mjs (v1.6.3 fix, commit 6df26a1, Phase 19-00).
import { z } from 'zod';
import { HealthStatusSchema } from '../../capability/health-status.js';

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
  method: 'GET' as const,
  path: '/health' as const,
  authType: 'none' as const,
  responseSchema: HealthStatusSchema,
} as const;

export { HealthStatusSchema as CapHealthResponseSchema };
export type { HealthStatus as CapHealthResponse } from '../../capability/health-status.js';
