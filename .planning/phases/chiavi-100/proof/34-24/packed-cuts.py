from pathlib import Path
import subprocess,json,hashlib,stat,difflib,shutil,re
p=Path('/private/tmp/codex-a-chiavi-completamento/proofs/34-24');c=p/'installed-consumer';r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1');pkg=(c/'node_modules/@x9-forge/contracts').resolve();outdir=p/'packed-cuts';outdir.mkdir(exist_ok=True)
env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':'/private/tmp','CI':'1'}
types=['node',str(r/'node_modules/typescript/bin/tsc'),'--ignoreConfig','--noEmit','--module','Node16','--moduleResolution','Node16','--target','ES2022','--strict',*[str(c/f) for f in ['retained18.mts','retained18.cts','model-local-authority-types.mts','model-local-authority-types.cts','model-legacy-observation-types.mts','model-legacy-observation-types.cts']]]
probe="""import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const load=process.argv[2]==='cjs'?specifier=>createRequire(import.meta.url)(specifier):specifier=>import(specifier);
const http=await load('@x9-forge/contracts/http');
assert.equal(http.InternalAgentToolDispatchResponseSchema.safeParse({callId:'synthetic-call',status:'success',output:{nested:[{INTERNAL_TOKEN:'synthetic'}]}}).success,false,'retained18 rejects canonical INTERNAL_TOKEN at depth');
console.log('canonical INTERNAL_TOKEN result assertion:1/1');
""";(c/'result-guard-probe.mjs').write_text(probe)
cases=[]
def add(name,file,old,new,cmd,marker='AssertionError'):cases.append((name,pkg/file,lambda b:b.replace(old.encode(),new.encode()),cmd,marker,old))
smoke=['node','chiavi-model-composition-smoke.mjs']
add('esm-model-execution-export','dist/model-router/index.js','export * from "./model-consumer-execution.js";','',smoke)
add('cjs-model-execution-export','dist/model-router/index.cjs','__exportStar(require("./model-consumer-execution.cjs"), exports);','',smoke)
add('esm-initial-export','dist/model-router/agent-model-configuration.js','export const AgentModelInitialSourceSchema =','const AgentModelInitialSourceSchema =',smoke)
cases.append(('cjs-initial-export-publication',pkg/'dist/model-router/agent-model-configuration.cjs',lambda b:b+b'\ndelete exports.AgentModelInitialSourceSchema;\n',smoke,'AssertionError',None))
for ext,fmt in [('js','esm'),('cjs','cjs')]:add(fmt+'-canonical-internal-token','dist/http/endpoints/internal-agent-tool-dispatch.'+ext,"?.kind === 'credential'","?.kind === 'credential' && key !== 'INTERNAL_TOKEN'",['node','result-guard-probe.mjs',fmt])
for name,file,export in [('initial-type','dist/model-router/agent-model-configuration.d.cts','AgentModelInitialSourceSchema'),('observed-type','dist/model-router/model-consumer-execution.d.cts','ModelConsumerRuntimeState'),('local-http-type','dist/http/endpoints/internal-agent-model-source-observation.d.cts','internalAgentModelSourceObservationContract'),('managed-voice-type','dist/capability/voice-live/index.d.cts','ManagedVoiceLiveCallStartRequestSchema'),('research-lease-type','dist/capability/ricerca/index.d.cts','ResearchExecuteInputSchema')]:
 cases.append((name,pkg/file,lambda b,word=export:re.sub(rb'\b'+word.encode()+rb'\b',b'Hidden'+word.encode(),b),types,'has no exported member',export))
manifest=json.loads(Path('/private/tmp/codex-a-chiavi-completamento/artifacts/34-24/contracts-manifest.json').read_text());archive=Path(manifest['archive']);copy=outdir/'archive-fault-copy.tgz';shutil.copyfile(archive,copy)
hashprobe=outdir/'hash-probe.py';hashprobe.write_text("import pathlib,hashlib,sys;actual=hashlib.sha256(pathlib.Path(sys.argv[1]).read_bytes()).hexdigest();assert actual==sys.argv[2], 'immutable archive hash mismatch';print('archive hash1/1')\n")
cases.append(('archive-byte-tamper',copy,lambda b:b+b'\x00',['/usr/bin/python3',str(hashprobe),str(copy),manifest['archive_sha256']],'AssertionError',None))
manifestcopy=outdir/'manifest-fault-copy.json';manifestcopy.write_text(json.dumps(manifest,indent=2)+'\n');mp=outdir/'manifest-probe.py';mp.write_text("import pathlib,hashlib,json,sys;x=json.loads(pathlib.Path(sys.argv[1]).read_text());assert hashlib.sha256(pathlib.Path(x['archive']).read_bytes()).hexdigest()==x['archive_sha256'],'manifest archive binding mismatch';print('manifest binding1/1')\n")
cases.append(('manifest-binding-tamper',manifestcopy,lambda b:b.replace(manifest['archive_sha256'].encode(),b'0'*64),['/usr/bin/python3',str(mp),str(manifestcopy)],'AssertionError',None))
def atomicwrite(file,data,mode):
 temp=file.with_name(file.name+'.chiavi-cut-tmp');temp.write_bytes(data);temp.chmod(mode);temp.replace(file)
def run(name,phase,command):
 q=subprocess.run(command,cwd=c,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);(outdir/(name+'-'+phase+'.log')).write_text('$ '+json.dumps(command)+'\n'+q.stdout+'\nEXIT_CODE='+str(q.returncode)+'\n');return q
results=json.loads((outdir/'matrix-results.json').read_text()) if (outdir/'matrix-results.json').exists() else []
for name,file,mutate,command,marker,needle in cases:
 if any(row['name']==name for row in results):continue
 original=file.read_bytes();before=hashlib.sha256(original).hexdigest();mode=stat.S_IMODE(file.stat().st_mode)
 if needle is not None:assert needle.encode() in original,(name,'missing mutation needle')
 changed=mutate(original);assert changed!=original
 if file.suffix in ['js','.js','.cjs','.cts']: (outdir/(name+'.diff')).write_text(''.join(difflib.unified_diff(original.decode().splitlines(True),changed.decode().splitlines(True),fromfile=str(file.relative_to(pkg)),tofile=str(file.relative_to(pkg)))))
 try:
  atomicwrite(file,changed,mode);q=run(name,'red',command);assert q.returncode!=0 and marker in q.stdout and 'TypeError:' not in q.stdout,(name,q.stdout[-3000:])
 finally:atomicwrite(file,original,mode)
 assert hashlib.sha256(file.read_bytes()).hexdigest()==before and stat.S_IMODE(file.stat().st_mode)==mode
 green=run(name,'restored-green',command);assert green.returncode==0,(name,green.stdout[-3000:]);results.append({'name':name,'path':str(file),'caught':True,'red_exit':q.returncode,'fresh_green_exit':green.returncode,'before_sha256':before,'restore_sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'inode_safe_atomic_private_replacement':True});(outdir/'matrix-results.json').write_text(json.dumps(results,indent=2)+'\n');print(name,'CAUGHT/EXACT-RESTORE/FRESH-GREEN',flush=True)
print('PACKED_CUTS',len(results),'/',len(cases),flush=True)
