import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { AssetRefSchema, AssetSha256Schema } from "../organization/asset.js";
import { DecisionRequestIdSchema } from "../organization/decision-request.js";
// Deferred: decision-request.ts imports this module, so the identifier is read only at parse time.
const PlanIdSchema = z.lazy(() => DecisionRequestIdSchema);
export const DOCUMENT_PDF_RECEIPT_ROLES = ['action_plan', 'lab_dossier', 'document'];
export const DocumentPdfReceiptRoleSchema = z.enum(DOCUMENT_PDF_RECEIPT_ROLES);
const ExactVersionSchema = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
const SnapshotIdSchema = z.string().min(1).max(128);
/** What the PDF was rendered from. The digests here are never the SHA of the PDF bytes. */
export const DocumentPdfReceiptSourceSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal('action_plan'),
        planId: PlanIdSchema,
        version: z.number().int().min(1),
        /** Digest of the approved plan, not of the document data and not of the PDF. */
        digest: AssetSha256Schema,
    }),
    z.strictObject({
        kind: z.literal('lab_dossier'),
        snapshotId: SnapshotIdSchema,
        digest: AssetSha256Schema,
    }),
    z.strictObject({
        kind: z.literal('document'),
        /** SHA-256 of the canonical document data. */
        sha256: AssetSha256Schema,
    }),
]);
/** The plan and dossier a delivery pair belongs to; identical in both receipts of one delivery. */
export const DocumentPdfDeliveryContextSchema = z.strictObject({
    planId: PlanIdSchema,
    planVersion: z.number().int().min(1),
    planDigest: AssetSha256Schema,
    dossierSnapshotId: SnapshotIdSchema,
    dossierDigest: AssetSha256Schema,
});
/**
 * Receipt of a PDF rendered, stored and read back by the service. The schema checks shape and coherence only:
 * it does not authenticate the producer, which is the service that issues the receipt after reading the bytes.
 */
export const DocumentPdfReceiptSchema = z.strictObject({
    schemaVersion: z.literal(1),
    role: DocumentPdfReceiptRoleSchema,
    tenantId: AssetRefSchema.shape.tenantId,
    organizationId: z.string().min(1).max(64),
    clientId: AssetRefSchema.shape.companyId,
    projectId: AssetRefSchema.shape.projectId,
    source: DocumentPdfReceiptSourceSchema,
    /** SHA-256 of the canonical document data; distinct from the PDF bytes. */
    documentDigest: AssetSha256Schema,
    asset: AssetRefSchema,
    renderer: z.strictObject({ name: z.literal('pdfmake'), version: ExactVersionSchema }),
    fontSet: z.strictObject({ name: z.string().min(1).max(64), version: ExactVersionSchema }),
    pageCount: z.number().int().min(1),
    createdAt: z.iso.datetime({ offset: true }),
    producedBy: z.strictObject({ agentId: AgentIdSchema }),
    deliveryContext: DocumentPdfDeliveryContextSchema.optional(),
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