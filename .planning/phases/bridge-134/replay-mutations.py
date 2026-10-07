from pathlib import Path
import subprocess,json,os,signal,time,hashlib
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-63-1');p=r/'.planning/phases/bridge-134'
channel='src/agent/agent-channel-configuration.ts';register='src/http/endpoints/voice-register.ts';voice='src/capability/voice/agent-voice-settings.ts'
recipes=[
 ('voice-optional',channel,'voiceConfiguration: AgentVoiceConfigSchema.optional()','voiceConfiguration: AgentVoiceConfigSchema',2),
 ('voice-context-scope',channel,'if (context.voiceConfiguration && context.voiceConfiguration.agentId !== context.agentId)','if (false)',1),
 ('voice-canonical-schema',channel,'voiceConfiguration: AgentVoiceConfigSchema.optional()','voiceConfiguration: z.unknown().optional()',2),
 ('voice-helper-export',channel,'export function appliedAgentVoiceSettings','function appliedAgentVoiceSettings',1),
 ('voice-helper-applied',channel,'return ctx.voiceConfiguration?.applied ?? null;','return ctx.voiceConfiguration?.desired ?? null;',1),
 ('voice-helper-null',channel,'return ctx.voiceConfiguration?.applied ?? null;','return ctx.voiceConfiguration?.applied;',1),
 ('caller-optional',register,'caller: OutboundCallerIdentitySchema.optional(),','caller: OutboundCallerIdentitySchema,',1),
 ('caller-canonical-field',register,'caller: OutboundCallerIdentitySchema.optional(),','',1),
 ('caller-management-binding',register,'if (request.caller && request.agentId !== request.caller.agent.managementAgentId)','if (false)',1),
 ('voice-not-applied-admission',voice,"  if (settings === null) return { ok: false, error: 'voice_not_applied' };",'',1),
 ('voice-not-applied-error',voice,"  'voice_not_applied',",'',1),
 ('policy-optional',channel,'scopePolicy: AgentScopePolicySchema.optional()','scopePolicy: AgentScopePolicySchema',2),
 ('policy-canonical-schema',channel,'scopePolicy: AgentScopePolicySchema.optional()','scopePolicy: z.unknown().optional()',2),
 ('policy-helper-export',channel,'export function appliedAgentScopePolicy','function appliedAgentScopePolicy',1),
 ('policy-helper-null',channel,'return ctx.scopePolicy ?? null;','return ctx.scopePolicy;',1),
 ('policy-helper-present',channel,'return ctx.scopePolicy ?? null;','return null;',1),
]
originals={name:(r/name).read_bytes()for name in [channel,register,voice]};completed=[];covered=set();deadline=time.time()+360
def digest(data):return hashlib.sha256(data).hexdigest()
def record(final=None):
 result={'expected':len(recipes),'expectedTests':35,'completed':completed,'coveredTests':sorted(covered),'restored':[{'file':name,'exact':(r/name).read_bytes()==originals[name],'sha256':digest(originals[name])}for name in originals],'final':final}
 (p/'05-mutations.json').write_text(json.dumps(result,indent=2)+'\n')
def run(label):
 report=p/(label+'.json');cmd=['pnpm','-C',str(r),'exec','vitest','run','tests/agent/bridge134-voice-context.test.ts','tests/agent/bridge134-scope-context.test.ts','tests/http/endpoints/bridge134-voice-register.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(report)]
 with(p/(label+'.txt')).open('w')as log:
  child=subprocess.Popen(cmd,cwd=r,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  timeout=False
  try:code=child.wait(timeout=min(90,max(1,deadline-time.time())))
  except subprocess.TimeoutExpired:
   timeout=True;os.killpg(child.pid,signal.SIGTERM)
   try:code=child.wait(timeout=5)
   except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);code=child.wait()
 (p/(label+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':code,'timeout':timeout},indent=2)+'\n')
 assert not timeout and report.exists(),label+' infrastructure failure'
 d=json.loads(report.read_text());counts={k:d[k]for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests']}
 assert counts['numTotalTests']==35 and counts['numPendingTests']==0,label+' incomplete'
 assertions=[t['fullName']for f in d['testResults']for t in f['assertionResults']if t['status']=='failed'and any('AssertionError:'in m for m in t['failureMessages'])]
 return code,counts,assertions
signal.signal(signal.SIGTERM,lambda *_: (_ for _ in ()).throw(SystemExit('terminated')))
try:
 code,baseline,_=run('05-baseline');assert code==0 and baseline['numPassedTests']==35
 (p/'05-recipes.json').write_text(json.dumps(recipes,indent=2)+'\n')
 for name,file,old,new,count in recipes:
  data=originals[file].decode();assert data.count(old)==count,name+' target mismatch'
  try:
   (r/file).write_text(data.replace(old,new));code,red,assertions=run('05-mut-'+name+'-red');assert code!=0 and assertions,name+' no AssertionError'
  finally:(r/file).write_bytes(originals[file])
  assert (r/file).read_bytes()==originals[file]
  code,green,_=run('05-mut-'+name+'-restore');assert code==0 and green['numPassedTests']==35,name+' failed restore'
  completed.append({'name':name,'source':file,'red':red,'assertions':assertions,'restore':green,'restoredSha':digest((r/file).read_bytes())});covered.update(assertions);record();print(name,len(assertions),'assertions; restore35/35',flush=True)
 code,final,_=run('05-final');record(final);assert code==0 and final['numPassedTests']==35 and len(covered)==35,(len(covered),sorted(covered))
 print('qualified',len(completed),'/',len(recipes),'names',len(covered),'/35',flush=True)
finally:
 for name,data in originals.items():(r/name).write_bytes(data)
 record(final if 'final'in locals()else None)
