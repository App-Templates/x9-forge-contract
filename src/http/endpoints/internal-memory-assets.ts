import { z } from 'zod';
import { AgentIdSchema } from '../../agent/agent-identity.js';
import { AssetRefSchema } from '../../organization/asset.js';

export const INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets' as const;

/**
 * POST: a file, archive or link handed to the company memory. Size is limited by the service, not the contract.
 * A `link` origin carries no bytes; every other origin requires `contentBase64`.
 */
export const InternalMemoryAssetIngestRequestSchema = z
  .strictObject({
    asset: AssetRefSchema,
    contentBase64: z.string().min(1).optional(),
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
export type InternalMemoryAssetIngestRequest = z.infer<typeof InternalMemoryAssetIngestRequestSchema>;

export const InternalMemoryAssetIngestResponseSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('file'), assetId: AssetRefSchema.shape.assetId }),
  z.strictObject({
    kind: z.literal('archive'),
    archiveAssetId: AssetRefSchema.shape.assetId,
    entries: z.array(
      z.strictObject({
        assetId: AssetRefSchema.shape.assetId,
        path: z.string().min(1),
        mediaType: AssetRefSchema.shape.mediaType,
        preview: z.boolean(),
      }),
    ),
    previewAssetId: AssetRefSchema.shape.assetId.nullable(),
  }),
]);
export type InternalMemoryAssetIngestResponse = z.infer<typeof InternalMemoryAssetIngestResponseSchema>;

/** GET: assets of a project. */
export const InternalMemoryAssetListQuerySchema = z.strictObject({
  tenantId: AssetRefSchema.shape.tenantId,
  agentId: AgentIdSchema,
  projectId: AssetRefSchema.shape.projectId,
  companyId: AssetRefSchema.shape.companyId.optional(),
  buSlug: AssetRefSchema.shape.buSlug,
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type InternalMemoryAssetListQuery = z.infer<typeof InternalMemoryAssetListQuerySchema>;

export const InternalMemoryAssetListResponseSchema = z.strictObject({
  assets: z.array(
    AssetRefSchema.extend({
      links: z.array(z.strictObject({ recordId: z.string().min(1), recordKind: z.string().min(1) })),
    }),
  ),
});
export type InternalMemoryAssetListResponse = z.infer<typeof InternalMemoryAssetListResponseSchema>;

export const internalMemoryAssetIngestContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_ASSETS_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryAssetIngestRequestSchema,
  responseSchema: InternalMemoryAssetIngestResponseSchema,
} as const;

export const internalMemoryAssetListContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_ASSETS_PATH,
  authType: 'secret' as const,
  querySchema: InternalMemoryAssetListQuerySchema,
  responseSchema: InternalMemoryAssetListResponseSchema,
} as const;
