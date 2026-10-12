import { z } from 'zod';
export declare const ElevenLabsPromptBundleHashSchema: z.ZodString;
/** Internal durable Forge record. The browser supplies correlation, never this authority snapshot. */
export declare const ElevenLabsNativeAdmissionAttemptSchema: z.ZodObject<{
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
export type ElevenLabsNativeAdmissionAttempt = z.infer<typeof ElevenLabsNativeAdmissionAttemptSchema>;
export declare const ElevenLabsNativeAuthorityRequestSchema: z.ZodObject<{
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
export type ElevenLabsNativeAuthorityRequest = z.infer<typeof ElevenLabsNativeAuthorityRequestSchema>;
export declare const ElevenLabsNativeAuthorityResultSchema: z.ZodObject<{
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
export type ElevenLabsNativeAuthorityResult = z.infer<typeof ElevenLabsNativeAuthorityResultSchema>;
/** Expected record comes from the authenticated Forge store, not a caller body. Re-read after every await. */
export declare function isElevenLabsNativeAuthorityCurrent(rawRequest: unknown, rawResult: unknown, rawExpectedAttempt: unknown, now: Date): boolean;
export declare const ElevenLabsNativeSessionBindingSchema: z.ZodObject<{
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
export type ElevenLabsNativeSessionBinding = z.infer<typeof ElevenLabsNativeSessionBindingSchema>;
export declare function isElevenLabsNativeSessionForAttempt(rawBinding: unknown, rawAttempt: unknown): boolean;
export declare const ElevenLabsNativeMintRequestSchema: z.ZodObject<{
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
export type ElevenLabsNativeMintRequest = z.infer<typeof ElevenLabsNativeMintRequestSchema>;
export declare const ElevenLabsNativeMintResultSchema: z.ZodObject<{
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
export type ElevenLabsNativeMintResult = z.infer<typeof ElevenLabsNativeMintResultSchema>;
export declare function isElevenLabsNativeMintCurrent(rawRequest: unknown, rawResult: unknown, rawCurrentBinding: unknown, now: Date): boolean;
export declare const ElevenLabsNativeConversationBindingSchema: z.ZodObject<{
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
export type ElevenLabsNativeConversationBinding = z.infer<typeof ElevenLabsNativeConversationBindingSchema>;
export declare const ElevenLabsNativeExecutionAttachmentSchema: z.ZodObject<{
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
export type ElevenLabsNativeExecutionAttachment = z.infer<typeof ElevenLabsNativeExecutionAttachmentSchema>;
export declare function sameElevenLabsNativeConversation(rawA: unknown, rawB: unknown): boolean;
export declare const ElevenLabsNativeCallbackIdentitySchema: z.ZodObject<{
    eventId: z.ZodString;
    providerConversationId: z.ZodString;
    providerAgentId: z.ZodString;
    occurredAt: z.ZodISODateTime;
    bodySha256: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativeCallbackIdentity = z.infer<typeof ElevenLabsNativeCallbackIdentitySchema>;
export declare const ElevenLabsNativeCallbackReceiptSchema: z.ZodObject<{
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
export type ElevenLabsNativeCallbackReceipt = z.infer<typeof ElevenLabsNativeCallbackReceiptSchema>;
export declare function isElevenLabsNativeCallbackCurrent(raw: unknown, rawBinding: unknown, now: Date, maxSkewSeconds?: number): boolean;
/** Identity and bundle correlation only; this descriptor grants no corpus or document access. */
export declare const ElevenLabsNativeKnowledgeBindingSchema: z.ZodObject<{
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
    configVersion: z.ZodNumber;
    promptBundleHash: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativeKnowledgeBinding = z.infer<typeof ElevenLabsNativeKnowledgeBindingSchema>;
//# sourceMappingURL=native-session.d.ts.map