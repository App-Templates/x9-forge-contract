// Synthetic Node 20 CommonJS consumer: optional identity on all three envelopes.
import { InternalAgentTurnRequestSchema, type InternalAgentTurnRequest } from '@x9-forge/contracts/http';
import { ToolCallRequestSchema, CapabilityContextRequestSchema, type ToolCallRequest, type CapabilityContextRequest } from '@x9-forge/contracts/capability';

const turn: InternalAgentTurnRequest = { channelId: 'meditation-test', sessionId: 'synthetic-session', message: 'Synthetic greeting', userId: 'clerk:synthetic-a' };
const tool: ToolCallRequest = { callId: 'synthetic-call', tool: 'synthetic_tool', input: {}, agentId: 'synthetic-agent', sessionId: turn.sessionId, userId: turn.userId };
const context: CapabilityContextRequest = { agentId: tool.agentId, sessionId: turn.sessionId, userId: turn.userId };

export const parsed = [InternalAgentTurnRequestSchema.parse(turn), ToolCallRequestSchema.parse(tool), CapabilityContextRequestSchema.parse(context)];
