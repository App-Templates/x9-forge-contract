import { z } from 'zod';
import { readDevSessionAssetContract } from './internal-dev-session-asset-content.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { AssetOriginSchema, AssetRefSchema } from '../../organization/asset.js';

export const DEV_DELIVERY_LINKS_MAX_PATHS = 12;
export const DEV_DELIVERY_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const DeliveryPathSchema = AssetOriginSchema.options[2].shape.path.unwrap()
  .refine((path) => !/\s/.test(path), 'Delivery path must contain no whitespace');

const hasDistinct = (values: readonly string[]): boolean => new Set(values).size === values.length;

const DevDeliveryBundleFileNameSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}\.zip$/);

const DevDeliveryBundleRequestSchema = z.strictObject({
  fileName: DevDeliveryBundleFileNameSchema,
  paths: z.array(DeliveryPathSchema).min(1).max(DEV_DELIVERY_LINKS_MAX_PATHS),
});

/** Transport request only; session authorization and file lookup belong to the service. */
export const DevDeliveryLinksRequestSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  deliveryRef: AssetRefSchema,
  paths: z.array(DeliveryPathSchema).min(1).max(DEV_DELIVERY_LINKS_MAX_PATHS),
  bundle: DevDeliveryBundleRequestSchema.optional(),
}).superRefine((request, ctx) => {
  const origin = request.deliveryRef.origin;
  if (origin.kind !== 'session' || origin.repo === undefined || origin.commit === undefined || origin.path === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['deliveryRef', 'origin'],
      message: 'Delivery ref must originate from a session with repo, commit and path',
    });
  }
  if (!hasDistinct(request.paths)) {
    ctx.addIssue({ code: 'custom', path: ['paths'], message: 'Paths must be distinct' });
  }
  if (request.bundle !== undefined && !hasDistinct(request.bundle.paths)) {
    ctx.addIssue({ code: 'custom', path: ['bundle', 'paths'], message: 'Paths must be distinct' });
  }
});
export type DevDeliveryLinksRequest = z.infer<typeof DevDeliveryLinksRequestSchema>;

export const DevDeliveryLinkSchema = z.strictObject({
  path: DeliveryPathSchema,
  url: z.url().refine((url) => url.startsWith('https://'), 'https only'),
  expiresAt: z.iso.datetime({ offset: true }),
  mediaType: AssetRefSchema.shape.mediaType,
  sha256: AssetRefSchema.shape.sha256,
  sizeBytes: AssetRefSchema.shape.sizeBytes,
});
export type DevDeliveryLink = z.infer<typeof DevDeliveryLinkSchema>;

const DevDeliveryBundleLinkSchema = DevDeliveryLinkSchema.extend({
  path: DevDeliveryBundleFileNameSchema,
  mediaType: z.literal('application/zip'),
});

export const DevDeliveryLinksResponseSchema = z.strictObject({
  links: z.array(DevDeliveryLinkSchema).max(DEV_DELIVERY_LINKS_MAX_PATHS),
  bundle: DevDeliveryBundleLinkSchema.optional(),
}).refine((response) => hasDistinct(response.links.map((link) => link.path)), {
  path: ['links'],
  message: 'One link per path',
});
export type DevDeliveryLinksResponse = z.infer<typeof DevDeliveryLinksResponseSchema>;

/**
 * Signed preview links for files of a delivery. The service verifies that
 * params.sessionId equals deliveryRef.origin.sessionId and that the scope tenant
 * and agent belong to that session. Every path is read at the delivery commit;
 * links expire after DEV_DELIVERY_LINK_TTL_MS (30 days). sha256 and sizeBytes
 * let the caller re-read the bytes through readDevSessionAssetContract.
 * With request.bundle the service also composes one ZIP of bundle.paths, read at
 * the same commit with the same checks as paths, and answers response.bundle: a
 * link whose path is bundle.fileName and whose mediaType is application/zip.
 */
export const devDeliveryLinksContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/delivery-links' as const,
  authType: 'secret' as const,
  paramsSchema: readDevSessionAssetContract.paramsSchema,
  bodySchema: DevDeliveryLinksRequestSchema,
  responseSchema: DevDeliveryLinksResponseSchema,
} as const;
