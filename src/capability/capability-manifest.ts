import { z } from 'zod';
import { CapabilityToolSchema } from './capability-tool.js';

/**
 * Manifest served by each capability service at GET /manifest
 * (capability identity is conveyed by the caller's baseUrl, not a path prefix).
 *
 * - `endpoint`: full URL as reported by the service itself (e.g. "http://cap-calendar:3000").
 *   Reflects Docker hostname + port. Used by X9 generate-registry to seed CapabilityRegistryEntry.
 * - `serviceName`: Docker hostname added by Forge X9Client.discoverCapabilities() at discovery
 *   time. Absent when the manifest is served directly by the capability itself.
 * - `tools`: list of tools the capability exposes. Used by X9 at boot to build tool definitions.
 */
export const CapabilityManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  endpoint: z.string().min(1),
  serviceName: z.string().min(1).optional(),
  tools: z.array(CapabilityToolSchema),
  /**
   * Capability names this service depends on at runtime (HTTP).
   * agent-core validates at boot: every entry here must be present AND
   * enabled in the registry — fail-fast on config drift.
   *
   * Optional for backward-compat (pre-v1.5.0 manifests omit entirely).
   * Empty array [] is valid explicit "zero runtime deps".
   *
   * @since v1.5.0 (Bug D1 — quick-260422-wrz)
   */
  requires: z.array(z.string().min(1)).optional(),
});

export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;
