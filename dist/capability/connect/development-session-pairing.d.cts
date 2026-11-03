import { z } from 'zod';
/** The same pairing lifecycle applies locally and in the cloud. Keep provider
 * credentials on the owner's device or cloud, never in this public contract. */
export declare const DevelopmentSessionPairingChallengeSchema: z.ZodObject<{
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
export type DevelopmentSessionPairingChallenge = z.infer<typeof DevelopmentSessionPairingChallengeSchema>;
export declare const DevelopmentSessionConsentSchema: z.ZodObject<{
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
export type DevelopmentSessionConsent = z.infer<typeof DevelopmentSessionConsentSchema>;
/**
 * `expected` must come from an authenticated registry. The service must verify
 * signature/possession, session consent, single-use nonce consumption and revocation.
 * This pure helper proves format, correlation and time only; client data never
 * becomes authority. Use the same local/cloud lifecycle and keep provider
 * credentials on the owner's device/cloud.
 */
export declare function isDevelopmentSessionConsentForChallenge(raw: unknown, expected: unknown, nowMs: number): boolean;
//# sourceMappingURL=development-session-pairing.d.ts.map