from pathlib import Path
import subprocess,json,hashlib,stat,shutil
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1');p=Path('/private/tmp/codex-a-chiavi-completamento/proofs/34-24');a=Path('/private/tmp/codex-a-chiavi-completamento/artifacts/34-24');rev=a/'revision-1';rev.mkdir(parents=True,exist_ok=True)
env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':'/private/tmp','CI':'1'}
def run(name,cmd,cwd=r):
 q=subprocess.run(cmd,cwd=cwd,env=env,capture_output=True,text=True);(p/(name+'.log')).write_text('$ '+json.dumps(cmd)+'\n'+q.stdout+q.stderr+'\nEXIT_CODE='+str(q.returncode)+'\n');print(name,q.returncode,flush=True);assert q.returncode==0,(name,q.stdout[-2500:],q.stderr[-2500:]);return q.stdout.strip()
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
guard=run('hook-effective-before',['git','config','--get','core.hooksPath']);assert guard=='/Users/admintemp/.x9-bacheca/versioni/v0.1.0/strumenti/hooks'
hooks={str(f):{'sha256':sha(f),'mode':stat.S_IMODE(f.stat().st_mode)} for f in Path(guard).iterdir() if f.is_file()};(p/'hooks-snapshot.json').write_text(json.dumps({'path':guard,'files':hooks},indent=2)+'\n')
archive=rev/'x9-forge-contracts.tgz';produced=rev/'x9-forge-contracts-1.44.0.tgz';assert not archive.exists() and not produced.exists()
run('pack',['pnpm','pack','--pack-destination',str(rev)]);assert produced.exists();produced.rename(archive);archive.chmod(0o444)
after=run('hook-effective-after',['git','config','--get','core.hooksPath'])
if after!=guard:run('hook-restore',['git','config','--worktree','core.hooksPath',guard])
assert run('hook-effective-restored',['git','config','--get','core.hooksPath'])==guard
for file,proof in hooks.items():f=Path(file);assert sha(f)==proof['sha256'] and stat.S_IMODE(f.stat().st_mode)==proof['mode']
c=p/'installed-consumer';c.mkdir(exist_ok=True)
(c/'package.json').write_text(json.dumps({'name':'chiavi-34-24-packed-consumer','private':True,'type':'module','dependencies':{'@x9-forge/contracts':'file:'+str(archive),'zod':'4.3.6'}},indent=2)+'\n')
run('consumer-install',['pnpm','install','--offline'],c)
for f in ['chiavi-model-composition-smoke.mjs','model-local-authority-smoke.mjs','model-legacy-observation-smoke.mjs','c5-models-consumers-smoke.mjs','model-consumers-smoke.mjs','public-entrypoints-first.mjs']:
 shutil.copyfile(r/'tests/cjs'/f,c/f)
 if f=='public-entrypoints-first.mjs':
  installed=(c/'node_modules/@x9-forge/contracts').resolve()
  script=(c/f).read_text().replace("const bridgeRoot = fileURLToPath(new URL('../../', import.meta.url));",'const bridgeRoot = '+json.dumps(str(installed))+';')
  (c/f).write_text(script)
 run('packed-'+f.removesuffix('.mjs'),['node',f],c)
fixture='''import { internalAgentToolDispatchContract, InternalAgentToolDispatchRequestSchema, INTERNAL_AGENT_EXECUTIONS, type InternalAgentToolDispatchRequest } from '@x9-forge/contracts/http';
import { ManagedVoiceLiveCallStartRequestSchema, type ManagedVoiceLiveCallStartRequest, StandaloneVoiceLiveCallStartRequestSchema } from '@x9-forge/contracts/capability/voice-live';
import { ResearchExecuteInputSchema, type ResearchExecuteInput, RICERCA_INTERNAL_TOOLS } from '@x9-forge/contracts/capability/ricerca';
const request: InternalAgentToolDispatchRequest = { requestId: 'r', identity: { tenantId: 't', ownerId: 'o', agentId: 'a' }, execution: 'research_execute', input: { researchId: 'r', leaseToken: '00000000-0000-4000-8000-000000000001' } };
const input: ResearchExecuteInput = { researchId: 'r', leaseToken: '00000000-0000-4000-8000-000000000001' };
const policy: ManagedVoiceLiveCallStartRequest['credentialPolicy'] = 'managed';
void [request, input, policy, internalAgentToolDispatchContract, InternalAgentToolDispatchRequestSchema, INTERNAL_AGENT_EXECUTIONS, ManagedVoiceLiveCallStartRequestSchema, StandaloneVoiceLiveCallStartRequestSchema, ResearchExecuteInputSchema, RICERCA_INTERNAL_TOOLS];
'''
fixtures=[]
for ext in ['mts','cts']:
 f=c/('retained18.'+ext);f.write_text(fixture);fixtures.append(str(f))
for f in ['model-legacy-observation-types.cts','model-legacy-observation-types.mts','model-local-authority-types.cts','model-local-authority-types.mts']:
 shutil.copyfile(r/'tests/cjs'/f,c/f);fixtures.append(str(c/f))
run('packed-types',['node',str(r/'node_modules/typescript/bin/tsc'),'--ignoreConfig','--noEmit','--module','Node16','--moduleResolution','Node16','--target','ES2022','--strict',*fixtures],c)
manifest={'package':'@x9-forge/contracts','version':'1.44.0','branch':'codex/chiavi-100-bridge','source_parent':run('source-parent',['git','rev-parse','HEAD']),'source_commit':None,'source_commit_status':'pending independent review and parent mutex; no stage/commit','retained18_product':'c23eb7f38d38ebd1ff0221d6a43a2edf26dd9419','initial_source_commit':'3d9eda54c9d5493b3b9f51a52618428e9f6e48db','observed_source_commit':'2b3ad075a88f5d39a2e5dbb986da55d37ebc9a4a','archive':str(archive),'archive_sha256':sha(archive),'archive_mode':oct(stat.S_IMODE(archive.stat().st_mode)),'node':'24.14.1','pnpm':'9.15.9','vitest':'3.2.4','exports':json.loads((r/'package.json').read_text())['exports'],'source_files':[{'path':str(f.relative_to(r)),'sha256':sha(f)} for f in sorted((r/'src').rglob('*.ts'))],'dist_files':[{'path':str(f.relative_to(r)),'sha256':sha(f)} for f in sorted((r/'dist').rglob('*')) if f.is_file()],'test_files':[{'path':row['path'],'sha256':sha(r/row['path'])} for row in json.loads((p/'preparation/baseline-preservation.json').read_text())['scope_rows'] if row['path'].startswith('tests/')],'producer_qualification':'pending final proof matrix and independent review','consumer_qualification':{'install':'normal native pnpm install --offline; actual local archive in node_modules, no aliases','typescript_fixtures':len(fixtures),'runtime_scripts':6}}
(a/'contracts-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('NEW_ARCHIVE',archive,manifest['archive_sha256'],flush=True)
