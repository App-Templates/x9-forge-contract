import { CapabilityManifestSchema } from '../../capability/capability-manifest.js';

/**
 * GET /:cap/manifest — capability manifest discovery.
 * Direction: Forge factory-svc -> X9 capability services (or any -> cap-svc)
 * Auth: None (public discovery endpoint)
 * Requirement: HTTP-08
 *
 * Response is the CapabilityManifest schema (already defined in Phase 1).
 * The `:cap` path segment is the Docker hostname of the capability service.
 */

export const capManifestContract = {
  method: 'GET' as const,
  path: '/:cap/manifest' as const,
  authType: 'none' as const,
  responseSchema: CapabilityManifestSchema,
} as const;

export { CapabilityManifestSchema as CapManifestResponseSchema };
export type { CapabilityManifest as CapManifestResponse } from '../../capability/capability-manifest.js';
