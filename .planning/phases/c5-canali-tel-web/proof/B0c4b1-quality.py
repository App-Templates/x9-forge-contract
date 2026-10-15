import subprocess,json
from pathlib import Path
proof=Path('.planning/phases/c5-canali-tel-web/proof');env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','NO_COLOR':'1'}
results=[]
for name,cmd in [('full',['pnpm','exec','vitest','run','--maxWorkers=1','--reporter=json','--outputFile='+str(proof/'B0c4b1-FULL.json')]),('typecheck',['pnpm','typecheck']),('lint',['pnpm','lint']),('build',['pnpm','build']),('pack',['pnpm','check:pack'])]:
 r=subprocess.run(cmd,env=env,capture_output=True,text=True);(proof/('B0c4b1-'+name+'.log')).write_text(r.stdout+r.stderr);results.append({'check':name,'exitCode':r.returncode});print(name,r.returncode,flush=True)
 if r.returncode!=0:break
(proof/'B0c4b1-QUALITY.json').write_text(json.dumps(results,indent=2)+'\n')
assert len(results)==5 and all(r['exitCode']==0 for r in results)
