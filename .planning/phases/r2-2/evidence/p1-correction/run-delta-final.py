from pathlib import Path
import subprocess,json,hashlib
import os
r=Path(__file__).parent;o=r/'evidence';env=dict(os.environ);env['npm_config_cache']=str(r/'npm-cache');p=r/'src/agent/agent-creation-replay.ts';original=p.read_bytes();s=original.decode();rows=[]
old="""    if (checkedBirthChannel && (checkedBirthChannel.desired.state !== 'active'
        || checkedBirthChannel.observation?.channelId !== job.firstCheck?.channel.channelId)) {
      issue(['firstCheck'], 'A birth-channel check must match the active applied channel');
"""
new="""    if (job.firstCheck?.channel.kind !== 'web' && (!checkedBirthChannel || checkedBirthChannel.desired.state !== 'active'
        || checkedBirthChannel.observation?.loaded !== true
        || checkedBirthChannel.observation.readiness !== 'ready'
        || checkedBirthChannel.observation.channelId !== job.firstCheck?.channel.channelId)) {
      issue(['firstCheck'], 'A textual check must be ready web or match an active applied ready birth channel');
"""
assert s.count(new)==1
mutants=[('previous-guard',s.replace(new,old),3),('ignore-textual-readiness',s.replace("        || checkedBirthChannel.observation.readiness !== 'ready'\n",''),1)]
try:
 for name,source,expected in mutants:
  p.write_text(source);j=o/(name+'.json')
  with(o/(name+'.log')).open('w') as f:q=subprocess.run(['pnpm','exec','vitest','run','tests/agent/r2-creation-replay.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(j)],cwd=r,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=60)
  d=json.loads(j.read_text());failed=[a for t in d['testResults'] for a in t['assertionResults'] if a['status']=='failed']
  assert q.returncode==1 and len(failed)==expected and all(any('AssertionError:' in x for x in a['failureMessages']) for a in failed)
  p.write_bytes(original);assert hashlib.sha256(p.read_bytes()).digest()==hashlib.sha256(original).digest()
  rows.append({'name':name,'assertionFailures':len(failed),'tests':d['numTotalTests'],'shaRestored':True});print(name,len(failed),'assertion failures',flush=True)
finally:p.write_bytes(original)
(o/'mutations-summary.json').write_text(json.dumps(rows,indent=2)+'\n')
checks=[]
for name,cmd in [('restore',['pnpm','exec','vitest','run','tests/agent/r2-creation-replay.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(o/'restore.json')]),('build',['pnpm','build']),('typecheck',['pnpm','typecheck']),('lint',['pnpm','lint']),('pack',['pnpm','check:pack']),('full',['pnpm','exec','vitest','run','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(o/'full.json')]),('cjs',['node','tests/cjs/smoke.cjs'])]:
 with(o/(name+'.log')).open('w') as f:q=subprocess.run(cmd,cwd=r,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=300)
 checks.append({'name':name,'exit':q.returncode});(o/'checks.json').write_text(json.dumps(checks,indent=2)+'\n');print(name,q.returncode,flush=True)
 if q.returncode:print((o/(name+'.log')).read_text()[-3000:],flush=True);raise SystemExit(q.returncode)
 if name in ('restore','full'):
  d=json.loads((o/(name+'.json')).read_text());print(d['numPassedTests'], '/', d['numTotalTests'],'tests',flush=True);assert d['numPassedTests']==d['numTotalTests'] and d['numFailedTests']==0 and d['numPendingTests']==0
