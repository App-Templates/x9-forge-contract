from pathlib import Path
import os,subprocess,time,json,hashlib
R=Path('/private/tmp/d-bridge-identita-agente-20261008');W=R/'checkout'
ENV={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/Applications/ChatGPT.app/Contents/Resources/codex-cli/codex-path:/usr/bin:/bin'}
checks=[('typecheck',['pnpm','typecheck']),('lint',['pnpm','lint']),('build',['pnpm','build']),('new-types',['pnpm','exec','tsc','-p',str(R/'TEST-TSC.json')]),('old-cjs',['node','tests/cjs/smoke.cjs']),('new-esm-cjs',['node','.planning/phases/bridge-identita-agente/consumer.mjs']),('pack',['pnpm','check:pack'])]
results=[]
for name,cmd in checks:
 start=time.monotonic();p=R/('QUALITY-'+name+'.log')
 with p.open('w') as f:out=subprocess.run(cmd,cwd=W,env=ENV,stdout=f,stderr=subprocess.STDOUT)
 result={'name':name,'exit':out.returncode,'seconds':round(time.monotonic()-start,2),'command':cmd,'logSha':hashlib.sha256(p.read_bytes()).hexdigest()};results.append(result)
 (R/'QUALITY.json').write_text(json.dumps({'checks':results,'passed':sum(x['exit']==0 for x in results),'total':len(checks)},indent=2)+'\n');print(json.dumps(result),flush=True)
 if out.returncode:break
