from pathlib import Path
import subprocess,json,hashlib
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-171-1')
p=root/'src/capability/index.ts'; original=p.read_text()
proof=root/'.planning/phases/60-paperclip-contracts/proofs/public-exports';proof.mkdir(parents=True,exist_ok=True)
report={'sourceHash':hashlib.sha256(original.encode()).hexdigest(),'faults':[]}
cmd=['pnpm','exec','vitest','run','tests/paperclip-execution-context.test.ts','--maxWorkers=2']
try:
 for name in ['PaperclipToolCallRequestSchema','toPaperclipToolCallScope']:
  line='  '+name+',\n';assert original.count(line)==1
  p.write_text(original.replace(line,'',1))
  try:
   r=subprocess.run(cmd,cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=20)
   semantic=r.returncode!=0 and 'AssertionError' in r.stdout and 'TypeError:' not in r.stdout
   (proof/(name+'.log')).write_text(r.stdout)
   report['faults'].append({'name':name,'semanticRed':semantic,'exitCode':r.returncode,'logSha256':hashlib.sha256(r.stdout.encode()).hexdigest()})
   assert semantic,r.stdout
  finally:p.write_text(original)
finally:
 p.write_text(original)
 r=subprocess.run(cmd,cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=20)
 (proof/'restored-green.log').write_text(r.stdout)
 report.update({'exactRestore':p.read_text()==original,'restoredGreenExit':r.returncode})
 (proof/'qualification.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report))
 assert r.returncode==0 and report['exactRestore']
