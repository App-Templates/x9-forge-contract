from pathlib import Path
import subprocess, json, hashlib, re, shutil, sys

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1')
proof = Path('/private/tmp/codex-a-chiavi-completamento/proofs/34-02')
nodebin = '/Users/admintemp/.nvm/versions/node/v24.14.1/bin'
env = ['/usr/bin/env','-i',f'PATH={nodebin}:/usr/bin:/bin']
test = env + [nodebin+'/pnpm','exec','vitest','run','--config','/private/tmp/codex-a-chiavi-completamento/bridge.config.mjs','tests/agent/agent-credentials.test.ts','tests/agent/agent-credential-services.test.ts','--maxWorkers=1']
records = []

def run(name, cmd):
    result = subprocess.run(cmd, cwd=root, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (proof/(name+'.log')).write_bytes(result.stdout)
    (proof/(name+'.json')).write_text(json.dumps({'command':cmd,'cwd':str(root),'exit_code':result.returncode},indent=2)+'\n')
    return result

def replace(text, old, new):
    assert text.count(old) == 1, (old,text.count(old))
    return text.replace(old,new,1)

def metadata_block(text):
    return re.search(r'(?m)^\s*"NETATMO_EMAIL": \{.*?^\s*\},\n(?=\s*"NETATMO_CLIENT_ID")',text,re.S).group()

def mutate(text, name, prefix):
    z = 'zod_1.z' if prefix == 'cjs' else 'z'
    if name == 'known': return replace(text,"    'NETATMO_EMAIL',\n" if prefix else "  'NETATMO_EMAIL',\n",'')
    schema = f'NETATMO_EMAIL: {z}.string().optional(),'
    if name == 'schema': return replace(text,schema,'')
    if name == 'optional': return replace(text,schema,f'NETATMO_EMAIL: {z}.string(),')
    if name == 'string': return replace(text,schema,f'NETATMO_EMAIL: {z}.number().optional(),')
    if name == 'non-string': return replace(text,schema,f'NETATMO_EMAIL: {z}.any().optional(),')
    if name in ['metadata','secret','kind','service','label']:
        block = metadata_block(text)
        cut = '' if name=='metadata' else {
            'secret':lambda s:replace(s,'"secret": false','"secret": true'),
            'kind':lambda s:replace(s,'"kind": "credential"','"kind": "identifier"'),
            'service':lambda s:replace(s,'"id": "netatmo"','"id": "google"'),
            'label':lambda s:replace(s,'Indirizzo email account Netatmo','Email'),
        }[name](block)
        return replace(text,block,cut)
    if name.startswith('forged-'):
        part = name.removeprefix('forged-')
        if part == 'service': return replace(text,'JSON.stringify(entry.service) !== JSON.stringify(expected.service)','false')
        return replace(text,f'entry.{part} !== expected.{part}','false')
    if name == 'unknown':
        namespace = 'exports.' if prefix == 'cjs' else ''
        return replace(text,': null;',f': {namespace}AGENT_CREDENTIAL_SERVICE_METADATA.OPENAI_API_KEY;')
    if name == 'baseline': return replace(text,'Chiave API OpenAI','Chiave API OpenAI changed')
    raise ValueError(name)

def campaign(target, names, prefix, command, tag):
    original = target.read_bytes()
    digest = hashlib.sha256(original).hexdigest()
    save = proof/'restores'/tag/target.name
    save.parent.mkdir(parents=True,exist_ok=True)
    save.write_bytes(original)
    for name in names:
        label = f'{tag}-{name}'
        try:
            target.write_text(mutate(original.decode(),name,prefix))
            result = run(label+'-red',command)
            assertion = b'AssertionError' in result.stdout or b'ERR_ASSERTION' in result.stdout
            assert result.returncode != 0 and assertion, (label,result.returncode,result.stdout[-2000:])
        finally:
            target.write_bytes(original)
        assert hashlib.sha256(target.read_bytes()).hexdigest() == digest
        green = run(label+'-restore-green',command)
        assert green.returncode == 0, (label,green.stdout[-2000:])
        records.append({'cut':label,'red_exit':result.returncode,'assertion':assertion,'restore_exit':green.returncode,'source_or_compiled_sha256':digest,'exact_restore':True})
        (proof/(sys.argv[1]+'-cuts.json')).write_text(json.dumps(records,indent=2)+'\n')
        print(label,'caught; exact restore; green',flush=True)

if sys.argv[1] == 'source':
    campaign(root/'src/agent/agent-credentials.ts',['known','schema','optional','string','non-string'],'',test,'source-schema')
    campaign(root/'src/agent/agent-credential-services.ts',['metadata','secret','kind','service','label','forged-secret','forged-kind','forged-service','forged-label'],'',test,'source-metadata')
elif sys.argv[1] == 'compiled':
    private = proof/'private-compiled-package'
    private.mkdir(exist_ok=True)
    shutil.copytree(root/'dist',private/'dist',dirs_exist_ok=True)
    shutil.copyfile(root/'package.json',private/'package.json')
    shutil.copytree(root/'tests/cjs',private/'tests/cjs',dirs_exist_ok=True)
    if not (private/'node_modules').exists(): (private/'node_modules').symlink_to(root/'node_modules',target_is_directory=True)
    for fmt, suffix in [('esm','js'),('cjs','cjs')]:
        cmd = env+[nodebin+'/node','/private/tmp/codex-a-chiavi-completamento/bridge-34-02-smoke.mjs',str(private),fmt]
        if fmt=='cjs': cmd = env+[nodebin+'/node',str(private/'tests/cjs/smoke.cjs')]
        campaign(private/f'dist/agent/agent-credentials.{suffix}',['known','schema','optional','string','non-string'],fmt,cmd,fmt+'-schema')
        campaign(private/f'dist/agent/agent-credential-services.{suffix}',['metadata','secret','kind','service','label','unknown'],fmt,cmd,fmt+'-metadata')
        # Preserve the full old registry, independently of the new email entry.
        cmd = env+[nodebin+'/node','/private/tmp/codex-a-chiavi-completamento/bridge-34-02-smoke.mjs',str(private),fmt]
        campaign(private/f'dist/agent/agent-credential-services.{suffix}',['baseline'],fmt,cmd,fmt+'-preservation')
else: raise ValueError(sys.argv[1])
print('cuts caught',len(records),'/',len(records))
