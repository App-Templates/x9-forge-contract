import {describe,it,expect} from 'vitest';
import {AgentChannelHistoryTranscriptResponseSchema as schema,isAgentChannelHistoryTranscriptCurrent as current} from '../../src/agent/agent-channel-history-content.js';
import {internalAgentChannelHistoryTranscriptContract as internal,internalAgentChannelHistoryTranscriptPath} from '../../src/http/endpoints/internal-agent-channel-history-content.js';
import {forgeAgentChannelHistoryTranscriptContract as browser,forgeAgentChannelHistoryTranscriptPath,isAgentChannelHistoryTranscriptWithinForgeAuthorization as authorized} from '../../src/http/endpoints/forge-agent-channel-history-content.js';
const now=Date.parse('2026-10-10T01:00:00Z');
const binding={scope:{agentId:'runtime-alias',ownerId:'owner-a',tenantId:'tenant-a'},identity:{managementAgentId:'managed-agent',runtimeAgentId:'runtime-alias',vaultAgentId:17}};
const entry=()=>({...binding,entryId:'opaque-entry',conversationId:'opaque-conversation',requestId:null,kind:'phone',direction:'outbound',participantName:'Synthetic participant',status:'completed',startedAt:'2026-10-10T00:59:00Z',endedAt:'2026-10-10T00:59:30Z',durationSeconds:30,content:{audio:'not-retained',transcript:'available'}});
const content=()=>({...binding,kind:'phone',entryId:'opaque-entry',conversationId:'opaque-conversation',status:'available',observedAt:new Date(now).toISOString(),subject:null,turns:[{speaker:'user',text:'Synthetic question <b>plain text</b>',offsetSeconds:0},{speaker:'assistant',text:'Synthetic answer',offsetSeconds:1}]});
const owner={role:'owner',ownerId:'owner-a',tenantId:'tenant-a'};
describe('qualified plain-text channel content',()=>{
 it('returns the exact bounded transcript without treating plain text as HTML',()=>expect(schema.parse(content())).toEqual(content()));
 it.each(['telegram','email','phone','web'])('supports %s with explicit canonical history correlation',kind=>{
  const result={...content(),kind},stored={...entry(),kind};
  expect(current(result,binding,kind,'opaque-entry',stored,now)).toBe(true);
 });
 it.each(['not-retained','expired','unavailable','not-applicable'])('preserves %s instead of manufacturing an empty conversation',status=>{
  const {subject:_subject,turns:_turns,...base}=content();
  const result={...base,status},stored={...entry(),content:{...entry().content,transcript:status}};
  expect(schema.parse(result)).toEqual(result);expect(current(result,binding,'phone','opaque-entry',stored,now)).toBe(true);
  expect(schema.safeParse({...result,turns:[]}).success).toBe(false);
 });
 it('permits email subject only with an actual available email body',()=>{
  expect(schema.parse({...content(),kind:'email',subject:'Synthetic subject'})).toMatchObject({subject:'Synthetic subject'});
  expect(schema.safeParse({...content(),subject:'Invented phone subject'}).success).toBe(false);
 });
 it.each(['signedUrl','providerId','raw','credentials'])('rejects extra %s private provider material',field=>expect(schema.safeParse({...content(),[field]:'PRIVATE'}).success).toBe(false));
 it.each([
  {turns:[]},
  {turns:[{speaker:'system',text:'PRIVATE_PROMPT',offsetSeconds:null}]},
  {turns:[{speaker:'assistant',text:'',offsetSeconds:0}]},
  {turns:[{speaker:'assistant',text:'Synthetic',offsetSeconds:-1}]},
  {turns:[{speaker:'assistant',text:'Synthetic',offsetSeconds:2},{speaker:'user',text:'Synthetic',offsetSeconds:1}]},
  {turns:[{speaker:'assistant',text:'Synthetic',offsetSeconds:0,toolArguments:'PRIVATE'}]},
  {turns:Array.from({length:5},()=>({speaker:'assistant',text:'x'.repeat(65_536),offsetSeconds:null}))},
 ])('rejects malformed, private or oversized transcript %#',change=>expect(schema.safeParse({...content(),...change}).success).toBe(false));
 it.each(['agentId','ownerId','tenantId'])('refuses foreign %s even when the whole content is internally coherent',field=>{
  const scope={...binding.scope,[field]:'foreign'};
  const identity=field==='agentId'?{...binding.identity,runtimeAgentId:'foreign'}:binding.identity;
  expect(current({...content(),scope,identity},binding,'phone','opaque-entry',entry(),now)).toBe(false);
 });
 it.each(['managementAgentId','vaultAgentId'])('refuses foreign identity %s',field=>{
  expect(current({...content(),identity:{...binding.identity,[field]:field==='vaultAgentId'?99:'other'}},binding,'phone','opaque-entry',entry(),now)).toBe(false);
 });
 it.each(['kind','entryId','conversationId'])('refuses uncorrelated content %s',field=>{
  const result={...content(),[field]:field==='kind'?'web':'other'};
  expect(current(result,binding,'phone','opaque-entry',entry(),now)).toBe(false);
 });
 it('requires content availability attested by the exact history entry',()=>expect(current(content(),binding,'phone','opaque-entry',{...entry(),content:{audio:'not-retained',transcript:'unavailable'}},now)).toBe(false));
 it.each([-1,60_000])('refuses content age %s at the strict freshness boundary',age=>expect(current({...content(),observedAt:new Date(now-age).toISOString()},binding,'phone','opaque-entry',entry(),now)).toBe(false));
 it.each([NaN,Infinity,-1,0])('refuses invalid time budget %s',budget=>expect(current(content(),binding,'phone','opaque-entry',entry(),now,budget)).toBe(false));
 it('refuses future stored events despite a fresh response',()=>expect(current(content(),binding,'phone','opaque-entry',{...entry(),endedAt:new Date(now+1).toISOString()},now)).toBe(false));
 it('does not qualify missing observation time or malformed authority',()=>{
  const {turns:_turns,subject:_subject,...base}=content();
  expect(current({...base,status:'unavailable',observedAt:null},binding,'phone','opaque-entry',entry(),now)).toBe(false);
  expect(current(content(),{},'phone','opaque-entry',entry(),now)).toBe(false);
  expect(current(content(),binding,'phone','opaque-entry',entry(),NaN)).toBe(false);
 });
});
describe('authorized transcript HTTP boundary',()=>{
 it('permits only current server owner or SA management authorization with the requested management alias',()=>{
  expect(authorized(content(),owner,'managed-agent')).toBe(true);
  expect(authorized(content(),{role:'sa'},'managed-agent')).toBe(true);
  expect(authorized(content(),owner,'runtime-alias')).toBe(false);
 });
 it.each([{...owner,ownerId:'other'},{...owner,tenantId:'other'},{role:'anonymous'},{...owner,userId:'browser-forged'}])('rejects foreign or browser-invented authorization %#',access=>expect(authorized(content(),access,'managed-agent')).toBe(false));
 it('uses the canonical response, owner session and closed internal transport descriptor',()=>{
  expect(browser).toMatchObject({method:'GET',authentication:'forge-session',authorization:'sa-or-agent-owner',cacheControl:'no-store'});
  expect(internal).toMatchObject({method:'GET',authType:'secret',cacheControl:'no-store'});
  expect(browser.responseSchema).toBe(schema);expect(internal.responseSchema).toBe(schema);
  expect(forgeAgentChannelHistoryTranscriptPath('managed-agent','phone','opaque-entry')).toBe('/api/agents/managed-agent/channels/phone/history/opaque-entry/transcript');
  expect(internalAgentChannelHistoryTranscriptPath('runtime-alias','phone','opaque-entry')).toBe('/internal/agents/runtime-alias/channels/phone/history/opaque-entry/transcript');
  expect(browser.paramsSchema.safeParse({agentId:'managed-agent',kind:'phone',entryId:'opaque-entry',url:'https://provider.invalid'}).success).toBe(false);
 });
});
