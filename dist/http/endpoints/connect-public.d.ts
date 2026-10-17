import { z } from 'zod';
/**
 * Public pages of the Connessioni service (cap-connect), opened from a browser.
 * Auth: none. Safety comes from the one-time link token and the single-use
 * OAuth `state` (PKCE), not from the fleet secret.
 *
 * No response ever carries a Google code, access token or refresh token.
 */
/** Path of the Google return page; used to build the registered redirect URI. */
export declare const CONNECT_RETURN_PATH: "/connect/return";
export declare const OpenConnectLinkParamsSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strict>;
export type OpenConnectLinkParams = z.infer<typeof OpenConnectLinkParamsSchema>;
export declare const OpenConnectLinkErrorReasonSchema: z.ZodEnum<{
    expired: "expired";
    invalid: "invalid";
    used: "used";
}>;
export type OpenConnectLinkErrorReason = z.infer<typeof OpenConnectLinkErrorReasonSchema>;
export declare const OpenConnectLinkResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"redirect">;
    location: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"error">;
    reason: z.ZodEnum<{
        expired: "expired";
        invalid: "invalid";
        used: "used";
    }>;
}, z.core.$strict>], "kind">;
export type OpenConnectLinkResponse = z.infer<typeof OpenConnectLinkResponseSchema>;
export declare const ConnectReturnQuerySchema: z.ZodObject<{
    state: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ConnectReturnQuery = z.infer<typeof ConnectReturnQuerySchema>;
export declare const ConnectReturnErrorReasonSchema: z.ZodEnum<{
    denied: "denied";
    invalid_state: "invalid_state";
    exchange_failed: "exchange_failed";
    vault_error: "vault_error";
}>;
export type ConnectReturnErrorReason = z.infer<typeof ConnectReturnErrorReasonSchema>;
export declare const ConnectReturnResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"done">;
    accountLabel: z.ZodOptional<z.ZodString>;
    scopes: z.ZodArray<z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
        mail_draft: "mail_draft";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"error">;
    reason: z.ZodEnum<{
        denied: "denied";
        invalid_state: "invalid_state";
        exchange_failed: "exchange_failed";
        vault_error: "vault_error";
    }>;
}, z.core.$strict>], "kind">;
export type ConnectReturnResponse = z.infer<typeof ConnectReturnResponseSchema>;
export declare const openConnectLinkContract: {
    readonly method: "GET";
    readonly path: "/connect/link/:token";
    readonly authType: "none";
    readonly paramsSchema: z.ZodObject<{
        token: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"redirect">;
        location: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"error">;
        reason: z.ZodEnum<{
            expired: "expired";
            invalid: "invalid";
            used: "used";
        }>;
    }, z.core.$strict>], "kind">;
};
export declare const connectReturnContract: {
    readonly method: "GET";
    readonly path: "/connect/return";
    readonly authType: "none";
    readonly querySchema: z.ZodObject<{
        state: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"done">;
        accountLabel: z.ZodOptional<z.ZodString>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"error">;
        reason: z.ZodEnum<{
            denied: "denied";
            invalid_state: "invalid_state";
            exchange_failed: "exchange_failed";
            vault_error: "vault_error";
        }>;
    }, z.core.$strict>], "kind">;
};
//# sourceMappingURL=connect-public.d.ts.map