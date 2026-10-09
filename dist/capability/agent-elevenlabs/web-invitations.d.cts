import { z } from 'zod';
/** Existing registry lookup only, supplied by Forge. An outage is not a not-registered result. */
export declare const ElevenLabsWebRecipientLookupSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"registered">;
    email: z.ZodEmail;
    recipientUserId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"not-registered">;
    email: z.ZodEmail;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unavailable">;
}, z.core.$strict>], "status">;
export type ElevenLabsWebRecipientLookup = z.infer<typeof ElevenLabsWebRecipientLookupSchema>;
/** No account/user ID, scope, authorization or timestamps may come from the browser. */
export declare const ElevenLabsWebInviteDraftSchema: z.ZodObject<{
    requestId: z.ZodString;
    email: z.ZodEmail;
    expectedVersion: z.ZodNumber;
}, z.core.$strict>;
export declare const ElevenLabsWebRevokeDraftSchema: z.ZodObject<{
    requestId: z.ZodString;
    invitationId: z.ZodString;
    expectedVersion: z.ZodNumber;
}, z.core.$strict>;
export type ElevenLabsWebInviteDraft = z.infer<typeof ElevenLabsWebInviteDraftSchema>;
export type ElevenLabsWebRevokeDraft = z.infer<typeof ElevenLabsWebRevokeDraftSchema>;
export declare const ElevenLabsWebPendingInvitationSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    expiresAt: z.ZodISODateTime;
    createdAt: z.ZodISODateTime;
    revision: z.ZodNumber;
    invitationId: z.ZodString;
    revokedAt: z.ZodNullable<z.ZodISODateTime>;
}, z.core.$strict>;
export declare const ElevenLabsWebInvitationRecordSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"registered">;
    email: z.ZodEmail;
    invitation: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"pending-registration">;
    email: z.ZodEmail;
    pending: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        expiresAt: z.ZodISODateTime;
        createdAt: z.ZodISODateTime;
        revision: z.ZodNumber;
        invitationId: z.ZodString;
        revokedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>;
    invitation: z.ZodNull;
}, z.core.$strict>], "status">;
export type ElevenLabsWebInvitationRecord = z.infer<typeof ElevenLabsWebInvitationRecordSchema>;
export declare const ElevenLabsWebInvitationListSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    status: z.ZodLiteral<"available">;
    version: z.ZodNumber;
    observedAt: z.ZodISODateTime;
    entries: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"registered">;
        email: z.ZodEmail;
        invitation: z.ZodObject<{
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
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"pending-registration">;
        email: z.ZodEmail;
        pending: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            expiresAt: z.ZodISODateTime;
            createdAt: z.ZodISODateTime;
            revision: z.ZodNumber;
            invitationId: z.ZodString;
            revokedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>;
        invitation: z.ZodNull;
    }, z.core.$strict>], "status">>;
}, z.core.$strict>;
export type ElevenLabsWebInvitationList = z.infer<typeof ElevenLabsWebInvitationListSchema>;
export declare const ElevenLabsWebPublicInvitationSchema: z.ZodObject<{
    expiresAt: z.ZodISODateTime;
    createdAt: z.ZodISODateTime;
    revision: z.ZodNumber;
    invitationId: z.ZodString;
    revokedAt: z.ZodNullable<z.ZodISODateTime>;
    email: z.ZodEmail;
    status: z.ZodEnum<{
        active: "active";
        expired: "expired";
        revoked: "revoked";
        "pending-registration": "pending-registration";
    }>;
}, z.core.$strict>;
export type ElevenLabsWebPublicInvitation = z.infer<typeof ElevenLabsWebPublicInvitationSchema>;
/** Correlation only, not a writer, registry lookup, admission decision or account-link flow. */
export declare function isElevenLabsWebInvitationListCurrent(rawList: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
export declare function projectElevenLabsWebInvitationList(rawList: unknown, rawBinding: unknown, now: number): ElevenLabsWebPublicInvitation[] | null;
/** Returns only the existing C3 record for an exact currently registered target; pending never grants access.
 * Producers also authenticate ownership and apply current admission/contact policy, then recheck after await.
 */
export declare function isElevenLabsWebInvitationRecipientCurrent(rawRecord: unknown, rawLookup: unknown, expectedScope: unknown, expectedEmail: unknown, expectedRevision: unknown, now: number): boolean;
//# sourceMappingURL=web-invitations.d.ts.map