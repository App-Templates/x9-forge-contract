from pathlib import Path
import json,subprocess,hashlib
e=Path('/private/tmp/codex-d-r7-evidence');q=json.loads((e/'QUALITY.json').read_text());client=Path(q['packedConsumer']);package=client/'node_modules/@x9-forge/contracts';node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node'
(client/'package.json').write_text('{"name":"r7-independent-consumer","private":true,"type":"commonjs"}\n')
actual=subprocess.check_output([node,'-p',"require.resolve('@x9-forge/contracts/agent')"],cwd=client,text=True).strip();assert Path(actual)==package/'dist/agent/index.cjs',actual
q['resolvedInstalledSubpath']=actual;q['consumerIsolation']='Independent package name prevents parent-package self resolution';q['excludedConsumerProbe']='First packed consumer and compiled controls resolved private parent build; excluded. Re-run with explicit installed resolution.';(e/'QUALITY.json').write_text(json.dumps(q,indent=2))
first=json.loads((e/'COMPILED-CONTROLS.json').read_text());(e/'COMPILED-UNEXERCISED.json').write_text(json.dumps(first,indent=2))
s=Path('/private/tmp/codex-d-r7-quality.py').read_text();old="client=private/'consumer';package=client/'node_modules/@x9-forge/contracts';package.mkdir(parents=True)";assert old in s
s=s.replace(old,old+"\n(client/'package.json').write_text('{\"name\":\"r7-independent-consumer\",\"private\":true,\"type\":\"commonjs\"}\\n')")
Path('/private/tmp/codex-d-r7-quality.py').write_text(s)
exec(s[:s.index("assert run('FINAL-TYPES'")])
assert run('FINAL-CJS-PACKED',[node,'r7-workspace-smoke.cjs'],client)==0
types=client/'r7-workspace-types.cts';original=types.read_text();sha=hashlib.sha256(types.read_bytes()).hexdigest();argv=[node,str(r/'node_modules/typescript/bin/tsc'),'--ignoreConfig','--noEmit','--strict','--exactOptionalPropertyTypes','--noUncheckedIndexedAccess','--module','Node16','--moduleResolution','Node16','--target','ES2023','r7-workspace-types.cts']
try:
 types.write_text(original.replace('const version: number | null','const version: string'));assert run('FINAL-CJS-TYPES-RED',argv,client)==2;assert 'TS2322' in (e/'FINAL-CJS-TYPES-RED.log').read_text()
finally:types.write_text(original)
assert hashlib.sha256(types.read_bytes()).hexdigest()==sha and run('FINAL-CJS-TYPES',argv,client)==0
print(json.dumps({'installedResolution':actual,'CJS':15,'CTS':0,'negative':'TS2322'}),flush=True)
