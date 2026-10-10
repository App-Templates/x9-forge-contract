import { z } from 'zod';
export declare const ElevenLabsNativeBrowserAdmissionRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    linkId: z.ZodString;
    program: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        programId: z.ZodString;
        programVersion: z.ZodNumber;
        strategy: z.ZodObject<{
            strategyId: z.ZodString;
            strategyVersion: z.ZodString;
        }, z.core.$strict>;
        catalogRevision: z.ZodString;
        policyRevision: z.ZodString;
        progressionRevision: z.ZodString;
        measureDefinitionRevision: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ElevenLabsNativeBrowserAdmissionRequest = z.infer<typeof ElevenLabsNativeBrowserAdmissionRequestSchema>;
/** Public facade excludes user identity, policy, mapping and connection credentials. */
export declare const ElevenLabsNativeBrowserAdmissionResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    attemptId: z.ZodString;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ElevenLabsNativeBrowserAdmissionResult = z.infer<typeof ElevenLabsNativeBrowserAdmissionResultSchema>;
export declare const nativeBrowserAdmissionContract: {
    readonly method: "POST";
    readonly path: "/api/native/admissions";
    readonly authType: "forge_session";
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        linkId: z.ZodString;
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        attemptId: z.ZodString;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
};
export declare const nativeAuthorityResolveContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        attemptId: z.ZodString;
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        request: z.ZodObject<{
            requestId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            attemptId: z.ZodString;
            phase: z.ZodEnum<{
                before: "before";
                after: "after";
            }>;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            attemptId: z.ZodString;
            requestId: z.ZodString;
            linkId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            viewer: z.ZodObject<{
                kind: z.ZodLiteral<"authenticated">;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                owner: z.ZodNullable<z.ZodObject<{
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            agentIdentity: z.ZodDiscriminatedUnion<[z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"master">;
                masterAgentId: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>, z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"erede">;
                masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strict>], "role">;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            policyVersion: z.ZodNumber;
            status: z.ZodEnum<{
                pending: "pending";
                expired: "expired";
                revoked: "revoked";
                admitted: "admitted";
            }>;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        observedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeAuthorityRecheckContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        attemptId: z.ZodString;
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        request: z.ZodObject<{
            requestId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            attemptId: z.ZodString;
            phase: z.ZodEnum<{
                before: "before";
                after: "after";
            }>;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            attemptId: z.ZodString;
            requestId: z.ZodString;
            linkId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            viewer: z.ZodObject<{
                kind: z.ZodLiteral<"authenticated">;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                owner: z.ZodNullable<z.ZodObject<{
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            agentIdentity: z.ZodDiscriminatedUnion<[z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"master">;
                masterAgentId: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>, z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"erede">;
                masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strict>], "role">;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            policyVersion: z.ZodNumber;
            status: z.ZodEnum<{
                pending: "pending";
                expired: "expired";
                revoked: "revoked";
                admitted: "admitted";
            }>;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        observedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeOpeningContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        attempt: z.ZodObject<{
            attemptId: z.ZodString;
            requestId: z.ZodString;
            linkId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            viewer: z.ZodObject<{
                kind: z.ZodLiteral<"authenticated">;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                owner: z.ZodNullable<z.ZodObject<{
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            agentIdentity: z.ZodDiscriminatedUnion<[z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"master">;
                masterAgentId: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>, z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"erede">;
                masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strict>], "role">;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            policyVersion: z.ZodNumber;
            status: z.ZodEnum<{
                pending: "pending";
                expired: "expired";
                revoked: "revoked";
                admitted: "admitted";
            }>;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        bindingId: z.ZodString;
        attemptId: z.ZodString;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        mapping: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            providerAgentId: z.ZodString;
            origin: z.ZodEnum<{
                provisioned: "provisioned";
                adopted: "adopted";
            }>;
            createdAt: z.ZodISODateTime;
            appliedConfigVersion: z.ZodNumber;
        }, z.core.$strip>;
        configVersion: z.ZodNumber;
        promptBundleHash: z.ZodString;
        boundAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeMintContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        binding: z.ZodObject<{
            bindingId: z.ZodString;
            attemptId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            mapping: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            boundAt: z.ZodISODateTime;
        }, z.core.$strict>;
        transport: z.ZodEnum<{
            websocket: "websocket";
            webrtc: "webrtc";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        binding: z.ZodObject<{
            bindingId: z.ZodString;
            attemptId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            mapping: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            boundAt: z.ZodISODateTime;
        }, z.core.$strict>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        connection: z.ZodDiscriminatedUnion<[z.ZodObject<{
            transport: z.ZodLiteral<"webrtc">;
            conversationToken: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            transport: z.ZodLiteral<"websocket">;
            signedUrl: z.ZodURL;
        }, z.core.$strict>], "transport">;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeConversationBindContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        binding: z.ZodObject<{
            bindingId: z.ZodString;
            attemptId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            mapping: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            boundAt: z.ZodISODateTime;
        }, z.core.$strict>;
        providerConversationId: z.ZodString;
        attachedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        binding: z.ZodObject<{
            bindingId: z.ZodString;
            attemptId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            mapping: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            boundAt: z.ZodISODateTime;
        }, z.core.$strict>;
        providerConversationId: z.ZodString;
        attachedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeExecutionAttachContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        conversation: z.ZodObject<{
            binding: z.ZodObject<{
                bindingId: z.ZodString;
                attemptId: z.ZodString;
                opening: z.ZodObject<{
                    openingId: z.ZodString;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>;
                    sessionId: z.ZodString;
                    program: z.ZodObject<{
                        scope: z.ZodObject<{
                            agentId: z.ZodString;
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                        }, z.core.$strict>;
                        programId: z.ZodString;
                        programVersion: z.ZodNumber;
                        strategy: z.ZodObject<{
                            strategyId: z.ZodString;
                            strategyVersion: z.ZodString;
                        }, z.core.$strict>;
                        catalogRevision: z.ZodString;
                        policyRevision: z.ZodString;
                        progressionRevision: z.ZodString;
                        measureDefinitionRevision: z.ZodString;
                    }, z.core.$strict>;
                    appliedConfigVersion: z.ZodNumber;
                    openedAt: z.ZodISODateTime;
                }, z.core.$strict>;
                mapping: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    providerAgentId: z.ZodString;
                    origin: z.ZodEnum<{
                        provisioned: "provisioned";
                        adopted: "adopted";
                    }>;
                    createdAt: z.ZodISODateTime;
                    appliedConfigVersion: z.ZodNumber;
                }, z.core.$strip>;
                configVersion: z.ZodNumber;
                promptBundleHash: z.ZodString;
                boundAt: z.ZodISODateTime;
            }, z.core.$strict>;
            providerConversationId: z.ZodString;
            attachedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
            snapshotId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>;
        attachedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        conversation: z.ZodObject<{
            binding: z.ZodObject<{
                bindingId: z.ZodString;
                attemptId: z.ZodString;
                opening: z.ZodObject<{
                    openingId: z.ZodString;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>;
                    sessionId: z.ZodString;
                    program: z.ZodObject<{
                        scope: z.ZodObject<{
                            agentId: z.ZodString;
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                        }, z.core.$strict>;
                        programId: z.ZodString;
                        programVersion: z.ZodNumber;
                        strategy: z.ZodObject<{
                            strategyId: z.ZodString;
                            strategyVersion: z.ZodString;
                        }, z.core.$strict>;
                        catalogRevision: z.ZodString;
                        policyRevision: z.ZodString;
                        progressionRevision: z.ZodString;
                        measureDefinitionRevision: z.ZodString;
                    }, z.core.$strict>;
                    appliedConfigVersion: z.ZodNumber;
                    openedAt: z.ZodISODateTime;
                }, z.core.$strict>;
                mapping: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    providerAgentId: z.ZodString;
                    origin: z.ZodEnum<{
                        provisioned: "provisioned";
                        adopted: "adopted";
                    }>;
                    createdAt: z.ZodISODateTime;
                    appliedConfigVersion: z.ZodNumber;
                }, z.core.$strip>;
                configVersion: z.ZodNumber;
                promptBundleHash: z.ZodString;
                boundAt: z.ZodISODateTime;
            }, z.core.$strict>;
            providerConversationId: z.ZodString;
            attachedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            startedAt: z.ZodISODateTime;
            segments: z.ZodArray<z.ZodObject<{
                segmentId: z.ZodString;
                stepId: z.ZodOptional<z.ZodString>;
                offsetSeconds: z.ZodNumber;
                durationSeconds: z.ZodNumber;
            }, z.core.$strict>>;
            totalSeconds: z.ZodNumber;
            decisionCodes: z.ZodArray<z.ZodString>;
            snapshotId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>;
        attachedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativePauseContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        binding: z.ZodObject<{
            bindingId: z.ZodString;
            attemptId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            mapping: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            boundAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        pausedAt: z.ZodISODateTime;
        opening: z.ZodObject<{
            openingId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            program: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                programId: z.ZodString;
                programVersion: z.ZodNumber;
                strategy: z.ZodObject<{
                    strategyId: z.ZodString;
                    strategyVersion: z.ZodString;
                }, z.core.$strict>;
                catalogRevision: z.ZodString;
                policyRevision: z.ZodString;
                progressionRevision: z.ZodString;
                measureDefinitionRevision: z.ZodString;
            }, z.core.$strict>;
            appliedConfigVersion: z.ZodNumber;
            openedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
/** Adapter verifies the original bytes with the per-agent resolver BEFORE parsing; receipt is not effect completion. */
export declare const ELEVENLABS_NATIVE_SIGNATURE_HEADER: "ElevenLabs-Signature";
export declare const nativeCallbackContract: {
    readonly method: "POST";
    readonly path: string;
    readonly authType: "external_provider";
    readonly authHeader: "ElevenLabs-Signature";
    readonly rawBodyRequired: true;
    readonly signatureAlgorithm: "hmac-sha256";
    readonly maxSkewSeconds: 300;
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        callback: z.ZodObject<{
            eventId: z.ZodString;
            providerConversationId: z.ZodString;
            providerAgentId: z.ZodString;
            occurredAt: z.ZodISODateTime;
            bodySha256: z.ZodString;
        }, z.core.$strict>;
        binding: z.ZodObject<{
            binding: z.ZodObject<{
                bindingId: z.ZodString;
                attemptId: z.ZodString;
                opening: z.ZodObject<{
                    openingId: z.ZodString;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>;
                    sessionId: z.ZodString;
                    program: z.ZodObject<{
                        scope: z.ZodObject<{
                            agentId: z.ZodString;
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                        }, z.core.$strict>;
                        programId: z.ZodString;
                        programVersion: z.ZodNumber;
                        strategy: z.ZodObject<{
                            strategyId: z.ZodString;
                            strategyVersion: z.ZodString;
                        }, z.core.$strict>;
                        catalogRevision: z.ZodString;
                        policyRevision: z.ZodString;
                        progressionRevision: z.ZodString;
                        measureDefinitionRevision: z.ZodString;
                    }, z.core.$strict>;
                    appliedConfigVersion: z.ZodNumber;
                    openedAt: z.ZodISODateTime;
                }, z.core.$strict>;
                mapping: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    providerAgentId: z.ZodString;
                    origin: z.ZodEnum<{
                        provisioned: "provisioned";
                        adopted: "adopted";
                    }>;
                    createdAt: z.ZodISODateTime;
                    appliedConfigVersion: z.ZodNumber;
                }, z.core.$strip>;
                configVersion: z.ZodNumber;
                promptBundleHash: z.ZodString;
                boundAt: z.ZodISODateTime;
            }, z.core.$strict>;
            providerConversationId: z.ZodString;
            attachedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        receivedAt: z.ZodISODateTime;
        inboxStatus: z.ZodEnum<{
            accepted: "accepted";
            duplicate: "duplicate";
        }>;
        effectStatus: z.ZodEnum<{
            applied: "applied";
            pending: "pending";
            rejected: "rejected";
        }>;
    }, z.core.$strict>;
};
export declare function capElevenLabsNativePath(agentId: string): string;
export declare function capElevenLabsNativeAuthorityPath(agentId: string, phase: 'resolve' | 'recheck'): string;
export declare const ElevenLabsNativePromptBundleRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    configVersion: z.ZodNumber;
    promptBundleHash: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativePromptBundleRequest = z.infer<typeof ElevenLabsNativePromptBundleRequestSchema>;
/** Internal resolved bundle only. No browser route returns private rendered content. */
export declare const ElevenLabsNativePromptBundleResultSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    configVersion: z.ZodNumber;
    promptBundleHash: z.ZodString;
    ok: z.ZodLiteral<true>;
    renderedPrompt: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativePromptBundleResult = z.infer<typeof ElevenLabsNativePromptBundleResultSchema>;
export declare function isElevenLabsNativePromptBundleForRequest(rawRequest: unknown, rawResult: unknown): boolean;
export declare const nativePromptBundleContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        promptBundleHash: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        promptBundleHash: z.ZodString;
        ok: z.ZodLiteral<true>;
        renderedPrompt: z.ZodString;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeApplyContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        expectedConfigVersion: z.ZodNullable<z.ZodNumber>;
        desired: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            fingerprint: z.ZodString;
            config: z.ZodObject<{
                agent: z.ZodObject<{
                    first_message: z.ZodString;
                    language: z.ZodString;
                    prompt: z.ZodObject<{
                        llm: z.ZodString;
                        reasoning_effort: z.ZodString;
                        temperature: z.ZodNumber;
                        backup_llm_config: z.ZodObject<{
                            preference: z.ZodLiteral<"override">;
                            order: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                        cascade_timeout_seconds: z.ZodNumber;
                        tools: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"client">;
                            expects_response: z.ZodBoolean;
                            response_timeout_secs: z.ZodNumber;
                            execution_mode: z.ZodOptional<z.ZodEnum<{
                                immediate: "immediate";
                                post_tool_speech: "post_tool_speech";
                            }>>;
                            interruption_mode: z.ZodOptional<z.ZodEnum<{
                                allow: "allow";
                                block: "block";
                            }>>;
                            parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"webhook">;
                            response_timeout_secs: z.ZodNumber;
                            api_schema: z.ZodObject<{
                                method: z.ZodLiteral<"POST">;
                                path: z.ZodString;
                                request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                request_headers: z.ZodArray<z.ZodObject<{
                                    name: z.ZodString;
                                    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                        kind: z.ZodLiteral<"credential">;
                                        key: z.ZodString;
                                    }, z.core.$strict>, z.ZodObject<{
                                        kind: z.ZodLiteral<"session">;
                                        bindingId: z.ZodString;
                                    }, z.core.$strict>], "kind">;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"system">;
                            params: z.ZodObject<{
                                system_tool_type: z.ZodEnum<{
                                    end_call: "end_call";
                                    skip_turn: "skip_turn";
                                }>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                tts: z.ZodObject<{
                    model_id: z.ZodString;
                    optimize_streaming_latency: z.ZodNumber;
                    agent_output_audio_format: z.ZodString;
                    supported_voices: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        description: z.ZodString;
                        voice_id: z.ZodString;
                        stability: z.ZodNumber;
                        speed: z.ZodNumber;
                        similarity_boost: z.ZodNumber;
                    }, z.core.$strict>>;
                    voice_id: z.ZodString;
                    stability: z.ZodNumber;
                    speed: z.ZodNumber;
                    similarity_boost: z.ZodNumber;
                }, z.core.$strict>;
                turn: z.ZodObject<{
                    turn_timeout: z.ZodNumber;
                    interruption_ignore_terms: z.ZodArray<z.ZodString>;
                    merge_with_default_ignore_terms: z.ZodBoolean;
                    silence_end_call_timeout: z.ZodNumber;
                }, z.core.$strict>;
                conversation: z.ZodObject<{
                    max_duration_seconds: z.ZodNumber;
                    client_events: z.ZodArray<z.ZodEnum<{
                        audio: "audio";
                        interruption: "interruption";
                        agent_response: "agent_response";
                        user_transcript: "user_transcript";
                        agent_response_correction: "agent_response_correction";
                        agent_tool_response: "agent_tool_response";
                    }>>;
                }, z.core.$strict>;
                platform_settings: z.ZodObject<{
                    auth: z.ZodObject<{
                        enable_auth: z.ZodLiteral<true>;
                        allowlist: z.ZodArray<z.ZodURL>;
                        require_origin_header: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requestId: z.ZodString;
        desired: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            fingerprint: z.ZodString;
            config: z.ZodObject<{
                agent: z.ZodObject<{
                    first_message: z.ZodString;
                    language: z.ZodString;
                    prompt: z.ZodObject<{
                        llm: z.ZodString;
                        reasoning_effort: z.ZodString;
                        temperature: z.ZodNumber;
                        backup_llm_config: z.ZodObject<{
                            preference: z.ZodLiteral<"override">;
                            order: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                        cascade_timeout_seconds: z.ZodNumber;
                        tools: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"client">;
                            expects_response: z.ZodBoolean;
                            response_timeout_secs: z.ZodNumber;
                            execution_mode: z.ZodOptional<z.ZodEnum<{
                                immediate: "immediate";
                                post_tool_speech: "post_tool_speech";
                            }>>;
                            interruption_mode: z.ZodOptional<z.ZodEnum<{
                                allow: "allow";
                                block: "block";
                            }>>;
                            parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"webhook">;
                            response_timeout_secs: z.ZodNumber;
                            api_schema: z.ZodObject<{
                                method: z.ZodLiteral<"POST">;
                                path: z.ZodString;
                                request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                request_headers: z.ZodArray<z.ZodObject<{
                                    name: z.ZodString;
                                    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                        kind: z.ZodLiteral<"credential">;
                                        key: z.ZodString;
                                    }, z.core.$strict>, z.ZodObject<{
                                        kind: z.ZodLiteral<"session">;
                                        bindingId: z.ZodString;
                                    }, z.core.$strict>], "kind">;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"system">;
                            params: z.ZodObject<{
                                system_tool_type: z.ZodEnum<{
                                    end_call: "end_call";
                                    skip_turn: "skip_turn";
                                }>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                tts: z.ZodObject<{
                    model_id: z.ZodString;
                    optimize_streaming_latency: z.ZodNumber;
                    agent_output_audio_format: z.ZodString;
                    supported_voices: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        description: z.ZodString;
                        voice_id: z.ZodString;
                        stability: z.ZodNumber;
                        speed: z.ZodNumber;
                        similarity_boost: z.ZodNumber;
                    }, z.core.$strict>>;
                    voice_id: z.ZodString;
                    stability: z.ZodNumber;
                    speed: z.ZodNumber;
                    similarity_boost: z.ZodNumber;
                }, z.core.$strict>;
                turn: z.ZodObject<{
                    turn_timeout: z.ZodNumber;
                    interruption_ignore_terms: z.ZodArray<z.ZodString>;
                    merge_with_default_ignore_terms: z.ZodBoolean;
                    silence_end_call_timeout: z.ZodNumber;
                }, z.core.$strict>;
                conversation: z.ZodObject<{
                    max_duration_seconds: z.ZodNumber;
                    client_events: z.ZodArray<z.ZodEnum<{
                        audio: "audio";
                        interruption: "interruption";
                        agent_response: "agent_response";
                        user_transcript: "user_transcript";
                        agent_response_correction: "agent_response_correction";
                        agent_tool_response: "agent_tool_response";
                    }>>;
                }, z.core.$strict>;
                platform_settings: z.ZodObject<{
                    auth: z.ZodObject<{
                        enable_auth: z.ZodLiteral<true>;
                        allowlist: z.ZodArray<z.ZodURL>;
                        require_origin_header: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        acceptedAt: z.ZodISODateTime;
        status: z.ZodEnum<{
            rejected: "rejected";
            reconcile_pending: "reconcile_pending";
            accepted: "accepted";
        }>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const nativeReadbackContract: {
    readonly path: string;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        binding: z.ZodObject<{
            bindingId: z.ZodString;
            attemptId: z.ZodString;
            opening: z.ZodObject<{
                openingId: z.ZodString;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>;
                sessionId: z.ZodString;
                program: z.ZodObject<{
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    programId: z.ZodString;
                    programVersion: z.ZodNumber;
                    strategy: z.ZodObject<{
                        strategyId: z.ZodString;
                        strategyVersion: z.ZodString;
                    }, z.core.$strict>;
                    catalogRevision: z.ZodString;
                    policyRevision: z.ZodString;
                    progressionRevision: z.ZodString;
                    measureDefinitionRevision: z.ZodString;
                }, z.core.$strict>;
                appliedConfigVersion: z.ZodNumber;
                openedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            mapping: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            boundAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"known">;
        observed: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            promptBundleHash: z.ZodString;
            fingerprint: z.ZodString;
            config: z.ZodObject<{
                agent: z.ZodObject<{
                    first_message: z.ZodString;
                    language: z.ZodString;
                    prompt: z.ZodObject<{
                        llm: z.ZodString;
                        reasoning_effort: z.ZodString;
                        temperature: z.ZodNumber;
                        backup_llm_config: z.ZodObject<{
                            preference: z.ZodLiteral<"override">;
                            order: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                        cascade_timeout_seconds: z.ZodNumber;
                        tools: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"client">;
                            expects_response: z.ZodBoolean;
                            response_timeout_secs: z.ZodNumber;
                            execution_mode: z.ZodOptional<z.ZodEnum<{
                                immediate: "immediate";
                                post_tool_speech: "post_tool_speech";
                            }>>;
                            interruption_mode: z.ZodOptional<z.ZodEnum<{
                                allow: "allow";
                                block: "block";
                            }>>;
                            parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"webhook">;
                            response_timeout_secs: z.ZodNumber;
                            api_schema: z.ZodObject<{
                                method: z.ZodLiteral<"POST">;
                                path: z.ZodString;
                                request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                request_headers: z.ZodArray<z.ZodObject<{
                                    name: z.ZodString;
                                    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                        kind: z.ZodLiteral<"credential">;
                                        key: z.ZodString;
                                    }, z.core.$strict>, z.ZodObject<{
                                        kind: z.ZodLiteral<"session">;
                                        bindingId: z.ZodString;
                                    }, z.core.$strict>], "kind">;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"system">;
                            params: z.ZodObject<{
                                system_tool_type: z.ZodEnum<{
                                    end_call: "end_call";
                                    skip_turn: "skip_turn";
                                }>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                tts: z.ZodObject<{
                    model_id: z.ZodString;
                    optimize_streaming_latency: z.ZodNumber;
                    agent_output_audio_format: z.ZodString;
                    supported_voices: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        description: z.ZodString;
                        voice_id: z.ZodString;
                        stability: z.ZodNumber;
                        speed: z.ZodNumber;
                        similarity_boost: z.ZodNumber;
                    }, z.core.$strict>>;
                    voice_id: z.ZodString;
                    stability: z.ZodNumber;
                    speed: z.ZodNumber;
                    similarity_boost: z.ZodNumber;
                }, z.core.$strict>;
                turn: z.ZodObject<{
                    turn_timeout: z.ZodNumber;
                    interruption_ignore_terms: z.ZodArray<z.ZodString>;
                    merge_with_default_ignore_terms: z.ZodBoolean;
                    silence_end_call_timeout: z.ZodNumber;
                }, z.core.$strict>;
                conversation: z.ZodObject<{
                    max_duration_seconds: z.ZodNumber;
                    client_events: z.ZodArray<z.ZodEnum<{
                        audio: "audio";
                        interruption: "interruption";
                        agent_response: "agent_response";
                        user_transcript: "user_transcript";
                        agent_response_correction: "agent_response_correction";
                        agent_tool_response: "agent_tool_response";
                    }>>;
                }, z.core.$strict>;
                platform_settings: z.ZodObject<{
                    auth: z.ZodObject<{
                        enable_auth: z.ZodLiteral<true>;
                        allowlist: z.ZodArray<z.ZodURL>;
                        require_origin_header: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        requestId: z.ZodString;
        mapping: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            providerAgentId: z.ZodString;
            origin: z.ZodEnum<{
                provisioned: "provisioned";
                adopted: "adopted";
            }>;
            createdAt: z.ZodISODateTime;
            appliedConfigVersion: z.ZodNumber;
        }, z.core.$strip>;
        observedAt: z.ZodISODateTime;
        source: z.ZodLiteral<"provider-read">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            missing: "missing";
            stale: "stale";
            mismatch: "mismatch";
        }>;
        requestId: z.ZodString;
        mapping: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            providerAgentId: z.ZodString;
            origin: z.ZodEnum<{
                provisioned: "provisioned";
                adopted: "adopted";
            }>;
            createdAt: z.ZodISODateTime;
            appliedConfigVersion: z.ZodNumber;
        }, z.core.$strip>;
        observedAt: z.ZodISODateTime;
        source: z.ZodLiteral<"provider-read">;
    }, z.core.$strict>], "status">;
    readonly method: "POST";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const NativeBrowserPolicyParamsSchema: z.ZodObject<{
    slug: z.ZodString;
}, z.core.$strict>;
export declare const NativeBrowserPolicyChangeSchema: z.ZodObject<{
    access: z.ZodEnum<{
        owner: "owner";
        invited: "invited";
        public: "public";
    }>;
    requestId: z.ZodString;
    expectedVersion: z.ZodNumber;
    paused: z.ZodBoolean;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type NativeBrowserPolicyChange = z.infer<typeof NativeBrowserPolicyChangeSchema>;
export declare const nativeBrowserPolicyReadContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:slug/native/web-policy";
    readonly authType: "forge_session";
    readonly paramsSchema: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        version: z.ZodNumber;
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        paused: z.ZodBoolean;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
};
export declare const nativeBrowserPolicyChangeContract: {
    readonly method: "PUT";
    readonly path: "/api/agents/:slug/native/web-policy";
    readonly authType: "forge_session";
    readonly paramsSchema: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        requestId: z.ZodString;
        expectedVersion: z.ZodNumber;
        paused: z.ZodBoolean;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        policy: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            version: z.ZodNumber;
            access: z.ZodEnum<{
                owner: "owner";
                invited: "invited";
                public: "public";
            }>;
            paused: z.ZodBoolean;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
export declare function nativeBrowserPolicyPath(managementAgentId: string): string;
//# sourceMappingURL=native-channel.d.ts.map