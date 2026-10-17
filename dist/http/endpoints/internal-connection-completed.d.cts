import { z } from 'zod';
/**
 * POST /internal/connect/completed — "connection completed" event.
 * Direction: cap-connect -> agent-core, after the user's consent (or its denial/expiry).
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER) or X-Internal-Token (INTERNAL_TOKEN_HEADER).
 *
 * Carries the full identity of the turn to resume (tenant, owner, agent, person)
 * and the correlation id issued with the card; X9 never invents the correlation.
 * Never carries a Google token, permit or secret.
 */
export declare const ConnectionCompletedOutcomeSchema: z.ZodEnum<{
    connected: "connected";
    denied: "denied";
    expired: "expired";
}>;
export type ConnectionCompletedOutcome = z.infer<typeof ConnectionCompletedOutcomeSchema>;
export declare const ConnectionCompletedBodySchema: z.ZodObject<{
    cardId: z.ZodString;
    correlationId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    personRef: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
    grantedPermissions: z.ZodArray<z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
        mail_draft: "mail_draft";
    }>>;
    outcome: z.ZodEnum<{
        connected: "connected";
        denied: "denied";
        expired: "expired";
    }>;
    completedAt: z.ZodNumber;
}, z.core.$strict>;
export type ConnectionCompletedBody = z.infer<typeof ConnectionCompletedBodySchema>;
export declare const ConnectionCompletedErrorCodeSchema: z.ZodEnum<{
    identity_mismatch: "identity_mismatch";
    unauthenticated: "unauthenticated";
    invalid_event: "invalid_event";
    unknown_correlation: "unknown_correlation";
}>;
export type ConnectionCompletedErrorCode = z.infer<typeof ConnectionCompletedErrorCodeSchema>;
export declare const ConnectionCompletedErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        identity_mismatch: "identity_mismatch";
        unauthenticated: "unauthenticated";
        invalid_event: "invalid_event";
        unknown_correlation: "unknown_correlation";
    }>;
    reason: z.ZodString;
}, z.core.$strict>;
export type ConnectionCompletedErrorResponse = z.infer<typeof ConnectionCompletedErrorResponseSchema>;
export declare const ConnectionCompletedResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    resumed: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        identity_mismatch: "identity_mismatch";
        unauthenticated: "unauthenticated";
        invalid_event: "invalid_event";
        unknown_correlation: "unknown_correlation";
    }>;
    reason: z.ZodString;
}, z.core.$strict>], "ok">;
export type ConnectionCompletedResponse = z.infer<typeof ConnectionCompletedResponseSchema>;
export declare const INTERNAL_CONNECTION_COMPLETED_PATH: "/internal/connect/completed";
export declare const connectionCompletedContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/completed";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        cardId: z.ZodString;
        correlationId: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        personRef: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        grantedPermissions: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
        }>>;
        outcome: z.ZodEnum<{
            connected: "connected";
            denied: "denied";
            expired: "expired";
        }>;
        completedAt: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        resumed: z.ZodBoolean;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            identity_mismatch: "identity_mismatch";
            unauthenticated: "unauthenticated";
            invalid_event: "invalid_event";
            unknown_correlation: "unknown_correlation";
        }>;
        reason: z.ZodString;
    }, z.core.$strict>], "ok">;
};
//# sourceMappingURL=internal-connection-completed.d.ts.map