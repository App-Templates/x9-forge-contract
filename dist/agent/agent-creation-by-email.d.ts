import { z } from 'zod';
/** Editable part of the creation draft; the owner is never part of it. */
export declare const AgentCreationByEmailDraftSchema: z.ZodObject<{
    name: z.ZodString;
    objective: z.ZodString;
    allowedCapabilities: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type AgentCreationByEmailDraft = z.infer<typeof AgentCreationByEmailDraftSchema>;
/** The recipient is named only by email; the owner is resolved by the producer, never imposed by the caller. */
export declare const AgentCreationByEmailRequestSchema: z.ZodObject<{
    idempotencyKey: z.ZodString;
    recipientEmail: z.ZodEmail;
    draft: z.ZodObject<{
        name: z.ZodString;
        objective: z.ZodString;
        allowedCapabilities: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    authorization: z.ZodObject<{
        tenantId: z.ZodString;
        actorId: z.ZodString;
        decision: z.ZodEnum<{
            denied: "denied";
            granted: "granted";
        }>;
        reason: z.ZodOptional<z.ZodString>;
        attestation: z.ZodObject<{
            tenantId: z.ZodString;
            actorId: z.ZodString;
            channel: z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>;
            issuer: z.ZodLiteral<"forge">;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
            nonce: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AgentCreationByEmailRequest = z.infer<typeof AgentCreationByEmailRequestSchema>;
export declare const AgentCreationByEmailStatusSchema: z.ZodEnum<{
    failed: "failed";
    pending: "pending";
    created: "created";
    invited: "invited";
}>;
export declare const AgentCreationByEmailOwnerResolutionSchema: z.ZodEnum<{
    existing_user: "existing_user";
    invited_identity: "invited_identity";
}>;
export declare const AgentCreationByEmailResultSchema: z.ZodObject<{
    status: z.ZodEnum<{
        failed: "failed";
        pending: "pending";
        created: "created";
        invited: "invited";
    }>;
    agentIdentity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    ownerResolution: z.ZodOptional<z.ZodEnum<{
        existing_user: "existing_user";
        invited_identity: "invited_identity";
    }>>;
    replayed: z.ZodBoolean;
}, z.core.$strict>;
export type AgentCreationByEmailResult = z.infer<typeof AgentCreationByEmailResultSchema>;
export declare const AgentCreationByEmailErrorCodeSchema: z.ZodEnum<{
    not_platform_owner: "not_platform_owner";
    email_ambiguous: "email_ambiguous";
    tenant_mismatch: "tenant_mismatch";
    intent_conflict: "intent_conflict";
    authorization_expired: "authorization_expired";
    resolution_failed: "resolution_failed";
}>;
export declare const AgentCreationByEmailErrorSchema: z.ZodObject<{
    code: z.ZodEnum<{
        not_platform_owner: "not_platform_owner";
        email_ambiguous: "email_ambiguous";
        tenant_mismatch: "tenant_mismatch";
        intent_conflict: "intent_conflict";
        authorization_expired: "authorization_expired";
        resolution_failed: "resolution_failed";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type AgentCreationByEmailError = z.infer<typeof AgentCreationByEmailErrorSchema>;
//# sourceMappingURL=agent-creation-by-email.d.ts.map