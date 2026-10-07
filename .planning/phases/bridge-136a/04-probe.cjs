const assert = require('node:assert/strict');
const path = require('node:path');
const agent = require('@x9-forge/contracts/agent');
const expectedRoot = process.argv[2];
assert.equal(require.resolve('@x9-forge/contracts/agent'),path.join(expectedRoot,'dist/agent/index.cjs'));
const pair = {managementAgentId:'101',runtimeAgentId:'alice'};
const base={agentId:'alice',ownerId:'owner',tenantId:'tenant',credentials:{},llmConfig:{provider:'synthetic',model:'synthetic'},telegramAllowFrom:[],workspacePath:'/synthetic/workspace',registryPath:'/synthetic/registry.json',displayName:'Synthetic'};
const voice=(id='101')=>({agentId:id,versions:{desired:3,applied:2,failed:null},desired:{mode:'text-only'},applied:{mode:'voice',provider:'openai_live',protocol:'websocket',transports:['phone'],voiceId:'synthetic-voice',model:'synthetic-model'}});
const ch=(kind,id='101')=>({kind,identity:{...pair,managementAgentId:id},scope:{agentId:'alice',ownerId:'owner',tenantId:'tenant'},desired:{version:2,state:'paused'},applied:null,resource:null,observation:null,observedAt:null,error:null});
const schemas=[agent.AgentContextWithChannelsSchema,agent.AgentContextWithChannelsWriteSchema,agent.AgentContextWithWorkspaceSchema,agent.AgentContextWithWorkspaceWriteSchema];
const checkAll=fn=>{for(const schema of schemas)fn(schema);};
const valid=(schema,raw)=>{const parsed=schema.safeParse(raw);assert.equal(parsed.success,true);return parsed.data;};
const results=[];
for(const[name,check]of[
 ['public-helper',()=>assert.equal(typeof agent.managementAgentIdOf,'function')],
 ['legacy-context',()=>checkAll(s=>assert.deepEqual(valid(s,base),base))],
 ['legacy-voice',()=>checkAll(s=>assert.deepEqual(valid(s,{...base,voiceConfiguration:voice('alice')}).voiceConfiguration,voice('alice')))],
 ['canonical-identity',()=>checkAll(s=>assert.deepEqual(valid(s,{...base,identity:pair}).identity,pair))],
 ['distinct-management-runtime',()=>checkAll(s=>assert.equal(valid(s,{...base,identity:pair,voiceConfiguration:voice()}).voiceConfiguration.agentId,'101'))],
 ['channel-derived-management',()=>checkAll(s=>assert.equal(valid(s,{...base,channelConfigurations:[ch('telegram'),ch('email')],voiceConfiguration:voice()}).voiceConfiguration.agentId,'101'))],
 ['runtime-binding',()=>checkAll(s=>assert.equal(s.safeParse({...base,identity:{managementAgentId:'alice',runtimeAgentId:'foreign'},voiceConfiguration:voice('alice')}).success,false))],
 ['channel-concordance',()=>checkAll(s=>assert.equal(s.safeParse({...base,channelConfigurations:[ch('telegram'),ch('email','999')]}).success,false))],
 ['explicit-channel-binding',()=>checkAll(s=>assert.equal(s.safeParse({...base,identity:pair,channelConfigurations:[ch('telegram','999'),ch('email','999')]}).success,false))],
 ['voice-management-binding',()=>checkAll(s=>{assert.equal(s.safeParse({...base,identity:pair,voiceConfiguration:voice('alice')}).success,false);assert.equal(s.safeParse({...base,voiceConfiguration:voice('foreign')}).success,false);})],
 ['helper-canonical-sources',()=>{assert.equal(typeof agent.managementAgentIdOf,'function');checkAll(s=>{assert.equal(agent.managementAgentIdOf(valid(s,{...base,identity:pair})),'101');assert.equal(agent.managementAgentIdOf(valid(s,{...base,channelConfigurations:[ch('telegram'),ch('email')]})),'101');});}],
 ['helper-no-guessed-source',()=>{assert.equal(typeof agent.managementAgentIdOf,'function');checkAll(s=>{assert.equal(agent.managementAgentIdOf(valid(s,base)),null);assert.equal(agent.managementAgentIdOf(valid(s,{...base,voiceConfiguration:voice('alice')})),null);});}],
 ['read-canonical-field-validation',()=>{for(const s of [schemas[0],schemas[2]])for(const identity of [null,{},'101',{managementAgentId:'101'}])assert.equal(s.shape.identity.safeParse(identity).success,false);}],
 ['write-canonical-field-validation',()=>{for(const s of [schemas[1],schemas[3]])for(const identity of [null,{},'101',{managementAgentId:'101'}])assert.equal(s.shape.identity.safeParse(identity).success,false);}],
]){try{check();results.push({name,passed:true});}catch(error){results.push({name,passed:false,errorName:error.name,message:error.message});}}
console.log(JSON.stringify({total:results.length,passed:results.filter(x=>x.passed).length,results}));process.exitCode=results.every(x=>x.passed)?0:1;
