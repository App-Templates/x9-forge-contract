"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeElevenLabsWebSessionContract = exports.forgeElevenLabsWebMetadataContract = exports.ForgeElevenLabsWebParamsSchema = void 0;
exports.forgeElevenLabsWebMetadataPath = forgeElevenLabsWebMetadataPath;
exports.forgeElevenLabsWebSessionPath = forgeElevenLabsWebSessionPath;
exports.isElevenLabsWebBrowserRequestForLink = isElevenLabsWebBrowserRequestForLink;
const zod_1 = require("zod");
const web_browser_js_1 = require("../../capability/agent-elevenlabs/web-browser.cjs");
exports.ForgeElevenLabsWebParamsSchema = zod_1.z.object({
    linkId: web_browser_js_1.ElevenLabsWebBrowserRequestSchema.shape.linkId,
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
exports.forgeElevenLabsWebMetadataContract = {
    ...browserAccess, method: 'GET', path: '/api/parla/:linkId',
    paramsSchema: exports.ForgeElevenLabsWebParamsSchema,
    responseSchema: web_browser_js_1.ElevenLabsWebBrowserMetadataSchema,
    errorResponseSchema: web_browser_js_1.ElevenLabsWebBrowserErrorResponseSchema,
};
exports.forgeElevenLabsWebSessionContract = {
    ...browserAccess, method: 'POST', path: '/api/parla/:linkId/session',
    paramsSchema: exports.ForgeElevenLabsWebParamsSchema,
    bodySchema: web_browser_js_1.ElevenLabsWebBrowserRequestSchema,
    responseSchema: web_browser_js_1.ElevenLabsWebBrowserSessionSchema,
    errorResponseSchema: web_browser_js_1.ElevenLabsWebBrowserErrorResponseSchema,
};
function webPath(template, linkId) {
    const params = exports.ForgeElevenLabsWebParamsSchema.parse({ linkId });
    return template.replace(':linkId', encodeURIComponent(params.linkId));
}
function forgeElevenLabsWebMetadataPath(linkId) {
    return webPath(exports.forgeElevenLabsWebMetadataContract.path, linkId);
}
function forgeElevenLabsWebSessionPath(linkId) {
    return webPath(exports.forgeElevenLabsWebSessionContract.path, linkId);
}
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
function isElevenLabsWebBrowserRequestForLink(rawRequest, rawLinkId) {
    const request = web_browser_js_1.ElevenLabsWebBrowserRequestSchema.safeParse(rawRequest);
    const params = exports.ForgeElevenLabsWebParamsSchema.safeParse({ linkId: rawLinkId });
    if (!request.success || !params.success)
        return false;
    return request.data.linkId === params.data.linkId; // guard:browser-path-link
}
//# sourceMappingURL=forge-elevenlabs-web.js.map