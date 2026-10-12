import {z} from 'zod';
import {AgentChannelAccessBindingSchema,sameAgentChannelAccessBinding} from './agent-channel-access.js';
import {AgentChannelHistoryKindSchema,AgentChannelHistoryEntrySchema,AgentChannelHistoryContentStateSchema} from './agent-channel-history.js';
import {AgentManagementRequestIdSchema} from './agent-management.js';
const time=z.iso.datetime({offset:true});
/** Plain conversation text only. Never HTML, provider envelopes, tool arguments or system prompts. */
export const AgentChannelHistoryTranscriptTurnSchema=z.object({
 speaker:z.enum(['user','assistant']),text:z.string().min(1).max(65_536),
 offsetSeconds:z.number().finite().nonnegative().nullable(),
}).strict();
const fields={
 kind:AgentChannelHistoryKindSchema,entryId:AgentManagementRequestIdSchema,conversationId:AgentManagementRequestIdSchema,
};
const available=AgentChannelAccessBindingSchema.safeExtend({...fields,status:z.literal('available'),observedAt:time,
 subject:z.string().max(998).nullable(),turns:z.array(AgentChannelHistoryTranscriptTurnSchema).min(1).max(2048),
}).superRefine((content,ctx)=>{
 if(content.kind!=='email'&&content.subject!==null)ctx.addIssue({code:'custom',path:['subject'],message:'Only email has a message subject'});
 if(content.turns.reduce((size,turn)=>size+turn.text.length,0)>262_144)ctx.addIssue({code:'custom',path:['turns'],message:'Transcript exceeds the bounded plain-text response'});
 let previous=0;
 for(const turn of content.turns)if(turn.offsetSeconds!==null){
  if(turn.offsetSeconds<previous)ctx.addIssue({code:'custom',path:['turns'],message:'Conversation offsets must be chronological'});
  previous=turn.offsetSeconds;
 }
});
const absent=AgentChannelAccessBindingSchema.safeExtend({...fields,
 status:AgentChannelHistoryContentStateSchema.exclude(['available']),observedAt:time.nullable(),
});
export const AgentChannelHistoryTranscriptResponseSchema=z.discriminatedUnion('status',[available,absent]);
export type AgentChannelHistoryTranscriptResponse=z.infer<typeof AgentChannelHistoryTranscriptResponseSchema>;
/** Correlation only: the producer authenticates, reloads the exact stored entry and rechecks current authority.
 * A missing/expired/unretained transcript never becomes an empty successful conversation.
 */
export function isAgentChannelHistoryTranscriptCurrent(rawContent:unknown,rawBinding:unknown,rawKind:unknown,rawEntryId:unknown,rawEntry:unknown,now:number,maximumAgeMs=60_000):boolean{
 const content=AgentChannelHistoryTranscriptResponseSchema.safeParse(rawContent),binding=AgentChannelAccessBindingSchema.safeParse(rawBinding);
 const kind=AgentChannelHistoryKindSchema.safeParse(rawKind),id=AgentManagementRequestIdSchema.safeParse(rawEntryId);
 const stored=AgentChannelHistoryEntrySchema.safeParse(rawEntry);
 if(!content.success||!binding.success||!kind.success||!id.success||!stored.success
  ||!Number.isFinite(now)||!Number.isFinite(maximumAgeMs)||maximumAgeMs<=0)return false;
 const actual=content.data,entry=stored.data;
 if(!sameAgentChannelAccessBinding({scope:actual.scope,identity:actual.identity},binding.data)
  ||!sameAgentChannelAccessBinding({scope:entry.scope,identity:entry.identity},binding.data))return false; // guard:transcript-binding
 if(actual.kind!==kind.data||entry.kind!==kind.data||actual.entryId!==id.data||entry.entryId!==id.data
  ||actual.conversationId!==entry.conversationId||actual.status!==entry.content.transcript)return false;
 if(actual.observedAt===null)return false;
 const observed=Date.parse(actual.observedAt),age=now-observed;
 return age>=0&&age<maximumAgeMs&&Date.parse(entry.startedAt)<=observed
  &&(entry.endedAt===null||Date.parse(entry.endedAt)<=observed);
}
