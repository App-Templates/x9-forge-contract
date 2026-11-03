from pathlib import Path
import subprocess,json,hashlib
R=Path('/private/tmp/d-bridge-identita-agente-20261008');W=R/'checkout';ENV={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin'}
mutants=[('esm',W/'dist/agent/index.js','export * from "./agent-context-identity.js";'),('cjs',W/'dist/agent/index.cjs','__exportStar(require("./agent-context-identity.cjs"), exports);')]
results=[]
for name,p,anchor in mutants:
 original=p.read_bytes();before=hashlib.sha256(original).hexdigest();s=original.decode();assert s.count(anchor)==1
 try:
  p.write_text(s.replace(anchor,'// omitted identity exports for qualification'))
  code=subprocess.run(['node','.planning/phases/bridge-identita-agente/consumer.mjs'],cwd=W,env=ENV,text=True,capture_output=True)
  (R/('COMPILED-'+name+'-red.log')).write_text(code.stdout+code.stderr)
  assert code.returncode and 'AssertionError' in code.stderr,'no semantic compiled red'
 finally:p.write_bytes(original)
 restore=subprocess.run(['node','.planning/phases/bridge-identita-agente/consumer.mjs'],cwd=W,env=ENV,text=True,capture_output=True)
 (R/('COMPILED-'+name+'-restore.log')).write_text(restore.stdout+restore.stderr)
 assert restore.returncode==0 and json.loads(restore.stdout)=={'passed':18,'total':18}
 assert hashlib.sha256(p.read_bytes()).hexdigest()==before
 results.append({'format':name,'path':str(p.relative_to(W)),'sha256':before,'semanticRed':True,'restore':18})
(R/'COMPILED-PROOF.json').write_text(json.dumps({'qualified':2,'total':2,'mutations':results},indent=2)+'\n');print(json.dumps(results))
