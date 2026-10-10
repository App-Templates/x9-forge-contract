import subprocess,json,os
from pathlib import Path
w=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-175-1')
p=Path('/private/tmp/a-chiavi-indice-20261009')
env={**os.environ,'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin:/usr/sbin:/sbin'}
pnpm='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/pnpm'
result=[]
for name,args in [('TYPECHECK',['typecheck']),('LINT',['lint']),('PACK',['check:pack']),('CJS-SMOKE',['exec','node','tests/cjs/smoke.cjs'])]:
 with (p/f'BRIDGE-{name}.log').open('w') as log:r=subprocess.run([pnpm,'-C',str(w),*args],env=env,stdout=log,stderr=subprocess.STDOUT)
 result.append({'name':name,'exitCode':r.returncode})
(p/'BRIDGE-QUALITY.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
