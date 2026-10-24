"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryAssetListContract = exports.internalMemoryAssetIngestContract = exports.InternalMemoryAssetListResponseSchema = exports.InternalMemoryAssetListQuerySchema = exports.InternalMemoryAssetListRequestSchema = exports.InternalMemoryAssetIngestResponseSchema = exports.InternalMemoryAssetIngestRequestSchema = exports.INTERNAL_MEMORY_ASSETS_LIST_PATH = exports.INTERNAL_MEMORY_ASSETS_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
exports.INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets';
/** List of the assets of a project: POST, because the signed run context does not fit a query string. */
exports.INTERNAL_MEMORY_ASSETS_LIST_PATH = '/internal/memory/assets/list';
/**
 * POST: a file, archive or link handed to the company memory. Size is limited by the service, not the contract.
 * A `link` origin carries no bytes; every other origin requires `contentBase64`.
 * `context` says for which agentic company (organization) the asset is stored: the signed context of the run,
 * as for the other company memory routes. An attachment that arrives on its own (email) carries the context the
 * connector issues for the organization of the conversation. The service takes tenant and organization from the
 * verified context, never from `asset`.
 */
exports.InternalMemoryAssetIngestRequestSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    asset: asset_js_1.AssetRefSchema,
    contentBase64: zod_1.z.string().min(1).optional(),
})
    .superRefine((value, ctx) => {
    const isLink = value.asset.origin.kind === 'link';
    if (isLink && value.contentBase64 !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'link_has_no_content' });
    }
    if (!isLink && value.contentBase64 === undefined) {
        ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'content_required' });
    }
});
exports.InternalMemoryAssetIngestResponseSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('file'), assetId: asset_js_1.AssetRefSchema.shape.assetId, sha256: asset_js_1.AssetSha256Schema }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('archive'),
        archiveAssetId: asset_js_1.AssetRefSchema.shape.assetId,
        entries: zod_1.z.array(zod_1.z.strictObject({
            assetId: asset_js_1.AssetRefSchema.shape.assetId,
            path: zod_1.z.string().min(1),
            mediaType: asset_js_1.AssetRefSchema.shape.mediaType,
            preview: zod_1.z.boolean(),
        })),
        previewAssetId: asset_js_1.AssetRefSchema.shape.assetId.nullable(),
    }),
]);
/** POST INTERNAL_MEMORY_ASSETS_LIST_PATH: assets of a project, for the organization of the signed context. */
exports.InternalMemoryAssetListRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    companyId: asset_js_1.AssetRefSchema.shape.companyId.optional(),
    buSlug: asset_js_1.AssetRefSchema.shape.buSlug,
    limit: zod_1.z.number().int().min(1).max(200).optional(),
});
/** @deprecated 1.63.0: the list carries the signed context, use `InternalMemoryAssetListRequestSchema`. */
exports.InternalMemoryAssetListQuerySchema = zod_1.z.strictObject({
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    agentId: agent_identity_js_1.AgentIdSchema,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    companyId: asset_js_1.AssetRefSchema.shape.companyId.optional(),
    buSlug: asset_js_1.AssetRefSchema.shape.buSlug,
    limit: zod_1.z.coerce.number().int().min(1).max(200).optional(),
});
exports.InternalMemoryAssetListResponseSchema = zod_1.z.strictObject({
    assets: zod_1.z.array(asset_js_1.AssetRefSchema.extend({
        links: zod_1.z.array(zod_1.z.strictObject({ recordId: zod_1.z.string().min(1), recordKind: zod_1.z.string().min(1) })),
    })),
});
exports.internalMemoryAssetIngestContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSETS_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetIngestRequestSchema,
    responseSchema: exports.InternalMemoryAssetIngestResponseSchema,
};
exports.internalMemoryAssetListContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSETS_LIST_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetListRequestSchema,
    responseSchema: exports.InternalMemoryAssetListResponseSchema,
};
//# sourceMappingURL=internal-memory-assets.js.map