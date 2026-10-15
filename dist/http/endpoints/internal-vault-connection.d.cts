import { z } from 'zod';
/**
 * /internal/vault/connections/:agentId/:provider[/value] — per-agent Vault port
 * for connection credentials (Connessioni service <-> Forge Vault).
 * Direction: cap-connect -> Forge vault; Forge panel reads state only.
 * Auth: X-Internal-Secret carrying CONNECT_VAULT_SECRET (never INTERNAL_SERVICE_TOKEN).
 *
 * The state response never carries a value; only the value route does, and only
 * the Connessioni service reads it.
 */
/** Maximum length of a stored connection value. */
export declare const VAULT_CONNECTION_VALUE_MAX_LENGTH = 8192;
export declare const VaultConnectionParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
}, z.core.$strict>;
export type VaultConnectionParams = z.infer<typeof VaultConnectionParamsSchema>;
export declare const PutVaultConnectionBodySchema: z.ZodObject<{
    value: z.ZodString;
    accountLabel: z.ZodOptional<z.ZodString>;
    scopes: z.ZodArray<z.ZodEnum<{
        calendar_events: "calendar_events";
        contacts_read: "contacts_read";
        mail_send: "mail_send";
        mail_draft: "mail_draft";
        mail_read: "mail_read";
        drive_read: "drive_read";
    }>>;
}, z.core.$strict>;
export type PutVaultConnectionBody = z.infer<typeof PutVaultConnectionBodySchema>;
export declare const PutVaultConnectionResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    status: z.ZodLiteral<"connected">;
}, z.core.$strict>;
export type PutVaultConnectionResponse = z.infer<typeof PutVaultConnectionResponseSchema>;
export declare const DeleteVaultConnectionResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    status: z.ZodLiteral<"revoked">;
}, z.core.$strict>;
export type DeleteVaultConnectionResponse = z.infer<typeof DeleteVaultConnectionResponseSchema>;
/** Revoca presso il provider con il refresh custodito dal Vault: il token non esce. */
export declare const RevokeVaultConnectionResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    status: z.ZodEnum<{
        not_connected: "not_connected";
        revoked: "revoked";
    }>;
}, z.core.$strict>;
export type RevokeVaultConnectionResponse = z.infer<typeof RevokeVaultConnectionResponseSchema>;
export declare const GetVaultConnectionStateResponseSchema: z.ZodObject<{
    agentId: z.ZodString;
    provider: z.ZodEnum<{
        google: "google";
    }>;
    status: z.ZodEnum<{
        not_connected: "not_connected";
        connected: "connected";
        needs_reconnect: "needs_reconnect";
        revoked: "revoked";
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
export type GetVaultConnectionStateResponse = z.infer<typeof GetVaultConnectionStateResponseSchema>;
export declare const GetVaultConnectionValueResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    value: z.ZodString;
}, z.core.$strict>;
export type GetVaultConnectionValueResponse = z.infer<typeof GetVaultConnectionValueResponseSchema>;
export declare const VaultConnectionErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>;
export type VaultConnectionErrorResponse = z.infer<typeof VaultConnectionErrorResponseSchema>;
/** Access tokens are issued by Vault; refresh credentials stay in Vault. */
export declare const VAULT_ACCESS_TOKEN_MAX_LENGTH = 4096;
export declare const VAULT_ACCESS_ERROR_CODES: readonly ["not_connected", "revoked", "scope_missing", "expired"];
export declare const VaultAccessErrorCodeSchema: z.ZodEnum<{
    not_connected: "not_connected";
    revoked: "revoked";
    expired: "expired";
    scope_missing: "scope_missing";
}>;
export type VaultAccessErrorCode = z.infer<typeof VaultAccessErrorCodeSchema>;
export declare const VaultAccessScopeSchema: z.ZodEnum<{
    calendar_events: "calendar_events";
    contacts_read: "contacts_read";
    mail_send: "mail_send";
    mail_draft: "mail_draft";
    mail_read: "mail_read";
    drive_read: "drive_read";
}> & z.ZodType<"calendar_events" | "contacts_read" | "mail_draft" | "mail_read" | "drive_read", "calendar_events" | "contacts_read" | "mail_send" | "mail_draft" | "mail_read" | "drive_read", z.core.$ZodTypeInternals<"calendar_events" | "contacts_read" | "mail_draft" | "mail_read" | "drive_read", "calendar_events" | "contacts_read" | "mail_send" | "mail_draft" | "mail_read" | "drive_read">>;
export type VaultAccessScope = z.infer<typeof VaultAccessScopeSchema>;
export declare const PostVaultAccessTokenBodySchema: z.ZodObject<{
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
export type PostVaultAccessTokenBody = z.infer<typeof PostVaultAccessTokenBodySchema>;
export declare const PostVaultAccessTokenResponseSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type PostVaultAccessTokenResponse = z.infer<typeof PostVaultAccessTokenResponseSchema>;
export declare const VaultAccessErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        not_connected: "not_connected";
        revoked: "revoked";
        expired: "expired";
        scope_missing: "scope_missing";
    }>;
}, z.core.$strict>;
export type VaultAccessErrorResponse = z.infer<typeof VaultAccessErrorResponseSchema>;
export declare const ListVaultConnectionsParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strict>;
export type ListVaultConnectionsParams = z.infer<typeof ListVaultConnectionsParamsSchema>;
export declare const ListVaultConnectionsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    connections: z.ZodArray<z.ZodObject<{
        provider: z.ZodEnum<{
            google: "google";
        }>;
        status: z.ZodEnum<{
            not_connected: "not_connected";
            connected: "connected";
            needs_reconnect: "needs_reconnect";
            revoked: "revoked";
        }>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
        }>>;
        accountLabel: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ListVaultConnectionsResponse = z.infer<typeof ListVaultConnectionsResponseSchema>;
