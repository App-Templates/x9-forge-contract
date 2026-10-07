from pathlib import Path
import subprocess,json,time,os,tempfile,shutil,hashlib,tarfile
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-65-1');e=Path('/private/tmp/codex-d-r7-evidence');nodebin=Path('/Users/admintemp/.nvm/versions/node/v24.14.1/bin');node=str(nodebin/'node');pnpm=str(nodebin/'pnpm');env=os.environ.copy();env['PATH']=str(nodebin)+os.pathsep+env.get('PATH','')
def run(name,argv,cwd,timeout=180):
 start=time.time()
 with (e/(name+'.log')).open('w') as log:code=subprocess.run(argv,cwd=cwd,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=timeout).returncode
 rec={'exitCode':code,'seconds':round(time.time()-start,2),'argv':argv,'cwd':str(cwd)};(e/(name+'-exit.json')).write_text(json.dumps(rec,indent=2));print(json.dumps(rec),flush=True)
 if code:print((e/(name+'.log')).read_text()[-4000:],flush=True)
 return code
assert run('FINAL-TYPES',[pnpm,'run','typecheck'],r)==0
assert run('FINAL-LINT',[pnpm,'run','lint'],r)==0
names=subprocess.check_output(['git','ls-files','src','scripts','tests'],cwd=r,text=True).splitlines()+subprocess.check_output(['git','ls-files','--others','--exclude-standard','src','tests'],cwd=r,text=True).splitlines()
files=sorted(set(p for p in names if not any(part.startswith('.env') or part=='secrets' for part in Path(p).parts)))+['package.json','pnpm-lock.yaml','README.md','tsconfig.json','tsconfig.eslint.json','eslint.config.mjs','vitest.config.ts']
private=Path(tempfile.mkdtemp(prefix='codex-d-r7-quality-',dir='/private/tmp'))
for f in files:p=private/f;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(r/f,p)
modules=private/'node_modules';modules.mkdir()
for item in (r/'node_modules').iterdir():
 if item.name in ['.vite','.vite-temp','.cache']:continue
 if item.name.startswith('@') and item.is_dir():
  scope=modules/item.name;scope.mkdir()
  for child in item.iterdir():(scope/child.name).symlink_to(child.resolve())
 else:(modules/item.name).symlink_to(item.resolve())
hashes={f:hashlib.sha256((private/f).read_bytes()).hexdigest() for f in files}
proof={'private':str(private),'inputFiles':len(files),'inputHashes':hashes,'inputMatchesAuthor':{f:hashlib.sha256((r/f).read_bytes()).hexdigest()==sha for f,sha in hashes.items()}}
(e/'QUALITY.json').write_text(json.dumps(proof,indent=2));assert all(proof['inputMatchesAuthor'].values())
assert run('FINAL-BUILD',[pnpm,'run','build'],private)==0
assert run('FINAL-PACK-CHECK',[pnpm,'run','check:pack'],private)==0
assert run('FINAL-CJS-SMOKE',[node,'tests/cjs/smoke.cjs'],private)==0
assert '15/15 probes passed' in (e/'FINAL-CJS-SMOKE.log').read_text()
assert run('FINAL-CJS-130',[node,'tests/cjs/bridge-130-smoke.cjs'],private)==0
assert run('FINAL-PACK',[str(nodebin/'npm'),'pack','--ignore-scripts','--json'],private)==0
packed=json.loads((e/'FINAL-PACK.log').read_text());tarball=private/packed[0]['filename']
client=private/'consumer';package=client/'node_modules/@x9-forge/contracts';package.mkdir(parents=True)
(client/'package.json').write_text('{"name":"r7-independent-consumer","private":true,"type":"commonjs"}\n')
with tarfile.open(tarball) as archive:
 for entry in archive.getmembers():
  if not entry.name.startswith('package/') or entry.isdir():continue
  relative=Path(entry.name).relative_to('package');assert '..' not in relative.parts and not relative.is_absolute()
  assert not any(part.startswith('.env') or part=='secrets' for part in relative.parts)
  target=package/relative;target.parent.mkdir(parents=True,exist_ok=True)
  data=archive.extractfile(entry);assert data is not None;target.write_bytes(data.read())
(client/'node_modules/zod').symlink_to((r/'node_modules/zod').resolve())
(client/'node_modules/@types').symlink_to((r/'node_modules/@types').resolve())
shutil.copyfile(r/'tests/cjs/r7-workspace-smoke.cjs',client/'r7-workspace-smoke.cjs')
shutil.copyfile(r/'tests/cjs/r7-workspace-types.cts',client/'r7-workspace-types.cts')
assert run('FINAL-CJS-PACKED',[node,'r7-workspace-smoke.cjs'],client)==0
assert run('FINAL-CJS-TYPES',[node,str(r/'node_modules/typescript/bin/tsc'),'--ignoreConfig','--noEmit','--strict','--exactOptionalPropertyTypes','--noUncheckedIndexedAccess','--module','Node16','--moduleResolution','Node16','--target','ES2023','r7-workspace-types.cts'],client)==0
proof.update({'tarball':str(tarball),'tarballSHA256':hashlib.sha256(tarball.read_bytes()).hexdigest(),'packedConsumer':str(client),'compiledWorkspaceFile':str(package/'dist/agent/agent-workspace.cjs'),'authorInputsUnchanged':{f:hashlib.sha256((r/f).read_bytes()).hexdigest()==sha for f,sha in hashes.items()},'compiledProbes':15,'normalSmokeProbes':36,'bridge130Probes':6})
(e/'QUALITY.json').write_text(json.dumps(proof,indent=2));print(json.dumps({'private':str(private),'consumer':str(client),'inputs':len(files),'authorUnchanged':all(proof['authorInputsUnchanged'].values()),'tarball':str(tarball)}),flush=True)
