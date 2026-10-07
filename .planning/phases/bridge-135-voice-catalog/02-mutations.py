from pathlib import Path
import subprocess,os,signal,json,hashlib
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-68-1');p=r/'.planning/phases/bridge-135-voice-catalog';source=r/'src/http/endpoints/voice-catalog.ts';index=r/'src/http/endpoints/index.ts';originals={f:f.read_bytes()for f in [source,index]};text=originals[source].decode();records=[];names=set()
def replace(old,new):assert text.count(old)==1;return text.replace(old,new)
def run(label):
 cmd=['pnpm','-C',str(r),'exec','vitest','run','tests/http/voice-catalog.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(p/(label+'.json'))]
 with(p/(label+'.txt')).open('w')as f:
  proc=subprocess.Popen(cmd,stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
  try:code=proc.wait(timeout=90)
  except subprocess.TimeoutExpired:
   os.killpg(proc.pid,signal.SIGTERM)
   try:proc.wait(timeout=5)
   except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);proc.wait()
   raise AssertionError('timeout')
 (p/(label+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':code})+'\n');j=json.loads((p/(label+'.json')).read_text());assert j['numTotalTests']==18 and j['numPendingTests']==0
 hits=[a['fullName']for t in j['testResults']for a in t['assertionResults']if a['status']=='failed'and any('AssertionError'in m for m in a.get('failureMessages',[]))]
 return {'exit':code,'total':18,'passed':j['numPassedTests'],'failed':j['numFailedTests'],'assertions':hits}
mutations=[('export',index,originals[index].decode().replace("export * from './voice-catalog.js';",'')),('method',source,replace("method: 'GET'","method: 'POST'")),('path',source,replace("path: '/internal/voice/catalog'","path: '/wrong/catalog'")),('auth',source,replace("authType: 'secret'","authType: 'none'")),('header',source,replace('authHeader: INTERNAL_SECRET_HEADER','authHeader: INTERNAL_SECRET_HEADER + "-wrong"')),('body',source,replace('  responseSchema:','  bodySchema: z.unknown(),\n  responseSchema:')),('permissive',source,replace('responseSchema: VoiceProviderCatalogSchema','responseSchema: z.unknown()')),('reject-valid',source,replace('responseSchema: VoiceProviderCatalogSchema','responseSchema: z.never()'))]
try:
 baseline=run('02-baseline');assert baseline['exit']==0 and baseline['passed']==18
 for label,file,mutated in mutations:
  file.write_text(mutated);red=run('02-'+label+'-red');assert red['exit']!=0 and red['assertions'],red
  file.write_bytes(originals[file]);assert file.read_bytes()==originals[file]
  green=run('02-'+label+'-restore');assert green['exit']==0 and green['passed']==18
  records.append({'name':label,'file':str(file.relative_to(r)),'red':red,'restore':green});names.update(red['assertions']);print(label,'qualified',len(red['assertions']),'restore18/18',flush=True)
 final=run('02-final');assert final['exit']==0 and final['passed']==18
 assert len(records)==8 and len(names)==18
finally:
 for file,content in originals.items():file.write_bytes(content)
 restored=[{'file':str(file.relative_to(r)),'exact':file.read_bytes()==content,'sha256':hashlib.sha256(content).hexdigest()}for file,content in originals.items()]
 (p/'02-mutations.json').write_text(json.dumps({'expected':8,'tests':18,'records':records,'namesHit':sorted(names),'restored':restored},indent=2)+'\n')
print('8/8 qualified,18/18 names,2/2SHA',flush=True)
