import { z } from 'zod';
/** Named refusals of the dossier snapshot read. A refusal never carries a partial snapshot. */
export declare const LAB_DOSSIER_SNAPSHOT_ERRORS: readonly ["scope_foreign", "dossier_empty", "cited_version_missing", "cited_version_ambiguous", "dossier_too_large", "snapshot_unavailable"];
export declare const LabDossierSnapshotErrorCodeSchema: z.ZodEnum<{
    scope_foreign: "scope_foreign";
    dossier_empty: "dossier_empty";
    cited_version_missing: "cited_version_missing";
    cited_version_ambiguous: "cited_version_ambiguous";
    dossier_too_large: "dossier_too_large";
    snapshot_unavailable: "snapshot_unavailable";
}>;
export type LabDossierSnapshotErrorCode = z.infer<typeof LabDossierSnapshotErrorCodeSchema>;
/** The signed run context names the organization; the dossier input must name the same one. */
export declare const InternalLabDossierSnapshotRequestSchema: z.ZodObject<{
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
    input: z.ZodObject<{
        pages: z.ZodArray<z.ZodObject<{
            notebookAgentId: z.ZodString;
            slug: z.ZodString;
            version: z.ZodNumber;
            role: z.ZodEnum<{
                current: "current";
                cited_by_plan: "cited_by_plan";
            }>;
            title: z.ZodString;
            body: z.ZodString;
            digest: z.ZodString;
            contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                target: z.ZodLiteral<"decision">;
                requestId: z.ZodString;
                planVersion: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                target: z.ZodLiteral<"map_entry">;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>], "target">]>>>;
        }, z.core.$strict>>;
        planCitations: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            version: z.ZodNumber;
            notebookAgentId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            notebookAgentId: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            contentSha256: z.ZodString;
            origin: z.ZodEnum<{
                web: "web";
                model: "model";
                dataset: "dataset";
                human: "human";
            }>;
        }, z.core.$strict>>;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        snapshotId: z.ZodString;
        cutoff: z.ZodISODateTime;
        scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"client">;
            clientId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"project">;
            clientId: z.ZodString;
            projectId: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
}, z.core.$strict>;
export type InternalLabDossierSnapshotRequest = z.infer<typeof InternalLabDossierSnapshotRequestSchema>;
/** The complete snapshot, or nothing: success never carries an error and never lists a part of the dossier. */
export declare const InternalLabDossierSnapshotResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    snapshot: z.ZodObject<{
        pages: z.ZodArray<z.ZodObject<{
            notebookAgentId: z.ZodString;
            slug: z.ZodString;
            version: z.ZodNumber;
            role: z.ZodEnum<{
                current: "current";
                cited_by_plan: "cited_by_plan";
            }>;
            title: z.ZodString;
            body: z.ZodString;
            digest: z.ZodString;
            contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                target: z.ZodLiteral<"decision">;
                requestId: z.ZodString;
                planVersion: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                target: z.ZodLiteral<"map_entry">;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>], "target">]>>>;
        }, z.core.$strict>>;
        citations: z.ZodArray<z.ZodObject<{
            notebookAgentId: z.ZodString;
            slug: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            notebookAgentId: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            contentSha256: z.ZodString;
            origin: z.ZodEnum<{
                web: "web";
                model: "model";
                dataset: "dataset";
                human: "human";
            }>;
        }, z.core.$strict>>;
        currentPageCount: z.ZodNumber;
        citedExtraPageCount: z.ZodNumber;
        totalPages: z.ZodNumber;
        complete: z.ZodLiteral<true>;
        manifestDigest: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        snapshotId: z.ZodString;
        cutoff: z.ZodISODateTime;
        scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"client">;
            clientId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"project">;
            clientId: z.ZodString;
            projectId: z.ZodString;
        }, z.core.$strict>], "kind">;
        schemaVersion: z.ZodLiteral<1>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type InternalLabDossierSnapshotResponse = z.infer<typeof InternalLabDossierSnapshotResponseSchema>;
export declare const InternalLabDossierSnapshotErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        scope_foreign: "scope_foreign";
        dossier_empty: "dossier_empty";
        cited_version_missing: "cited_version_missing";
        cited_version_ambiguous: "cited_version_ambiguous";
        dossier_too_large: "dossier_too_large";
        snapshot_unavailable: "snapshot_unavailable";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalLabDossierSnapshotError = z.infer<typeof InternalLabDossierSnapshotErrorSchema>;
export declare const internalLabDossierSnapshotPath = "/internal/capability/lab/dossier/snapshot";
/** Read the frozen dossier a Lab published for a client or project, under a signed run context. */
export declare const internalLabDossierSnapshotContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/lab/dossier/snapshot";
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
        input: z.ZodObject<{
            pages: z.ZodArray<z.ZodObject<{
                notebookAgentId: z.ZodString;
                slug: z.ZodString;
                version: z.ZodNumber;
                role: z.ZodEnum<{
                    current: "current";
                    cited_by_plan: "cited_by_plan";
                }>;
                title: z.ZodString;
                body: z.ZodString;
                digest: z.ZodString;
                contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    target: z.ZodLiteral<"decision">;
                    requestId: z.ZodString;
                    planVersion: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    target: z.ZodLiteral<"map_entry">;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>], "target">]>>>;
            }, z.core.$strict>>;
            planCitations: z.ZodArray<z.ZodObject<{
                slug: z.ZodString;
                version: z.ZodNumber;
                notebookAgentId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            sources: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                notebookAgentId: z.ZodString;
                url: z.ZodOptional<z.ZodString>;
                title: z.ZodOptional<z.ZodString>;
                contentSha256: z.ZodString;
                origin: z.ZodEnum<{
                    web: "web";
                    model: "model";
                    dataset: "dataset";
                    human: "human";
                }>;
            }, z.core.$strict>>;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodString;
            snapshotId: z.ZodString;
            cutoff: z.ZodISODateTime;
            scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"client">;
                clientId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"project">;
                clientId: z.ZodString;
                projectId: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        snapshot: z.ZodObject<{
            pages: z.ZodArray<z.ZodObject<{
                notebookAgentId: z.ZodString;
                slug: z.ZodString;
                version: z.ZodNumber;
                role: z.ZodEnum<{
                    current: "current";
                    cited_by_plan: "cited_by_plan";
                }>;
                title: z.ZodString;
                body: z.ZodString;
                digest: z.ZodString;
                contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    target: z.ZodLiteral<"decision">;
                    requestId: z.ZodString;
                    planVersion: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    target: z.ZodLiteral<"map_entry">;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>], "target">]>>>;
            }, z.core.$strict>>;
            citations: z.ZodArray<z.ZodObject<{
                notebookAgentId: z.ZodString;
                slug: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            sources: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                notebookAgentId: z.ZodString;
                url: z.ZodOptional<z.ZodString>;
                title: z.ZodOptional<z.ZodString>;
                contentSha256: z.ZodString;
                origin: z.ZodEnum<{
                    web: "web";
                    model: "model";
                    dataset: "dataset";
                    human: "human";
                }>;
            }, z.core.$strict>>;
            currentPageCount: z.ZodNumber;
            citedExtraPageCount: z.ZodNumber;
            totalPages: z.ZodNumber;
            complete: z.ZodLiteral<true>;
            manifestDigest: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodString;
            snapshotId: z.ZodString;
            cutoff: z.ZodISODateTime;
            scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"client">;
                clientId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"project">;
                clientId: z.ZodString;
                projectId: z.ZodString;
            }, z.core.$strict>], "kind">;
            schemaVersion: z.ZodLiteral<1>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            scope_foreign: "scope_foreign";
            dossier_empty: "dossier_empty";
            cited_version_missing: "cited_version_missing";
            cited_version_ambiguous: "cited_version_ambiguous";
            dossier_too_large: "dossier_too_large";
            snapshot_unavailable: "snapshot_unavailable";
        }>;
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-capability-lab-dossier.d.ts.map