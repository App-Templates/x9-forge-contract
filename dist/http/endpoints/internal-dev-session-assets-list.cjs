"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDevSessionAssetsContract = exports.DevSessionAssetsListRefusalSchema = exports.DEV_SESSION_ASSETS_LIST_REFUSALS = exports.DevSessionAssetsListResponseSchema = exports.DevSessionAssetsListRequestSchema = exports.DEV_SESSION_ASSETS_LIST_MAX = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const session_assignment_js_1 = require("../../capability/dev/session-assignment.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const internal_dev_session_asset_content_js_1 = require("./internal-dev-session-asset-content.cjs");
/** Delivered files (at most DEV_SESSION_MAX_FILES) plus the images of the manifest (at most 40). */
exports.DEV_SESSION_ASSETS_LIST_MAX = session_assignment_js_1.DEV_SESSION_MAX_FILES + 40;
/** Transport request only; session authorization and delivery verification belong to the service. */
exports.DevSessionAssetsListRequestSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
});
/** The list is complete and verified, or the call is refused: never a truncated list. */
exports.DevSessionAssetsListResponseSchema = zod_1.z.strictObject({
    assets: zod_1.z.array(asset_js_1.AssetRefSchema).min(1).max(exports.DEV_SESSION_ASSETS_LIST_MAX),
}).superRefine((response, ctx) => {
    const ids = new Set();
    const paths = new Set();
    let sessionId;
    let commit;
    response.assets.forEach((asset, index) => {
        const origin = asset.origin;
        if (origin.kind !== 'session' || origin.repo === undefined || origin.commit === undefined || origin.path === undefined) {
            ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin'], message: 'Asset must be a session delivery with repo, commit and path' });
            return;
        }
        sessionId ??= origin.sessionId;
        commit ??= origin.commit;
        if (origin.sessionId !== sessionId) {
            ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin', 'sessionId'], message: 'All assets must belong to one session' });
        }
        if (origin.commit !== commit) {
            ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin', 'commit'], message: 'All assets must come from one commit' });
        }
        if (ids.has(asset.assetId)) {
            ctx.addIssue({ code: 'custom', path: ['assets', index, 'assetId'], message: 'Duplicate assetId' });
        }
        ids.add(asset.assetId);
        if (paths.has(origin.path)) {
            ctx.addIssue({ code: 'custom', path: ['assets', index, 'origin', 'path'], message: 'Duplicate path' });
        }
        paths.add(origin.path);
    });
});
exports.DEV_SESSION_ASSETS_LIST_REFUSALS = [
    'session_not_found',
    'session_foreign',
    'session_not_closed',
    'delivery_not_verified',
    'identity_source_unavailable',
];
exports.DevSessionAssetsListRefusalSchema = zod_1.z.strictObject({
    error: zod_1.z.enum(exports.DEV_SESSION_ASSETS_LIST_REFUSALS),
});
/**
 * POST that lists the verified files and proof images of a closed session; it serves no bytes (those use
 * readDevSessionAssetContract on the same family of routes). The list is complete or it is a refusal
 * (`delivery_not_verified`), never truncated. Authorization and verification belong to the service, as for bytes.
 */
exports.listDevSessionAssetsContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/list',
    authType: 'secret',
    paramsSchema: internal_dev_session_asset_content_js_1.readDevSessionAssetContract.paramsSchema,
    bodySchema: exports.DevSessionAssetsListRequestSchema,
    responseSchema: exports.DevSessionAssetsListResponseSchema,
};
//# sourceMappingURL=internal-dev-session-assets-list.js.map