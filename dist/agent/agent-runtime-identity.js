import { z } from 'zod';
import { AgentIdSchema } from "./agent-identity.js";
/** Explicit control-plane/runtime mapping; management and runtime IDs are not numeric database keys. */
export const AgentRuntimeIdentitySchema = z.object({
    managementAgentId: AgentIdSchema,
    runtimeAgentId: AgentIdSchema,
    /**
     * Forge writes its agents.id alongside this identity in the same saved voice configuration.
     * X9 uses this integer only for VaultClient.resolve, never as a runtime/management identifier.
     * Legacy absence is valid; consumers must report missing context without falling back to another agent.
     */
    vaultAgentId: z.number().int().positive().optional(),
});
/** Every identifier resolves to exactly one logical agent, across both namespaces. */
export const AgentRuntimeIdentitiesSchema = z.array(AgentRuntimeIdentitySchema)
    .superRefine((identities, ctx) => {
    const identifiers = new Set();
    for (const [index, identity] of identities.entries()) {
        const current = new Set([identity.managementAgentId, identity.runtimeAgentId]);
        for (const identifier of current) {
            if (identifiers.has(identifier)) {
                ctx.addIssue({
                    code: 'custom',
                    path: [index],
                    message: `Duplicate or ambiguous agent identifier: ${identifier}`,
                });
            }
            identifiers.add(identifier);
        }
    }
});
//# sourceMappingURL=agent-runtime-identity.js.map