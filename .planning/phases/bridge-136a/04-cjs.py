from pathlib import Path
import json,subprocess,hashlib,shutil,tempfile
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-70-1');p=r/'.planning/phases/bridge-136a';b=Path(Path('/private/tmp/codex-a-bridge137-build-current').read_text().strip());consumer=Path(tempfile.mkdtemp(prefix='codex-a-bridge137-consumer-',dir='/private/tmp'));modules=consumer/'node_modules/@x9-forge';modules.mkdir(parents=True);(modules/'contracts').symlink_to(b);probe=consumer/'probe.cjs';shutil.copyfile(p/'04-probe.cjs',probe)
f=b/'dist/agent/agent-channel-configuration.cjs';original=f.read_bytes();s=original.decode();sha=hashlib.sha256(original).hexdigest();done=[];names=set()
recipes=[
('read-validation','AgentContextFileSchema.safeExtend({ identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional()','AgentContextFileSchema.safeExtend({ identity: zod_1.z.unknown().optional()',1),
('write-validation','AgentContextFileWriteSchema.safeExtend({ identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional()','AgentContextFileWriteSchema.safeExtend({ identity: zod_1.z.unknown().optional()',1),
('legacy-optional','identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional()','identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema',2),
('runtime','context.identity && context.identity.runtimeAgentId !== context.agentId','false',1),
('channels','channelIds.size > 1','false',1),
('identity-channels','context.identity && config.identity.managementAgentId !== context.identity.managementAgentId','false',1),
('voice','context.voiceConfiguration && context.voiceConfiguration.agentId !== (managementAgentId ?? context.agentId)','false',1),
('legacy-voice','(managementAgentId ?? context.agentId)','managementAgentId',1),
('helper-explicit','return context.identity.managementAgentId;','return context.identity.runtimeAgentId;',1),
('helper-channel','return context.channelConfigurations?.[0]?.identity.managementAgentId ?? null;','return context.channelConfigurations?.[0]?.identity.runtimeAgentId ?? null;',1),
('helper-null','if (ids.size !== 1)\n        return null;','if (ids.size !== 1)\n        return context.agentId;',1),
('export','exports.managementAgentIdOf = managementAgentIdOf;','exports.wrongHelper = managementAgentIdOf;',1),
('valid-identity','identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional()','identity: zod_1.z.never().optional()',2),
]
def run(label):
 cmd=['node',str(probe),str(b)];result=subprocess.run(cmd,cwd=consumer,capture_output=True,text=True,timeout=30);data=json.loads(result.stdout);(p/(label+'.txt')).write_text(result.stdout+result.stderr);(p/(label+'.json')).write_text(json.dumps({'command':cmd,'exit':result.returncode,**data},indent=2)+'\n');return result.returncode,data
try:
 code,baseline=run('04-baseline');assert code==0 and baseline['passed']==14
 for name,old,new,count in recipes:
  assert s.count(old)==count,(name,s.count(old),count)
  try:
   f.write_text(s.replace(old,new));code,red=run('04-'+name+'-red');hits=[v['name']for v in red['results']if not v['passed']and v['errorName']=='AssertionError'];assert code==1 and hits and len(hits)==14-red['passed'],red
   names.update(hits);done.append({'name':name,'assertions':hits,'redPassed':red['passed'],'total':14,'mutantSha256':hashlib.sha256(f.read_bytes()).hexdigest()})
  finally:
   f.write_bytes(original);assert hashlib.sha256(f.read_bytes()).hexdigest()==sha;code,green=run('04-'+name+'-restore');assert code==0 and green['passed']==14
   if done and done[-1]['name']==name:done[-1].update({'restored':14,'restoredSha256':sha})
 code,green=run('04-final');assert code==0 and len(names)==14
finally:
 f.write_bytes(original);(p/'04-cjs-proof.json').write_text(json.dumps({'consumer':str(consumer),'compiledPackage':str(b),'pathAssertBeforeQualification':True,'qualified':len(done),'total':len(recipes),'probes':14,'names':sorted(names),'coveredNames':len(names),'sourceSha256':sha,'restored':f.read_bytes()==original,'results':done},indent=2)+'\n')
print('real installed CJS14/14,mutations13/13,names14/14,SHA1/1',flush=True)
cts=consumer/'consumer.cts';shutil.copyfile(p/'04-consumer.cts',cts);ctOriginal=cts.read_bytes();cmd=['pnpm','-C',str(b),'exec','tsc','--ignoreConfig','--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023',str(cts)]
def types(label):
 result=subprocess.run(cmd,cwd=consumer,capture_output=True,text=True,timeout=60);(p/(label+'.txt')).write_text(result.stdout+result.stderr);(p/(label+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':result.returncode},indent=2)+'\n');return result
try:
 baseline=types('04-types-baseline');assert baseline.returncode==0,baseline.stdout
 cts.write_text(ctOriginal.decode().replace('const selected: AgentId | null','const selected: AgentId'));red=types('04-types-red');assert red.returncode!=0 and 'TS2322' in red.stdout,red.stdout
finally:cts.write_bytes(ctOriginal)
green=types('04-types-green');assert green.returncode==0 and cts.read_bytes()==ctOriginal
(p/'04-types-proof.json').write_text(json.dumps({'baselineExit':0,'redExit':red.returncode,'redDiagnostic':'TS2322','greenExit':0,'restored':True,'sha256':hashlib.sha256(ctOriginal).hexdigest()},indent=2)+'\n');print('CTS0,TS2322red,restore0',flush=True)