export declare const putVaultConnectionContract: {
    readonly method: "PUT";
    readonly path: "/internal/vault/connections/:agentId/:provider";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        value: z.ZodString;
        accountLabel: z.ZodOptional<z.ZodString>;
        scopes: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
            mail_draft: "mail_draft";
            mail_read: "mail_read";
            drive_read: "drive_read";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        status: z.ZodLiteral<"connected">;
    }, z.core.$strict>;
};
export declare const deleteVaultConnectionContract: {
    readonly method: "DELETE";
    readonly path: "/internal/vault/connections/:agentId/:provider";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        status: z.ZodLiteral<"revoked">;
    }, z.core.$strict>;
};
export declare const revokeVaultConnectionContract: {
    readonly method: "POST";
    readonly path: "/internal/vault/connections/:agentId/:provider/revoke";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        status: z.ZodEnum<{
            not_connected: "not_connected";
            revoked: "revoked";
        }>;
    }, z.core.$strict>;
};
export declare const getVaultConnectionStateContract: {
    readonly method: "GET";
    readonly path: "/internal/vault/connections/:agentId/:provider";
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
            not_connected: "not_connected";
            connected: "connected";
            needs_reconnect: "needs_reconnect";
            revoked: "revoked";
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
export declare const getVaultConnectionValueContract: {
    readonly method: "GET";
    readonly path: "/internal/vault/connections/:agentId/:provider/value";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        value: z.ZodString;
    }, z.core.$strict>;
};
export declare const postVaultAccessTokenContract: {
    readonly method: "POST";
    readonly path: "/internal/vault/connections/:agentId/:provider/access-token";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodObject<{
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
    }, z.core.$strict>;
};
export declare const listVaultConnectionsContract: {
    readonly method: "GET";
    readonly path: "/internal/vault/connections/:agentId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        connections: z.ZodArray<z.ZodObject<{
            provider: z.ZodEnum<{
                google: "google";
            }>;
            status: z.ZodEnum<{
                not_connected: "not_connected";
                connected: "connected";
                needs_reconnect: "needs_reconnect";
                revoked: "revoked";
            }>;
            scopes: z.ZodArray<z.ZodEnum<{
                calendar_events: "calendar_events";
                contacts_read: "contacts_read";
                mail_send: "mail_send";
                mail_draft: "mail_draft";
                mail_read: "mail_read";
                drive_read: "drive_read";
            }>>;
            accountLabel: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-vault-connection.d.ts.map