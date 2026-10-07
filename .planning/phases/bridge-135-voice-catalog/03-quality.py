from pathlib import Path
import subprocess,json,os,signal,time,hashlib,tempfile,shutil
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-68-1');p=r/'.planning/phases/bridge-135-voice-catalog';private=Path(tempfile.mkdtemp(prefix='codex-a-bridge135-build-',dir='/private/tmp'))
files=subprocess.check_output(['git','-C',str(r),'ls-files'],text=True).splitlines()+subprocess.check_output(['git','-C',str(r),'ls-files','--others','--exclude-standard'],text=True).splitlines();inputs=[]
for name in sorted(set(files)):
 parts=Path(name).parts
 if name.startswith(('dist/','.planning/','.github/','.husky/')) or any(part.startswith('.env')or part.lower()=='secrets'for part in parts) or name.endswith(('.pem','.key'))or name=='.npmrc':continue
 if not (name.startswith(('src/','tests/','scripts/'))or '/'not in name):continue
 source=r/name
 if not source.is_file()or source.is_symlink():continue
 target=private/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 inputs.append({'file':name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
(private/'node_modules').symlink_to(r/'node_modules');(p/'03-private-input.json').write_text(json.dumps({'path':str(private),'files':inputs,'sourceAliases':False,'originalTsconfig':True},indent=2)+'\n');Path('/private/tmp/codex-a-bridge135-build-current').write_text(str(private))
env=os.environ.copy();cache=private/'npm-cache';cache.mkdir();npmrc=private/'empty-npmrc';npmrc.write_text('');env.update({'NPM_CONFIG_CACHE':str(cache),'NPM_CONFIG_USERCONFIG':str(npmrc),'NPM_CONFIG_OFFLINE':'true'})
commands=[('03-native-types',['pnpm','-C',str(r),'run','typecheck','--tsBuildInfoFile','/private/tmp/codex-a-bridge135-native.tsbuildinfo']),('03-native-lint',['pnpm','-C',str(r),'run','lint']),('03-private-typecheck',['pnpm','-C',str(private),'run','typecheck']),('03-private-build',['pnpm','-C',str(private),'run','build']),('03-private-pack',['pnpm','-C',str(private),'run','check:pack']),('03-cjs-existing',['node',str(private/'tests/cjs/smoke.cjs')]),('03-full',['pnpm','-C',str(private),'exec','vitest','run','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(p/'03-full.json')])]
results=[]
for label,cmd in commands:
 start=time.time()
 with(p/(label+'.txt')).open('w')as log:
  child=subprocess.Popen(cmd,cwd=private,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True);timeout=False
  try:code=child.wait(timeout=180)
  except subprocess.TimeoutExpired:
   timeout=True;os.killpg(child.pid,signal.SIGTERM)
   try:code=child.wait(timeout=5)
   except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);code=child.wait()
 result={'name':label,'command':cmd,'exit':code,'timeout':timeout,'elapsedSeconds':time.time()-start};results.append(result);(p/(label+'-exit.json')).write_text(json.dumps(result,indent=2)+'\n');(p/'03-quality.json').write_text(json.dumps(results,indent=2)+'\n');print(label,code,'timeout',timeout,flush=True)
 assert code==0 and not timeout,label+' failed'
 if label=='03-full':
  d=json.loads((p/'03-full.json').read_text());print({k:d[k]for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests']},flush=True);assert d['numTotalTests']>1900 and d['numTotalTests']==d['numPassedTests']and d['numFailedTests']==0 and d['numPendingTests']==0
checks=[{**i,'authorSame':hashlib.sha256((r/i['file']).read_bytes()).hexdigest()==i['sha256'],'privateSame':hashlib.sha256((private/i['file']).read_bytes()).hexdigest()==i['sha256']}for i in inputs]
(p/'03-private-final.json').write_text(json.dumps({'path':str(private),'inputs':checks,'passed':sum(i['authorSame']and i['privateSame']for i in checks),'total':len(checks)},indent=2)+'\n');assert all(i['authorSame']and i['privateSame']for i in checks)
print('private source inputs',len(checks),'/',len(checks),'identical',flush=True)
