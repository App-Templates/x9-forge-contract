import { z } from 'zod';
import { CapabilityManifestSchema } from "../../capability/capability-manifest.js";
/**
 * GET /manifest — capability manifest discovery.
 * Direction: Forge factory-svc -> X9 capability services (or any -> cap-svc)
 * Auth: None (public discovery endpoint)
 * Requirement: HTTP-08
 *
 * Response is the CapabilityManifest schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl` (Docker hostname),
 * not by a path segment — each capability service mounts this route at root.
 */
export declare const capManifestContract: {
    readonly method: "GET";
    readonly path: "/manifest";
    readonly authType: "none";
    readonly responseSchema: z.ZodObject<{
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
};
export { CapabilityManifestSchema as CapManifestResponseSchema };
export type { CapabilityManifest as CapManifestResponse } from "../../capability/capability-manifest.js";
//# sourceMappingURL=cap-manifest.d.ts.map