import { z } from 'zod';
/** The server resolves person scope. References select a persisted record, never permission. */
export declare const ElevenLabsNativeBindingReadRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    ref: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"attempt">;
        attemptId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"binding">;
        bindingId: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type ElevenLabsNativeBindingReadRequest = z.infer<typeof ElevenLabsNativeBindingReadRequestSchema>;
/** Absence and pause are observations; they neither renew admission nor authorize execution. */
export declare const ElevenLabsNativeBindingReadResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    request: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        ref: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"attempt">;
            attemptId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"binding">;
            bindingId: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    record: z.ZodNullable<z.ZodObject<{
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
        pausedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>>;
    observedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ElevenLabsNativeBindingReadResult = z.infer<typeof ElevenLabsNativeBindingReadResultSchema>;
/** Expected attempt comes from the trusted Forge writer. This checks facts, not current permission. */
export declare function isElevenLabsNativeBindingReadCurrent(rawRequest: unknown, rawResult: unknown, rawExpectedAttempt: unknown, now: Date): boolean;
export declare function isElevenLabsNativeBindingReadForRoute(rawRequest: unknown, rawParams: unknown): boolean;
export declare const nativeBindingReadContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs/native/bindings/read";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        ref: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"attempt">;
            attemptId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"binding">;
            bindingId: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        request: z.ZodObject<{
            requestId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>;
            ref: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"attempt">;
                attemptId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"binding">;
                bindingId: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>;
        record: z.ZodNullable<z.ZodObject<{
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
            pausedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        observedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
};
export declare function capElevenLabsNativeBindingReadPath(agentId: string): string;
//# sourceMappingURL=native-binding-read.d.ts.map