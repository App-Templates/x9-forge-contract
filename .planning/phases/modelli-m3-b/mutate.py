"""Run only against a private copy; never a reviewer's read-only source worktree."""
from pathlib import Path
import argparse,os,subprocess,json,hashlib,sys,time
parser=argparse.ArgumentParser(description="Repeat consumer mutations in a private checkout")
parser.add_argument('--root',type=Path,required=True)
parser.add_argument('--evidence-dir',type=Path,required=True)
args=parser.parse_args();root=args.evidence_dir;root.mkdir(parents=True,exist_ok=True);candidate=args.root
phase=Path(__file__).parent;env=os.environ.copy();node=Path('/Users/admintemp/.nvm/versions/node/v24.14.1/bin')
if node.exists():env['PATH']=str(node)+':'+env['PATH']
def test(name,paths):
 output=root/(name+'.json');log=root/(name+'.log')
 with log.open('w') as f:r=subprocess.run(['pnpm','exec','vitest','run',*paths,'--maxWorkers=1','--no-file-parallelism','--testTimeout=60000','--no-cache','--reporter=json','--outputFile='+str(output)],cwd=candidate,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=150)
 j=json.loads(output.read_text()) if output.exists() else {};failed=[a for s in j.get('testResults',[]) for a in s.get('assertionResults',[]) if a['status']=='failed'];return {'exit':r.returncode,'passed':j.get('numPassedTests',0),'total':j.get('numTotalTests',0),'failed':j.get('numFailedTests',0),'pending':j.get('numPendingTests',0),'todo':j.get('numTodoTests',0),'files':len(j.get('testResults',[])),'semantic':sum(any('AssertionError:' in m for m in a.get('failureMessages',[])) for a in failed),'unhandled':j.get('unhandledErrors',[]),'witnesses':[{'name':a['fullName'],'error':a['failureMessages'][0][:650]} for a in failed if any('AssertionError:' in m for m in a.get('failureMessages',[]))][:2],'logSha256':hashlib.sha256(log.read_bytes()).hexdigest()}
paths=['tests/model-router/model-consumers.test.ts'];cases=json.loads((phase/'MUTATIONS.json').read_text());sources={r['file']:(candidate/r['file']).read_bytes() for r in cases};report={'baseline':test('baseline',paths),'mutations':[],'sourceHashes':{f:hashlib.sha256(b).hexdigest() for f,b in sources.items()}};assert report['baseline']['exit']==0 and report['baseline']['passed']==42
try:
 for i,row in enumerate(cases):
  path=candidate/row['file'];raw=sources[row['file']];source=raw.decode();assert source.count(row['old'])==1,row['label']
  try:path.write_text(source.replace(row['old'],row['new']));red=test(str(i)+'-'+row['label'],paths)
  finally:path.write_bytes(raw)
  restored=test(str(i)+'-restored',paths);qualified=red['exit']!=0 and red['semantic']>0 and not red['unhandled'] and restored['exit']==0 and restored['passed']==restored['total']==42 and not restored['pending']
  report['mutations'].append({'label':row['label'],'file':row['file'],'qualified':qualified,'red':red,'restored':restored});(root/'MUTATION-PROOF.json').write_text(json.dumps(report,indent=2)+'\n');print(row['label'],qualified,'semantic',red['semantic'],flush=True);assert qualified,row['label']
finally:
 for f,b in sources.items():(candidate/f).write_bytes(b)
report['restoredHashes']={f:hashlib.sha256((candidate/f).read_bytes()).hexdigest() for f in sources};assert report['sourceHashes']==report['restoredHashes'];report['qualified']=sum(r['qualified'] for r in report['mutations']);report['total']=len(cases);(root/'MUTATION-PROOF.json').write_text(json.dumps(report,indent=2)+'\n')
