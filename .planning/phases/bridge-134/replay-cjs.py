from pathlib import Path
import json,subprocess,hashlib,shutil
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-63-1');p=r/'.planning/phases/bridge-134';private=Path('/private/tmp/codex-a-bridge134-build-current').read_text().strip();b=Path(private)
probe=b/'bridge134-probe.cjs'
probe.write_text('''const assert = require('node:assert/strict');
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
''')
shutil.copyfile(probe,p/'08b-cjs-probe.cjs')
channel='dist/agent/agent-channel-configuration.cjs';register='dist/http/endpoints/voice-register.cjs';voice='dist/capability/voice/agent-voice-settings.cjs';original={name:(b/name).read_bytes()for name in [channel,register,voice]}
recipes=[('voice-null-and-applied',channel,'return ctx.voiceConfiguration?.applied ?? null;','return undefined;'),('policy-null-and-present',channel,'return ctx.scopePolicy ?? null;','return undefined;'),('caller-binding',register,'if (request.caller && request.agentId !== request.caller.agent.managementAgentId)','if (false)'),('unapplied-admission',voice,"if (settings === null)\n        return { ok: false, error: 'voice_not_applied' };", "if (settings === null)\n        return { ok: false, error: 'voice_disabled' };")]
done=[];hit=set()
def run(label):
 result=subprocess.run(['node',str(probe)],cwd=b,capture_output=True,text=True,timeout=30);(p/(label+'.txt')).write_text(result.stdout+result.stderr);data=json.loads(result.stdout);(p/(label+'.json')).write_text(json.dumps({'exit':result.returncode,**data},indent=2)+'\n');return result.returncode,data
try:
 code,d=run('08b-cjs-baseline');assert code==0 and d['passed']==5
 for name,file,old,new in recipes:
  source=original[file].decode();assert source.count(old)==1,(name,source.count(old))
  try:
   (b/file).write_text(source.replace(old,new));code,red=run('08b-mut-'+name+'-red');assert code==1
   assertions=[x['name']for x in red['results']if not x['passed']and x['errorName']=='AssertionError'];assert assertions;hit.update(assertions)
  finally:(b/file).write_bytes(original[file])
  code,green=run('08b-mut-'+name+'-restore');assert code==0 and green['passed']==5
  done.append({'name':name,'assertions':assertions,'red':red['passed'],'redTotal':5,'restorePassed':5,'restoreTotal':5,'sha':hashlib.sha256((b/file).read_bytes()).hexdigest()})
 code,d=run('08b-cjs-final');assert code==0 and d['passed']==5 and len(hit)==5
finally:
 for name,data in original.items():(b/name).write_bytes(data)
 (p/'08b-cjs-mutations.json').write_text(json.dumps({'qualified':len(done),'expected':4,'completed':done,'namesHit':sorted(hit),'newNames':5,'restored':[{'file':name,'exact':(b/name).read_bytes()==data,'sha':hashlib.sha256(data).hexdigest()}for name,data in original.items()]},indent=2)+'\n')
print('CJS5/5, compiled mutation4/4, names5/5, SHA3/3',flush=True)
fixture=b/'bridge134-types.cts';fixture.write_text('''import { AgentContextWithChannelsSchema, appliedAgentVoiceSettings, appliedAgentScopePolicy } from '@x9-forge/contracts/agent';
import type { AgentVoiceSettings } from '@x9-forge/contracts/voice';
import type { AgentScopePolicy } from '@x9-forge/contracts/agent';
import { VoiceRegisterRequestSchema } from '@x9-forge/contracts/http';
import type { VoiceRegisterRequest } from '@x9-forge/contracts/http';
const context = AgentContextWithChannelsSchema.parse({});
const appliedVoice: AgentVoiceSettings | null = appliedAgentVoiceSettings(context);
const appliedPolicy: AgentScopePolicy | null = appliedAgentScopePolicy(context);
const registration: VoiceRegisterRequest = VoiceRegisterRequestSchema.parse({});
void appliedVoice; void appliedPolicy; void registration.caller?.agent.managementAgentId;
''');shutil.copyfile(fixture,p/'08b-cjs-types.cts')
cmd=['pnpm','-C',str(b),'exec','tsc','--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023',str(fixture)];result=subprocess.run(cmd,cwd=b,capture_output=True,text=True,timeout=60);(p/'08b-cjs-types.txt').write_text(result.stdout+result.stderr);(p/'08b-cjs-types-exit.json').write_text(json.dumps({'command':cmd,'exit':result.returncode},indent=2)+'\n');print('CJS declaration consumer',result.returncode,flush=True);assert result.returncode==0
