import { AgentRuntimeIdentitySchema, AgentContextWithChannelsSchema, AgentContextWithChannelsWriteSchema, AgentContextWithWorkspaceSchema, managementAgentIdOf } from '@x9-forge/contracts/agent';
import type { AgentRuntimeIdentity, AgentContextWithChannels, AgentId } from '@x9-forge/contracts/agent';
const identity: AgentRuntimeIdentity = AgentRuntimeIdentitySchema.parse({ managementAgentId: '101', runtimeAgentId: 'alice' });
const context: AgentContextWithChannels = AgentContextWithChannelsSchema.parse({});
const selected: AgentId | null = managementAgentIdOf(context);
const retained: AgentRuntimeIdentity | undefined = context.identity;
const workspaceIdentity: AgentRuntimeIdentity | undefined = AgentContextWithWorkspaceSchema.parse({}).identity;
void identity; void selected; void retained; void workspaceIdentity; void AgentContextWithChannelsWriteSchema;
