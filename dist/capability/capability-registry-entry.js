import { z } from 'zod';
import { CapabilityToolSchema } from "./capability-tool.js";
import { ModelPolicySchema } from "../model-router/model-policy.js";
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
 * - `modelPolicy`: optional. Added in Phase 6 (MDRT-04). Consumer defaults
 *   to { min: 'standard', max: 'standard' } when absent. See
 *   @x9-forge/contracts/model-router.
 *
 * Use `toEndpoint()` to derive the full URL for HTTP calls.
 * Use `fromEndpoint()` to parse a legacy endpoint URL into this shape.
 *
 * @see toEndpoint
 * @see fromEndpoint
 * @see CapabilityManifest — manifest returned by GET /manifest
 */
export const CapabilityRegistryEntrySchema = z.object({
    name: z.string().min(1),
    enabled: z.boolean(),
    host: z.string().min(1),
    port: z.number().int().positive(),
    version: z.string().min(1),
    protocol: z.enum(['http', 'https']).optional(),
    tools: z.array(CapabilityToolSchema).optional(),
    /**
     * Optional Model Router policy — capability-scoped tier bound.
     *
     * Consumer MUST default to `{ min: 'standard', max: 'standard' }` when
     * absent (D-24). The bridge does NOT supply a runtime default — that is
     * intentionally a consumer decision to force an explicit fallback.
     *
     * Backward compat (D-23): entries without `modelPolicy` continue to parse
     * green. This field is a non-breaking extension added in Phase 6.
     *
     * @see @x9-forge/contracts/model-router (ModelPolicySchema)
     * @see CONTEXT D-23, D-24 (MDRT-04)
     */
    modelPolicy: ModelPolicySchema.optional(),
    /**
     * Capability names this service depends on at runtime (HTTP).
     * agent-core validates at boot: every entry here must be present AND
     * enabled in the registry — fail-fast on config drift.
     *
     * Optional for backward-compat (pre-v1.5.0 entries omit entirely).
     * Empty array [] is valid explicit "zero runtime deps".
     *
     * @since v1.5.0 (Bug D1 — quick-260422-wrz)
     */
    requires: z.array(z.string().min(1)).optional(),
});
// -- Helpers ------------------------------------------------------------------
/**
 * Derive the full endpoint URL from a registry entry.
 * Protocol defaults to 'http' when the field is absent.
 *
 * @example
 * toEndpoint({ host: 'cap-calendar', port: 3000, version: '1.0.0', enabled: true, name: 'calendar' })
 * // → 'http://cap-calendar:3000'
 */
export function toEndpoint(entry) {
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
export function fromEndpoint(endpoint, meta) {
    const url = new URL(endpoint);
    const port = url.port !== ''
        ? parseInt(url.port, 10)
        : url.protocol === 'https:' ? 443 : 80;
    return {
        name: meta.name,
        enabled: meta.enabled,
        version: meta.version,
        host: url.hostname,
        port,
        ...(url.protocol === 'https:' ? { protocol: 'https' } : {}),
    };
}
//# sourceMappingURL=capability-registry-entry.js.map