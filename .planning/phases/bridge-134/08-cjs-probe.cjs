const assert = require('node:assert/strict');
const agent = require('@x9-forge/contracts/agent');
const voice = require('@x9-forge/contracts/voice');
const http = require('@x9-forge/contracts/http');
const context = { agentId:'synthetic-agent',ownerId:'synthetic-owner',credentials:{},llmConfig:{provider:'synthetic',model:'synthetic'},telegramAllowFrom:[],workspacePath:'/synthetic/workspace',registryPath:'/synthetic/registry',displayName:'Synthetic' };
const settings = {mode:'voice',provider:'openai_live',protocol:'websocket',transports:['phone'],voiceId:'synthetic-own-voice',model:'synthetic-own-model'};
const config = {agentId:context.agentId,versions:{desired:4,applied:3,failed:null},desired:{mode:'text-only'},applied:settings};
const policy = {version:7,defaultWebSearch:false,scopeLimited:true,purpose:'Synthetic purpose',defaults:{read:'deny',write:'deny'},rules:[{capability:'email',read:'allow',write:'ask'}]};
const caller = voice.OutboundCallerIdentitySchema.parse({agent:{managementAgentId:'42',runtimeAgentId:'runtime-synthetic'},displayName:'Synthetic caller',voice:{provider:settings.provider,voiceId:settings.voiceId,model:settings.model},fromNumber:'+390212345678',settingsVersion:3});
const results = [];
for(const [name,check] of [
 ['legacy-null',()=>{assert.equal(agent.appliedAgentVoiceSettings(agent.AgentContextWithChannelsSchema.parse(context)),null);assert.equal(agent.appliedAgentScopePolicy(agent.AgentContextWithChannelsSchema.parse(context)),null);} ],
 ['applied-voice',()=>{const parsed=agent.AgentContextWithChannelsSchema.parse({...context,voiceConfiguration:config});assert.deepEqual(agent.appliedAgentVoiceSettings(parsed),settings);assert.equal(agent.AgentContextWithChannelsWriteSchema.safeParse({...context,voiceConfiguration:{...config,agentId:'foreign'}}).success,false);} ],
 ['applied-policy',()=>{const parsed=agent.AgentContextWithChannelsWriteSchema.parse({...context,scopePolicy:policy});assert.deepEqual(agent.appliedAgentScopePolicy(parsed),policy);assert.equal(agent.AgentContextWithChannelsSchema.safeParse({...context,scopePolicy:{...policy,rules:[policy.rules[0],policy.rules[0]]}}).success,false);} ],
 ['authoritative-caller',()=>{const input={agentId:'42',conversationId:'synthetic-call',caller};assert.deepEqual(http.VoiceRegisterRequestSchema.parse(input),input);assert.equal(http.VoiceRegisterRequestSchema.safeParse({...input,agentId:'foreign'}).success,false);} ],
 ['unapplied-admission',()=>{const {voice:_voice,...identity}=caller;assert.deepEqual(voice.outboundCallerIdentityFor({...identity,settings:null}),{ok:false,error:'voice_not_applied'});assert.equal(voice.AgentVoiceErrorCodeSchema.safeParse('voice_not_applied').success,true);} ],
]) {try{check();results.push({name,passed:true});}catch(error){results.push({name,passed:false,errorName:error.name,message:error.message});}}
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.passed).length,results}));
process.exitCode=results.every(r=>r.passed)?0:1;
