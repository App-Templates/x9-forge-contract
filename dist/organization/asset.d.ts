import { z } from 'zod';
export declare const ASSET_ORIGIN_KINDS: readonly ["email", "archive", "session"];
export declare const AssetSha256Schema: z.ZodString;
export type AssetSha256 = z.infer<typeof AssetSha256Schema>;
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
}, z.core.$strict>], "kind">;
export type AssetOrigin = z.infer<typeof AssetOriginSchema>;
/** Shared reference scoped to a tenant, company and project. */
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
    }, z.core.$strict>], "kind">;
    tenantId: z.ZodString;
    companyId: z.ZodString;
    projectId: z.ZodString;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AssetRef = z.infer<typeof AssetRefSchema>;
//# sourceMappingURL=asset.d.ts.map