import { z } from 'zod';
/** agent-core -> Forge factory, X-Internal-Secret as existing internal calls.
 * Creates an agent for a recipient named only by email; the owner is resolved by the producer.
 * Error bodies use AgentCreationByEmailErrorSchema from `../../agent/agent-creation-by-email.js`:
 * no other endpoint contract carries an `errorSchema` field, so it is omitted here.
 * This adds a contract, not a route implementation.
 */
export declare const internalAgentCreationByEmailContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/create-by-email";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        idempotencyKey: z.ZodString;
        recipientEmail: z.ZodEmail;
        draft: z.ZodObject<{
            name: z.ZodString;
            objective: z.ZodString;
            allowedCapabilities: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        authorization: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        status: z.ZodEnum<{
            failed: "failed";
            pending: "pending";
            created: "created";
            invited: "invited";
        }>;
        agentIdentity: z.ZodOptional<z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        ownerResolution: z.ZodOptional<z.ZodEnum<{
            existing_user: "existing_user";
            invited_identity: "invited_identity";
        }>>;
        replayed: z.ZodBoolean;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-agent-creation-by-email.d.ts.map