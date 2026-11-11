"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryAssetVersionReviewContract = exports.internalMemoryAssetVersionLatestContract = exports.internalMemoryAssetVersionListContract = exports.internalMemoryAssetVersionRecordContract = exports.InternalMemoryAssetVersionReviewResponseSchema = exports.InternalMemoryAssetVersionReviewRequestSchema = exports.InternalMemoryAssetVersionLatestResponseSchema = exports.InternalMemoryAssetVersionLatestRequestSchema = exports.InternalMemoryAssetVersionListResponseSchema = exports.InternalMemoryAssetVersionListRequestSchema = exports.InternalMemoryAssetVersionRecordResponseSchema = exports.InternalMemoryAssetVersionRecordRequestSchema = exports.ASSET_VERSION_REFUSALS = exports.INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH = exports.INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH = exports.INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH = exports.INTERNAL_MEMORY_ASSET_VERSIONS_PATH = void 0;
const zod_1 = require("zod");
const asset_version_js_1 = require("../../organization/asset-version.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
exports.INTERNAL_MEMORY_ASSET_VERSIONS_PATH = '/internal/memory/asset-versions';
exports.INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH = '/internal/memory/asset-versions/list';
exports.INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH = '/internal/memory/asset-versions/latest';
exports.INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH = '/internal/memory/asset-versions/reviews';
exports.ASSET_VERSION_REFUSALS = [
    'asset_version_conflict',
    'asset_version_unknown_file',
    'asset_version_foreign_business_unit',
    'asset_version_key_not_in_mandate',
];
// Zod cannot omit directly from refined objects. Reuse the canonical checks, which do not depend on createdBy.
const RegistrationProvenanceSchema = new zod_1.z.ZodObject({
    ...asset_version_js_1.AssetVersionProvenanceSchema.def,
    shape: zod_1.z.strictObject(asset_version_js_1.AssetVersionProvenanceSchema.shape).omit({ createdBy: true }).shape,
});
/**
 * The service resolves createdBy from the verified identity, checks buSlug against that identity,
 * and checks key against the business unit's mandate (6304). Zero means the first version.
 */
exports.InternalMemoryAssetVersionRecordRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    projectId: asset_version_js_1.AssetVersionRecordSchema.shape.projectId,
    buSlug: asset_version_js_1.AssetVersionRecordSchema.shape.buSlug,
    key: asset_version_js_1.AssetVersionRecordSchema.shape.key,
    expectedPreviousVersion: zod_1.z.number().int().min(0),
    files: asset_version_js_1.AssetVersionRecordSchema.shape.files,
    deliveryPackage: asset_version_js_1.AssetVersionRecordSchema.shape.deliveryPackage,
    provenance: RegistrationProvenanceSchema,
});
exports.InternalMemoryAssetVersionRecordResponseSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ outcome: zod_1.z.literal('recorded'), version: asset_version_js_1.AssetVersionRecordSchema }),
    zod_1.z.strictObject({ outcome: zod_1.z.literal('already_recorded'), version: asset_version_js_1.AssetVersionRecordSchema }),
    zod_1.z.strictObject({ outcome: zod_1.z.literal('refused'), code: zod_1.z.enum(exports.ASSET_VERSION_REFUSALS) }),
]);
/** Organization-wide visibility follows the existing asset list; the service derives states with deriveAssetVersionStates. */
exports.InternalMemoryAssetVersionListRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    projectId: asset_version_js_1.AssetVersionRecordSchema.shape.projectId,
    buSlug: asset_version_js_1.AssetVersionRecordSchema.shape.buSlug.optional(),
    key: asset_version_js_1.AssetVersionRecordSchema.shape.key.optional(),
    limit: zod_1.z.number().int().min(1).max(200).optional(),
});
exports.InternalMemoryAssetVersionListResponseSchema = zod_1.z.strictObject({
    versions: zod_1.z.array(zod_1.z.strictObject({
        record: asset_version_js_1.AssetVersionRecordSchema,
        state: asset_version_js_1.AssetVersionStateSchema,
        requestId: decision_request_js_1.DecisionRequestIdSchema.optional(),
        decidedAt: decision_request_js_1.DecisionRequestSchema.shape.createdAt.optional(),
    })),
});
exports.InternalMemoryAssetVersionLatestRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    projectId: asset_version_js_1.AssetVersionRecordSchema.shape.projectId,
    buSlug: asset_version_js_1.AssetVersionRecordSchema.shape.buSlug,
    key: asset_version_js_1.AssetVersionRecordSchema.shape.key,
});
exports.InternalMemoryAssetVersionLatestResponseSchema = zod_1.z.strictObject({
    version: zod_1.z.strictObject({
        record: asset_version_js_1.AssetVersionRecordSchema,
        state: asset_version_js_1.AssetVersionStateSchema.extract(['approved']),
        requestId: decision_request_js_1.DecisionRequestIdSchema,
        decidedAt: decision_request_js_1.DecisionRequestSchema.shape.createdAt,
    }).nullable(),
});
/** Reviewer identity and timestamp come from the service; the existing redo/reason check is preserved. */
exports.InternalMemoryAssetVersionReviewRequestSchema = new zod_1.z.ZodObject({
    ...asset_version_js_1.AssetVersionLeadReviewSchema.def,
    shape: zod_1.z.strictObject(asset_version_js_1.AssetVersionLeadReviewSchema.shape)
        .omit({ reviewedBy: true, reviewedAt: true })
        .extend({
        context: run_context_js_1.OrganizationRunContextSchema,
        projectId: asset_version_js_1.AssetVersionRecordSchema.shape.projectId,
    }).shape,
});
exports.InternalMemoryAssetVersionReviewResponseSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ outcome: zod_1.z.literal('recorded'), review: asset_version_js_1.AssetVersionLeadReviewSchema }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('refused'),
        code: zod_1.z.enum(['asset_version_not_found', 'asset_version_review_not_lead']),
    }),
]);
exports.internalMemoryAssetVersionRecordContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSET_VERSIONS_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetVersionRecordRequestSchema,
    responseSchema: exports.InternalMemoryAssetVersionRecordResponseSchema,
};
exports.internalMemoryAssetVersionListContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetVersionListRequestSchema,
    responseSchema: exports.InternalMemoryAssetVersionListResponseSchema,
};
exports.internalMemoryAssetVersionLatestContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetVersionLatestRequestSchema,
    responseSchema: exports.InternalMemoryAssetVersionLatestResponseSchema,
};
exports.internalMemoryAssetVersionReviewContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryAssetVersionReviewRequestSchema,
    responseSchema: exports.InternalMemoryAssetVersionReviewResponseSchema,
};
//# sourceMappingURL=internal-memory-asset-versions.js.map