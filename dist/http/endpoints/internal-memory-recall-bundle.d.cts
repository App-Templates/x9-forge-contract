import { z } from 'zod';
export declare const InternalMemoryRecallBundleRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    mode: z.ZodDefault<z.ZodEnum<{
        standard: "standard";
        fast: "fast";
        deep: "deep";
    }>>;
    taskType: z.ZodDefault<z.ZodString>;
    query: z.ZodString;
    topK: z.ZodDefault<z.ZodNumber>;
    latencyBudgetMs: z.ZodDefault<z.ZodNumber>;
    privacyLevelAllow: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        standard: "standard";
        secret: "secret";
        sensitive: "sensitive";
        third_party: "third_party";
        voice_biometric: "voice_biometric";
    }>>>;
    sourceTypeFilter: z.ZodOptional<z.ZodString>;
    createdAtWindow: z.ZodOptional<z.ZodObject<{
        fromIso: z.ZodString;
        toIso: z.ZodString;
    }, z.core.$strip>>;
    temporal: z.ZodOptional<z.ZodObject<{
        mode: z.ZodEnum<{
            history: "history";
            current: "current";
            valid_at: "valid_at";
            known_at: "known_at";
            valid_between: "valid_between";
        }>;
        validAt: z.ZodOptional<z.ZodString>;
        knownAt: z.ZodOptional<z.ZodString>;
        validFrom: z.ZodOptional<z.ZodString>;
        validTo: z.ZodOptional<z.ZodString>;
        includeInvalidated: z.ZodOptional<z.ZodBoolean>;
        includeSuperseded: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    organization: z.ZodOptional<z.ZodObject<{
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
        recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"organization">;
            id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"group">;
            id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"project">;
            id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"department">;
            id: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type InternalMemoryRecallBundleRequest = z.infer<typeof InternalMemoryRecallBundleRequestSchema>;
export declare const RecallBundleEntrySchema: z.ZodObject<{
    id: z.ZodString;
    resultType: z.ZodEnum<{
        episode: "episode";
        fact: "fact";
        edge: "edge";
    }>;
    score: z.ZodNumber;
    contentNormalized: z.ZodString;
    privacyLevel: z.ZodString;
    createdAt: z.ZodString;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    sourceType: z.ZodOptional<z.ZodString>;
    sourceRef: z.ZodOptional<z.ZodString>;
    sourceTimestamp: z.ZodOptional<z.ZodString>;
    memoryType: z.ZodOptional<z.ZodString>;
    subtype: z.ZodOptional<z.ZodString>;
    slotKey: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodNumber>;
    salience: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
    fromEntityId: z.ZodOptional<z.ZodString>;
    toEntityId: z.ZodOptional<z.ZodString>;
    edgeType: z.ZodOptional<z.ZodString>;
    strength: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export type RecallBundleEntryContract = z.infer<typeof RecallBundleEntrySchema>;
export declare const RecallBundleAuditSchema: z.ZodObject<{
    mode: z.ZodString;
    latencyMs: z.ZodNumber;
    candidateCount: z.ZodNumber;
    resultCount: z.ZodNumber;
    qdrantUsed: z.ZodBoolean;
    postgresUsed: z.ZodBoolean;
    degraded: z.ZodBoolean;
    degradedReason: z.ZodNullable<z.ZodString>;
    embeddingCacheHit: z.ZodBoolean;
    cacheHit: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type RecallBundleAuditContract = z.infer<typeof RecallBundleAuditSchema>;
export declare const InternalMemoryRecallBundleResponseSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        resultType: z.ZodEnum<{
            episode: "episode";
            fact: "fact";
            edge: "edge";
        }>;
        score: z.ZodNumber;
        contentNormalized: z.ZodString;
        privacyLevel: z.ZodString;
        createdAt: z.ZodString;
        metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        sourceType: z.ZodOptional<z.ZodString>;
        sourceRef: z.ZodOptional<z.ZodString>;
        sourceTimestamp: z.ZodOptional<z.ZodString>;
        memoryType: z.ZodOptional<z.ZodString>;
        subtype: z.ZodOptional<z.ZodString>;
        slotKey: z.ZodOptional<z.ZodString>;
        confidence: z.ZodOptional<z.ZodNumber>;
        salience: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodString>;
        fromEntityId: z.ZodOptional<z.ZodString>;
        toEntityId: z.ZodOptional<z.ZodString>;
        edgeType: z.ZodOptional<z.ZodString>;
        strength: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>;
    audit: z.ZodObject<{
        mode: z.ZodString;
        latencyMs: z.ZodNumber;
        candidateCount: z.ZodNumber;
        resultCount: z.ZodNumber;
        qdrantUsed: z.ZodBoolean;
        postgresUsed: z.ZodBoolean;
        degraded: z.ZodBoolean;
        degradedReason: z.ZodNullable<z.ZodString>;
        embeddingCacheHit: z.ZodBoolean;
        cacheHit: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
    organizationReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ref: z.ZodObject<{
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
            sourceScope: z.ZodEnum<{
                organization: "organization";
                private: "private";
                team: "team";
            }>;
            slug: z.ZodString;
            version: z.ZodNumber;
            digest: z.ZodString;
            recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"organization">;
                id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"group">;
                id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"project">;
                id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"department">;
                id: z.ZodString;
            }, z.core.$strict>], "kind">;
            explicit: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
        authorizedAt: z.ZodISODateTime;
        bindingVersion: z.ZodNumber;
    }, z.core.$strict>>>;
}, z.core.$strip>;
export type InternalMemoryRecallBundleResponse = z.infer<typeof InternalMemoryRecallBundleResponseSchema>;
export declare const INTERNAL_MEMORY_RECALL_BUNDLE_PATH: "/internal/memory/recall/bundle";
export declare const internalMemoryRecallBundleContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/recall/bundle";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        mode: z.ZodDefault<z.ZodEnum<{
            standard: "standard";
            fast: "fast";
            deep: "deep";
        }>>;
        taskType: z.ZodDefault<z.ZodString>;
        query: z.ZodString;
        topK: z.ZodDefault<z.ZodNumber>;
        latencyBudgetMs: z.ZodDefault<z.ZodNumber>;
        privacyLevelAllow: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            standard: "standard";
            secret: "secret";
            sensitive: "sensitive";
            third_party: "third_party";
            voice_biometric: "voice_biometric";
        }>>>;
        sourceTypeFilter: z.ZodOptional<z.ZodString>;
        createdAtWindow: z.ZodOptional<z.ZodObject<{
            fromIso: z.ZodString;
            toIso: z.ZodString;
        }, z.core.$strip>>;
        temporal: z.ZodOptional<z.ZodObject<{
            mode: z.ZodEnum<{
                history: "history";
                current: "current";
                valid_at: "valid_at";
                known_at: "known_at";
                valid_between: "valid_between";
            }>;
            validAt: z.ZodOptional<z.ZodString>;
            knownAt: z.ZodOptional<z.ZodString>;
            validFrom: z.ZodOptional<z.ZodString>;
            validTo: z.ZodOptional<z.ZodString>;
            includeInvalidated: z.ZodOptional<z.ZodBoolean>;
            includeSuperseded: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        organization: z.ZodOptional<z.ZodObject<{
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
            recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"organization">;
                id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"group">;
                id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"project">;
                id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"department">;
                id: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            resultType: z.ZodEnum<{
                episode: "episode";
                fact: "fact";
                edge: "edge";
            }>;
            score: z.ZodNumber;
            contentNormalized: z.ZodString;
            privacyLevel: z.ZodString;
            createdAt: z.ZodString;
            metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            sourceType: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            sourceTimestamp: z.ZodOptional<z.ZodString>;
            memoryType: z.ZodOptional<z.ZodString>;
            subtype: z.ZodOptional<z.ZodString>;
            slotKey: z.ZodOptional<z.ZodString>;
            confidence: z.ZodOptional<z.ZodNumber>;
            salience: z.ZodOptional<z.ZodNumber>;
            status: z.ZodOptional<z.ZodString>;
            fromEntityId: z.ZodOptional<z.ZodString>;
            toEntityId: z.ZodOptional<z.ZodString>;
            edgeType: z.ZodOptional<z.ZodString>;
            strength: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strip>>;
        audit: z.ZodObject<{
            mode: z.ZodString;
            latencyMs: z.ZodNumber;
            candidateCount: z.ZodNumber;
            resultCount: z.ZodNumber;
            qdrantUsed: z.ZodBoolean;
            postgresUsed: z.ZodBoolean;
            degraded: z.ZodBoolean;
            degradedReason: z.ZodNullable<z.ZodString>;
            embeddingCacheHit: z.ZodBoolean;
            cacheHit: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        organizationReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ref: z.ZodObject<{
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
                sourceScope: z.ZodEnum<{
                    organization: "organization";
                    private: "private";
                    team: "team";
                }>;
                slug: z.ZodString;
                version: z.ZodNumber;
                digest: z.ZodString;
                recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"organization">;
                    id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"group">;
                    id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"project">;
                    id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"department">;
                    id: z.ZodString;
                }, z.core.$strict>], "kind">;
                explicit: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
            authorizedAt: z.ZodISODateTime;
            bindingVersion: z.ZodNumber;
        }, z.core.$strict>>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-memory-recall-bundle.d.ts.map