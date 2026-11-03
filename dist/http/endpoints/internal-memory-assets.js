import { z } from 'zod';
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { AssetRefSchema, AssetSha256Schema } from "../../organization/asset.js";
import { OrganizationRunContextSchema } from "../../organization/run-context.js";
export const INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets';
/** List of the assets of a project: POST, because the signed run context does not fit a query string. */
export const INTERNAL_MEMORY_ASSETS_LIST_PATH = '/internal/memory/assets/list';
export const INTERNAL_MEMORY_ASSET_CONTENT_PATH = '/internal/memory/assets/content';
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
    providedByEmail: z.email().optional(),
})
    .superRefine((value, ctx) => {
    if (value.providedByEmail !== undefined && value.asset.providedBy !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['asset', 'providedBy'], message: 'provided_by_is_resolved_by_the_service' });
    }
    const isLink = value.asset.origin.kind === 'link';
    if (isLink && value.contentBase64 !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'link_has_no_content' });
    }
    if (!isLink && value.contentBase64 === undefined) {
        ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'content_required' });
    }
});
export const InternalMemoryAssetIngestResponseSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('file'), assetId: AssetRefSchema.shape.assetId, sha256: AssetSha256Schema }),
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
/** POST INTERNAL_MEMORY_ASSETS_LIST_PATH: assets of a project, for the organization of the signed context. */
export const InternalMemoryAssetListRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    projectId: AssetRefSchema.shape.projectId,
    companyId: AssetRefSchema.shape.companyId.optional(),
    buSlug: AssetRefSchema.shape.buSlug,
    limit: z.number().int().min(1).max(200).optional(),
});
/** @deprecated 1.63.0: the list carries the signed context, use `InternalMemoryAssetListRequestSchema`. */
export const InternalMemoryAssetListQuerySchema = z.strictObject({
    tenantId: AssetRefSchema.shape.tenantId,
    agentId: AgentIdSchema,
    projectId: AssetRefSchema.shape.projectId,
    companyId: AssetRefSchema.shape.companyId.optional(),
    buSlug: AssetRefSchema.shape.buSlug,
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
export const InternalMemoryAssetListResponseSchema = z.strictObject({
    assets: z.array(AssetRefSchema.extend({
        links: z.array(z.strictObject({ recordId: z.string().min(1), recordKind: z.string().min(1) })),
    })),
});
/** Transport request only: the service verifies the signed context, its expiry and the asset's ownership. */
export const InternalMemoryAssetContentRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    asset: AssetRefSchema,
    offset: z.number().int().min(0),
    length: z.number().int().min(1).max(262144),
}).refine((request) => request.asset.origin.kind === 'generated', {
    path: ['asset', 'origin'],
    message: 'Asset must have a generated origin',
}).refine((request) => request.offset < request.asset.sizeBytes, {
    path: ['offset'],
    message: 'Offset must be less than asset sizeBytes',
});
/**
 * Transport shape and chunk coherence only. Before serving any chunk, the service verifies sha256 and
 * sizeBytes against the entire stored content, taking tenant and organization from the verified context.
 * The consumer checks the response identity and offset, then verifies sha256 and sizeBytes again on the
 * complete file after assembly. Missing or foreign assets produce a service error, never an empty file.
 */
export const InternalMemoryAssetContentResponseSchema = z.strictObject({
    assetId: AssetRefSchema.shape.assetId,
    sha256: AssetSha256Schema,
    sizeBytes: AssetRefSchema.shape.sizeBytes,
    offset: z.number().int().min(0),
    contentBase64: z.string().regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
    eof: z.boolean(),
}).superRefine((chunk, ctx) => {
    const padding = chunk.contentBase64.endsWith('==') ? 2 : chunk.contentBase64.endsWith('=') ? 1 : 0;
    const bytes = chunk.contentBase64.length / 4 * 3 - padding;
    // Also reject a trailing line terminator accepted by the regex's end anchor.
    if (!Number.isInteger(bytes) || bytes < 1 || bytes > 262144) {
        ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'Chunk must contain 1..262144 decoded bytes' });
    }
    const end = chunk.offset + bytes;
    if (end > chunk.sizeBytes) {
        ctx.addIssue({ code: 'custom', path: ['contentBase64'], message: 'Chunk exceeds asset sizeBytes' });
    }
    if (chunk.eof !== (end === chunk.sizeBytes)) {
        ctx.addIssue({ code: 'custom', path: ['eof'], message: 'EOF must match the final asset byte' });
    }
});
export const internalMemoryAssetIngestContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSETS_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetIngestRequestSchema,
    responseSchema: InternalMemoryAssetIngestResponseSchema,
};
export const internalMemoryAssetListContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSETS_LIST_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetListRequestSchema,
    responseSchema: InternalMemoryAssetListResponseSchema,
};
export const internalMemoryAssetContentContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSET_CONTENT_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetContentRequestSchema,
    responseSchema: InternalMemoryAssetContentResponseSchema,
};
//# sourceMappingURL=internal-memory-assets.js.map