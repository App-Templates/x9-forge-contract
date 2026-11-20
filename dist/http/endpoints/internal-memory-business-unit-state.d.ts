import { z } from 'zod';
export declare const INTERNAL_MEMORY_BUSINESS_UNIT_STATE_PATH: "/internal/memory/business-unit-state";
/** Memory resolves the caller's role, projects and departments from the verified run identity. */
export declare const InternalMemoryBusinessUnitStateRequestSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type InternalMemoryBusinessUnitStateRequest = z.infer<typeof InternalMemoryBusinessUnitStateRequestSchema>;
/**
 * These are the facts consumed by deriveBusinessUnitStateSummary. A lead review carries no scope,
 * so the consumer pairs it with the department scope it was read in. The derivation ignores every
 * fact outside that scope. If the complete facts exceed a limit, Memory refuses with state_too_large
 * instead of truncating them before derivation, which could change the resulting state.
 */
export declare const InternalMemoryBusinessUnitStateResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"listed">;
    role: z.ZodEnum<{
        director: "director";
        "capo-bu": "capo-bu";
        other: "other";
    }>;
    departments: z.ZodArray<z.ZodObject<{
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
        }, z.core.$strict>;
        versions: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
        decisions: z.ZodArray<z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
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
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                            asset: "asset";
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
            outcome: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
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
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                            asset: "asset";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
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
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
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
                            referent: "referent";
                            person: "person";
                            responsibility: "responsibility";
                            asset: "asset";
                        }>;
                        entryRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                        entryDigest: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>], "outcome">>;
        }, z.core.$strict>>;
        leadReviews: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
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
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"refused">;
    code: z.ZodLiteral<"state_too_large">;
}, z.core.$strict>], "outcome">;
export type InternalMemoryBusinessUnitStateResponse = z.infer<typeof InternalMemoryBusinessUnitStateResponseSchema>;
export declare const internalMemoryBusinessUnitStateContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/business-unit-state";
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"listed">;
        role: z.ZodEnum<{
            director: "director";
            "capo-bu": "capo-bu";
            other: "other";
        }>;
        departments: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
            }, z.core.$strict>;
            versions: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strict>>;
            decisions: z.ZodArray<z.ZodObject<{
                request: z.ZodObject<{
                    requestId: z.ZodString;
                    tenantId: z.ZodString;
                    organizationId: z.ZodString;
                    projectId: z.ZodOptional<z.ZodString>;
                    subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodEnum<{
                            action_plan: "action_plan";
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
                                referent: "referent";
                                person: "person";
                                responsibility: "responsibility";
                                asset: "asset";
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
                outcome: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                        kind: z.ZodEnum<{
                            action_plan: "action_plan";
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
                                referent: "referent";
                                person: "person";
                                responsibility: "responsibility";
                                asset: "asset";
                            }>;
                            entryRef: z.ZodString;
                            entryVersion: z.ZodNumber;
                            entryDigest: z.ZodString;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>], "kind">>;
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
                        kind: z.ZodEnum<{
                            action_plan: "action_plan";
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
                                referent: "referent";
                                person: "person";
                                responsibility: "responsibility";
                                asset: "asset";
                            }>;
                            entryRef: z.ZodString;
                            entryVersion: z.ZodNumber;
                            entryDigest: z.ZodString;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>], "kind">>;
                }, z.core.$strict>], "outcome">>;
            }, z.core.$strict>>;
            leadReviews: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strict>>;
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
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"refused">;
        code: z.ZodLiteral<"state_too_large">;
    }, z.core.$strict>], "outcome">;
};
//# sourceMappingURL=internal-memory-business-unit-state.d.ts.map