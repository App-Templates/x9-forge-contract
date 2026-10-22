import { z } from 'zod';
export declare const INTERNAL_MEMORY_ASSETS_PATH: "/internal/memory/assets";
/** POST: a file or archive handed to the company memory. Size is limited by the service, not the contract. */
export declare const InternalMemoryAssetIngestRequestSchema: z.ZodObject<{
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
        }, z.core.$strict>], "kind">;
        tenantId: z.ZodString;
        companyId: z.ZodString;
        projectId: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    contentBase64: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryAssetIngestRequest = z.infer<typeof InternalMemoryAssetIngestRequestSchema>;
export declare const InternalMemoryAssetIngestResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"file">;
    assetId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"archive">;
    archiveAssetId: z.ZodString;
    entries: z.ZodArray<z.ZodObject<{
        assetId: z.ZodString;
        path: z.ZodString;
        mediaType: z.ZodString;
        preview: z.ZodBoolean;
    }, z.core.$strict>>;
    previewAssetId: z.ZodNullable<z.ZodString>;
}, z.core.$strict>], "kind">;
export type InternalMemoryAssetIngestResponse = z.infer<typeof InternalMemoryAssetIngestResponseSchema>;
/** GET: assets of a project. */
export declare const InternalMemoryAssetListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    projectId: z.ZodString;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type InternalMemoryAssetListQuery = z.infer<typeof InternalMemoryAssetListQuerySchema>;
export declare const InternalMemoryAssetListResponseSchema: z.ZodObject<{
    assets: z.ZodArray<z.ZodObject<{
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
        links: z.ZodArray<z.ZodObject<{
            recordId: z.ZodString;
            recordKind: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryAssetListResponse = z.infer<typeof InternalMemoryAssetListResponseSchema>;
//# sourceMappingURL=internal-memory-assets.d.ts.map