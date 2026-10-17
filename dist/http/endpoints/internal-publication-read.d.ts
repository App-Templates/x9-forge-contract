import { z } from 'zod';
export declare const INTERNAL_PUBLICATION_RESOLVE_PATH: "/internal/publication/resolve";
export declare const internalPublicationResolveContract: {
    readonly method: "POST";
    readonly path: "/internal/publication/resolve";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"ok">;
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
        digest: z.ZodString;
        content: z.ZodObject<{
            mediaType: z.ZodLiteral<"text/plain">;
            text: z.ZodString;
        }, z.core.$strict>;
        contentDigest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"revoked">;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"not_authorized">;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"unknown_reference">;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"version_superseded">;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"digest_mismatch">;
    }, z.core.$strict>], "status">;
};
export declare const INTERNAL_PUBLICATION_WITHDRAW_PATH: "/internal/publications/withdraw";
export declare const INTERNAL_PUBLICATION_LIST_PATH: "/internal/publications/list";
export declare const internalPublicationWithdrawContract: {
    readonly method: "POST";
    readonly path: "/internal/publications/withdraw";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"withdrawn">;
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
        withdrawnAt: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"not_authorized">;
    }, z.core.$strict>, z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        status: z.ZodLiteral<"unknown_reference">;
    }, z.core.$strict>], "status">;
};
export declare const internalPublicationListContract: {
    readonly method: "POST";
    readonly path: "/internal/publications/list";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
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
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-publication-read.d.ts.map