"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleScopePolicy = roleScopePolicy;
const agent_role_js_1 = require("../organization/agent-role.cjs");
const agent_scope_policy_js_1 = require("./agent-scope-policy.cjs");
/**
 * Birth policy of a role (Director, business-unit lead): free read everywhere, write allowed on the
 * capabilities of the profile, write elsewhere asks for human approval.
 */
function roleScopePolicy(input) {
    agent_role_js_1.AgentRoleSchema.parse(input.role);
    const capabilities = [...new Set(input.capabilities)].sort();
    return agent_scope_policy_js_1.AgentScopePolicySchema.parse({
        version: input.version,
        defaultWebSearch: true,
        scopeLimited: false,
        ...(input.purpose === undefined ? {} : { purpose: input.purpose }),
        defaults: { read: 'allow', write: 'ask' },
        rules: capabilities.map((capability) => ({ capability, read: 'allow', write: 'allow' })),
    });
}
//# sourceMappingURL=agent-role-scope-policy.js.map