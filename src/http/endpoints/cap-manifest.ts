import { CapabilityManifestSchema } from '../../capability/capability-manifest.js';

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

export const capManifestContract = {
  method: 'GET' as const,
  path: '/manifest' as const,
  authType: 'none' as const,
  responseSchema: CapabilityManifestSchema,
} as const;

export { CapabilityManifestSchema as CapManifestResponseSchema };
export type { CapabilityManifest as CapManifestResponse } from '../../capability/capability-manifest.js';
