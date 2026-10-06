import { z } from 'zod';
import { AgentIdSchema } from './agent-identity.js';

/** Explicit control-plane/runtime mapping; neither ID is a numeric database key. */
export const AgentRuntimeIdentitySchema = z.object({
  managementAgentId: AgentIdSchema,
  runtimeAgentId: AgentIdSchema,
});
export type AgentRuntimeIdentity = z.infer<typeof AgentRuntimeIdentitySchema>;

/** Every identifier resolves to exactly one logical agent, across both namespaces. */
export const AgentRuntimeIdentitiesSchema = z.array(AgentRuntimeIdentitySchema)
  .superRefine((identities, ctx) => {
    const identifiers = new Set<string>();
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
export type AgentRuntimeIdentities = z.infer<typeof AgentRuntimeIdentitiesSchema>;
