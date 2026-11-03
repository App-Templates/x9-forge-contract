// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration generation.
import {z} from 'zod';
import {AgentChannelHistoryTranscriptResponseSchema} from '../../agent/agent-channel-history-content.js';
import {AgentChannelAccessErrorResponseSchema} from '../../agent/agent-channel-access-requests.js';
import {AgentChannelHistoryTranscriptParamsSchema} from './internal-agent-channel-history-content.js';
import {ForgeAgentChannelAccessAuthorizationSchema} from './forge-agent-channel-access.js';
/** Server session evidence only. This helper does not authenticate an HTTP request. */
export function isAgentChannelHistoryTranscriptWithinForgeAuthorization(rawContent:unknown,trustedAccess:unknown,requestedAgentId:unknown):boolean{
 const content=AgentChannelHistoryTranscriptResponseSchema.safeParse(rawContent),access=ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
 const params=AgentChannelHistoryTranscriptParamsSchema.shape.agentId.safeParse(requestedAgentId);
 if(!content.success||!access.success||!params.success||content.data.identity.managementAgentId!==params.data)return false;
 return access.data.role==='sa'||(content.data.scope.ownerId===access.data.ownerId&&content.data.scope.tenantId===access.data.tenantId); // guard:transcript-owner
}
export const forgeAgentChannelHistoryTranscriptContract={
 method:'GET' as const,path:'/api/agents/:agentId/channels/:kind/history/:entryId/transcript' as const,
 authentication:'forge-session' as const,authorization:'sa-or-agent-owner' as const,cacheControl:'no-store' as const,
 paramsSchema:AgentChannelHistoryTranscriptParamsSchema,responseSchema:AgentChannelHistoryTranscriptResponseSchema,
 errorResponseSchema:AgentChannelAccessErrorResponseSchema,
};
export function forgeAgentChannelHistoryTranscriptPath(agentId:string,kind:string,entryId:string):string{
 const p=AgentChannelHistoryTranscriptParamsSchema.parse({agentId,kind,entryId});
 return forgeAgentChannelHistoryTranscriptContract.path.replace(':agentId',encodeURIComponent(p.agentId)).replace(':kind',p.kind).replace(':entryId',encodeURIComponent(p.entryId));
}
