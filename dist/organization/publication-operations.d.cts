import { z } from 'zod';
/** Publish a material. Tenant and owner come from the run context, never from the caller. */
export declare const PublishMaterialRequestSchema: z.ZodObject<{
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
    digest: z.ZodString;
    /** Opaque reference to the content; the content itself never travels here. */
    contentRef: z.ZodString;
    explicit: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type PublishMaterialRequest = z.infer<typeof PublishMaterialRequestSchema>;
export declare const PUBLISH_MATERIAL_ERROR_CODES: readonly ["not_authorized", "invalid_recipient"];
export declare const PublishMaterialErrorCodeSchema: z.ZodEnum<{
    not_authorized: "not_authorized";
    invalid_recipient: "invalid_recipient";
}>;
export type PublishMaterialErrorCode = z.infer<typeof PublishMaterialErrorCodeSchema>;
export declare const PublishMaterialResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"published">;
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    code: z.ZodEnum<{
        not_authorized: "not_authorized";
        invalid_recipient: "invalid_recipient";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "status">;
export type PublishMaterialResponse = z.infer<typeof PublishMaterialResponseSchema>;
export declare const ReadMaterialRequestSchema: z.ZodObject<{
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
export type ReadMaterialRequest = z.infer<typeof ReadMaterialRequestSchema>;
export declare const ReadMaterialResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type ReadMaterialResponse = z.infer<typeof ReadMaterialResponseSchema>;
export declare const ResolveMaterialRequestSchema: z.ZodObject<{
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
export type ResolveMaterialRequest = z.infer<typeof ResolveMaterialRequestSchema>;
export declare const ResolveMaterialResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type ResolveMaterialResponse = z.infer<typeof ResolveMaterialResponseSchema>;
//# sourceMappingURL=publication-operations.d.ts.map