from pathlib import Path
import json,subprocess,hashlib,shutil,tempfile,os,signal
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-73-1');p=r/'.planning/phases/bridge-138';b=Path(Path('/private/tmp/codex-a-bridge138-build-current').read_text().strip());consumer=Path(tempfile.mkdtemp(prefix='codex-a-bridge138-consumer-',dir='/private/tmp'));archive=consumer/'archive';archive.mkdir();config=consumer/'empty-npmrc';config.write_text('');env=os.environ.copy();env.update({'NPM_CONFIG_USERCONFIG':str(config),'NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_CACHE':str(consumer/'cache')})
def command(label,cmd,timeout=90):
 with(p/(label+'.txt')).open('w')as log:
  child=subprocess.Popen(cmd,cwd=consumer,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try:code=child.wait(timeout=timeout)
  except subprocess.TimeoutExpired:
   os.killpg(child.pid,signal.SIGTERM)
   try:child.wait(timeout=5)
   except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);child.wait()
   raise
 (p/(label+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':code})+'\n');assert code==0,label
command('04-pack-consumer',['pnpm','-C',str(b),'pack','--pack-destination',str(archive)])
archives=list(archive.glob('*.tgz'));assert len(archives)==1
(consumer/'package.json').write_text(json.dumps({'name':'bridge138-independent-consumer','private':True,'dependencies':{'@x9-forge/contracts':'file:'+str(archives[0]),'zod':'4.3.6'}})+'\n')
command('04-install-consumer',['pnpm','-C',str(consumer),'install','--offline','--ignore-scripts'])
installed=(consumer/'node_modules/@x9-forge/contracts').resolve();assert installed!=b
files=[f for f in(b/'dist').rglob('*')if f.is_file()];assert all((installed/'dist'/f.relative_to(b/'dist')).read_bytes()==f.read_bytes()for f in files)
(p/'04-package-input.json').write_text(json.dumps({'consumer':str(consumer),'archive':str(archives[0]),'archiveSha256':hashlib.sha256(archives[0].read_bytes()).hexdigest(),'installed':str(installed),'compiledFiles':len(files),'identicalCompiledFiles':len(files),'installedFromArchive':True,'sourceAliases':False},indent=2)+'\n')
probe=consumer/'probe.cjs';shutil.copyfile(p/'04-probe.cjs',probe)
paths={'identity':installed/'dist/agent/agent-runtime-identity.cjs','helper':installed/'dist/agent/agent-channel-configuration.cjs'};originals={k:f.read_bytes()for k,f in paths.items()};sha={k:hashlib.sha256(v).hexdigest()for k,v in originals.items()};done=[];names=set()
recipes=[
('field-retention','identity','vaultAgentId: zod_1.z.number().int().positive().optional()','wrongVaultAgentId: zod_1.z.number().int().positive().optional()',1),
('integer','identity','vaultAgentId: zod_1.z.number().int().positive().optional()','vaultAgentId: zod_1.z.number().positive().optional()',1),
('positive','identity','vaultAgentId: zod_1.z.number().int().positive().optional()','vaultAgentId: zod_1.z.number().int().optional()',1),
('noncoercing','identity','vaultAgentId: zod_1.z.number().int().positive().optional()','vaultAgentId: zod_1.z.coerce.number().int().positive().optional()',1),
('numeric-domain','identity','vaultAgentId: zod_1.z.number().int().positive().optional()','vaultAgentId: zod_1.z.any().optional()',1),
('optional-legacy','identity','vaultAgentId: zod_1.z.number().int().positive().optional()','vaultAgentId: zod_1.z.number().int().positive()',1),
('explicit-root','helper','return context.identity?.vaultAgentId ?? null;','return null;',1),
('no-management','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (Number(context.identity?.managementAgentId) || null);',1),
('no-runtime','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (Number(context.identity?.runtimeAgentId) || null);',1),
('no-context-id','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (Number(context.agentId) || null);',1),
('no-top-level','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? context.vaultAgentId ?? null;',1),
('no-channels','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? context.channelConfigurations?.[0]?.identity.vaultAgentId ?? null;',1),
('missing-null','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId;',1),
('public-export','helper','exports.vaultAgentIdOf = vaultAgentIdOf;','exports.wrongVaultAgentIdOf = vaultAgentIdOf;',1),
('fresh-context','helper','function vaultAgentIdOf(context) {','function vaultAgentIdOf(context) {',1),
]
def run(label):
 cmd=['node',str(probe),str(installed)];result=subprocess.run(cmd,cwd=consumer,env=env,capture_output=True,text=True,timeout=30);data=json.loads(result.stdout);(p/(label+'.txt')).write_text(result.stdout+result.stderr);(p/(label+'.json')).write_text(json.dumps({'command':cmd,'exit':result.returncode,**data},indent=2)+'\n');return result.returncode,data
try:
 code,baseline=run('04-baseline');assert code==0 and baseline['passed']==12
 for name,key,old,new,count in recipes:
  source=originals[key].decode();assert source.count(old)==count,(name,source.count(old));mutated=source.replace(old,new)
  if name=='fresh-context':
   mutated=mutated.replace('function vaultAgentIdOf(context) {','let cachedVault;\nfunction vaultAgentIdOf(context) {',1).replace('return context.identity?.vaultAgentId ?? null;', 'if (cachedVault !== undefined) return cachedVault;\n    return cachedVault = context.identity?.vaultAgentId ?? null;',1)
  try:
   paths[key].write_text(mutated);code,red=run('04-'+name+'-red');hits=[v['name']for v in red['results']if not v['passed']and v['errorName']=='AssertionError'];assert code==1 and hits and len(hits)==12-red['passed'],red;names.update(hits);done.append({'name':name,'file':str(paths[key]),'assertions':hits,'redPassed':red['passed'],'total':12,'sourceSha256':sha[key],'mutantSha256':hashlib.sha256(paths[key].read_bytes()).hexdigest()})
  finally:
   paths[key].write_bytes(originals[key]);assert hashlib.sha256(paths[key].read_bytes()).hexdigest()==sha[key];code,green=run('04-'+name+'-restore');assert code==0 and green['passed']==12
   if done and done[-1]['name']==name:done[-1].update({'restored':12,'restoredSha256':sha[key]})
 code,green=run('04-final');assert code==0 and len(names)==12
finally:
 for key,f in paths.items():f.write_bytes(originals[key]);assert hashlib.sha256(f.read_bytes()).hexdigest()==sha[key]
 (p/'04-cjs-proof.json').write_text(json.dumps({'consumer':str(consumer),'installedPackage':str(installed),'compiledPackage':str(b),'installedFromArchive':True,'pathAssertBeforeQualification':True,'qualified':len(done),'total':len(recipes),'probes':12,'names':sorted(names),'coveredNames':len(names),'sourceSha256':sha,'restored':all(f.read_bytes()==originals[k]for k,f in paths.items()),'results':done},indent=2)+'\n')
print('installed archive CJS12/12,mutations15/15,names12/12,SHA2/2',flush=True)
cts=consumer/'consumer.cts';shutil.copyfile(p/'04-consumer.cts',cts);ctOriginal=cts.read_bytes();cmd=['pnpm','-C',str(b),'exec','tsc','--ignoreConfig','--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023',str(cts)]
def types(label):
 result=subprocess.run(cmd,cwd=consumer,env=env,capture_output=True,text=True,timeout=60);(p/(label+'.txt')).write_text(result.stdout+result.stderr);(p/(label+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':result.returncode})+'\n');return result
try:
 baseline=types('04-types-baseline');assert baseline.returncode==0,baseline.stdout
 cts.write_text(ctOriginal.decode().replace('const selected: number | null','const selected: number'));red=types('04-types-red');assert red.returncode!=0 and 'TS2322' in red.stdout,red.stdout
finally:cts.write_bytes(ctOriginal)
green=types('04-types-green');assert green.returncode==0 and cts.read_bytes()==ctOriginal
(p/'04-types-proof.json').write_text(json.dumps({'baselineExit':0,'redExit':red.returncode,'redDiagnostic':'TS2322','greenExit':0,'restored':True,'sha256':hashlib.sha256(ctOriginal).hexdigest()})+'\n');print('CTS0,TS2322red,restore0',flush=True)
