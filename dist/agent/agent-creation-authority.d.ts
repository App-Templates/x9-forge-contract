import { z } from 'zod';
/** Forge-issued proof of who is asking a channel to create an agent; never names the target owner or agent. */
export declare const CreationActorAttestationSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    channel: z.ZodEnum<{
        email: "email";
        voice: "voice";
        telegram: "telegram";
        whatsapp: "whatsapp";
    }>;
    issuer: z.ZodLiteral<"forge">;
    issuedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    nonce: z.ZodString;
}, z.core.$strict>;
export type CreationActorAttestation = z.infer<typeof CreationActorAttestationSchema>;
export declare const PlatformOwnerAuthorizationSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    decision: z.ZodEnum<{
        denied: "denied";
        granted: "granted";
    }>;
    reason: z.ZodOptional<z.ZodString>;
    attestation: z.ZodObject<{
        tenantId: z.ZodString;
        actorId: z.ZodString;
        channel: z.ZodEnum<{
            email: "email";
            voice: "voice";
            telegram: "telegram";
            whatsapp: "whatsapp";
        }>;
        issuer: z.ZodLiteral<"forge">;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        nonce: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PlatformOwnerAuthorization = z.infer<typeof PlatformOwnerAuthorizationSchema>;
/** Validity window only; clock injected (epoch ms). Not yet valid, expired or malformed → false. */
export declare function isCreationAuthorityCurrent(rawAttestation: unknown, now: number): boolean;
//# sourceMappingURL=agent-creation-authority.d.ts.map