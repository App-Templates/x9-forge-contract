import { z } from 'zod';
export declare const INTERNAL_MEMORY_DECISION_REQUESTS_PATH: "/internal/memory/decision-requests";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_PATH: "/internal/memory/decision-requests/:requestId";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH: "/internal/memory/decision-requests/:requestId/outcome";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH: "/internal/memory/decision-requests/by-project";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_AGENT_PAGE_PATH: "/internal/memory/decision-requests/by-agent-page";
export declare const InternalMemoryDecisionRequestParamsSchema: z.ZodObject<{
    requestId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestParams = z.infer<typeof InternalMemoryDecisionRequestParamsSchema>;
export declare const InternalMemoryDecisionRequestQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestQuery = z.infer<typeof InternalMemoryDecisionRequestQuerySchema>;
export declare const InternalMemoryDecisionRequestCreateResponseSchema: z.ZodObject<{
    requestId: z.ZodString;
    state: z.ZodLiteral<"open">;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestCreateResponse = z.infer<typeof InternalMemoryDecisionRequestCreateResponseSchema>;
export declare const InternalMemoryDecisionRequestReadResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    request: z.ZodObject<{
        requestId: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
            effect: z.ZodOptional<z.ZodEnum<{
                approve: "approve";
                request_changes: "request_changes";
                reject: "reject";
            }>>;
        }, z.core.$strict>>;
        requestedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        addressedTo: z.ZodUnion<readonly [z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    state: z.ZodLiteral<"open">;
    outcome: z.ZodNull;
}, z.core.$strict>, z.ZodObject<{
    request: z.ZodObject<{
        requestId: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
            effect: z.ZodOptional<z.ZodEnum<{
                approve: "approve";
                request_changes: "request_changes";
                reject: "reject";
            }>>;
        }, z.core.$strict>>;
        requestedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        addressedTo: z.ZodUnion<readonly [z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    state: z.ZodLiteral<"decided">;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"approved">;
        optionId: z.ZodString;
        referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            buSlug: z.ZodOptional<z.ZodString>;
            replaces: z.ZodOptional<z.ZodString>;
            email: z.ZodEmail;
            personRef: z.ZodString;
            role: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>>>>;
        note: z.ZodOptional<z.ZodString>;
        requestId: z.ZodString;
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        referentWords: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"rejected">;
        reason: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        referentWords: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "outcome">;
}, z.core.$strict>], "state">;
export type InternalMemoryDecisionRequestReadResponse = z.infer<typeof InternalMemoryDecisionRequestReadResponseSchema>;
export declare const InternalMemoryDecisionRequestStateSchema: z.ZodEnum<{
    decided: "decided";
    open: "open";
}>;
export type InternalMemoryDecisionRequestState = z.infer<typeof InternalMemoryDecisionRequestStateSchema>;
/**
 * List (1.66.0, stage probes T3/T7 and readers that do not know the request id): the requests opened by one agent,
 * optionally restricted to one subject plan and to one state, newest first.
 * Same scope rule as the read: tenant and agent.
 */
export declare const InternalMemoryDecisionRequestListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    planId: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<{
        decided: "decided";
        open: "open";
    }>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestListQuery = z.infer<typeof InternalMemoryDecisionRequestListQuerySchema>;
export declare const InternalMemoryDecisionRequestListResponseSchema: z.ZodObject<{
    requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"open">;
        outcome: z.ZodNull;
    }, z.core.$strict>, z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"decided">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"approved">;
            optionId: z.ZodString;
            referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                buSlug: z.ZodOptional<z.ZodString>;
                replaces: z.ZodOptional<z.ZodString>;
                email: z.ZodEmail;
                personRef: z.ZodString;
                role: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>>>>;
            note: z.ZodOptional<z.ZodString>;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestListResponse = z.infer<typeof InternalMemoryDecisionRequestListResponseSchema>;
/** agentId identifies the Director reader to authorize, never the requests' producers. */
export declare const InternalMemoryDecisionRequestProjectListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestProjectListQuery = z.infer<typeof InternalMemoryDecisionRequestProjectListQuerySchema>;
/**
 * Decoded cursor: transported as opaque base64url-encoded JSON. The service must
 * validate the decoded value and match its tenant/organization/project against
 * the query and authenticated scope on every page; a cursor grants no access.
 * Both ordering keys are mandatory, including when several rows share a timestamp.
 */
export declare const InternalMemoryDecisionRequestProjectCursorSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    createdAt: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestProjectCursor = z.infer<typeof InternalMemoryDecisionRequestProjectCursorSchema>;
export declare const InternalMemoryDecisionRequestProjectListResponseSchema: z.ZodObject<{
    requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"open">;
        outcome: z.ZodNull;
    }, z.core.$strict>, z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"decided">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"approved">;
            optionId: z.ZodString;
            referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                buSlug: z.ZodOptional<z.ZodString>;
                replaces: z.ZodOptional<z.ZodString>;
                email: z.ZodEmail;
                personRef: z.ZodString;
                role: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>>>>;
            note: z.ZodOptional<z.ZodString>;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestProjectListResponse = z.infer<typeof InternalMemoryDecisionRequestProjectListResponseSchema>;
/**
 * Agent page (1.304.0): the history of one chief inside one project. agentId is both
 * the reader and the author of the requests; there is no alternative producer key and
 * no state or plan filter, so a pending request can never be hidden by the query.
 */
export declare const InternalMemoryDecisionRequestAgentPageQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestAgentPageQuery = z.infer<typeof InternalMemoryDecisionRequestAgentPageQuerySchema>;
/**
 * Decoded cursor: transported as opaque, canonical base64url-encoded JSON. The service
 * validates the decoded value and matches tenant, reader/author, organization and project
 * against the query and the authenticated scope on every page; a cursor grants no access.
 * Both ordering keys are mandatory, including when several rows share a timestamp.
 */
export declare const InternalMemoryDecisionRequestAgentPageCursorSchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    createdAt: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestAgentPageCursor = z.infer<typeof InternalMemoryDecisionRequestAgentPageCursorSchema>;
/** Same page as the project list: whole requests and outcomes, unique ids, at most 100, mandatory nextCursor. */
export declare const InternalMemoryDecisionRequestAgentPageResponseSchema: z.ZodObject<{
    requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"open">;
        outcome: z.ZodNull;
    }, z.core.$strict>, z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"decided">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"approved">;
            optionId: z.ZodString;
            referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                buSlug: z.ZodOptional<z.ZodString>;
                replaces: z.ZodOptional<z.ZodString>;
                email: z.ZodEmail;
                personRef: z.ZodString;
                role: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>>>>;
            note: z.ZodOptional<z.ZodString>;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestAgentPageResponse = z.infer<typeof InternalMemoryDecisionRequestAgentPageResponseSchema>;
export declare const InternalMemoryDecisionRequestOutcomeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        recorded: "recorded";
    }>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestOutcomeResponse = z.infer<typeof InternalMemoryDecisionRequestOutcomeResponseSchema>;
export declare const DecisionRequestErrorCodeSchema: z.ZodEnum<{
    decision_request_conflict: "decision_request_conflict";
    decision_request_not_found: "decision_request_not_found";
    decision_already_taken: "decision_already_taken";
}>;
export type DecisionRequestErrorCode = z.infer<typeof DecisionRequestErrorCodeSchema>;
export declare const DecisionRequestErrorResponseSchema: z.ZodObject<{
    code: z.ZodEnum<{
        decision_request_conflict: "decision_request_conflict";
        decision_request_not_found: "decision_request_not_found";
        decision_already_taken: "decision_already_taken";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type DecisionRequestErrorResponse = z.infer<typeof DecisionRequestErrorResponseSchema>;
/**
 * Create: 201 for a new request, 200 for an identical replay (same receipt),
 * 409 decision_request_conflict for the same ID with different content.
 */
export declare const internalMemoryDecisionRequestCreateContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/decision-requests";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
            effect: z.ZodOptional<z.ZodEnum<{
                approve: "approve";
                request_changes: "request_changes";
                reject: "reject";
            }>>;
        }, z.core.$strict>>;
        requestedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        addressedTo: z.ZodUnion<readonly [z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requestId: z.ZodString;
        state: z.ZodLiteral<"open">;
    }, z.core.$strict>;
};
/**
 * Read: 200 with the current state; 404 decision_request_not_found for a missing
 * request or a different tenant/agent. The service must check the authenticated
 * scope before returning data; query parameters alone authorize nobody.
 */
export declare const internalMemoryDecisionRequestReadContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests/:requestId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        requestId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"open">;
        outcome: z.ZodNull;
    }, z.core.$strict>, z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                effect: z.ZodOptional<z.ZodEnum<{
                    approve: "approve";
                    request_changes: "request_changes";
                    reject: "reject";
                }>>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"decided">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"approved">;
            optionId: z.ZodString;
            referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                buSlug: z.ZodOptional<z.ZodString>;
                replaces: z.ZodOptional<z.ZodString>;
                email: z.ZodEmail;
                personRef: z.ZodString;
                role: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>>>>;
            note: z.ZodOptional<z.ZodString>;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"action_plan">;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
                documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"lab_dossier">;
                        snapshotId: z.ZodString;
                        digest: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"document">;
                        sha256: z.ZodString;
                    }, z.core.$strict>], "kind">;
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
                }, z.core.$strict>>], null>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodEnum<{
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                assetVersion: z.ZodOptional<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>;
                assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"confirmation_set">;
                planId: z.ZodString;
                planVersion: z.ZodLiteral<1>;
                digest: z.ZodString;
                clientId: z.ZodString;
                entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    projectId: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    kind: z.ZodEnum<{
                        access: "access";
                        asset: "asset";
                        referent: "referent";
                        person: "person";
                        responsibility: "responsibility";
                    }>;
                    entryRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                    entryDigest: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>], "kind">>;
            referentWords: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">;
};
/**
 * Outcome: 200 recorded or duplicate for an identical replay; 409
 * decision_already_taken for a different outcome on an already decided request.
 * The service must correlate body.requestId with params.requestId and validate
 * the authenticated scope and owner against the stored request before writing.
 */
