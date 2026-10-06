import { z } from 'zod';
import { AgentIdSchema } from "./agent-identity.js";
/** Explicit control-plane/runtime mapping; neither ID is a numeric database key. */
export const AgentRuntimeIdentitySchema = z.object({
    managementAgentId: AgentIdSchema,
    runtimeAgentId: AgentIdSchema,
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