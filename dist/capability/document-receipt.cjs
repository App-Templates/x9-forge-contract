"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPdfReceiptSchema = exports.DocumentPdfDeliveryContextSchema = exports.DocumentPdfReceiptSourceSchema = exports.DocumentPdfReceiptRoleSchema = exports.DOCUMENT_PDF_RECEIPT_ROLES = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const asset_js_1 = require("../organization/asset.cjs");
const decision_request_js_1 = require("../organization/decision-request.cjs");
// Deferred: decision-request.ts imports this module, so the identifier is read only at parse time.
const PlanIdSchema = zod_1.z.lazy(() => decision_request_js_1.DecisionRequestIdSchema);
exports.DOCUMENT_PDF_RECEIPT_ROLES = ['action_plan', 'lab_dossier', 'document'];
exports.DocumentPdfReceiptRoleSchema = zod_1.z.enum(exports.DOCUMENT_PDF_RECEIPT_ROLES);
const ExactVersionSchema = zod_1.z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
const SnapshotIdSchema = zod_1.z.string().min(1).max(128);
/** What the PDF was rendered from. The digests here are never the SHA of the PDF bytes. */
exports.DocumentPdfReceiptSourceSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        kind: zod_1.z.literal('action_plan'),
        planId: PlanIdSchema,
        version: zod_1.z.number().int().min(1),
        /** Digest of the approved plan, not of the document data and not of the PDF. */
        digest: asset_js_1.AssetSha256Schema,
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('lab_dossier'),
        snapshotId: SnapshotIdSchema,
        digest: asset_js_1.AssetSha256Schema,
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('document'),
        /** SHA-256 of the canonical document data. */
        sha256: asset_js_1.AssetSha256Schema,
    }),
]);
/** The plan and dossier a delivery pair belongs to; identical in both receipts of one delivery. */
exports.DocumentPdfDeliveryContextSchema = zod_1.z.strictObject({
    planId: PlanIdSchema,
    planVersion: zod_1.z.number().int().min(1),
    planDigest: asset_js_1.AssetSha256Schema,
    dossierSnapshotId: SnapshotIdSchema,
    dossierDigest: asset_js_1.AssetSha256Schema,
});
/**
 * Receipt of a PDF rendered, stored and read back by the service. The schema checks shape and coherence only:
 * it does not authenticate the producer, which is the service that issues the receipt after reading the bytes.
 */
exports.DocumentPdfReceiptSchema = zod_1.z.strictObject({
    schemaVersion: zod_1.z.literal(1),
    role: exports.DocumentPdfReceiptRoleSchema,
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    source: exports.DocumentPdfReceiptSourceSchema,
    /** SHA-256 of the canonical document data; distinct from the PDF bytes. */
    documentDigest: asset_js_1.AssetSha256Schema,
    asset: asset_js_1.AssetRefSchema,
    renderer: zod_1.z.strictObject({ name: zod_1.z.literal('pdfmake'), version: ExactVersionSchema }),
    fontSet: zod_1.z.strictObject({ name: zod_1.z.string().min(1).max(64), version: ExactVersionSchema }),
    pageCount: zod_1.z.number().int().min(1),
    createdAt: zod_1.z.iso.datetime({ offset: true }),
    producedBy: zod_1.z.strictObject({ agentId: agent_identity_js_1.AgentIdSchema }),
    deliveryContext: exports.DocumentPdfDeliveryContextSchema.optional(),
}).superRefine((receipt, ctx) => {
    const { asset, source } = receipt;
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
    const pdfMedia = asset.mediaType === 'application/pdf';
    if (!pdfMedia)
        issue(['asset', 'mediaType'], 'Asset must be a PDF');
    if (asset.origin.kind !== 'generated') {
        issue(['asset', 'origin', 'kind'], 'Asset origin must be generated');
    }
    else if (asset.origin.agentId !== receipt.producedBy.agentId) {
        issue(['producedBy', 'agentId'], 'Producer must be the agent that generated the asset');
    }
    if (asset.sizeBytes < 1)
        issue(['asset', 'sizeBytes'], 'Asset must not be empty');
    if (asset.tenantId !== receipt.tenantId)
        issue(['asset', 'tenantId'], 'Asset scope must match the receipt');
    if (asset.companyId !== receipt.clientId)
        issue(['asset', 'companyId'], 'Asset scope must match the receipt');
    if (asset.projectId !== receipt.projectId)
        issue(['asset', 'projectId'], 'Asset scope must match the receipt');
    if (source.kind !== receipt.role)
        issue(['source', 'kind'], 'Source must match the receipt role');
    if (receipt.documentDigest === asset.sha256) {
        issue(['documentDigest'], 'Document digest must not be the SHA of the PDF bytes');
    }
    if (source.kind !== 'document' && source.digest === asset.sha256) {
        issue(['source', 'digest'], 'Source digest must not be the SHA of the PDF bytes');
    }
    if (source.kind === 'document' && source.sha256 !== receipt.documentDigest) {
        issue(['source', 'sha256'], 'Source data digest must match the document digest');
    }
    const context = receipt.deliveryContext;
    if (receipt.role === 'document') {
        if (context !== undefined)
            issue(['deliveryContext'], 'A generic document has no delivery context');
        return;
    }
    if (context === undefined) {
        issue(['deliveryContext'], 'Delivery context is required for plan and dossier receipts');
        return;
    }
    if (source.kind === 'action_plan'
        && (context.planId !== source.planId || context.planVersion !== source.version || context.planDigest !== source.digest)) {
        issue(['deliveryContext'], 'Delivery context must match the plan source');
    }
    if (source.kind === 'lab_dossier'
        && (context.dossierSnapshotId !== source.snapshotId || context.dossierDigest !== source.digest)) {
        issue(['deliveryContext'], 'Delivery context must match the dossier source');
    }
});
//# sourceMappingURL=document-receipt.js.map