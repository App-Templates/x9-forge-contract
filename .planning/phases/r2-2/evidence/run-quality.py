from pathlib import Path
import subprocess,json,os
r=Path(__file__).parent;out=r/'evidence';rows=[];env={k:v for k,v in os.environ.items() if not k.startswith(('SENTRY_','VITE_'))}
commands=[('build',['pnpm','build']),('typecheck',['pnpm','typecheck']),('lint',['pnpm','lint']),('pack',['pnpm','check:pack']),('full',['pnpm','exec','vitest','run','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(out/'full.json')]),('cjs',['node','tests/cjs/smoke.cjs'])]
for name,cmd in commands:
 with(out/(name+'.txt')).open('w') as f:p=subprocess.run(cmd,cwd=r,env=env,stdout=f,stderr=subprocess.STDOUT)
 rows.append({'check':name,'cmd':cmd,'exit':p.returncode});(out/'execution.json').write_text(json.dumps(rows,indent=2)+'\n');print(name,p.returncode,flush=True)
 if p.returncode:print((out/(name+'.txt')).read_text()[-5000:],flush=True);raise SystemExit(p.returncode)
 if name=='full':
  d=json.loads((out/'full.json').read_text());assert d['numPassedTests']==1951 and d['numTotalTests']==1951 and len(d['testResults'])==112;print('full1951/1951 in112files',flush=True)
