import { z } from 'zod';
/** Transport request only; session authorization and file lookup belong to the service. */
export declare const DevSessionAssetReadSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
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
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    offset: z.ZodNumber;
    length: z.ZodNumber;
}, z.core.$strict>;
export type DevSessionAssetRead = z.infer<typeof DevSessionAssetReadSchema>;
/**
 * Read-only POST for bytes of a delivered session asset. The service verifies
 * that params.sessionId equals asset.origin.sessionId and that the scope tenant
 * and agent belong to that session, authorizing its owner as well. Verify sha256
 * and sizeBytes against the complete file, not just the requested chunk. Missing
 * or foreign assets produce a service error, never an empty file.
 */
export declare const readDevSessionAssetContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/read";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
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
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        offset: z.ZodNumber;
        length: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        artifact: z.ZodObject<{
            artifactRef: z.ZodString;
            mediaType: z.ZodString;
            bytes: z.ZodNumber;
            sha256: z.ZodString;
            fileName: z.ZodOptional<z.ZodString>;
            displayName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        offset: z.ZodNumber;
        contentBase64: z.ZodString;
        eof: z.ZodBoolean;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-dev-session-asset-content.d.ts.map