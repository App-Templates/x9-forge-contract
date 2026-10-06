import { z } from 'zod';
/** Explicit control-plane/runtime mapping; neither ID is a numeric database key. */
export declare const AgentRuntimeIdentitySchema: z.ZodObject<{
    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strip>;
export type AgentRuntimeIdentity = z.infer<typeof AgentRuntimeIdentitySchema>;
/** Every identifier resolves to exactly one logical agent, across both namespaces. */
export declare const AgentRuntimeIdentitiesSchema: z.ZodArray<z.ZodObject<{
    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strip>>;
export type AgentRuntimeIdentities = z.infer<typeof AgentRuntimeIdentitiesSchema>;
//# sourceMappingURL=agent-runtime-identity.d.ts.map