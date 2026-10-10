import { z } from 'zod';
import { ElevenLabsWebBrowserRequestSchema, ElevenLabsWebBrowserSessionSchema, ElevenLabsWebBrowserMetadataSchema, ElevenLabsWebBrowserErrorResponseSchema, } from "../../capability/agent-elevenlabs/web-browser.js";
export const ForgeElevenLabsWebParamsSchema = z.object({
    linkId: ElevenLabsWebBrowserRequestSchema.shape.linkId,
}).strict();
/** Optional session permits only an explicitly public door. Owner/invited access requires
 * a freshly revalidated server Clerk session and current server policy on every request.
 * These descriptors do not authenticate a caller or accept browser authorization evidence.
 */
const browserAccess = {
    authentication: 'optional-forge-session',
    authorization: 'server-web-policy',
    cacheControl: 'no-store',
};
export const forgeElevenLabsWebMetadataContract = {
    ...browserAccess, method: 'GET', path: '/api/parla/:linkId',
    paramsSchema: ForgeElevenLabsWebParamsSchema,
    responseSchema: ElevenLabsWebBrowserMetadataSchema,
    errorResponseSchema: ElevenLabsWebBrowserErrorResponseSchema,
};
export const forgeElevenLabsWebSessionContract = {
    ...browserAccess, method: 'POST', path: '/api/parla/:linkId/session',
    paramsSchema: ForgeElevenLabsWebParamsSchema,
    bodySchema: ElevenLabsWebBrowserRequestSchema,
    responseSchema: ElevenLabsWebBrowserSessionSchema,
    errorResponseSchema: ElevenLabsWebBrowserErrorResponseSchema,
};
function webPath(template, linkId) {
    const params = ForgeElevenLabsWebParamsSchema.parse({ linkId });
    return template.replace(':linkId', encodeURIComponent(params.linkId));
}
export function forgeElevenLabsWebMetadataPath(linkId) {
    return webPath(forgeElevenLabsWebMetadataContract.path, linkId);
}
export function forgeElevenLabsWebSessionPath(linkId) {
    return webPath(forgeElevenLabsWebSessionContract.path, linkId);
}
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
export function isElevenLabsWebBrowserRequestForLink(rawRequest, rawLinkId) {
    const request = ElevenLabsWebBrowserRequestSchema.safeParse(rawRequest);
    const params = ForgeElevenLabsWebParamsSchema.safeParse({ linkId: rawLinkId });
    if (!request.success || !params.success)
        return false;
    return request.data.linkId === params.data.linkId; // guard:browser-path-link
}
//# sourceMappingURL=forge-elevenlabs-web.js.map