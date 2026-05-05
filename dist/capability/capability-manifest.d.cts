import { z } from 'zod';
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
export declare const CapabilityManifestSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    endpoint: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>;
    requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;
//# sourceMappingURL=capability-manifest.d.ts.map