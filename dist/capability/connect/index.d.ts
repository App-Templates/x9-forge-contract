import { z } from 'zod';
/** Providers a person can connect (provider list is configuration; Google first). */
export declare const ConnectProviderSchema: z.ZodEnum<{
    google: "google";
}>;
/** A supported connection provider. */
export type ConnectProvider = z.infer<typeof ConnectProviderSchema>;
/** Minimum permissions only: no mailbox reading. */
export declare const ConnectScopeSchema: z.ZodEnum<{
    calendar_events: "calendar_events";
    contacts_read: "contacts_read";
    mail_send: "mail_send";
}>;
/** A supported connection permission. */
export type ConnectScope = z.infer<typeof ConnectScopeSchema>;
/** One-time link limits: the link expires in 10 minutes. */
export declare const CONNECT_LINK_LIMITS: {
    readonly ttlSeconds: 600;
    readonly stateBytes: 32;
};
/** Maximum lifetime of a tool permit, in seconds. */
export declare const CONNECT_PERMIT_MAX_TTL_SECONDS = 3600;
/** Request to start a connection from a conversation. */
export declare const ConnectStartRequestSchema: z.ZodObject<{
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
/** One-time https link, or an explicit failure reason. */
export declare const ConnectStartResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    linkUrl: z.ZodString;
    expiresAt: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>], "ok">;
/** State of a connection. */
export declare const ConnectStatusSchema: z.ZodEnum<{
    revoked: "revoked";
    not_connected: "not_connected";
    connected: "connected";
    needs_reconnect: "needs_reconnect";
}>;
/** Connection state; never carries a token, code or value. */
export declare const ConnectStateResponseSchema: z.ZodObject<{
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
/** Request to revoke a connection. */
export declare const ConnectRevokeRequestSchema: z.ZodObject<{
    agentId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
}, z.core.$strict>;
/** Revocation result. */
export declare const ConnectRevokeResponseSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    status: z.ZodEnum<{
        revoked: "revoked";
        not_connected: "not_connected";
        connected: "connected";
        needs_reconnect: "needs_reconnect";
    }>;
}, z.core.$strict>;
/** Time-limited permit for tools to use a connection. */
export declare const ConnectToolPermitSchema: z.ZodObject<{
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
export type ConnectStartRequest = z.infer<typeof ConnectStartRequestSchema>;
export type ConnectStartResponse = z.infer<typeof ConnectStartResponseSchema>;
export type ConnectStatus = z.infer<typeof ConnectStatusSchema>;
export type ConnectStateResponse = z.infer<typeof ConnectStateResponseSchema>;
export type ConnectRevokeRequest = z.infer<typeof ConnectRevokeRequestSchema>;
export type ConnectRevokeResponse = z.infer<typeof ConnectRevokeResponseSchema>;
export type ConnectToolPermit = z.infer<typeof ConnectToolPermitSchema>;
//# sourceMappingURL=index.d.ts.map