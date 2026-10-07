from pathlib import Path
import subprocess,json,hashlib
root=Path('/private/tmp/b139-consumer')
files=[root/'workspace.cts',root/'metadata.cts'];original={p:p.read_bytes() for p in files}
cmd=['/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node','/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-81-1/node_modules/typescript/bin/tsc','--ignoreConfig','--noEmit','--strict','--module','Node16','--moduleResolution','Node16','--skipLibCheck','--ignoreDeprecations','6.0']+[str(p) for p in files]
def run(label):
 r=subprocess.run(cmd,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);p=Path('/private/tmp/b139-cts-'+label+'.log');p.write_text(r.stdout);return {'exit':r.returncode,'TS2322':'TS2322' in r.stdout,'log':str(p)}
records=[]
try:
 baseline=run('baseline');assert baseline['exit']==0,baseline
 for label,p,old,new in [('workspace-null',files[0],'const version: number | null','const version: number'),('capabilities-null',files[1],'const unknown: AgentInventoryCapability[] | null','const unknown: AgentInventoryCapability[]'),('telegram-null',files[1],'const telegram: AgentTelegramChannelMetadata | null','const telegram: AgentTelegramChannelMetadata')]:
  s=original[p].decode();assert s.count(old)==1;p.write_text(s.replace(old,new,1));red=run(label);p.write_bytes(original[p]);green=run(label+'-restore');assert red['exit']!=0 and red['TS2322'] and green['exit']==0
  records.append({'name':label,'red':red,'restore':green,'sha_restored':p.read_bytes()==original[p]})
 Path('/private/tmp/b139-cts-proof.json').write_text(json.dumps({'baseline':baseline,'records':records,'sha256':{p.name:hashlib.sha256(b).hexdigest() for p,b in original.items()},'excluded_startup':'TS5112 at native-build cwd before ignoreConfig; never qualified'},indent=2)+'\n');print('CTS 3/3 TS2322 -> 3/3 restored green')
finally:
 for p,b in original.items():p.write_bytes(b)
