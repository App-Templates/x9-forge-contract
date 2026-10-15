// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration generation.
import {z} from 'zod';
import {AgentChannelHistoryParamsSchema} from './internal-agent-channel-history.js';
import {AgentManagementRequestIdSchema} from '../../agent/agent-management.js';
import {AgentChannelHistoryTranscriptResponseSchema} from '../../agent/agent-channel-history-content.js';
import {AgentChannelAccessErrorResponseSchema} from '../../agent/agent-channel-access-requests.js';
export const AgentChannelHistoryTranscriptParamsSchema=AgentChannelHistoryParamsSchema.extend({entryId:AgentManagementRequestIdSchema}).strict();
/** Internal authentication is mandatory; producers never accept a provider id or URL from the caller. */
export const internalAgentChannelHistoryTranscriptContract={
 method:'GET' as const,path:'/internal/agents/:agentId/channels/:kind/history/:entryId/transcript' as const,authType:'secret' as const,
 cacheControl:'no-store' as const,paramsSchema:AgentChannelHistoryTranscriptParamsSchema,
 responseSchema:AgentChannelHistoryTranscriptResponseSchema,errorResponseSchema:AgentChannelAccessErrorResponseSchema,
};
export function internalAgentChannelHistoryTranscriptPath(agentId:string,kind:string,entryId:string):string{
 const p=AgentChannelHistoryTranscriptParamsSchema.parse({agentId,kind,entryId});
 return internalAgentChannelHistoryTranscriptContract.path.replace(':agentId',encodeURIComponent(p.agentId)).replace(':kind',p.kind).replace(':entryId',encodeURIComponent(p.entryId));
}
