from pathlib import Path
import subprocess,json,time
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1');out=Path.cwd()/'work/c5-bridge-145/raw/second-final'
out.mkdir(exist_ok=True)
node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node';n20='/Users/admintemp/.nvm/versions/node/v20.20.2/bin/node'
env={'HOME':'/Users/admintemp','PATH':str(Path(node).parent)+':/usr/bin:/bin:/usr/sbin:/sbin'}
checks=[('FULL-FINAL',[node,'node_modules/vitest/vitest.mjs','run','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(out/'FULL-FINAL.json')]),('TYPECHECK',['pnpm','typecheck']),('LINT',['pnpm','lint']),('PACK',['pnpm','check:pack'])]
for name,runner in [('24',node),('20',n20)]:
 for label,file in [('NATIVE-CJS','smoke.cjs'),('E-DELETION','agent-deletion-smoke.cjs'),('C-PHONE-WEB','c5-phone-web-smoke.mjs'),('B-RESOURCE-INDEPENDENT','c5-resource-independent.mjs')]:checks.append((label+'-NODE'+name,[runner,'tests/cjs/'+file]))
checks.append(('C-ROUNDTRIP-NODE24',[node,'.planning/phases/c5-canali-tel-web/proof/round-trip-smoke.mjs']))
checks.append(('C-ROUNDTRIP-NODE20',[n20,'.planning/phases/c5-canali-tel-web/proof/round-trip-smoke.mjs']))
checks.append(('E-PUBLIC-TYPES',[node,'node_modules/typescript/bin/tsc','--ignoreConfig','--noEmit','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023','--strict','--skipLibCheck','--ignoreDeprecations','6.0','tests/cjs/agent-deletion-types.cts']))
report=[]
for name,cmd in checks:
 start=time.time()
 with (out/(name+'.txt')).open('w') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=240)
 row={'name':name,'exit':r.returncode,'elapsedSeconds':round(time.time()-start,2),'command':cmd,'log':name+'.txt'}
 report.append(row);(out/'FINAL-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(row),flush=True)
 if r.returncode:break
