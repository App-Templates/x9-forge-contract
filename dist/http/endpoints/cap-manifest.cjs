"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapManifestResponseSchema = exports.capManifestContract = void 0;
const capability_manifest_js_1 = require("../../capability/capability-manifest.cjs");
Object.defineProperty(exports, "CapManifestResponseSchema", { enumerable: true, get: function () { return capability_manifest_js_1.CapabilityManifestSchema; } });
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
exports.capManifestContract = {
    method: 'GET',
    path: '/manifest',
    authType: 'none',
    responseSchema: capability_manifest_js_1.CapabilityManifestSchema,
};
//# sourceMappingURL=cap-manifest.js.map