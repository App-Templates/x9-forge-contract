import { z } from 'zod';
/** Durable session metadata, never permission by itself. A Forge producer must re-read current
 * policy, invitations, link and runtime authority after awaits; S2S authentication alone is insufficient. */
export declare const ElevenLabsNativeSessionGrantSchema: z.ZodObject<{
    grantId: z.ZodString;
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
            revoked: "revoked";
            pending: "pending";
            expired: "expired";
            admitted: "admitted";
        }>;
        createdAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
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
    issuedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    status: z.ZodEnum<{
        revoked: "revoked";
        active: "active";
        closed: "closed";
        draining: "draining";
    }>;
}, z.core.$strict>;
export type ElevenLabsNativeSessionGrant = z.infer<typeof ElevenLabsNativeSessionGrantSchema>;
export declare const ElevenLabsNativeSessionGrantIssueRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
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
}, z.core.$strict>;
export type ElevenLabsNativeSessionGrantIssueRequest = z.infer<typeof ElevenLabsNativeSessionGrantIssueRequestSchema>;
export declare const ElevenLabsNativeSessionGrantAuthorityRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    grantId: z.ZodString;
    operation: z.ZodEnum<{
        continue: "continue";
        guide_start: "guide_start";
    }>;
    phase: z.ZodEnum<{
        before: "before";
        after: "after";
    }>;
}, z.core.$strict>;
export type ElevenLabsNativeSessionGrantAuthorityRequest = z.infer<typeof ElevenLabsNativeSessionGrantAuthorityRequestSchema>;
export declare const ElevenLabsNativeSessionGrantAuthorityResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    request: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        grantId: z.ZodString;
        operation: z.ZodEnum<{
            continue: "continue";
            guide_start: "guide_start";
        }>;
        phase: z.ZodEnum<{
            before: "before";
            after: "after";
        }>;
    }, z.core.$strict>;
    grant: z.ZodObject<{
        grantId: z.ZodString;
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
                revoked: "revoked";
                pending: "pending";
                expired: "expired";
                admitted: "admitted";
            }>;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
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
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        status: z.ZodEnum<{
            revoked: "revoked";
            active: "active";
            closed: "closed";
            draining: "draining";
        }>;
    }, z.core.$strict>;
    observedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ElevenLabsNativeSessionGrantAuthorityResult = z.infer<typeof ElevenLabsNativeSessionGrantAuthorityResultSchema>;
/** expectedAttempt is loaded from the authenticated durable authority store, never the request. */
export declare function isElevenLabsNativeSessionGrantForIssueRequest(rawRequest: unknown, rawGrant: unknown, rawExpectedAttempt: unknown, now: Date): boolean;
/** expectedGrant is the durable record. Re-check current server authority after every await. */
export declare function isElevenLabsNativeSessionGrantAuthorityCurrent(rawRequest: unknown, rawResult: unknown, rawExpectedGrant: unknown, now: Date): boolean;
//# sourceMappingURL=native-session-grant.d.ts.map