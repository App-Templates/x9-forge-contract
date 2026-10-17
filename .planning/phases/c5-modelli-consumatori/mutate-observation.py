from pathlib import Path
import json,subprocess,hashlib
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1');w=Path(__file__).resolve().parent;p=r/'src/model-router/agent-model-configuration.ts';original=p.read_bytes();s=original.decode();mutants=[]
def add(name,old,new,start=''):
 a=s.index(start) if start else 0;assert s[a:].count(old)==1,(name,s[a:].count(old));i=s.index(old,a);mutants.append((name,s[:i]+new+s[i+len(old):]))
add('observed-time-required','observedAt: z.iso.datetime({ offset: true }), validUntil:','observedAt: z.iso.datetime({ offset: true }).optional(), validUntil:',start='export const AgentModelSourceObservationSchema')
add('valid-until-required','validUntil: z.iso.datetime({ offset: true }),\n}).superRefine((source, ctx)','validUntil: z.iso.datetime({ offset: true }).optional(),\n}).superRefine((source, ctx)',start='export const AgentModelSourceObservationSchema')
add('observed-scope-runtime','source.scope.agentId !== source.identity.runtimeAgentId','false',start='export const AgentModelSourceObservationSchema')
add('observed-interval','Date.parse(source.validUntil) <= Date.parse(source.observedAt)','false',start='export const AgentModelSourceObservationSchema')
start='export function isAgentModelSourceObservationCurrent'
for name,old in [('finite-clock','!Number.isFinite(time)'),('future-clock','time < observed - 5_000'),('maximum-age','time > observed + 60_000'),('expired-clock','time >= Date.parse(source.validUntil)'),('observed-generation','source.sourceVersion === expectation.sourceVersion'),('observed-identity','sameModelAgentIdentity(source.identity, expectation.identity)'),('observed-scope','sameCapabilityScope(source.scope, expectation.scope)')]:
 end=s.index('export const AgentModelsStateSchema',s.index(start));i=s.index(old,s.index(start),end);mutants.append((name,s[:i]+('true' if name.startswith('observed-') else 'false')+s[i+len(old):]))
add('saved-observed-authority','state.saved === null || state.saved.provenance === undefined','false')
add('state-observed-identity','!sameModelAgentIdentity(state.identity, source.identity)','false')
add('state-observed-scope','!sameCapabilityScope(state.saved.provenance.scope, source.scope)','false')
add('command-http-freshness',"if ('observedAt' in source.data)",'if (false)')
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/opt/homebrew/bin:/usr/bin:/bin'}
def run(label):
 output=w/(label+'.json')
 with (w/(label+'.log')).open('w') as log:proc=subprocess.run(['node','node_modules/vitest/vitest.mjs','run','tests/model-router/c5-model-source-observation.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(output)],cwd=r,env=env,stdout=log,stderr=subprocess.STDOUT)
 d=json.loads(output.read_text());fail=[x for f in d['testResults'] for x in f['assertionResults'] if x['status']=='failed'];sem=[{'name':x['fullName'],'message':x['failureMessages'][0].splitlines()[0]} for x in fail if x['failureMessages'][0].startswith('AssertionError')];return proc.returncode,d,sem,len(fail)-len(sem)
report={'mutations':[]}
try:
 code,d,_,_=run('OBS-MUT-BASE');assert code==0
 for i,(name,text) in enumerate(mutants):
  try:
   p.write_text(text);code,d,witness,technical=run('OBS-MUT-'+str(i+1).zfill(2));entry={'name':name,'exit':code,'assertions':len(witness),'technical':technical,'witnesses':witness};report['mutations'].append(entry);assert code!=0 and witness,entry
  finally:p.write_bytes(original)
  print(f'{i+1}/{len(mutants)} {name}: {len(witness)} semantic',flush=True)
 code,d,_,_=run('OBS-MUT-RESTORED');assert code==0;report['fresh']={'passed':d['numPassedTests'],'total':d['numTotalTests'],'exit':code}
finally:
 p.write_bytes(original);report['hashRestored']=hashlib.sha256(p.read_bytes()).hexdigest()==hashlib.sha256(original).hexdigest();(w/'OBS-MUTATIONS.json').write_text(json.dumps(report,indent=2)+'\n')
