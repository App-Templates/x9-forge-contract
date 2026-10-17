import subprocess,json,os,re,hashlib
from pathlib import Path
w=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-175-1');p=Path('/private/tmp/a-chiavi-indice-20261009')
node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node'
keys=['GOOGLE_CONTACTS_CLIENT_ID','GOOGLE_CONTACTS_CLIENT_SECRET','GOOGLE_CONTACTS_REFRESH_TOKEN','NETATMO_CLIENT_ID','NETATMO_CLIENT_SECRET','NETATMO_REFRESH_TOKEN','NETATMO_ACCESS_TOKEN','NETATMO_PASSWORD']
result=[];baselines=[]
def run(label,mode):
 r=subprocess.run([node,str(w/'tests/cjs/credential-provider-index.mjs'),mode],capture_output=True,text=True)
 (p/f'{label}.log').write_text(r.stdout+r.stderr)
 return {'exitCode':r.returncode,'assertion':'AssertionError' in r.stderr,'result':json.loads(r.stdout) if r.returncode==0 else None}
for mode,ext in [('esm','js'),('cjs','cjs')]:
 cred=w/f'dist/agent/agent-credentials.{ext}';meta=w/f'dist/agent/agent-credential-services.{ext}';original={f:f.read_bytes() for f in [cred,meta]}
 baseline=run(f'COMPILED-{mode}-BASELINE',mode);assert baseline['exitCode']==0;baselines.append(baseline)
 cuts=[]
 for k in keys:
  s=original[cred].decode();needle=f"    '{k}',\n";assert s.count(needle)==1;cuts.append((f'known-{k}',cred,s.replace(needle,'')))
  needle=f'    {k}: '+('zod_1.z' if mode=='cjs' else 'z')+'.string().optional(),\n';assert s.count(needle)==1;cuts.append((f'shape-{k}',cred,s.replace(needle,'')))
 for k in ['GOOGLE_CALENDAR_CLIENT_ID',*keys]:
  s=original[meta].decode();m=re.search(r'    "'+k+r'": \{\n.*?\n    \}',s,re.S);assert m,k;b=m.group()
  for prop,patch in [('kind',b.replace('"kind": "credential"','"kind": "identifier"')),('secret',b.replace('"secret": false','"secret": true') if k.endswith('_CLIENT_ID') else b.replace('"secret": true','"secret": false')),('service',b.replace('"id": "google"','"id": "openai"').replace('"id": "netatmo"','"id": "openai"')),('missing','')]:
   assert patch!=b;cuts.append((f'{prop}-{k}',meta,s[:m.start()]+patch+s[m.end()+(1 if prop=='missing' and s[m.end():].startswith(',') else 0):]))
 s=original[meta].decode();assert "'hostinger', 'netatmo']" in s;cuts.append(('netatmo-enum',meta,s.replace("'hostinger', 'netatmo']","'hostinger']")))
 try:
  for i,(name,file,mutated) in enumerate(cuts,1):
   file.write_text(mutated);red=run(f'COMPILED-{mode}-CUT-{i:02}-{name}',mode)
   file.write_bytes(original[file]);exact=file.read_bytes()==original[file]
   assert red['exitCode']!=0 and red['assertion'],(name,red)
   green=run(f'COMPILED-{mode}-RESTORE-{i:02}-{name}',mode)
   assert exact and green['exitCode']==0 and green['result']['passed']==25,(name,green)
   result.append({'mode':mode,'id':i,'name':name,'sha256':hashlib.sha256(original[file]).hexdigest(),'red':red,'exactRestore':exact,'green':green})
   (p/'BRIDGE-COMPILED-CUTS.json').write_text(json.dumps({'baseline':baselines,'cuts':result},indent=2))
 finally:
  for f,b in original.items():f.write_bytes(b)
print(json.dumps({'qualified':len(result),'expected':106}))
