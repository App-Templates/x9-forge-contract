import { AgentRuntimeIdentitySchema, vaultAgentIdOf, type AgentRuntimeIdentity } from '@x9-forge/contracts/agent';
const identity: AgentRuntimeIdentity = AgentRuntimeIdentitySchema.parse({ managementAgentId: 'forge-alice', runtimeAgentId: 'alice', vaultAgentId: 42 });
const selected: number | null = vaultAgentIdOf({ identity });
const legacy: AgentRuntimeIdentity = AgentRuntimeIdentitySchema.parse({ managementAgentId: 'forge-alice', runtimeAgentId: 'alice' });
const optional: number | undefined = legacy.vaultAgentId;
void selected; void optional;
