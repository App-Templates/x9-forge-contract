import { z } from 'zod';
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { AssetRefSchema } from "../../organization/asset.js";
export const INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets';
/** POST: a file or archive handed to the company memory. Size is limited by the service, not the contract. */
export const InternalMemoryAssetIngestRequestSchema = z.strictObject({
    asset: AssetRefSchema,
    contentBase64: z.string().min(1),
});
export const InternalMemoryAssetIngestResponseSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('file'), assetId: AssetRefSchema.shape.assetId }),
    z.strictObject({
        kind: z.literal('archive'),
        archiveAssetId: AssetRefSchema.shape.assetId,
        entries: z.array(z.strictObject({
            assetId: AssetRefSchema.shape.assetId,
            path: z.string().min(1),
            mediaType: AssetRefSchema.shape.mediaType,
            preview: z.boolean(),
        })),
        previewAssetId: AssetRefSchema.shape.assetId.nullable(),
    }),
]);
/** GET: assets of a project. */
export const InternalMemoryAssetListQuerySchema = z.strictObject({
    tenantId: AssetRefSchema.shape.tenantId,
    agentId: AgentIdSchema,
    projectId: AssetRefSchema.shape.projectId,
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
export const InternalMemoryAssetListResponseSchema = z.strictObject({
    assets: z.array(AssetRefSchema.extend({
        links: z.array(z.strictObject({ recordId: z.string().min(1), recordKind: z.string().min(1) })),
    })),
});
export const internalMemoryAssetIngestContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSETS_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetIngestRequestSchema,
    responseSchema: InternalMemoryAssetIngestResponseSchema,
};
export const internalMemoryAssetListContract = {
    method: 'GET',
    path: INTERNAL_MEMORY_ASSETS_PATH,
    authType: 'secret',
    querySchema: InternalMemoryAssetListQuerySchema,
    responseSchema: InternalMemoryAssetListResponseSchema,
};
//# sourceMappingURL=internal-memory-assets.js.map