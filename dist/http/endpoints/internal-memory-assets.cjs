"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryAssetListContract = exports.internalMemoryAssetIngestContract = exports.InternalMemoryAssetListResponseSchema = exports.InternalMemoryAssetListQuerySchema = exports.InternalMemoryAssetIngestResponseSchema = exports.InternalMemoryAssetIngestRequestSchema = exports.INTERNAL_MEMORY_ASSETS_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
exports.INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets';
/** POST: a file or archive handed to the company memory. Size is limited by the service, not the contract. */
exports.InternalMemoryAssetIngestRequestSchema = zod_1.z.strictObject({
    asset: asset_js_1.AssetRefSchema,
    contentBase64: zod_1.z.string().min(1),
});
exports.InternalMemoryAssetIngestResponseSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('file'), assetId: asset_js_1.AssetRefSchema.shape.assetId }),
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
/** GET: assets of a project. */
exports.InternalMemoryAssetListQuerySchema = zod_1.z.strictObject({
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    agentId: agent_identity_js_1.AgentIdSchema,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
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
    method: 'GET',
    path: exports.INTERNAL_MEMORY_ASSETS_PATH,
    authType: 'secret',
    querySchema: exports.InternalMemoryAssetListQuerySchema,
    responseSchema: exports.InternalMemoryAssetListResponseSchema,
};
//# sourceMappingURL=internal-memory-assets.js.map