export declare const internalMemoryDecisionRequestOutcomeContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/decision-requests/:requestId/outcome";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        requestId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"approved">;
        optionId: z.ZodString;
        referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            buSlug: z.ZodOptional<z.ZodString>;
            replaces: z.ZodOptional<z.ZodString>;
            email: z.ZodEmail;
            personRef: z.ZodString;
            role: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>>>>;
        note: z.ZodOptional<z.ZodString>;
        requestId: z.ZodString;
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        referentWords: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"rejected">;
        reason: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"action_plan">;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
            documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab_dossier">;
                    snapshotId: z.ZodString;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document">;
                    sha256: z.ZodString;
                }, z.core.$strict>], "kind">;
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
            }, z.core.$strict>>], null>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            assetVersion: z.ZodOptional<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"confirmation_set">;
            planId: z.ZodString;
            planVersion: z.ZodLiteral<1>;
            digest: z.ZodString;
            clientId: z.ZodString;
            entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                projectId: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                }>;
                entryRef: z.ZodString;
                entryVersion: z.ZodNumber;
                entryDigest: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>], "kind">>;
        referentWords: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "outcome">;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            recorded: "recorded";
        }>;
    }, z.core.$strict>;
};
/**
 * List: 200 with the agent's requests, restricted to the requested state when
 * state is provided, always newest first. An unknown agent answers an empty list, never another's.
 */
export declare const internalMemoryDecisionRequestListContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        planId: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodEnum<{
            decided: "decided";
            open: "open";
        }>>;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                    effect: z.ZodOptional<z.ZodEnum<{
                        approve: "approve";
                        request_changes: "request_changes";
                        reject: "reject";
                    }>>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"open">;
            outcome: z.ZodNull;
        }, z.core.$strict>, z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                    effect: z.ZodOptional<z.ZodEnum<{
                        approve: "approve";
                        request_changes: "request_changes";
                        reject: "reject";
                    }>>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"decided">;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                outcome: z.ZodLiteral<"approved">;
                optionId: z.ZodString;
                referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    replaces: z.ZodOptional<z.ZodString>;
                    email: z.ZodEmail;
                    personRef: z.ZodString;
                    role: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>>>>;
                note: z.ZodOptional<z.ZodString>;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                referentWords: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"rejected">;
                reason: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                referentWords: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "outcome">;
        }, z.core.$strict>], "state">>;
    }, z.core.$strict>;
};
/**
 * Project list: authorize agentId as a Director for this tenant, organization
 * and project before returning data, on every page. Return no data from other
 * scopes; query parameters and decoded cursors alone authorize nobody.
 * Include every lead's requests and every state, preserving full requests,
 * referents, outcomes and email receipts. No producer, plan or state filter.
 *
 * Stable order: createdAt DESC, requestId ASC. Continue strictly after BOTH keys:
 * createdAt < cursor.createdAt OR (createdAt = cursor.createdAt AND requestId >
 * cursor.requestId). Never use an offset. Decode and validate cursors with
 * InternalMemoryDecisionRequestProjectCursorSchema and verify their scope as
 * documented above on every page.
 *
 * The service reads limit + 1 rows (default limit: 50), returns at most limit
 * rows, and emits a cursor for the last returned row only if more rows remain.
 * Only the mandatory nextCursor: null marks completion; clients must read all
 * pages. State changes do not move rows. New requests require a new complete
 * read before assembly; an empty or partial list does not authorize assembly.
 * Authorization, database pagination and assembly checks belong to consumers.
 */
export declare const internalMemoryDecisionRequestProjectListContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests/by-project";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                    effect: z.ZodOptional<z.ZodEnum<{
                        approve: "approve";
                        request_changes: "request_changes";
                        reject: "reject";
                    }>>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"open">;
            outcome: z.ZodNull;
        }, z.core.$strict>, z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                    effect: z.ZodOptional<z.ZodEnum<{
                        approve: "approve";
                        request_changes: "request_changes";
                        reject: "reject";
                    }>>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"decided">;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                outcome: z.ZodLiteral<"approved">;
                optionId: z.ZodString;
                referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    replaces: z.ZodOptional<z.ZodString>;
                    email: z.ZodEmail;
                    personRef: z.ZodString;
                    role: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>>>>;
                note: z.ZodOptional<z.ZodString>;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                referentWords: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"rejected">;
                reason: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                referentWords: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "outcome">;
        }, z.core.$strict>], "state">>;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
/**
 * Agent page: the service authorizes agentId with read access to the organization (never
 * manage) and limits the query to tenant, agentId as author, organization and project, on
 * every page. Every state is returned, with the full requests, referents, outcomes and
 * email receipts. No producer, plan or state filter. The legacy agent list and the project
 * list keep their own contracts unchanged.
 *
 * Stable order: createdAt DESC, requestId ASC. Continue strictly after BOTH keys:
 * createdAt < cursor.createdAt OR (createdAt = cursor.createdAt AND requestId >
 * cursor.requestId). Never use an offset. Decode and validate cursors with
 * InternalMemoryDecisionRequestAgentPageCursorSchema and verify their scope on every page.
 *
 * The service reads limit + 1 rows (default limit: 50), returns at most limit rows, and
 * emits a cursor for the last returned row only if more rows remain. Only the mandatory
 * nextCursor: null marks completion; clients must read all pages. A change of outcome does
 * not move a row. New requests require a new complete read before assembly; an empty or
 * partial list does not authorize assembly. Authorization, database pagination and
 * assembly checks belong to consumers.
 */
export declare const internalMemoryDecisionRequestAgentPageContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests/by-agent-page";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                    effect: z.ZodOptional<z.ZodEnum<{
                        approve: "approve";
                        request_changes: "request_changes";
                        reject: "reject";
                    }>>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"open">;
            outcome: z.ZodNull;
        }, z.core.$strict>, z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                    effect: z.ZodOptional<z.ZodEnum<{
                        approve: "approve";
                        request_changes: "request_changes";
                        reject: "reject";
                    }>>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"decided">;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                outcome: z.ZodLiteral<"approved">;
                optionId: z.ZodString;
                referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                    level: z.ZodEnum<{
                        client: "client";
                        project: "project";
                        business_unit: "business_unit";
                    }>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    replaces: z.ZodOptional<z.ZodString>;
                    email: z.ZodEmail;
                    personRef: z.ZodString;
                    role: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>>>>;
                note: z.ZodOptional<z.ZodString>;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                referentWords: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"rejected">;
                reason: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"action_plan">;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                    documents: z.ZodOptional<z.ZodTuple<[z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>, z.ZodLazy<z.ZodObject<{
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
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"lab_dossier">;
                            snapshotId: z.ZodString;
                            digest: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"document">;
                            sha256: z.ZodString;
                        }, z.core.$strict>], "kind">;
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
                    }, z.core.$strict>>], null>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                    assetVersion: z.ZodOptional<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>;
                    assetVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"confirmation_set">;
                    planId: z.ZodString;
                    planVersion: z.ZodLiteral<1>;
                    digest: z.ZodString;
                    clientId: z.ZodString;
                    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
                        level: z.ZodEnum<{
                            client: "client";
                            project: "project";
                            business_unit: "business_unit";
                        }>;
                        projectId: z.ZodOptional<z.ZodString>;
                        buSlug: z.ZodOptional<z.ZodString>;
                        kind: z.ZodEnum<{
                            access: "access";
                            asset: "asset";
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
                referentWords: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "outcome">;
        }, z.core.$strict>], "state">>;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-decision-requests.d.ts.map