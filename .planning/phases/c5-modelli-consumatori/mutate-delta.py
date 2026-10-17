from pathlib import Path
import json,subprocess,hashlib
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1');w=Path(__file__).resolve().parent
files=['src/agent/agent-management.ts','src/model-router/agent-model-configuration.ts'];original={f:(r/f).read_bytes() for f in files};mutants=[]
def add(name,f,old,new):
 s=original[f].decode();assert s.count(old)==1,(name,s.count(old));mutants.append((name,f,s.replace(old,new)))
f=files[0]
add('configuration-generation-pair',f,'(command.modelConfiguration !== undefined) !== (command.modelExpectedSourceVersion !== undefined)','false')
add('configuration-version',f,'command.modelConfiguration.configVersion !== command.desiredVersion','false')
add('bootstrap-generation-agreement',f,'command.modelExpectedSourceVersion !== command.modelBootstrap.expectedSourceVersion','false')
add('complete-provenance-authority',f,'z.lazy(() => AgentModelsConfigurationWithProvenanceSchema)','z.lazy(() => AgentModelsConfigurationSchema)')
mutants[-1]=(mutants[-1][0],f,mutants[-1][2].replace('import { AgentModelsConfigurationWithProvenanceSchema }','import { AgentModelsConfigurationWithProvenanceSchema, AgentModelsConfigurationSchema }'))
add('registered-consumer',f,'findModelConsumerDefinition(selection.slotId);',"findModelConsumerDefinition(selection.slotId) ?? findModelConsumerDefinition('agent_classifier');")
add('consumer-capability',f,'selection.settings.capability !== consumer.capability','false')
add('consumer-function',f,'selection.settings.function !== consumer.function','false')
add('consumer-requirements',f,'!sameModelFeatures(selection.settings.requirements, consumer.requirements)','false')
add('consumer-routing',f,"(consumer.routing === 'tiered' ? !['automatic', 'pin'].includes(selection.settings.mode) : selection.settings.mode !== consumer.routing)",'false')
add('generation-replay',f,' && a.modelExpectedSourceVersion === b.modelExpectedSourceVersion','')
add('configuration-replay',f,' && JSON.stringify(canonicalCommandValue(a.modelConfiguration)) === JSON.stringify(canonicalCommandValue(b.modelConfiguration))','')
add('selection-order',f,"return key === 'selections' || key === 'bindings' ? values.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))) : values;",'return values;')
add('object-order',f,".sort(([left], [right]) => left.localeCompare(right))",'')
f=files[1]
add('apply-explicit-authority',f,'if (request.modelConfiguration !== undefined) {','if (false) {')
add('source-generation',f,'command.data.modelExpectedSourceVersion === source.data.sourceVersion','true')
add('source-identity',f,'sameModelAgentIdentity(configuration.identity, source.data.identity)','true')
add('source-scope',f,'sameCapabilityScope(configuration.provenance.scope, source.data.scope)','true')
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/opt/homebrew/bin:/usr/bin:/bin'}
def run(label):
 output=w/(label+'.json')
 with (w/(label+'.log')).open('w') as log:p=subprocess.run(['node','node_modules/vitest/vitest.mjs','run','tests/agent/c5-model-configuration-command.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(output)],cwd=r,env=env,text=True,stdout=log,stderr=subprocess.STDOUT)
 d=json.loads(output.read_text());fails=[x for s in d['testResults'] for x in s['assertionResults'] if x['status']=='failed'];semantic=[{'name':x['fullName'],'message':x['failureMessages'][0].splitlines()[0]} for x in fails if x['failureMessages'][0].startswith('AssertionError')]
 return p.returncode,d,semantic,len(fails)-len(semantic)
report={'mutations':[]}
try:
 code,d,_,_=run('DELTA-MUT-BASE');assert code==0
 for i,(name,file,text) in enumerate(mutants):
  try:
   (r/file).write_text(text);code,d,witness,technical=run('DELTA-MUT-'+str(i+1).zfill(2));entry={'name':name,'exit':code,'assertions':len(witness),'technical':technical,'witnesses':witness};report['mutations'].append(entry);assert code!=0 and witness,entry
  finally:(r/file).write_bytes(original[file])
  print(f'{i+1}/{len(mutants)} {name}: {len(witness)} semantic',flush=True)
 code,d,_,_=run('DELTA-MUT-RESTORED');assert code==0;report['fresh']={'passed':d['numPassedTests'],'total':d['numTotalTests'],'exit':code}
finally:
 for f,b in original.items():(r/f).write_bytes(b)
 report['hashesRestored']={f:hashlib.sha256((r/f).read_bytes()).hexdigest()==hashlib.sha256(b).hexdigest() for f,b in original.items()}
 (w/'DELTA-MUTATIONS.json').write_text(json.dumps(report,indent=2)+'\n')
