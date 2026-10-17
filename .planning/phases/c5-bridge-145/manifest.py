from pathlib import Path
import subprocess,hashlib,json,fnmatch
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1');out=Path.cwd()/'work/c5-bridge-145/raw'
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
changed=git('diff','--name-only','ae7c464','--','src').decode().splitlines()
barrels=['src/agent/index.ts','src/http/endpoints/index.ts','src/capability/index.ts']
groups={'B':('c8a2683',['src/agent/agent-channel-resource-operation.ts','src/http/endpoints/forge-agent-channel-resource.ts']), 'E':('7d4c3f3',['src/agent/agent-deletion.ts','src/http/endpoints/internal-agents-deletion.ts'])}
groups['C']=('6c4db38',[p for p in changed if p not in barrels and not any(p in v[1] for v in groups.values())])
rows=[]
for who,(ref,files) in groups.items():
 for p in files:
  actual=(root/p).read_bytes();expected=git('show',ref+':'+p)
  rows.append({'author':who,'ref':ref,'path':p,'sha256':hashlib.sha256(actual).hexdigest(),'exactAuthorBytes':actual==expected})
base=['src/model-router/agent-model-configuration.ts','src/model-router/model-catalog.ts']
baseRows=[]
for p in base:
 actual=(root/p).read_bytes();expected=git('show','ae7c464:'+p)
 baseRows.append({'path':p,'sha256':hashlib.sha256(actual).hexdigest(),'exactBaseBytes':actual==expected})
patterns=Path('/Users/admintemp/Downloads/Claude/forge-v2-bacheca/perimetri/codex_c5-bridge-145.txt').read_text().splitlines()
allchanged=git('diff','--name-only','ae7c464').decode().splitlines()+git('ls-files','--others','--exclude-standard').decode().splitlines()
violations=[p for p in allchanged if not any(fnmatch.fnmatchcase(p,pattern) for pattern in patterns)]
report={'sourceHead':git('rev-parse','HEAD').decode().strip(),'base':'ae7c464','source':rows,'B0':baseRows,'barrels':barrels,'perimeterViolations':violations,'packageUnchanged':not bool(git('diff','ae7c464','--','package.json','pnpm-lock.yaml')),'distFiles':len(list((root/'dist').rglob('*.*')))}
assert all(r['exactAuthorBytes'] for r in rows)
assert all(r['exactBaseBytes'] for r in baseRows)
assert not violations,violations
assert report['packageUnchanged']
(out/'SOURCE-MANIFEST.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'sourceFiles':len(rows),'exactAuthors':sum(r['exactAuthorBytes'] for r in rows),'B0Exact':sum(r['exactBaseBytes'] for r in baseRows),'perimeterViolations':violations,'packageUnchanged':report['packageUnchanged']}))
