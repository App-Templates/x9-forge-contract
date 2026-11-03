import { z } from 'zod';
export declare const DevelopmentSessionPairingParamsSchema: z.ZodObject<{
    pairingId: z.ZodString;
}, z.core.$strict>;
export declare const DevelopmentSessionParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, z.core.$strict>;
export declare const DevelopmentSessionStateQuerySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const DevelopmentSessionRevocationSchema: z.ZodObject<{
    sessionId: z.ZodString;
    status: z.ZodLiteral<"revoked">;
    revokedAt: z.ZodString;
}, z.core.$strict>;
/**
 * Internal routes are called by the authenticated backend after owner verification,
 * never directly by the browser. A body/query scope does not authenticate its owner.
 * The service must bind path pairingId/sessionId to trusted records and the
 * authenticated tenant/owner/agent scope, validate the registered device and its
 * signature, and consume the challenge and nonce exactly once.
 * Cloud targets reuse a registered adapter; platform/provider secrets stay outside
 * this API. Device signatures and consent do not authorize productive work without A11.
 */
export declare const startDevelopmentSessionPairingContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/development-sessions/pairings";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodLazy<z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>>;
        sessionId: z.ZodString;
        target: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"local">;
            deviceId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"cloud">;
            connectionRef: z.ZodString;
        }, z.core.$strict>], "kind">;
        engines: z.ZodArray<z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        binding: z.ZodObject<{
            scope: z.ZodLazy<z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
            sessionId: z.ZodString;
            target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"local">;
                deviceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"cloud">;
                connectionRef: z.ZodString;
            }, z.core.$strict>], "kind">;
            engines: z.ZodArray<z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>>;
        }, z.core.$strict>;
        pairingId: z.ZodString;
        nonce: z.ZodString;
        issuedAt: z.ZodString;
        expiresAt: z.ZodString;
    }, z.core.$strict>;
};
/** Device proof and consent require registry validation and single-use challenge/nonce consumption; A11 remains required for productive work. */
export declare const consentDevelopmentSessionContract: {
    readonly method: "POST";
    readonly path: "/connect/development-sessions/pairings/:pairingId/consent";
    readonly authType: "device_signature";
    readonly headersSchema: z.ZodObject<{
        "X-X9-Device": z.ZodString;
        "X-X9-Device-Timestamp": z.ZodString;
        "X-X9-Device-Nonce": z.ZodString;
        "X-X9-Device-Signature": z.ZodString;
    }, z.core.$strip>;
    readonly paramsSchema: z.ZodObject<{
        pairingId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        challenge: z.ZodObject<{
            binding: z.ZodObject<{
                scope: z.ZodLazy<z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>>;
                sessionId: z.ZodString;
                target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    deviceId: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"cloud">;
                    connectionRef: z.ZodString;
                }, z.core.$strict>], "kind">;
                engines: z.ZodArray<z.ZodEnum<{
                    claude: "claude";
                    codex: "codex";
                }>>;
            }, z.core.$strict>;
            pairingId: z.ZodString;
            nonce: z.ZodString;
            issuedAt: z.ZodString;
            expiresAt: z.ZodString;
        }, z.core.$strict>;
        consentedAt: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        binding: z.ZodObject<{
            scope: z.ZodLazy<z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
            sessionId: z.ZodString;
            target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"local">;
                deviceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"cloud">;
                connectionRef: z.ZodString;
            }, z.core.$strict>], "kind">;
            engines: z.ZodArray<z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>>;
        }, z.core.$strict>;
        leaseId: z.ZodString;
        consentRef: z.ZodString;
        status: z.ZodEnum<{
            connected: "connected";
            offline: "offline";
            revoked: "revoked";
        }>;
        issuedAt: z.ZodString;
        lastSeenAt: z.ZodString;
        expiresAt: z.ZodString;
        availableEngines: z.ZodArray<z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>>;
    }, z.core.$strict>;
};
/** Authenticated backend only, after owner verification; correlate sessionId and authenticated scope with the registry, never trust the query as authority. */
export declare const getDevelopmentSessionStateContract: {
    readonly method: "GET";
    readonly path: "/internal/connect/development-sessions/:sessionId/state";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        binding: z.ZodObject<{
            scope: z.ZodLazy<z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
            sessionId: z.ZodString;
            target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"local">;
                deviceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"cloud">;
                connectionRef: z.ZodString;
            }, z.core.$strict>], "kind">;
            engines: z.ZodArray<z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>>;
        }, z.core.$strict>;
        leaseId: z.ZodString;
        consentRef: z.ZodString;
        status: z.ZodEnum<{
            connected: "connected";
            offline: "offline";
            revoked: "revoked";
        }>;
        issuedAt: z.ZodString;
        lastSeenAt: z.ZodString;
        expiresAt: z.ZodString;
        availableEngines: z.ZodArray<z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>>;
    }, z.core.$strict>;
};
/** Authenticated backend only, after owner verification; match sessionId and authenticated scope before revoking the trusted record. */
export declare const revokeDevelopmentSessionContract: {
    readonly method: "POST";
    readonly path: "/internal/connect/development-sessions/:sessionId/revoke";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        sessionId: z.ZodString;
        status: z.ZodLiteral<"revoked">;
        revokedAt: z.ZodString;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-development-sessions.d.ts.map