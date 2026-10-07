import { AgentInventoryCapabilitySchema, agentCapabilitiesOf, telegramChannelMetadataOf, type AgentInventoryCapability, type AgentTelegramChannelMetadata, type AgentRuntimeChannel } from '@x9-forge/contracts/agent';
import { getListAgentsCapabilities, type ListAgentsAgent } from '@x9-forge/contracts/http';
const capability: AgentInventoryCapability = AgentInventoryCapabilitySchema.parse({ name: 'synthetic', enabled: true });
const unknown: AgentInventoryCapability[] | null = agentCapabilitiesOf({});
const observed: AgentInventoryCapability[] | null = getListAgentsCapabilities({}, 'synthetic');
const telegram: AgentTelegramChannelMetadata | null = telegramChannelMetadataOf({});
const channel: AgentRuntimeChannel = { channelId: 'synthetic', kind: 'telegram', state: 'paused', loaded: false, readiness: 'unknown', allowFromCount: 0, botUsername: 'synthetic_bot' };
const row: ListAgentsAgent = { agentId: 'synthetic', displayName: '', ownerId: 'synthetic', capabilities: null };
void [capability, unknown, observed, telegram, channel, row];
