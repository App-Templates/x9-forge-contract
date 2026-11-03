import { z } from 'zod';
/** Trusted-registry attestation, never a model's self-reported availability.
 * Services must apply real revocation and reread the registry before effects (S2/S3).
 * A configured binding or DevAgentStatus alone does not attest a usable session.
 */
export declare const DevelopmentSessionLeaseSchema: z.ZodObject<{
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
export type DevelopmentSessionLease = z.infer<typeof DevelopmentSessionLeaseSchema>;
/** Pure format/correlation/freshness check; both lease and expected binding must
 * come from trusted service state. This does not verify passkeys or wire revocation.
 * Engine order is irrelevant; the caller must inject its current clock.
 */
export declare function isDevelopmentSessionUsable(raw: unknown, expectedBinding: unknown, engine: unknown, nowMs: number): boolean;
//# sourceMappingURL=development-session-state.d.ts.map