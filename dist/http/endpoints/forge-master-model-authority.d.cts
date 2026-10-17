import { z } from 'zod';
/** X9 -> Factory. Forge attests its DB Master role against X9's current local source.
 * Metadata only; neither desired configuration nor caller-supplied role grants authority.
 */
export declare const forgeMasterModelAuthorityContract: {
    readonly method: "POST";
    readonly path: "/api/internal/factory/models/master-authority";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly bodySchema: z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        sourceVersion: z.ZodString;
        observedAt: z.ZodISODateTime;
        validUntil: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        role: z.ZodLiteral<"master">;
        masterAgentId: z.ZodOptional<z.ZodNever>;
    }, z.core.$strict>, z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        role: z.ZodLiteral<"erede">;
        masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>], "role">;
};
//# sourceMappingURL=forge-master-model-authority.d.ts.map