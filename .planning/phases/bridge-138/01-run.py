from pathlib import Path
import subprocess,json,signal,os,sys
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-73-1');p=r/'.planning/phases/bridge-138';label=sys.argv[1]
cmd=['pnpm','-C',str(r),'exec','vitest','run','tests/agent/bridge138-vault-identity.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(p/(label+'.json'))]
with(p/(label+'.txt')).open('w')as f:
 proc=subprocess.Popen(cmd,stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
 try:code=proc.wait(timeout=90)
 except subprocess.TimeoutExpired:
  os.killpg(proc.pid,signal.SIGTERM)
  try:proc.wait(timeout=5)
  except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);proc.wait()
  raise
x=json.loads((p/(label+'.json')).read_text());assert x['numTotalTests']==81 and x['numPendingTests']==0,(x['numTotalTests'],[t.get('message')for t in x['testResults']]);fail=[a['fullName']for t in x['testResults']for a in t['assertionResults']if a['status']=='failed'and any('AssertionError'in m for m in a.get('failureMessages',[]))];res={'command':cmd,'exit':code,'total':x['numTotalTests'],'passed':x['numPassedTests'],'failed':x['numFailedTests'],'assertionNames':fail};(p/(label+'-exit.json')).write_text(json.dumps(res,indent=2)+'\n');print(label,res['passed'],'/',res['total'],'AssertionError',len(fail),flush=True)
if label=='01-red':assert code!=0 and len(fail)==81
if label.endswith('green'):assert code==0 and x['numPassedTests']==81
