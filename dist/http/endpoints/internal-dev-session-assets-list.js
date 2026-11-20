import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-context.js";
import { DEV_SESSION_MAX_FILES } from "../../capability/dev/session-assignment.js";
import { AssetRefSchema } from "../../organization/asset.js";
import { readDevSessionAssetContract } from "./internal-dev-session-asset-content.js";
/** Delivered files (at most DEV_SESSION_MAX_FILES) plus the images of the manifest (at most 40). */
export const DEV_SESSION_ASSETS_LIST_MAX = DEV_SESSION_MAX_FILES + 40;
/** Transport request only; session authorization and delivery verification belong to the service. */
export const DevSessionAssetsListRequestSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema,
});
/** The list is complete and verified, or the call is refused: never a truncated list. */
export const DevSessionAssetsListResponseSchema = z.strictObject({
    assets: z.array(AssetRefSchema).min(1).max(DEV_SESSION_ASSETS_LIST_MAX),
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
export const DEV_SESSION_ASSETS_LIST_REFUSALS = [
    'session_not_found',
    'session_foreign',
    'session_not_closed',
    'delivery_not_verified',
    'identity_source_unavailable',
];
export const DevSessionAssetsListRefusalSchema = z.strictObject({
    error: z.enum(DEV_SESSION_ASSETS_LIST_REFUSALS),
});
/**
 * POST that lists the verified files and proof images of a closed session; it serves no bytes (those use
 * readDevSessionAssetContract on the same family of routes). The list is complete or it is a refusal
 * (`delivery_not_verified`), never truncated. Authorization and verification belong to the service, as for bytes.
 */
export const listDevSessionAssetsContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/list',
    authType: 'secret',
    paramsSchema: readDevSessionAssetContract.paramsSchema,
    bodySchema: DevSessionAssetsListRequestSchema,
    responseSchema: DevSessionAssetsListResponseSchema,
};
//# sourceMappingURL=internal-dev-session-assets-list.js.map