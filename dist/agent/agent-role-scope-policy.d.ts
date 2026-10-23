import type { z } from 'zod';
import type { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { type AgentRole } from "../organization/agent-role.js";
import { type AgentScopePolicy } from "./agent-scope-policy.js";
export interface RoleScopePolicyInput {
    readonly role: AgentRole;
    /** Capabilities of the role's profile: read and write are allowed on them. */
    readonly capabilities: readonly string[];
    readonly version: z.infer<typeof AgentConfigVersionSchema>;
    readonly purpose?: string;
}
/**
 * Birth policy of a role (Director, business-unit lead): free read everywhere, write allowed on the
 * capabilities of the profile, write elsewhere asks for human approval.
 */
export declare function roleScopePolicy(input: RoleScopePolicyInput): AgentScopePolicy;
//# sourceMappingURL=agent-role-scope-policy.d.ts.map