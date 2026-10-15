import { z } from 'zod';
export declare const INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH: "/internal/memory/knowledge/publish";
export declare const INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH: "/internal/memory/knowledge/withdraw";
export declare const InternalMemoryKnowledgePublishRequestSchema: z.ZodObject<{
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
    publication: z.ZodObject<{
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
        kind: z.ZodEnum<{
            decision: "decision";
            procedure: "procedure";
            knowledge: "knowledge";
        }>;
        status: z.ZodEnum<{
            proposed: "proposed";
            current: "current";
            withdrawn: "withdrawn";
        }>;
        evidence: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                source: "source";
                decision: "decision";
                run_receipt: "run_receipt";
                experience: "experience";
            }>;
            id: z.ZodString;
            digest: z.ZodString;
        }, z.core.$strict>>;
        supersedes: z.ZodOptional<z.ZodNumber>;
        validFrom: z.ZodISODateTime;
        validUntil: z.ZodOptional<z.ZodISODateTime>;
        contradicts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type InternalMemoryKnowledgePublishRequest = z.infer<typeof InternalMemoryKnowledgePublishRequestSchema>;
export declare const InternalMemoryKnowledgeWithdrawRequestSchema: z.ZodObject<{
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
    reason: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryKnowledgeWithdrawRequest = z.infer<typeof InternalMemoryKnowledgeWithdrawRequestSchema>;
export declare const InternalMemoryKnowledgeReceiptSchema: z.ZodObject<{
    slug: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    disposition: z.ZodEnum<{
        duplicate: "duplicate";
        stored: "stored";
    }>;
}, z.core.$strict>;
export type InternalMemoryKnowledgeReceipt = z.infer<typeof InternalMemoryKnowledgeReceiptSchema>;
export declare const InternalMemoryKnowledgeErrorResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"error">;
    code: z.ZodEnum<{
        identity_uncertain: "identity_uncertain";
        invalid_publication: "invalid_publication";
        knowledge_conflict: "knowledge_conflict";
        supersedes_missing: "supersedes_missing";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryKnowledgeErrorResponse = z.infer<typeof InternalMemoryKnowledgeErrorResponseSchema>;
export declare const internalMemoryKnowledgePublishContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/knowledge/publish";
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
        publication: z.ZodObject<{
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
            kind: z.ZodEnum<{
                decision: "decision";
                procedure: "procedure";
                knowledge: "knowledge";
            }>;
            status: z.ZodEnum<{
                proposed: "proposed";
                current: "current";
                withdrawn: "withdrawn";
            }>;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    source: "source";
                    decision: "decision";
                    run_receipt: "run_receipt";
                    experience: "experience";
                }>;
                id: z.ZodString;
                digest: z.ZodString;
            }, z.core.$strict>>;
            supersedes: z.ZodOptional<z.ZodNumber>;
            validFrom: z.ZodISODateTime;
            validUntil: z.ZodOptional<z.ZodISODateTime>;
            contradicts: z.ZodOptional<z.ZodArray<z.ZodString>>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        disposition: z.ZodEnum<{
            duplicate: "duplicate";
            stored: "stored";
        }>;
    }, z.core.$strict>;
};
export declare const internalMemoryKnowledgeWithdrawContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/knowledge/withdraw";
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
        reason: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        disposition: z.ZodEnum<{
            duplicate: "duplicate";
            stored: "stored";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-knowledge.d.ts.map