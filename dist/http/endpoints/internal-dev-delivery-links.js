import { z } from 'zod';
import { readDevSessionAssetContract } from "./internal-dev-session-asset-content.js";
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-context.js";
import { AssetOriginSchema, AssetRefSchema } from "../../organization/asset.js";
export const DEV_DELIVERY_LINKS_MAX_PATHS = 12;
export const DEV_DELIVERY_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DeliveryPathSchema = AssetOriginSchema.options[2].shape.path.unwrap()
    .refine((path) => !/\s/.test(path), 'Delivery path must contain no whitespace');
const hasDistinct = (values) => new Set(values).size === values.length;
/** Transport request only; session authorization and file lookup belong to the service. */
export const DevDeliveryLinksRequestSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema,
    deliveryRef: AssetRefSchema,
    paths: z.array(DeliveryPathSchema).min(1).max(DEV_DELIVERY_LINKS_MAX_PATHS),
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
});
export const DevDeliveryLinkSchema = z.strictObject({
    path: DeliveryPathSchema,
    url: z.url().refine((url) => url.startsWith('https://'), 'https only'),
    expiresAt: z.iso.datetime({ offset: true }),
    mediaType: AssetRefSchema.shape.mediaType,
    sha256: AssetRefSchema.shape.sha256,
    sizeBytes: AssetRefSchema.shape.sizeBytes,
});
export const DevDeliveryLinksResponseSchema = z.strictObject({
    links: z.array(DevDeliveryLinkSchema).max(DEV_DELIVERY_LINKS_MAX_PATHS),
}).refine((response) => hasDistinct(response.links.map((link) => link.path)), {
    path: ['links'],
    message: 'One link per path',
});
/**
 * Signed preview links for files of a delivery. The service verifies that
 * params.sessionId equals deliveryRef.origin.sessionId and that the scope tenant
 * and agent belong to that session. Every path is read at the delivery commit;
 * links expire after DEV_DELIVERY_LINK_TTL_MS (30 days). sha256 and sizeBytes
 * let the caller re-read the bytes through readDevSessionAssetContract.
 */
export const devDeliveryLinksContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/delivery-links',
    authType: 'secret',
    paramsSchema: readDevSessionAssetContract.paramsSchema,
    bodySchema: DevDeliveryLinksRequestSchema,
    responseSchema: DevDeliveryLinksResponseSchema,
};
//# sourceMappingURL=internal-dev-delivery-links.js.map