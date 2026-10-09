from pathlib import Path
import subprocess,json,hashlib
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1');out=Path.cwd()/'work/c5-bridge-145/raw'
node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node';env={'HOME':'/Users/admintemp','PATH':str(Path(node).parent)+':/usr/bin:/bin:/usr/sbin:/sbin'}
cases=[('C-trip-participant', 'src/agent/agent-channel-history.ts', 'if (!ownerParticipant.success || ownerParticipant.data.kind !== rawKind || JSON.stringify(evidence.data.participant) !== JSON.stringify(ownerParticipant.data)) return false;', '', ['tests/agent/c5-channel-history.test.ts']), ('C-trip-generation', 'src/agent/agent-channel-history.ts', 'return JSON.stringify(facts(frozen)) === JSON.stringify(facts(actual));', 'return true;', ['tests/agent/c5-channel-history.test.ts'])]
original={p:(root/p).read_bytes() for _,p,_,_,_ in cases};report={'mutations':[]}
def run(name,files):
 dest=out/(name+'.json')
 cmd=[node,'node_modules/vitest/vitest.mjs','run',*files,'--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(dest)]
 with (out/(name+'.txt')).open('w') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=120)
 data=json.loads(dest.read_text()) if dest.exists() else {}
 failed=[v for f in data.get('testResults',[]) for v in f.get('assertionResults',[]) if v['status']=='failed']
 functional=[v['title'] for v in failed if any('AssertionError' in m for m in v.get('failureMessages',[]))]
 return {'exit':r.returncode,'passed':data.get('numPassedTests'),'total':data.get('numTotalTests'),'assertionFailures':functional,'otherFailures':len(failed)-len(functional),'report':dest.name}
try:
 files=list(dict.fromkeys(f for *_,fs in cases for f in fs));report['baseline']=run('TRIP-SAMPLES-BASELINE',files);assert report['baseline']['exit']==0
 for name,p,old,new,files in cases:
  s=original[p].decode();assert old in s,name
  try:
   (root/p).write_text(s.replace(old,new,1));row=run(name+'-RED',files);row.update(name=name,qualified=row['exit']!=0 and bool(row['assertionFailures']) and row['otherFailures']==0)
   report['mutations'].append(row);print(json.dumps(row),flush=True);assert row['qualified']
  finally:(root/p).write_bytes(original[p])
 report['restored']=run('TRIP-SAMPLES-RESTORED',list(dict.fromkeys(f for *_,fs in cases for f in fs)))
finally:
 for p,s in original.items():(root/p).write_bytes(s)
 report['restoredExact']=all((root/p).read_bytes()==s for p,s in original.items());report['sourceHashes']={p:hashlib.sha256(s).hexdigest() for p,s in original.items()}
 (out/'TRIP-sample-qualification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'qualified':sum(v['qualified'] for v in report['mutations']),'candidates':len(cases),'restored':report['restoredExact']}),flush=True)
