import { z } from 'zod';
import { CapabilityToolSchema } from './capability-tool.js';

/**
 * Canonical cross-repo registry entry for a capability service.
 *
 * Stores structural location info (host, port, version). This is the shape
 * written by Forge's deploy.machine when it provisions an agent and by X9's
 * generate-registry script (Phase 1-02 onwards).
 *
 * - `tools`: optional. Present in X9-generated registries (pre-loaded from
 *   manifest). Absent in Forge-generated registries (discovery at runtime).
 *   X9 runtime must handle both cases; see registry.ts.
 * - `protocol`: defaults to 'http' when absent. Omit for http-only services
 *   to keep registry.json compact.
 *
 * Use `toEndpoint()` to derive the full URL for HTTP calls.
 * Use `fromEndpoint()` to parse a legacy endpoint URL into this shape.
 *
 * @see toEndpoint
 * @see fromEndpoint
 * @see CapabilityManifest — manifest returned by GET /:cap/manifest
 */
export const CapabilityRegistryEntrySchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  host: z.string().min(1),
  port: z.number().int().positive(),
  version: z.string().min(1),
  protocol: z.enum(['http', 'https']).optional(),
  tools: z.array(CapabilityToolSchema).optional(),
});

export type CapabilityRegistryEntry = z.infer<typeof CapabilityRegistryEntrySchema>;

// -- Helpers ------------------------------------------------------------------

/**
 * Derive the full endpoint URL from a registry entry.
 * Protocol defaults to 'http' when the field is absent.
 *
 * @example
 * toEndpoint({ host: 'cap-calendar', port: 3000, version: '1.0.0', enabled: true, name: 'calendar' })
 * // → 'http://cap-calendar:3000'
 */
export function toEndpoint(
  entry: Pick<CapabilityRegistryEntry, 'host' | 'port' | 'protocol'>
): string {
  return `${entry.protocol ?? 'http'}://${entry.host}:${entry.port}`;
}

/**
 * Parse a legacy endpoint URL string into CapabilityRegistryEntry fields.
 *
 * Protocol 'http' is omitted from the result (it is the default and its
 * absence keeps registry.json compact). Only 'https' is stored explicitly.
 *
 * @throws {TypeError} if `endpoint` is not a valid URL.
 *
 * @example
 * fromEndpoint('http://memory:3001', { name: 'memory', enabled: true, version: '1.0.0' })
 * // → { name: 'memory', enabled: true, host: 'memory', port: 3001, version: '1.0.0' }
 */
export function fromEndpoint(
  endpoint: string,
  meta: { name: string; enabled: boolean; version: string }
): CapabilityRegistryEntry {
  const url = new URL(endpoint);
  const port =
    url.port !== ''
      ? parseInt(url.port, 10)
      : url.protocol === 'https:' ? 443 : 80;
  return {
    name: meta.name,
    enabled: meta.enabled,
    version: meta.version,
    host: url.hostname,
    port,
    ...(url.protocol === 'https:' ? { protocol: 'https' as const } : {}),
  };
}
