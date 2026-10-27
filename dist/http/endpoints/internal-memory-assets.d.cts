import { z } from 'zod';
export declare const INTERNAL_MEMORY_ASSETS_PATH: "/internal/memory/assets";
/** List of the assets of a project: POST, because the signed run context does not fit a query string. */
export declare const INTERNAL_MEMORY_ASSETS_LIST_PATH: "/internal/memory/assets/list";
/**
 * POST: a file, archive or link handed to the company memory. Size is limited by the service, not the contract.
 * A `link` origin carries no bytes; every other origin requires `contentBase64`.
 * `context` says for which agentic company (organization) the asset is stored: the signed context of the run,
 * as for the other company memory routes. An attachment that arrives on its own (email) carries the context the
 * connector issues for the organization of the conversation. The service takes tenant and organization from the
 * verified context, never from `asset`.
 */
export declare const InternalMemoryAssetIngestRequestSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
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
    contentBase64: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryAssetIngestRequest = z.infer<typeof InternalMemoryAssetIngestRequestSchema>;
export declare const InternalMemoryAssetIngestResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"file">;
    assetId: z.ZodString;
    sha256: z.ZodString;
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
/** POST INTERNAL_MEMORY_ASSETS_LIST_PATH: assets of a project, for the organization of the signed context. */
export declare const InternalMemoryAssetListRequestSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    projectId: z.ZodString;
    companyId: z.ZodOptional<z.ZodString>;
    buSlug: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type InternalMemoryAssetListRequest = z.infer<typeof InternalMemoryAssetListRequestSchema>;
/** @deprecated 1.63.0: the list carries the signed context, use `InternalMemoryAssetListRequestSchema`. */
export declare const InternalMemoryAssetListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    projectId: z.ZodString;
    companyId: z.ZodOptional<z.ZodString>;
    buSlug: z.ZodOptional<z.ZodString>;
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
        links: z.ZodArray<z.ZodObject<{
            recordId: z.ZodString;
            recordKind: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryAssetListResponse = z.infer<typeof InternalMemoryAssetListResponseSchema>;
export declare const internalMemoryAssetIngestContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/assets";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
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
        contentBase64: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"file">;
        assetId: z.ZodString;
        sha256: z.ZodString;
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
};
export declare const internalMemoryAssetListContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/assets/list";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        projectId: z.ZodString;
        companyId: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
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
            createdAt: z.ZodISODateTime;
            links: z.ZodArray<z.ZodObject<{
                recordId: z.ZodString;
                recordKind: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-assets.d.ts.map