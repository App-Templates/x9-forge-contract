import { createAgentContextIdentity, AgentContextWithIdentityWriteSchema, type AgentContextIdentity, type AgentContextIdentityInput } from '@x9-forge/contracts/agent';
const base = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a', identity: { managementAgentId: 'forge-a', runtimeAgentId: 'runtime-a', vaultAgentId: 17 } };
const master: AgentContextIdentityInput = { ...base, role: 'master' };
const heir: AgentContextIdentityInput = { ...base, role: 'erede', masterAgentId: 'runtime-master' };
const output: AgentContextIdentity = createAgentContextIdentity(heir);
createAgentContextIdentity(master);
AgentContextWithIdentityWriteSchema.parse({ ...output, credentials: {}, llmConfig: { provider: 'openai', model: 'fixture' }, telegramAllowFrom: [], workspacePath: '/fixture', registryPath: '/fixture', displayName: 'Fixture' });
// @ts-expect-error Every modern writer must declare its role.
createAgentContextIdentity(base);
// @ts-expect-error An heir must have its explicit Master runtime identity.
createAgentContextIdentity({ ...base, role: 'erede' });
// @ts-expect-error A Master cannot declare a parent.
createAgentContextIdentity({ ...base, role: 'master', masterAgentId: 'parent' });
// @ts-expect-error Vault is required; management/runtime strings do not substitute for it.
createAgentContextIdentity({ ...base, role: 'master', identity: { managementAgentId: 'a', runtimeAgentId: 'runtime-a' } });
// @ts-expect-error Tenant authority is mandatory.
createAgentContextIdentity({ agentId: base.agentId, ownerId: base.ownerId, identity: base.identity, role: 'master' });
if (output.role === 'erede') { const parent: string = output.masterAgentId; void parent; }
