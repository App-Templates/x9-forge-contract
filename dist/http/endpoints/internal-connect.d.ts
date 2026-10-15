import { z } from 'zod';
/**
 * /internal/connect/* — internal routes of the Connessioni service (cap-connect).
 * Direction: agent-core / X9 tool -> cap-connect.
 * Auth: X-Internal-Secret (fleet secret, INTERNAL_SECRET_HEADER).
 *
 * The state response never carries a Google token or value; the permit route
 * returns only a signed, time-limited permit for tools.
 */
/** Common error body of the Connessioni internal routes. */
export declare const ConnectErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>;
export type ConnectErrorResponse = z.infer<typeof ConnectErrorResponseSchema>;
export declare const ConnectStateParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
}, z.core.$strict>;
export type ConnectStateParams = z.infer<typeof ConnectStateParamsSchema>;
export declare const IssueConnectPermitBodySchema: z.ZodObject<{
    agentId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
    scopes: z.ZodArray<z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
    }>>;
}, z.core.$strict>;
export type IssueConnectPermitBody = z.infer<typeof IssueConnectPermitBodySchema>;
export declare const IssueConnectPermitResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    permit: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
        }>>;
        issuedAt: z.ZodNumber;
        expiresAt: z.ZodNumber;
    }, z.core.$strict>;
    token: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>], "ok">;
export type IssueConnectPermitResponse = z.infer<typeof IssueConnectPermitResponseSchema>;
export declare const startConnectContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/start";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        personRef: z.ZodString;
        conversationId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        linkUrl: z.ZodString;
        expiresAt: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strict>], "ok">;
};
export declare const getConnectStateContract: {
    readonly method: "GET";
    readonly path: "/internal/connect/state/:agentId/:provider";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        status: z.ZodEnum<{
            revoked: "revoked";
            not_connected: "not_connected";
            connected: "connected";
            needs_reconnect: "needs_reconnect";
        }>;
        accountLabel: z.ZodOptional<z.ZodString>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
        }>>;
        connectedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
};
export declare const revokeConnectContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/revoke";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodBoolean;
        status: z.ZodEnum<{
            revoked: "revoked";
            not_connected: "not_connected";
            connected: "connected";
            needs_reconnect: "needs_reconnect";
        }>;
    }, z.core.$strict>;
};
export declare const issueConnectPermitContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/permit";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        permit: z.ZodObject<{
            agentId: z.ZodString;
            provider: z.ZodEnum<{
                google: "google";
            }>;
            scopes: z.ZodArray<z.ZodEnum<{
                calendar_events: "calendar_events";
                contacts_read: "contacts_read";
                mail_send: "mail_send";
            }>>;
            issuedAt: z.ZodNumber;
            expiresAt: z.ZodNumber;
        }, z.core.$strict>;
        token: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strict>], "ok">;
};
//# sourceMappingURL=internal-connect.d.ts.map