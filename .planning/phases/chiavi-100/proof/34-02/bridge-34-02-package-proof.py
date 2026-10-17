from pathlib import Path
import subprocess, json, hashlib, tarfile

root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1')
proof=Path('/private/tmp/codex-a-chiavi-completamento/proofs/34-02')
nodebin='/Users/admintemp/.nvm/versions/node/v24.14.1/bin'
env=['/usr/bin/env','-i',f'PATH={nodebin}:/usr/bin:/bin']
archive=proof/'x9-forge-contracts-1.44.0.tgz'
unpacked=proof/'packed-consumer'
unpacked.mkdir(exist_ok=True)
with tarfile.open(archive) as package:
    package.extractall(unpacked,filter='data')
package_root=unpacked/'package'
if not (package_root/'node_modules').exists(): (package_root/'node_modules').symlink_to(root/'node_modules',target_is_directory=True)
consumer=unpacked/'types'
(consumer/'node_modules/@x9-forge').mkdir(parents=True,exist_ok=True)
if not (consumer/'node_modules/@x9-forge/contracts').exists(): (consumer/'node_modules/@x9-forge/contracts').symlink_to(package_root,target_is_directory=True)
fixture="import { type KnownCredentialKey, AgentCredentialsSchema } from '@x9-forge/contracts/agent';\nconst key: KnownCredentialKey = 'NETATMO_EMAIL';\nAgentCredentialsSchema.shape.NETATMO_EMAIL.parse(undefined);\nvoid key;\n"
for ext in ['mts','cts']: (consumer/f'consumer.{ext}').write_text(fixture)
cmd=env+[nodebin+'/node',str(root/'node_modules/typescript/bin/tsc'),'--ignoreConfig','--noEmit','--module','Node16','--moduleResolution','Node16','--target','ES2022','--strict',str(consumer/'consumer.mts'),str(consumer/'consumer.cts')]

def run(name,command):
    result=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    (proof/(name+'.log')).write_bytes(result.stdout)
    (proof/(name+'.json')).write_text(json.dumps({'command':command,'exit_code':result.returncode},indent=2)+'\n')
    return result

assert run('packed-types-green',cmd).returncode==0
decl=package_root/'dist/agent/agent-credentials.d.cts'
original=decl.read_bytes()
digest=hashlib.sha256(original).hexdigest()
cuts=[]
for name,old in [('known-key','"NETATMO_EMAIL", '),('explicit-shape','    NETATMO_EMAIL: z.ZodOptional<z.ZodString>;\n')]:
    assert original.decode().count(old)==1
    try:
        decl.write_text(original.decode().replace(old,'',1))
        red=run('packed-types-'+name+'-red',cmd)
        assert red.returncode!=0 and (b'TS2322' in red.stdout or b'TS2339' in red.stdout), red.stdout
    finally: decl.write_bytes(original)
    assert hashlib.sha256(decl.read_bytes()).hexdigest()==digest
    green=run('packed-types-'+name+'-restore-green',cmd)
    assert green.returncode==0,green.stdout
    cuts.append({'cut':name,'red_exit':red.returncode,'restore_exit':green.returncode,'compiled_sha256':digest,'exact_restore':True})
for fmt in ['esm','cjs']:
    command=env+[nodebin+'/node','/private/tmp/codex-a-chiavi-completamento/bridge-34-02-smoke.mjs',str(package_root),fmt]
    assert run('packed-'+fmt+'-green',command).returncode==0
archive.chmod(0o444)
files=[]
for p in sorted((root/'dist').rglob('*')):
    if p.is_file():
        previous=proof/'private-compiled-package'/p.relative_to(root)
        assert p.read_bytes()==previous.read_bytes(),str(p)
        files.append({'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':p.stat().st_size})
sources=[]
for p in sorted((root/'src').rglob('*.ts')):
    sources.append({'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
manifest={'package':'@x9-forge/contracts','version':'1.44.0','branch':'codex/chiavi-100-bridge','base':'f88d02a0a8517fe9aca1d969f55dd340847425d9','node':'24.14.1','pnpm':'9.15.9','vitest':'3.2.4','archive':str(archive),'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'dist_files':files,'source_files':sources,'all_rebuilt_dist_identical_to_qualified_copy':True,'packed_type_cuts':cuts}
(proof/'PACKAGE-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Packed ESM/CJS 8/8 each; consumer declarations2/2; declaration cuts2/2; exact rebuilt dist',len(files),'/',len(files),'archive',archive)
