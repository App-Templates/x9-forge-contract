"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityManifestSchema = void 0;
const zod_1 = require("zod");
const capability_tool_js_1 = require("./capability-tool.cjs");
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
exports.CapabilityManifestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    endpoint: zod_1.z.string().min(1),
    serviceName: zod_1.z.string().min(1).optional(),
    tools: zod_1.z.array(capability_tool_js_1.CapabilityToolSchema),
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
    requires: zod_1.z.array(zod_1.z.string().min(1)).optional(),
});
//# sourceMappingURL=capability-manifest.js.map