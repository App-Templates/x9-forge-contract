import { z } from 'zod';
import { AgentIdSchema } from '../../agent/agent-identity.js';
import { AssetRefSchema, AssetSha256Schema } from '../../organization/asset.js';
import { OrganizationRunContextSchema } from '../../organization/run-context.js';

export const INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets' as const;
/** List of the assets of a project: POST, because the signed run context does not fit a query string. */
export const INTERNAL_MEMORY_ASSETS_LIST_PATH = '/internal/memory/assets/list' as const;

/**
 * POST: a file, archive or link handed to the company memory. Size is limited by the service, not the contract.
 * A `link` origin carries no bytes; every other origin requires `contentBase64`.
 * `context` says for which agentic company (organization) the asset is stored: the signed context of the run,
 * as for the other company memory routes. An attachment that arrives on its own (email) carries the context the
 * connector issues for the organization of the conversation. The service takes tenant and organization from the
 * verified context, never from `asset`.
 */
export const InternalMemoryAssetIngestRequestSchema = z
  .strictObject({
    context: OrganizationRunContextSchema,
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
  z.strictObject({ kind: z.literal('file'), assetId: AssetRefSchema.shape.assetId, sha256: AssetSha256Schema }),
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

/** POST INTERNAL_MEMORY_ASSETS_LIST_PATH: assets of a project, for the organization of the signed context. */
export const InternalMemoryAssetListRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  projectId: AssetRefSchema.shape.projectId,
  companyId: AssetRefSchema.shape.companyId.optional(),
  buSlug: AssetRefSchema.shape.buSlug,
  limit: z.number().int().min(1).max(200).optional(),
});
export type InternalMemoryAssetListRequest = z.infer<typeof InternalMemoryAssetListRequestSchema>;

/** @deprecated 1.63.0: the list carries the signed context, use `InternalMemoryAssetListRequestSchema`. */
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
  method: 'POST' as const,
  path: INTERNAL_MEMORY_ASSETS_LIST_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryAssetListRequestSchema,
  responseSchema: InternalMemoryAssetListResponseSchema,
} as const;
