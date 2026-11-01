import { AgentRoleSchema } from "../organization/agent-role.js";
import { AgentScopePolicySchema } from "./agent-scope-policy.js";
/**
 * Birth policy of a role (Director, business-unit lead): free read everywhere, write allowed on the
 * capabilities of the profile, write elsewhere asks for human approval.
 */
export function roleScopePolicy(input) {
    AgentRoleSchema.parse(input.role);
    const capabilities = [...new Set(input.capabilities)].sort();
    return AgentScopePolicySchema.parse({
        version: input.version,
        defaultWebSearch: true,
        scopeLimited: false,
        ...(input.purpose === undefined ? {} : { purpose: input.purpose }),
        defaults: { read: 'allow', write: 'ask' },
        rules: capabilities.map((capability) => ({ capability, read: 'allow', write: 'allow' })),
    });
}
//# sourceMappingURL=agent-role-scope-policy.js.map