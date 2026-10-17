from pathlib import Path
import subprocess,json,sys
root=Path(sys.argv[1]).resolve()
out=Path(sys.argv[2]).resolve();out.mkdir(exist_ok=True,parents=True)
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.21.0/bin:/usr/bin:/bin'}
node='/Users/admintemp/.nvm/versions/node/v24.21.0/bin/node'
checks=[
('typecheck',['pnpm','typecheck']),
('lint',['pnpm','lint']),
('check-pack',['pnpm','check:pack']),
('native-cjs',[node,'tests/cjs/smoke.cjs']),
('b0d-cjs24',[node,'tests/cjs/agent-deletion-smoke.cjs']),
('b0d-cjs20',['/Users/admintemp/.nvm/versions/node/v20.20.2/bin/node','tests/cjs/agent-deletion-smoke.cjs']),
('b0d-cjs-types',[node,'node_modules/typescript/bin/tsc','--ignoreConfig','--noEmit','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023','--strict','--skipLibCheck','--ignoreDeprecations','6.0','tests/cjs/agent-deletion-types.cts'])]
results=[]
for name,cmd in checks:
 with (out/('b0d-quality-'+name+'.log')).open('w') as log:
  r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=180)
 results.append({'name':name,'exit':r.returncode,'command':cmd,'log':'b0d-quality-'+name+'.log'})
 print(json.dumps(results[-1]),flush=True)
 if r.returncode:break
(out/'b0d-quality.json').write_text(json.dumps(results,indent=2)+'\n')
