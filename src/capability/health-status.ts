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
export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'down']),
  service: z.string().min(1),
  version: z.string().min(1),
  uptime: z.number().nonnegative(),
  timestamp: z.string().min(1),
  checks: z.record(z.string(), z.enum(['ok', 'error'])).optional(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
