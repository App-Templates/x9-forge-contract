import { AGENT_ROLE_READ_ONLY_CAPABILITIES, AgentRoleSchema } from "../organization/agent-role.js";
import { AgentScopePolicySchema } from "./agent-scope-policy.js";
/**
 * Birth policy of a role (Director, business-unit lead): free read everywhere, write allowed on the
 * capabilities of the profile (denied on the ones the role only reads), write elsewhere asks for human approval.
 */
export function roleScopePolicy(input) {
    AgentRoleSchema.parse(input.role);
    const readOnly = AGENT_ROLE_READ_ONLY_CAPABILITIES[input.role];
    const capabilities = [...new Set(input.capabilities)].sort();
    return AgentScopePolicySchema.parse({
        version: input.version,
        defaultWebSearch: true,
        scopeLimited: false,
        ...(input.purpose === undefined ? {} : { purpose: input.purpose }),
        defaults: { read: 'allow', write: 'ask' },
        rules: capabilities.map((capability) => ({
            capability,
            read: 'allow',
            write: readOnly.includes(capability) ? 'deny' : 'allow',
        })),
    });
}
//# sourceMappingURL=agent-role-scope-policy.js.map