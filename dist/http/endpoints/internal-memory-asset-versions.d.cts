import { z } from 'zod';
export declare const INTERNAL_MEMORY_ASSET_VERSIONS_PATH: "/internal/memory/asset-versions";
export declare const INTERNAL_MEMORY_ASSET_VERSIONS_LIST_PATH: "/internal/memory/asset-versions/list";
export declare const INTERNAL_MEMORY_ASSET_VERSIONS_LATEST_PATH: "/internal/memory/asset-versions/latest";
export declare const INTERNAL_MEMORY_ASSET_VERSIONS_REVIEWS_PATH: "/internal/memory/asset-versions/reviews";
export declare const ASSET_VERSION_REFUSALS: readonly ["asset_version_conflict", "asset_version_unknown_file", "asset_version_foreign_business_unit", "asset_version_key_not_in_mandate"];
/**
 * The service resolves createdBy from the verified identity, checks buSlug against that identity,
 * and checks key against the business unit's mandate (6304). Zero means the first version.
 */
export declare const InternalMemoryAssetVersionRecordRequestSchema: z.ZodObject<{
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
    buSlug: z.ZodString;
    key: z.ZodString;
    expectedPreviousVersion: z.ZodNumber;
    files: z.ZodArray<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    deliveryPackage: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    provenance: z.ZodObject<z.core.$ZodLooseShape, z.core.$strip>;
}, z.core.$strict>;
export type InternalMemoryAssetVersionRecordRequest = z.infer<typeof InternalMemoryAssetVersionRecordRequestSchema>;
export declare const InternalMemoryAssetVersionRecordResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"recorded">;
    version: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        key: z.ZodString;
        version: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        deliveryPackage: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        provenance: z.ZodObject<{
            createdBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            paperclipIssueId: z.ZodOptional<z.ZodUUID>;
            sessionId: z.ZodOptional<z.ZodString>;
            repo: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            commit: z.ZodOptional<z.ZodString>;
            inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"already_recorded">;
    version: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        key: z.ZodString;
        version: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        deliveryPackage: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        provenance: z.ZodObject<{
            createdBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            paperclipIssueId: z.ZodOptional<z.ZodUUID>;
            sessionId: z.ZodOptional<z.ZodString>;
            repo: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            commit: z.ZodOptional<z.ZodString>;
            inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"refused">;
    code: z.ZodEnum<{
        asset_version_conflict: "asset_version_conflict";
        asset_version_unknown_file: "asset_version_unknown_file";
        asset_version_foreign_business_unit: "asset_version_foreign_business_unit";
        asset_version_key_not_in_mandate: "asset_version_key_not_in_mandate";
    }>;
}, z.core.$strict>], "outcome">;
export type InternalMemoryAssetVersionRecordResponse = z.infer<typeof InternalMemoryAssetVersionRecordResponseSchema>;
/** Organization-wide visibility follows the existing asset list; the service derives states with deriveAssetVersionStates. */
export declare const InternalMemoryAssetVersionListRequestSchema: z.ZodObject<{
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
    buSlug: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type InternalMemoryAssetVersionListRequest = z.infer<typeof InternalMemoryAssetVersionListRequestSchema>;
export declare const InternalMemoryAssetVersionListResponseSchema: z.ZodObject<{
    versions: z.ZodArray<z.ZodObject<{
        record: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            key: z.ZodString;
            version: z.ZodNumber;
            files: z.ZodArray<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            deliveryPackage: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            provenance: z.ZodObject<{
                createdBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                paperclipIssueId: z.ZodOptional<z.ZodUUID>;
                sessionId: z.ZodOptional<z.ZodString>;
                repo: z.ZodOptional<z.ZodString>;
                branch: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodEnum<{
            approved: "approved";
            changes_requested: "changes_requested";
            delivered: "delivered";
            superseded: "superseded";
            rejected_by_lead: "rejected_by_lead";
            awaiting_decision: "awaiting_decision";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryAssetVersionListResponse = z.infer<typeof InternalMemoryAssetVersionListResponseSchema>;
export declare const InternalMemoryAssetVersionLatestRequestSchema: z.ZodObject<{
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
    buSlug: z.ZodString;
    key: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryAssetVersionLatestRequest = z.infer<typeof InternalMemoryAssetVersionLatestRequestSchema>;
export declare const InternalMemoryAssetVersionLatestResponseSchema: z.ZodObject<{
    version: z.ZodNullable<z.ZodObject<{
        record: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            key: z.ZodString;
            version: z.ZodNumber;
            files: z.ZodArray<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            deliveryPackage: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            provenance: z.ZodObject<{
                createdBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                paperclipIssueId: z.ZodOptional<z.ZodUUID>;
                sessionId: z.ZodOptional<z.ZodString>;
                repo: z.ZodOptional<z.ZodString>;
                branch: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodEnum<{
            approved: "approved";
        }>;
        requestId: z.ZodString;
        decidedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryAssetVersionLatestResponse = z.infer<typeof InternalMemoryAssetVersionLatestResponseSchema>;
/** Reviewer identity and timestamp come from the service; the existing redo/reason check is preserved. */
export declare const InternalMemoryAssetVersionReviewRequestSchema: z.ZodObject<{
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
    key: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    version: z.ZodNumber;
    buSlug: z.ZodString;
    verdict: z.ZodEnum<{
        ok: "ok";
        redo: "redo";
    }>;
}, z.core.$strict>;
export type InternalMemoryAssetVersionReviewRequest = z.infer<typeof InternalMemoryAssetVersionReviewRequestSchema>;
export declare const InternalMemoryAssetVersionReviewResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"recorded">;
    review: z.ZodObject<{
        buSlug: z.ZodString;
        key: z.ZodString;
        version: z.ZodNumber;
        verdict: z.ZodEnum<{
            ok: "ok";
            redo: "redo";
        }>;
        reason: z.ZodOptional<z.ZodString>;
        reviewedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        reviewedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"refused">;
    code: z.ZodEnum<{
        asset_version_not_found: "asset_version_not_found";
        asset_version_review_not_lead: "asset_version_review_not_lead";
    }>;
}, z.core.$strict>], "outcome">;
export type InternalMemoryAssetVersionReviewResponse = z.infer<typeof InternalMemoryAssetVersionReviewResponseSchema>;
export declare const internalMemoryAssetVersionRecordContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/asset-versions";
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
        buSlug: z.ZodString;
        key: z.ZodString;
        expectedPreviousVersion: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        deliveryPackage: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        provenance: z.ZodObject<z.core.$ZodLooseShape, z.core.$strip>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"recorded">;
        version: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            key: z.ZodString;
            version: z.ZodNumber;
            files: z.ZodArray<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            deliveryPackage: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            provenance: z.ZodObject<{
                createdBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                paperclipIssueId: z.ZodOptional<z.ZodUUID>;
                sessionId: z.ZodOptional<z.ZodString>;
                repo: z.ZodOptional<z.ZodString>;
                branch: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"already_recorded">;
        version: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            key: z.ZodString;
            version: z.ZodNumber;
            files: z.ZodArray<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            deliveryPackage: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            provenance: z.ZodObject<{
                createdBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                paperclipIssueId: z.ZodOptional<z.ZodUUID>;
                sessionId: z.ZodOptional<z.ZodString>;
                repo: z.ZodOptional<z.ZodString>;
                branch: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"refused">;
        code: z.ZodEnum<{
            asset_version_conflict: "asset_version_conflict";
            asset_version_unknown_file: "asset_version_unknown_file";
            asset_version_foreign_business_unit: "asset_version_foreign_business_unit";
            asset_version_key_not_in_mandate: "asset_version_key_not_in_mandate";
        }>;
    }, z.core.$strict>], "outcome">;
};
export declare const internalMemoryAssetVersionListContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/asset-versions/list";
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
        buSlug: z.ZodOptional<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        versions: z.ZodArray<z.ZodObject<{
            record: z.ZodObject<{
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                key: z.ZodString;
                version: z.ZodNumber;
                files: z.ZodArray<z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>>;
                deliveryPackage: z.ZodOptional<z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>>;
                provenance: z.ZodObject<{
                    createdBy: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    paperclipIssueId: z.ZodOptional<z.ZodUUID>;
                    sessionId: z.ZodOptional<z.ZodString>;
                    repo: z.ZodOptional<z.ZodString>;
                    branch: z.ZodOptional<z.ZodString>;
                    commit: z.ZodOptional<z.ZodString>;
                    inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>;
                recordedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodEnum<{
                approved: "approved";
                changes_requested: "changes_requested";
                delivered: "delivered";
                superseded: "superseded";
                rejected_by_lead: "rejected_by_lead";
                awaiting_decision: "awaiting_decision";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const internalMemoryAssetVersionLatestContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/asset-versions/latest";
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
        buSlug: z.ZodString;
        key: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        version: z.ZodNullable<z.ZodObject<{
            record: z.ZodObject<{
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                key: z.ZodString;
                version: z.ZodNumber;
                files: z.ZodArray<z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>>;
                deliveryPackage: z.ZodOptional<z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>>;
                provenance: z.ZodObject<{
                    createdBy: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    paperclipIssueId: z.ZodOptional<z.ZodUUID>;
                    sessionId: z.ZodOptional<z.ZodString>;
                    repo: z.ZodOptional<z.ZodString>;
                    branch: z.ZodOptional<z.ZodString>;
                    commit: z.ZodOptional<z.ZodString>;
                    inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>;
                recordedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodEnum<{
                approved: "approved";
            }>;
            requestId: z.ZodString;
            decidedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const internalMemoryAssetVersionReviewContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/asset-versions/reviews";
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
        key: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        buSlug: z.ZodString;
        verdict: z.ZodEnum<{
            ok: "ok";
            redo: "redo";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"recorded">;
        review: z.ZodObject<{
            buSlug: z.ZodString;
            key: z.ZodString;
            version: z.ZodNumber;
            verdict: z.ZodEnum<{
                ok: "ok";
                redo: "redo";
            }>;
            reason: z.ZodOptional<z.ZodString>;
            reviewedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            reviewedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"refused">;
        code: z.ZodEnum<{
            asset_version_not_found: "asset_version_not_found";
            asset_version_review_not_lead: "asset_version_review_not_lead";
        }>;
    }, z.core.$strict>], "outcome">;
};
//# sourceMappingURL=internal-memory-asset-versions.d.ts.map