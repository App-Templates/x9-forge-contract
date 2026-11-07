import { z } from 'zod';
export declare const DEV_DELIVERY_LINKS_MAX_PATHS = 12;
export declare const DEV_DELIVERY_LINK_TTL_MS: number;
/** Transport request only; session authorization and file lookup belong to the service. */
export declare const DevDeliveryLinksRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    deliveryRef: z.ZodObject<{
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
    paths: z.ZodArray<z.ZodString>;
    bundle: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodString;
        paths: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevDeliveryLinksRequest = z.infer<typeof DevDeliveryLinksRequestSchema>;
export declare const DevDeliveryLinkSchema: z.ZodObject<{
    path: z.ZodString;
    url: z.ZodURL;
    expiresAt: z.ZodISODateTime;
    mediaType: z.ZodString;
    sha256: z.ZodString;
    sizeBytes: z.ZodNumber;
}, z.core.$strict>;
export type DevDeliveryLink = z.infer<typeof DevDeliveryLinkSchema>;
export declare const DevDeliveryLinksResponseSchema: z.ZodObject<{
    links: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        url: z.ZodURL;
        expiresAt: z.ZodISODateTime;
        mediaType: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>>;
    bundle: z.ZodOptional<z.ZodObject<{
        url: z.ZodURL;
        expiresAt: z.ZodISODateTime;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
        path: z.ZodString;
        mediaType: z.ZodLiteral<"application/zip">;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevDeliveryLinksResponse = z.infer<typeof DevDeliveryLinksResponseSchema>;
/**
 * Signed preview links for files of a delivery. The service verifies that
 * params.sessionId equals deliveryRef.origin.sessionId and that the scope tenant
 * and agent belong to that session. Every path is read at the delivery commit;
 * links expire after DEV_DELIVERY_LINK_TTL_MS (30 days). sha256 and sizeBytes
 * let the caller re-read the bytes through readDevSessionAssetContract.
 * With request.bundle the service also composes one ZIP of bundle.paths, read at
 * the same commit with the same checks as paths, and answers response.bundle: a
 * link whose path is bundle.fileName and whose mediaType is application/zip.
 */
export declare const devDeliveryLinksContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/dev/sessions/:sessionId/delivery-links";
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
        deliveryRef: z.ZodObject<{
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
        paths: z.ZodArray<z.ZodString>;
        bundle: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodString;
            paths: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        links: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            url: z.ZodURL;
            expiresAt: z.ZodISODateTime;
            mediaType: z.ZodString;
            sha256: z.ZodString;
            sizeBytes: z.ZodNumber;
        }, z.core.$strict>>;
        bundle: z.ZodOptional<z.ZodObject<{
            url: z.ZodURL;
            expiresAt: z.ZodISODateTime;
            sha256: z.ZodString;
            sizeBytes: z.ZodNumber;
            path: z.ZodString;
            mediaType: z.ZodLiteral<"application/zip">;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-dev-delivery-links.d.ts.map