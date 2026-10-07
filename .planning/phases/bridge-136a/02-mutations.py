from pathlib import Path
import subprocess,json,hashlib
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-70-1');p=r/'.planning/phases/bridge-136a';f=r/'src/agent/agent-channel-configuration.ts';original=f.read_bytes();sha=hashlib.sha256(original).hexdigest();s=original.decode();results=[];names=set()
mutations=[
('read-identity-validation','AgentContextFileSchema.safeExtend({ identity: AgentRuntimeIdentitySchema.optional()','AgentContextFileSchema.safeExtend({ identity: z.unknown().optional()',1),
('write-identity-validation','AgentContextFileWriteSchema.safeExtend({ identity: AgentRuntimeIdentitySchema.optional()','AgentContextFileWriteSchema.safeExtend({ identity: z.unknown().optional()',1),
('legacy-optional-identity','identity: AgentRuntimeIdentitySchema.optional()','identity: AgentRuntimeIdentitySchema',2),
('runtime-binding','context.identity && context.identity.runtimeAgentId !== context.agentId','false',1),
('channel-concordance','channelIds.size > 1','false',1),
('explicit-channel-binding','context.identity && config.identity.managementAgentId !== context.identity.managementAgentId','false',1),
('voice-management-binding','context.voiceConfiguration && context.voiceConfiguration.agentId !== (managementAgentId ?? context.agentId)','false',1),
('legacy-voice-compatibility','(managementAgentId ?? context.agentId)','managementAgentId',1),
('helper-explicit-management','if (context.identity) return context.identity.managementAgentId;','if (context.identity) return context.identity.runtimeAgentId;',1),
('helper-channel-management','return context.channelConfigurations?.[0]?.identity.managementAgentId ?? null;','return context.channelConfigurations?.[0]?.identity.runtimeAgentId ?? null;',1),
('helper-no-source-null','if (ids.size !== 1) return null;','if (ids.size !== 1) return (context as AgentContextWithChannels).agentId;',1),
('public-helper-export','export function managementAgentIdOf','function managementAgentIdOf',1),
('valid-identity-admission','identity: AgentRuntimeIdentitySchema.optional()','identity: z.never().optional()',2),
('context-owner-binding','config.scope.ownerId !== context.ownerId','false',1),
]
def run(label):
 subprocess.run(['python3',str(p/'01-run.py'),label],check=True)
 return json.loads((p/(label+'-exit.json')).read_text())
run('02-baseline-green')
try:
 for index,(name,old,new,count)in enumerate(mutations,1):
  assert s.count(old)==count,(name,s.count(old),count)
  label='02-'+str(index).zfill(2)+'-'+name
  try:
   f.write_text(s.replace(old,new));x=run(label)
   assert x['exit']!=0 and x['failed']==len(x['assertionNames']) and x['assertionNames'],x
   names.update(x['assertionNames'])
   results.append({'name':name,'beforeSha256':sha,'mutantSha256':hashlib.sha256(f.read_bytes()).hexdigest(),'red':x})
  finally:
   f.write_bytes(original);assert hashlib.sha256(f.read_bytes()).hexdigest()==sha
   restored=run(label+'-restore-green')
   if results and results[-1]['name']==name:results[-1].update({'restoredSha256':sha,'restored':restored})
  (p/'02-mutation-manifest.json').write_text(json.dumps({'source':str(f),'sha256':sha,'results':results,'qualified':len(results),'total':len(mutations),'coveredNames':sorted(names),'covered':len(names),'testTotal':92},indent=2)+'\n')
 run('02-final-green')
 print('qualified',len(results),'/',len(mutations),'covered names',len(names),'/92',flush=True)
finally:
 f.write_bytes(original);assert hashlib.sha256(f.read_bytes()).hexdigest()==sha
