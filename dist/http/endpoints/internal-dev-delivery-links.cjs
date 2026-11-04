"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devDeliveryLinksContract = exports.DevDeliveryLinksResponseSchema = exports.DevDeliveryLinkSchema = exports.DevDeliveryLinksRequestSchema = exports.DEV_DELIVERY_LINK_TTL_MS = exports.DEV_DELIVERY_LINKS_MAX_PATHS = void 0;
const zod_1 = require("zod");
const internal_dev_session_asset_content_js_1 = require("./internal-dev-session-asset-content.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
exports.DEV_DELIVERY_LINKS_MAX_PATHS = 12;
exports.DEV_DELIVERY_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DeliveryPathSchema = asset_js_1.AssetOriginSchema.options[2].shape.path.unwrap()
    .refine((path) => !/\s/.test(path), 'Delivery path must contain no whitespace');
const hasDistinct = (values) => new Set(values).size === values.length;
/** Transport request only; session authorization and file lookup belong to the service. */
exports.DevDeliveryLinksRequestSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    deliveryRef: asset_js_1.AssetRefSchema,
    paths: zod_1.z.array(DeliveryPathSchema).min(1).max(exports.DEV_DELIVERY_LINKS_MAX_PATHS),
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
exports.DevDeliveryLinkSchema = zod_1.z.strictObject({
    path: DeliveryPathSchema,
    url: zod_1.z.url().refine((url) => url.startsWith('https://'), 'https only'),
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
    mediaType: asset_js_1.AssetRefSchema.shape.mediaType,
    sha256: asset_js_1.AssetRefSchema.shape.sha256,
    sizeBytes: asset_js_1.AssetRefSchema.shape.sizeBytes,
});
exports.DevDeliveryLinksResponseSchema = zod_1.z.strictObject({
    links: zod_1.z.array(exports.DevDeliveryLinkSchema).max(exports.DEV_DELIVERY_LINKS_MAX_PATHS),
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
exports.devDeliveryLinksContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/delivery-links',
    authType: 'secret',
    paramsSchema: internal_dev_session_asset_content_js_1.readDevSessionAssetContract.paramsSchema,
    bodySchema: exports.DevDeliveryLinksRequestSchema,
    responseSchema: exports.DevDeliveryLinksResponseSchema,
};
//# sourceMappingURL=internal-dev-delivery-links.js.map