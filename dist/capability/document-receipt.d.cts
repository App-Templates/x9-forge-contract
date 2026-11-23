import { z } from 'zod';
export declare const DOCUMENT_PDF_RECEIPT_ROLES: readonly ["action_plan", "lab_dossier", "document"];
export declare const DocumentPdfReceiptRoleSchema: z.ZodEnum<{
    document: "document";
    action_plan: "action_plan";
    lab_dossier: "lab_dossier";
}>;
export type DocumentPdfReceiptRole = z.infer<typeof DocumentPdfReceiptRoleSchema>;
/** What the PDF was rendered from. The digests here are never the SHA of the PDF bytes. */
export declare const DocumentPdfReceiptSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"action_plan">;
    planId: z.ZodLazy<z.ZodString>;
    version: z.ZodNumber;
    /** Digest of the approved plan, not of the document data and not of the PDF. */
    digest: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"lab_dossier">;
    snapshotId: z.ZodString;
    digest: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"document">;
    /** SHA-256 of the canonical document data. */
    sha256: z.ZodString;
}, z.core.$strict>], "kind">;
export type DocumentPdfReceiptSource = z.infer<typeof DocumentPdfReceiptSourceSchema>;
/** The plan and dossier a delivery pair belongs to; identical in both receipts of one delivery. */
export declare const DocumentPdfDeliveryContextSchema: z.ZodObject<{
    planId: z.ZodLazy<z.ZodString>;
    planVersion: z.ZodNumber;
    planDigest: z.ZodString;
    dossierSnapshotId: z.ZodString;
    dossierDigest: z.ZodString;
}, z.core.$strict>;
export type DocumentPdfDeliveryContext = z.infer<typeof DocumentPdfDeliveryContextSchema>;
/**
 * Receipt of a PDF rendered, stored and read back by the service. The schema checks shape and coherence only:
 * it does not authenticate the producer, which is the service that issues the receipt after reading the bytes.
 */
export declare const DocumentPdfReceiptSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    role: z.ZodEnum<{
        document: "document";
        action_plan: "action_plan";
        lab_dossier: "lab_dossier";
    }>;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"action_plan">;
        planId: z.ZodLazy<z.ZodString>;
        version: z.ZodNumber;
        /** Digest of the approved plan, not of the document data and not of the PDF. */
        digest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"lab_dossier">;
        snapshotId: z.ZodString;
        digest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"document">;
        /** SHA-256 of the canonical document data. */
        sha256: z.ZodString;
    }, z.core.$strict>], "kind">;
    /** SHA-256 of the canonical document data; distinct from the PDF bytes. */
    documentDigest: z.ZodString;
    asset: z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
        name: z.ZodString;
        mediaType: z.ZodString;
        sizeBytes: z.ZodNumber;
        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"email">;
            messageId: z.ZodString;
            attachmentName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"archive">;
            archiveSha256: z.ZodString;
            entryPath: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"session">;
            sessionId: z.ZodString;
            repo: z.ZodOptional<z.ZodString>;
            commit: z.ZodOptional<z.ZodString>;
            path: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"link">;
            url: z.ZodURL;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"generated">;
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>], "kind">;
        tenantId: z.ZodString;
        companyId: z.ZodString;
        projectId: z.ZodString;
        assetType: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        providedBy: z.ZodOptional<z.ZodObject<{
            personRef: z.ZodString;
        }, z.core.$strict>>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    renderer: z.ZodObject<{
        name: z.ZodLiteral<"pdfmake">;
        version: z.ZodString;
    }, z.core.$strict>;
    fontSet: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
    }, z.core.$strict>;
    pageCount: z.ZodNumber;
    createdAt: z.ZodISODateTime;
    producedBy: z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>;
    deliveryContext: z.ZodOptional<z.ZodObject<{
        planId: z.ZodLazy<z.ZodString>;
        planVersion: z.ZodNumber;
        planDigest: z.ZodString;
        dossierSnapshotId: z.ZodString;
        dossierDigest: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DocumentPdfReceipt = z.infer<typeof DocumentPdfReceiptSchema>;
//# sourceMappingURL=document-receipt.d.ts.map