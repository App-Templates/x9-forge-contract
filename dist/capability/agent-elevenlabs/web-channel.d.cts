import { z } from 'zod';
/** Independent Web admission policy; this does not pause the provider or other doors. */
export declare const ElevenLabsWebAccessSchema: z.ZodEnum<{
    owner: "owner";
    invited: "invited";
    public: "public";
}>;
export type ElevenLabsWebAccess = z.infer<typeof ElevenLabsWebAccessSchema>;
export declare const ElevenLabsWebPolicySchema: z.ZodObject<{
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
export type ElevenLabsWebPolicy = z.infer<typeof ElevenLabsWebPolicySchema>;
/** First execution advances the Web policy exactly once; replay returns that same revision. */
export declare const ElevenLabsWebPolicyChangeSchema: z.ZodObject<{
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    expectedVersion: z.ZodNumber;
    access: z.ZodEnum<{
        owner: "owner";
        invited: "invited";
        public: "public";
    }>;
    paused: z.ZodBoolean;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type ElevenLabsWebPolicyChange = z.infer<typeof ElevenLabsWebPolicyChangeSchema>;
export declare const ElevenLabsWebPolicyResultSchema: z.ZodObject<{
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
export type ElevenLabsWebPolicyResult = z.infer<typeof ElevenLabsWebPolicyResultSchema>;
/** A readback is current only for the full scope, command and exactly next revision. */
export declare function isElevenLabsWebPolicyResultCurrent(request: unknown, result: unknown): boolean;
/** Server-owned record, not an authorization token or proof of an authenticated viewer. */
export declare const ElevenLabsWebInvitationSchema: z.ZodObject<{
    invitationId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    revision: z.ZodNumber;
    recipientUserId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    revokedAt: z.ZodNullable<z.ZodISODateTime>;
}, z.core.$strict>;
export type ElevenLabsWebInvitation = z.infer<typeof ElevenLabsWebInvitationSchema>;
/**
 * Call only with a freshly loaded server record and server-resolved scope, authenticated person and revision.
 * Recheck after every awaited operation. This validates the invitation; it never grants a provider lease.
 */
export declare function isElevenLabsWebInvitationCurrent(invitation: unknown, expectedScope: unknown, authenticatedUserId: unknown, currentRevision: unknown, now: Date): boolean;
//# sourceMappingURL=web-channel.d.ts.map