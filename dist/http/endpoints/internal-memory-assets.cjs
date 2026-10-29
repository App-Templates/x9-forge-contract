"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryAssetContentContract = exports.internalMemoryAssetListContract = exports.internalMemoryAssetIngestContract = exports.InternalMemoryAssetContentResponseSchema = exports.InternalMemoryAssetContentRequestSchema = exports.InternalMemoryAssetListResponseSchema = exports.InternalMemoryAssetListQuerySchema = exports.InternalMemoryAssetListRequestSchema = exports.InternalMemoryAssetIngestResponseSchema = exports.InternalMemoryAssetIngestRequestSchema = exports.INTERNAL_MEMORY_ASSET_CONTENT_PATH = exports.INTERNAL_MEMORY_ASSETS_LIST_PATH = exports.INTERNAL_MEMORY_ASSETS_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
exports.INTERNAL_MEMORY_ASSETS_PATH = '/internal/memory/assets';
/** List of the assets of a project: POST, because the signed run context does not fit a query string. */
exports.INTERNAL_MEMORY_ASSETS_LIST_PATH = '/internal/memory/assets/list';
exports.INTERNAL_MEMORY_ASSET_CONTENT_PATH = '/internal/memory/assets/content';
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
    providedByEmail: zod_1.z.email().optional(),
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
/** Transport request only: the service verifies the signed context, its expiry and the asset's ownership. */
exports.InternalMemoryAssetContentRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    asset: asset_js_1.AssetRefSchema,
    offset: zod_1.z.number().int().min(0),
    length: zod_1.z.number().int().min(1).max(262144),
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
exports.InternalMemoryAssetContentResponseSchema = zod_1.z.strictObject({
    assetId: asset_js_1.AssetRefSchema.shape.assetId,
    sha256: asset_js_1.AssetSha256Schema,
    sizeBytes: asset_js_1.AssetRefSchema.shape.sizeBytes,
    offset: zod_1.z.number().int().min(0),
    contentBase64: zod_1.z.string().regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
    eof: zod_1.z.boolean(),
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
exports.internalMemoryAssetContentContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSET_CONTENT_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetContentRequestSchema,
    responseSchema: exports.InternalMemoryAssetContentResponseSchema,
};
//# sourceMappingURL=internal-memory-assets.js.map