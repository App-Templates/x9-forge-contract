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
        mail_draft: "mail_draft";
        mail_read: "mail_read";
        drive_read: "drive_read";
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
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
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
/** Capability services (calendar, contacts, email) ask cap-connect for a short-lived access token. */
export declare const IssueConnectAccessTokenBodySchema: z.ZodObject<{
    agentId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
    scope: z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
        mail_draft: "mail_draft";
        mail_read: "mail_read";
        drive_read: "drive_read";
    }> & z.ZodType<"calendar_events" | "contacts_read" | "mail_draft" | "mail_read" | "drive_read", "calendar_events" | "contacts_read" | "mail_send" | "mail_draft" | "mail_read" | "drive_read", z.core.$ZodTypeInternals<"calendar_events" | "contacts_read" | "mail_draft" | "mail_read" | "drive_read", "calendar_events" | "contacts_read" | "mail_send" | "mail_draft" | "mail_read" | "drive_read">>;
    personRef: z.ZodString;
}, z.core.$strict>;
export type IssueConnectAccessTokenBody = z.infer<typeof IssueConnectAccessTokenBodySchema>;
export declare const CONNECT_ACCESS_ERROR_CODES: readonly ["not_connected", "revoked", "scope_missing", "expired", "person_not_determinable", "unavailable"];
export declare const ConnectAccessErrorCodeSchema: z.ZodEnum<{
    revoked: "revoked";
    not_connected: "not_connected";
    expired: "expired";
    unavailable: "unavailable";
    scope_missing: "scope_missing";
    person_not_determinable: "person_not_determinable";
}>;
export type ConnectAccessErrorCode = z.infer<typeof ConnectAccessErrorCodeSchema>;
export declare const IssueConnectAccessTokenResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    accessToken: z.ZodString;
    expiresAt: z.ZodNumber;
    scopes: z.ZodArray<z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
        mail_draft: "mail_draft";
        mail_read: "mail_read";
        drive_read: "drive_read";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        revoked: "revoked";
        not_connected: "not_connected";
        expired: "expired";
        unavailable: "unavailable";
        scope_missing: "scope_missing";
        person_not_determinable: "person_not_determinable";
    }>;
}, z.core.$strict>], "ok">;
export type IssueConnectAccessTokenResponse = z.infer<typeof IssueConnectAccessTokenResponseSchema>;
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
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
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
            connected: "connected";
            revoked: "revoked";
            not_connected: "not_connected";
            needs_reconnect: "needs_reconnect";
        }>;
        accountLabel: z.ZodOptional<z.ZodString>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
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
            connected: "connected";
            revoked: "revoked";
            not_connected: "not_connected";
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
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
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
                mail_draft: "mail_draft";
                mail_read: "mail_read";
                drive_read: "drive_read";
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
export declare const issueConnectAccessTokenContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/access-token";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        scope: z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
        }> & z.ZodType<"calendar_events" | "contacts_read" | "mail_draft" | "mail_read" | "drive_read", "calendar_events" | "contacts_read" | "mail_send" | "mail_draft" | "mail_read" | "drive_read", z.core.$ZodTypeInternals<"calendar_events" | "contacts_read" | "mail_draft" | "mail_read" | "drive_read", "calendar_events" | "contacts_read" | "mail_send" | "mail_draft" | "mail_read" | "drive_read">>;
        personRef: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        accessToken: z.ZodString;
        expiresAt: z.ZodNumber;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            revoked: "revoked";
            not_connected: "not_connected";
            expired: "expired";
            unavailable: "unavailable";
            scope_missing: "scope_missing";
            person_not_determinable: "person_not_determinable";
        }>;
    }, z.core.$strict>], "ok">;
};
//# sourceMappingURL=internal-connect.d.ts.map