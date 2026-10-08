from pathlib import Path
import subprocess,json,hashlib,copy
R=Path('/private/tmp/d-bridge-identita-agente-20261008');W=R/'checkout';A=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-128-1');DOC='.planning/phases/bridge-identita-agente/'
BASE=json.loads((R/'INPUTS.json').read_text());PROOF=json.loads((R/'CHECKPOINT-PROOF.json').read_text());APP=PROOF['sourceSha'];DIST=PROOF['compiledSha'];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
PROTECTED={p:h for p,h in BASE.items() if p not in APP and not p.startswith(DOC) and not p.startswith('dist/')}
paths=subprocess.check_output(['git','ls-files','-z'],cwd=A).decode().split('\0');extra=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=A).decode().split('\0')
allpaths=set(p for p in paths+extra if p)
actual={p:sha(A/p) for p in allpaths if (A/p).is_file() and not (A/p).is_symlink()}
def verify(data):
 for p,h in PROTECTED.items():assert data.get(p)==h,'protected '+p
 for p,h in APP.items():assert data.get(p)==h,'source '+p
 for p,h in DIST.items():assert data.get(p)==h,'compiled '+p
 assert all(p in BASE or p in APP or p in DIST or p.startswith(DOC) for p in data),'unexpected path'
 assert all(p in data for p in BASE),'file deletion'
verify(actual)
assert all(sha(W/p)==h for p,h in APP.items()) and all(sha(W/p)==h for p,h in DIST.items()),'private/author SHA'
oldtest=next(p for p in PROTECTED if p.startswith('tests/'))
source=next(iter(APP));artifact=next(iter(DIST));legacy='src/agent/agent-context-core.ts'
faults=[]
for name,change in [('old-test',lambda d:d.__setitem__(oldtest,'changed')),('deletion',lambda d:d.pop(oldtest)),('perimeter',lambda d:d.__setitem__('src/unapproved.ts','changed')),('manifest',lambda d:d.__setitem__('package.json','changed')),('source-sha',lambda d:d.__setitem__(source,'changed')),('dist-sha',lambda d:d.__setitem__(artifact,'changed')),('legacy-schema',lambda d:d.__setitem__(legacy,'changed'))]:
 bad=copy.deepcopy(actual);change(bad)
 try:verify(bad)
 except AssertionError:faults.append(name)
 else:raise AssertionError('audit missed '+name)
report={'app':len(APP),'dist':len(DIST),'protected':len(PROTECTED),'oldTests':len([p for p in PROTECTED if p.startswith('tests/')]),'faults':faults,'inputSha':APP,'generatedSha':DIST,'zeroFileDeletion':True,'packageAndLockUnchanged':True,'nativeAuthorInventory':True}
(R/'AUDIT-FINAL.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['generatedSha','inputSha']}))
