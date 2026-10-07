"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeIdentitiesSchema = exports.AgentRuntimeIdentitySchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("./agent-identity.cjs");
/** Explicit control-plane/runtime mapping; management and runtime IDs are not numeric database keys. */
exports.AgentRuntimeIdentitySchema = zod_1.z.object({
    managementAgentId: agent_identity_js_1.AgentIdSchema,
    runtimeAgentId: agent_identity_js_1.AgentIdSchema,
    /**
     * Forge writes its agents.id alongside this identity in the same saved voice configuration.
     * X9 uses this integer only for VaultClient.resolve, never as a runtime/management identifier.
     * Legacy absence is valid; consumers must report missing context without falling back to another agent.
     */
    vaultAgentId: zod_1.z.number().int().positive().optional(),
});
/** Every identifier resolves to exactly one logical agent, across both namespaces. */
exports.AgentRuntimeIdentitiesSchema = zod_1.z.array(exports.AgentRuntimeIdentitySchema)
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