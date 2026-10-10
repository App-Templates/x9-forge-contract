import subprocess,json,os,re,hashlib
from pathlib import Path
w=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-175-1')
p=Path('/private/tmp/a-chiavi-indice-20261009')
env={**os.environ,'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin:/usr/sbin:/sbin'}
pnpm='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/pnpm'
keys=['GOOGLE_CONTACTS_CLIENT_ID','GOOGLE_CONTACTS_CLIENT_SECRET','GOOGLE_CONTACTS_REFRESH_TOKEN','NETATMO_CLIENT_ID','NETATMO_CLIENT_SECRET','NETATMO_REFRESH_TOKEN','NETATMO_ACCESS_TOKEN','NETATMO_PASSWORD']
cred=w/'src/agent/agent-credentials.ts';meta=w/'src/agent/agent-credential-services.ts'
original={f:f.read_bytes() for f in [cred,meta]}
sha=lambda b:hashlib.sha256(b).hexdigest()
cuts=[]
for k in keys:
 s=original[cred].decode();needle=f"  '{k}',\n";assert s.count(needle)==1;cuts.append((f'known-{k}',cred,s.replace(needle,'')))
 needle=f'    {k}: z.string().optional(),\n';assert s.count(needle)==1;cuts.append((f'shape-{k}',cred,s.replace(needle,'')))
for k in ['GOOGLE_CALENDAR_CLIENT_ID',*keys]:
 s=original[meta].decode();m=re.search(r'  "'+k+r'": \{\n.*?\n  \}',s,re.S);assert m,k;b=m.group()
 for prop,patch in [('kind',b.replace('"kind": "credential"','"kind": "identifier"')),('secret',b.replace('"secret": false','"secret": true') if k.endswith('_CLIENT_ID') else b.replace('"secret": true','"secret": false')),('service',b.replace('"id": "google"','"id": "openai"').replace('"id": "netatmo"','"id": "openai"')),('missing','')]:
  assert patch!=b;(cuts.append((f'{prop}-{k}',meta,s[:m.start()]+patch+s[m.end()+(1 if prop=='missing' and s[m.end():].startswith(',') else 0):])))
s=original[meta].decode();assert "'hostinger', 'netatmo']" in s;cuts.append(('netatmo-enum',meta,s.replace("'hostinger', 'netatmo']","'hostinger']")))
result=[]
def run(label):
 out=p/f'{label}.json'
 with (p/f'{label}.log').open('w') as log:r=subprocess.run([pnpm,'-C',str(w),'exec','vitest','run','tests/agent/credential-provider-index.test.ts','--maxWorkers=2','--testTimeout=60000','--reporter=json',f'--outputFile={out}'],env=env,stdout=log,stderr=subprocess.STDOUT)
 d=json.loads(out.read_text());a=[a for t in d['testResults'] for a in t['assertionResults']]
 return {'exitCode':r.returncode,'total':d['numTotalTests'],'passed':d['numPassedTests'],'failed':d['numFailedTests'],'assertions':sum(a['status']=='failed' and any('AssertionError' in x for x in a['failureMessages']) for a in a),'success':d['success']}
try:
 for i,(name,file,mutated) in enumerate(cuts,1):
  file.write_text(mutated)
  red=run(f'CUT-{i:02}-{name}')
  file.write_bytes(original[file]);restored=file.read_bytes()==original[file]
  assert red['exitCode']!=0 and red['failed']>0 and red['failed']==red['assertions'],(name,red)
  green=run(f'RESTORE-{i:02}-{name}')
  assert restored and green['exitCode']==0 and green['passed']==25 and green['success'],(name,green)
  result.append({'id':i,'name':name,'file':str(file),'sha256':sha(original[file]),'red':red,'exactRestore':restored,'green':green})
  (p/'BRIDGE-CUTS.json').write_text(json.dumps(result,indent=2))
 print(json.dumps({'qualified':len(result),'expected':len(cuts),'exactRestore':all(f.read_bytes()==b for f,b in original.items())}))
finally:
 for f,b in original.items():f.write_bytes(b)
