import { z } from 'zod';
export declare const ASSET_ORIGIN_KINDS: readonly ["email", "archive", "session", "link", "generated"];
export declare const AssetSha256Schema: z.ZodString;
export type AssetSha256 = z.infer<typeof AssetSha256Schema>;
/** Kind of a company asset (logo, brand-book, price-list...), lowercase slug. */
export declare const AssetTypeSchema: z.ZodString;
export type AssetType = z.infer<typeof AssetTypeSchema>;
/** Provenance of a company file, without embedding its contents. */
export declare const AssetOriginSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    /**
     * Where a verified delivery of the session lives (1.74.0, optional: older refs carry only the session). The
     * three fields go together: `repo` and `commit` name the delivery, `path` the file inside it. A ref with
     * only some of them is not a delivery pointer and is rejected.
     */
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
export type AssetOrigin = z.infer<typeof AssetOriginSchema>;
/**
 * Shared reference scoped to a tenant, company and project.
 * `companyId` is the client company, `projectId` the project.
 * For a `link` origin `sha256` is the fingerprint of the URL and `sizeBytes` is 0.
 */
export declare const AssetRefSchema: z.ZodObject<{
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
        /**
         * Where a verified delivery of the session lives (1.74.0, optional: older refs carry only the session). The
         * three fields go together: `repo` and `commit` name the delivery, `path` the file inside it. A ref with
         * only some of them is not a delivery pointer and is rejected.
         */
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
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AssetRef = z.infer<typeof AssetRefSchema>;
//# sourceMappingURL=asset.d.ts.map