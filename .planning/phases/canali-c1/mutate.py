from pathlib import Path
import hashlib,json,subprocess,sys,time
WORKTREE=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-109-1')
PHASE=WORKTREE/'.planning/phases/canali-c1'
CAMPAIGN=sys.argv[1]
cases=json.loads((PHASE/(CAMPAIGN+'-mutations.json')).read_text())
root=Path('/private/tmp/codex-b-canali-c1-b-mutations')/CAMPAIGN;root.mkdir(parents=True,exist_ok=True)
sources={row['file']:(WORKTREE/row['file']).read_bytes() for row in cases}
def run(label):
 result=root/(label+'.json')
 cmd=['pnpm','-C',str(WORKTREE),'exec','vitest','run',*sys.argv[2:],'--maxWorkers=1','--no-file-parallelism','--testTimeout=60000','--no-cache','--reporter=json','--outputFile='+str(result)]
 with (root/(label+'.txt')).open('w') as log: status=subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT,timeout=60).returncode
 payload=json.loads(result.read_text()) if result.exists() else {}
 assertions=[a for suite in payload.get('testResults',[]) for a in suite.get('assertionResults',[])]
 failures=[a for a in assertions if a['status']=='failed']
 return {'exit':status,'passed':payload.get('numPassedTests',0),'total':payload.get('numTotalTests',0),'failed':payload.get('numFailedTests',0),'skipped':payload.get('numPendingTests',0),'semantic':any(any('AssertionError:' in m for m in a['failureMessages']) for a in failures),'witnesses':[{'test':a['fullName'][:400],'error':a['failureMessages'][0][:700]} for a in [item for item in failures if any('AssertionError:' in message for message in item['failureMessages'])][:3]]}
report={'campaign':CAMPAIGN,'sourceHashes':{p:hashlib.sha256(raw).hexdigest() for p,raw in sources.items()},'tests':sys.argv[2:],'baseline':run('baseline'),'mutations':[]}
assert report['baseline']['exit']==0,report['baseline']
try:
 for row in cases:
  file=WORKTREE/row['file'];original=sources[row['file']];text=original.decode();assert text.count(row['old'])==1,row['label']
  try:
   file.write_text(text.replace(row['old'],row['new']))
   red=run(row['label']+'-red')
  finally: file.write_bytes(original)
  assert file.read_bytes()==original
  restored=run(row['label']+'-restore')
  qualified=red['exit']!=0 and red['semantic'] and restored['exit']==0 and restored['passed']==restored['total'] and restored['skipped']==0
  report['mutations'].append({'label':row['label'],'file':row['file'],'qualified':qualified,'red':red,'restored':restored})
  (PHASE/(CAMPAIGN+'-mutation-proof.json')).write_text(json.dumps(report,indent=2)+'\n')
  print(row['label'],'KILLED' if qualified else 'NOT_QUALIFIED',red['failed'],'failures',flush=True)
finally:
 for p,original in sources.items(): (WORKTREE/p).write_bytes(original)
report['final']=run('final');report['qualified']=sum(x['qualified'] for x in report['mutations']);report['total']=len(cases);report['restoredHashes']={p:hashlib.sha256((WORKTREE/p).read_bytes()).hexdigest() for p in sources}
assert report['sourceHashes']==report['restoredHashes']
(PHASE/(CAMPAIGN+'-mutation-proof.json')).write_text(json.dumps(report,indent=2)+'\n');print('QUALIFIED',report['qualified'],'/',report['total'],flush=True)
sys.exit(0 if report['qualified']==report['total'] and report['final']['exit']==0 else 1)
