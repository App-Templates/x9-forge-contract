import { z } from 'zod';
export declare const DevelopmentSessionHeartbeatSchema: z.ZodObject<{
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
    availableEngines: z.ZodArray<z.ZodEnum<{
        claude: "claude";
        codex: "codex";
    }>>;
}, z.core.$strict>;
/**
 * The service must verify the signature and nonce and a device registered for this
 * binding, including for cloud adapters. Header parsing only validates format.
 * Correlate path sessionId, binding, leaseId and consentRef with trusted registry
 * records; reject revoked sessions and never reactivate an expired lease with a
 * heartbeat (a new pairing is required). The service chooses all new timestamps
 * and expiry. This grants no A11 authorization and does not renew productive work.
 */
export declare const heartbeatDevelopmentSessionContract: {
    readonly method: "POST";
    readonly path: "/connect/development-sessions/:sessionId/heartbeat";
    readonly authType: "device_signature";
    readonly headersSchema: z.ZodObject<{
        "X-X9-Device": z.ZodString;
        "X-X9-Device-Timestamp": z.ZodString;
        "X-X9-Device-Nonce": z.ZodString;
        "X-X9-Device-Signature": z.ZodString;
    }, z.core.$strip>;
    readonly paramsSchema: z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
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
        availableEngines: z.ZodArray<z.ZodEnum<{
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
//# sourceMappingURL=development-session-heartbeat.d.ts.map