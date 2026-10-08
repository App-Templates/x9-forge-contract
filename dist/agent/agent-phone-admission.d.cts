import { z } from 'zod';
/** Correlation only. Authentication and explicit request authority belong to the producer. */
export declare const AgentPhoneOutboundRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    requestId: z.ZodString;
    callId: z.ZodString;
    toNumber: z.ZodString;
    requestedAt: z.ZodISODateTime;
    expectedPhoneVersion: z.ZodNumber;
    expectedNumberVersion: z.ZodNumber;
    expectedRoutingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type AgentPhoneOutboundRequest = z.infer<typeof AgentPhoneOutboundRequestSchema>;
/** Must be reconstructed from the server-owned explicit request, never accepted from a browser or model. */
export declare const AgentPhoneOutboundAuthoritySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    requestId: z.ZodString;
    callId: z.ZodString;
    toNumber: z.ZodString;
    requestedAt: z.ZodISODateTime;
    expectedPhoneVersion: z.ZodNumber;
    expectedNumberVersion: z.ZodNumber;
    expectedRoutingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    explicitlyRequested: z.ZodBoolean;
    observedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentPhoneOutboundAuthority = z.infer<typeof AgentPhoneOutboundAuthoritySchema>;
/** Exact Conoscenza entries only. An email-only legacy source never attests telephone admission. */
export declare function isPhoneNumberInAddressBook(rawNumber: unknown, rawBook: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
/** Verified event only: producer verifies provider signature and resolves a unique route before this gate.
 * This pure helper is not authentication, provider support validation, or permission to perform an effect.
 * The producer reloads and rechecks all authoritative inputs after each await and before media/turn effects.
 */
export declare function isAgentPhoneInboundAdmitted(rawEvent: unknown, rawSnapshot: unknown, rawBook: unknown, rawBinding: unknown, rawVoice: unknown, now: number, maximumAgeMs?: number): boolean;
/** Outbound never inherits public inbound access. It requires an exact Rubrica destination and a matching
 * server-owned explicit request, plus current applied phone/voice state. Idempotency and effects remain producer-owned.
 */
export declare function isAgentPhoneOutboundAdmitted(rawRequest: unknown, rawSnapshot: unknown, rawBook: unknown, rawBinding: unknown, rawVoice: unknown, rawAuthority: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-phone-admission.d.ts.map