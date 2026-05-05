import { z } from 'zod';
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
export declare const CapabilityRegistryEntrySchema: z.ZodObject<{
    name: z.ZodString;
    enabled: z.ZodBoolean;
    host: z.ZodString;
    port: z.ZodNumber;
    version: z.ZodString;
    protocol: z.ZodOptional<z.ZodEnum<{
        http: "http";
        https: "https";
    }>>;
    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>>;
    modelPolicy: z.ZodOptional<z.ZodObject<{
        min: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>;
        max: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>;
    }, z.core.$strip>>;
    requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CapabilityRegistryEntry = z.infer<typeof CapabilityRegistryEntrySchema>;
/**
 * Derive the full endpoint URL from a registry entry.
 * Protocol defaults to 'http' when the field is absent.
 *
 * @example
 * toEndpoint({ host: 'cap-calendar', port: 3000, version: '1.0.0', enabled: true, name: 'calendar' })
 * // → 'http://cap-calendar:3000'
 */
export declare function toEndpoint(entry: Pick<CapabilityRegistryEntry, 'host' | 'port' | 'protocol'>): string;
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
export declare function fromEndpoint(endpoint: string, meta: {
    name: string;
    enabled: boolean;
    version: string;
}): CapabilityRegistryEntry;
//# sourceMappingURL=capability-registry-entry.d.ts.map