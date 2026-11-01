import type { z } from 'zod';
import type { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { AgentRoleSchema, type AgentRole } from '../organization/agent-role.js';
import { AgentScopePolicySchema, type AgentScopePolicy } from './agent-scope-policy.js';

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
export function roleScopePolicy(input: RoleScopePolicyInput): AgentScopePolicy {
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
