from pathlib import Path
import subprocess,json,hashlib,os,re
H=Path('/private/tmp/b139-p2-build');C=H/'b139-consumer';D=C/'node_modules/@x9-forge/contracts/dist';ENV=dict(os.environ,PATH='/Users/admintemp/.nvm/versions/node/v24.14.1/bin:'+os.environ['PATH']);source=json.loads(Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-81-1/.planning/phases/bridge-139/P2-SOURCE-MUTATIONS.json').read_text());results=[]
def run(label):
 log=H/(label+'.log');cmd=['node','--test','--test-reporter=tap','bridge139-workspace.cjs','bridge139-metadata.cjs','bridge139-telegram-username.cjs']
 with log.open('w') as out:p=subprocess.run(cmd,cwd=C,env=ENV,stdout=out,stderr=subprocess.STDOUT,timeout=120)
 text=log.read_text();counts={name:int(re.search(r'^# '+name+r' (\d+)$',text,re.M).group(1)) for name in ['tests','pass','fail','skipped']};return {'exit':p.returncode,**counts,'assertion':'ERR_ASSERTION' in text}
for mode,filename in [('CJS','agent/agent-runtime-state.cjs'),('ESM','agent/agent-runtime-state.js')]:
 path=D/filename;original=path.read_bytes();text=original.decode()
 for item in source:
  name=mode+'-'+item['name'];old=item['old'];new=item['new']
  if mode=='CJS':old=old.replace('z.string()','zod_1.z.string()');new=new.replace('z.string()','zod_1.z.string()')
  assert old in text,(name,old)
  try:
   path.write_text(text.replace(old,new,1));mutant=hashlib.sha256(path.read_bytes()).hexdigest();red=run('compiled-'+name+'-red');assert red['exit']!=0 and red['fail']>0 and red['assertion'],(name,red)
  finally:path.write_bytes(original)
  green=run('compiled-'+name+'-restore');assert green['exit']==0 and green['skipped']==0 and path.read_bytes()==original,(name,green)
  results.append({'name':name,'path':filename,'old':old,'new':new,'red':red,'green':green,'mutant_sha256':mutant,'restored_sha256':hashlib.sha256(original).hexdigest()});(H/'compiled-mutations.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps({'name':name,'red':red['fail'],'green':[green['pass'],green['tests']]}),flush=True)
archive=json.loads((H/'archive-proof.json').read_text());files=archive['files'];root=D.parent;assert all(hashlib.sha256((root/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in files)
(H/'archive-final.json').write_text(json.dumps({'restored':[len(files),len(files)],'mutations':[len(results),16]},indent=2)+'\n');print('compiled16/16,archiveexact'+str(len(files))+'/'+str(len(files)),flush=True)
