import { z } from 'zod';
/** Delivered files (at most DEV_SESSION_MAX_FILES) plus the images of the manifest (at most 40). */
export declare const DEV_SESSION_ASSETS_LIST_MAX: number;
/** Transport request only; session authorization and delivery verification belong to the service. */
export declare const DevSessionAssetsListRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    include: z.ZodOptional<z.ZodArray<z.ZodLiteral<"reading">>>;
}, z.core.$strict>;
export type DevSessionAssetsListRequest = z.infer<typeof DevSessionAssetsListRequestSchema>;
/** The list is complete and verified, or the call is refused: never a truncated list. */
export declare const DevSessionAssetsListResponseSchema: z.ZodObject<{
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
    }, z.core.$strict>>;
    reading: z.ZodOptional<z.ZodObject<{
        productKind: z.ZodOptional<z.ZodEnum<{
            code: "code";
            design: "design";
        }>>;
        complete: z.ZodBoolean;
        notMet: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            attestor: z.ZodEnum<{
                sessione: "sessione";
                esecutore: "esecutore";
            }>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        deviationsPath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionAssetsListResponse = z.infer<typeof DevSessionAssetsListResponseSchema>;
export declare const DEV_SESSION_ASSETS_LIST_REFUSALS: readonly ["session_not_found", "session_foreign", "session_not_closed", "delivery_not_verified", "identity_source_unavailable"];
export declare const DevSessionAssetsListRefusalSchema: z.ZodObject<{
    error: z.ZodEnum<{
        session_foreign: "session_foreign";
        session_not_found: "session_not_found";
        session_not_closed: "session_not_closed";
        delivery_not_verified: "delivery_not_verified";
        identity_source_unavailable: "identity_source_unavailable";
    }>;
}, z.core.$strict>;
export type DevSessionAssetsListRefusal = z.infer<typeof DevSessionAssetsListRefusalSchema>;
/**
 * POST that lists the verified files and proof images of a closed session; it serves no bytes (those use
 * readDevSessionAssetContract on the same family of routes). The list is complete or it is a refusal
 * (`delivery_not_verified`), never truncated. Authorization and verification belong to the service, as for bytes.
 */
export declare const listDevSessionAssetsContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/list";
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
        include: z.ZodOptional<z.ZodArray<z.ZodLiteral<"reading">>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
        }, z.core.$strict>>;
        reading: z.ZodOptional<z.ZodObject<{
            productKind: z.ZodOptional<z.ZodEnum<{
                code: "code";
                design: "design";
            }>>;
            complete: z.ZodBoolean;
            notMet: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                attestor: z.ZodEnum<{
                    sessione: "sessione";
                    esecutore: "esecutore";
                }>;
                reason: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            deviationsPath: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-dev-session-assets-list.d.ts.map