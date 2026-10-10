import { z } from 'zod';
export declare const ForgeElevenLabsWebParamsSchema: z.ZodObject<{
    linkId: z.ZodString;
}, z.core.$strict>;
export declare const forgeElevenLabsWebMetadataContract: {
    readonly method: "GET";
    readonly path: "/api/parla/:linkId";
    readonly paramsSchema: z.ZodObject<{
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        linkId: z.ZodString;
        displayName: z.ZodString;
        state: z.ZodEnum<{
            unavailable: "unavailable";
            off: "off";
            paused: "paused";
            ready: "ready";
        }>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            source_unavailable: "source_unavailable";
            authentication_required: "authentication_required";
            access_denied: "access_denied";
            session_in_progress: "session_in_progress";
        }>;
    }, z.core.$strict>;
    readonly authentication: "optional-forge-session";
    readonly authorization: "server-web-policy";
    readonly cacheControl: "no-store";
};
export declare const forgeElevenLabsWebSessionContract: {
    readonly method: "POST";
    readonly path: "/api/parla/:linkId/session";
    readonly paramsSchema: z.ZodObject<{
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        linkId: z.ZodString;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        signedUrl: z.ZodURL;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            source_unavailable: "source_unavailable";
            authentication_required: "authentication_required";
            access_denied: "access_denied";
            session_in_progress: "session_in_progress";
        }>;
    }, z.core.$strict>;
    readonly authentication: "optional-forge-session";
    readonly authorization: "server-web-policy";
    readonly cacheControl: "no-store";
};
export declare function forgeElevenLabsWebMetadataPath(linkId: string): string;
export declare function forgeElevenLabsWebSessionPath(linkId: string): string;
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
export declare function isElevenLabsWebBrowserRequestForLink(rawRequest: unknown, rawLinkId: unknown): boolean;
/** Browser metadata only. Unavailable cannot masquerade as a successfully observed empty list. */
export declare const ForgeElevenLabsWebInvitationListResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"available">;
    version: z.ZodNumber;
    observedAt: z.ZodISODateTime;
    entries: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unavailable">;
}, z.core.$strict>], "status">;
export type ForgeElevenLabsWebInvitationListResponse = z.infer<typeof ForgeElevenLabsWebInvitationListResponseSchema>;
/** Receipt correlation only: this never proves an authenticated session or grants a provider connection. */
export declare const ForgeElevenLabsWebInvitationWriteResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    replayed: z.ZodBoolean;
    version: z.ZodNumber;
    invitation: z.ZodObject<{
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
}, z.core.$strict>;
export type ForgeElevenLabsWebInvitationWriteResult = z.infer<typeof ForgeElevenLabsWebInvitationWriteResultSchema>;
/** Trusted existing Forge session, freshly resolved full binding and source only; never browser authority. */
export declare function isElevenLabsWebInvitationWithinForgeAuthorization(rawList: unknown, trustedAccess: unknown, requestedAgentId: unknown): boolean;
/** Null means the producer must return an error/unavailable state, never an invented empty source. */
export declare function projectForgeElevenLabsWebInvitations(rawList: unknown, trustedAccess: unknown, requestedAgentId: unknown, now: number): ForgeElevenLabsWebInvitationListResponse | null;
export declare function isForgeElevenLabsWebInvitationResultForDraft(action: unknown, rawDraft: unknown, rawResult: unknown): boolean;
export declare const forgeElevenLabsWebInvitationsContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:agentId/channels/web/invitations";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"available">;
        version: z.ZodNumber;
        observedAt: z.ZodISODateTime;
        entries: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>], "status">;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>;
        currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
};
export declare const forgeElevenLabsWebInviteContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/web/invitations";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        email: z.ZodEmail;
        expectedVersion: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        version: z.ZodNumber;
        invitation: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>;
        currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
};
export declare const forgeElevenLabsWebRevokeContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/web/invitations/revoke";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        invitationId: z.ZodString;
        expectedVersion: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        version: z.ZodNumber;
        invitation: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>;
        currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
};
export declare function forgeElevenLabsWebInvitationsPath(agentId: string): string;
export declare function forgeElevenLabsWebRevokePath(agentId: string): string;
//# sourceMappingURL=forge-elevenlabs-web.d.ts.map