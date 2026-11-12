import { z } from 'zod';
import { ASSET_VERSION_REDO_REASON_MESSAGE, assetVersionRedoHasReason, AssetVersionLeadReviewSchema, AssetVersionProvenanceSchema, AssetVersionRecordSchema, AssetVersionStateSchema, } from "../../organization/asset-version.js";
import { DecisionRequestIdSchema, DecisionRequestSchema } from "../../organization/decision-request.js";
import { OrganizationRunContextSchema } from "../../organization/run-context.js";
export const INTERNAL_MEMORY_ASSET_VERSIONS_PATH = '/internal/memory/asset-versions';
export const INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH = '/internal/memory/asset-versions/list';
export const INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH = '/internal/memory/asset-versions/latest';
export const INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH = '/internal/memory/asset-versions/reviews';
export const ASSET_VERSION_REFUSALS = [
    'asset_version_conflict',
    'asset_version_unknown_file',
    'asset_version_foreign_business_unit',
    'asset_version_key_not_in_mandate',
];
// Zod cannot omit directly from refined objects. Reuse the canonical checks, which do not depend on createdBy.
const RegistrationProvenanceSchema = new z.ZodObject({
    ...AssetVersionProvenanceSchema.def,
    shape: z.strictObject(AssetVersionProvenanceSchema.shape).omit({ createdBy: true }).shape,
});
/**
 * The service resolves createdBy from the verified identity, checks buSlug against that identity,
 * and checks key against the business unit's mandate (6304). Zero means the first version.
 */
export const InternalMemoryAssetVersionRecordRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    projectId: AssetVersionRecordSchema.shape.projectId,
    buSlug: AssetVersionRecordSchema.shape.buSlug,
    key: AssetVersionRecordSchema.shape.key,
    expectedPreviousVersion: z.number().int().min(0),
    files: AssetVersionRecordSchema.shape.files,
    deliveryPackage: AssetVersionRecordSchema.shape.deliveryPackage,
    provenance: RegistrationProvenanceSchema,
});
export const InternalMemoryAssetVersionRecordResponseSchema = z.discriminatedUnion('outcome', [
    z.strictObject({ outcome: z.literal('recorded'), version: AssetVersionRecordSchema }),
    z.strictObject({ outcome: z.literal('already_recorded'), version: AssetVersionRecordSchema }),
    z.strictObject({ outcome: z.literal('refused'), code: z.enum(ASSET_VERSION_REFUSALS) }),
]);
/** Organization-wide visibility follows the existing asset list; the service derives states with deriveAssetVersionStates. */
export const InternalMemoryAssetVersionListRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    projectId: AssetVersionRecordSchema.shape.projectId,
    buSlug: AssetVersionRecordSchema.shape.buSlug.optional(),
    key: AssetVersionRecordSchema.shape.key.optional(),
    limit: z.number().int().min(1).max(200).optional(),
});
export const InternalMemoryAssetVersionListResponseSchema = z.strictObject({
    versions: z.array(z.strictObject({
        record: AssetVersionRecordSchema,
        state: AssetVersionStateSchema,
        requestId: DecisionRequestIdSchema.optional(),
        decidedAt: DecisionRequestSchema.shape.createdAt.optional(),
    })),
});
export const InternalMemoryAssetVersionLatestRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    projectId: AssetVersionRecordSchema.shape.projectId,
    buSlug: AssetVersionRecordSchema.shape.buSlug,
    key: AssetVersionRecordSchema.shape.key,
});
export const InternalMemoryAssetVersionLatestResponseSchema = z.strictObject({
    version: z.strictObject({
        record: AssetVersionRecordSchema,
        state: AssetVersionStateSchema.extract(['approved']),
        requestId: DecisionRequestIdSchema,
        decidedAt: DecisionRequestSchema.shape.createdAt,
    }).nullable(),
});
/** Reviewer identity and timestamp come from the service; the existing redo/reason check is preserved. */
export const InternalMemoryAssetVersionReviewRequestSchema = z.strictObject({
    ...z.strictObject(AssetVersionLeadReviewSchema.shape)
        .omit({ reviewedBy: true, reviewedAt: true }).shape,
    context: OrganizationRunContextSchema,
    projectId: AssetVersionRecordSchema.shape.projectId,
}).refine(assetVersionRedoHasReason, {
    path: ['reason'], message: ASSET_VERSION_REDO_REASON_MESSAGE,
});
export const InternalMemoryAssetVersionReviewResponseSchema = z.discriminatedUnion('outcome', [
    z.strictObject({ outcome: z.literal('recorded'), review: AssetVersionLeadReviewSchema }),
    z.strictObject({
        outcome: z.literal('refused'),
        code: z.enum(['asset_version_not_found', 'asset_version_review_not_lead']),
    }),
]);
export const internalMemoryAssetVersionRecordContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSET_VERSIONS_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetVersionRecordRequestSchema,
    responseSchema: InternalMemoryAssetVersionRecordResponseSchema,
};
export const internalMemoryAssetVersionListContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetVersionListRequestSchema,
    responseSchema: InternalMemoryAssetVersionListResponseSchema,
};
export const internalMemoryAssetVersionLatestContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetVersionLatestRequestSchema,
    responseSchema: InternalMemoryAssetVersionLatestResponseSchema,
};
export const internalMemoryAssetVersionReviewContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryAssetVersionReviewRequestSchema,
    responseSchema: InternalMemoryAssetVersionReviewResponseSchema,
};
//# sourceMappingURL=internal-memory-asset-versions.js.map