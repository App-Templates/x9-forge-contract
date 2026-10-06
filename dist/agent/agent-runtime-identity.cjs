"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeIdentitiesSchema = exports.AgentRuntimeIdentitySchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("./agent-identity.cjs");
/** Explicit control-plane/runtime mapping; neither ID is a numeric database key. */
exports.AgentRuntimeIdentitySchema = zod_1.z.object({
    managementAgentId: agent_identity_js_1.AgentIdSchema,
    runtimeAgentId: agent_identity_js_1.AgentIdSchema,
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