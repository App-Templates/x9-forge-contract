from pathlib import Path,PurePosixPath
import subprocess,json,fnmatch
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-81-1');base='67708ce1efa7dd2f7f03ff49d8607449a69a3d6c'
perim=Path('/Users/admintemp/Downloads/Claude/forge-v2-bacheca/perimetri/codex_bridge-139.txt')
patterns=[s.strip() for s in perim.read_text().splitlines() if s.strip() and not s.startswith('#')]
def command(args):return subprocess.check_output(['git']+args,cwd=root,text=True)
def allowed(p):return not PurePosixPath(p).is_absolute() and '..' not in PurePosixPath(p).parts and any(fnmatch.fnmatchcase(p,g) for g in patterns)
def tree(ref):
 d={}
 for line in command(['ls-tree','-r',ref]).splitlines():
  info,p=line.split('\t');d[p]=info
 return d
head=command(['rev-parse','HEAD']).strip();b=tree(base);current=tree(head);changed=command(['diff','--name-only',base,head]).splitlines();protected={p:v for p,v in b.items() if not allowed(p)}
def unchanged(candidate):return all(candidate.get(p)==v for p,v in protected.items())
assert all(allowed(p) for p in changed)
assert unchanged(current)
negative=[]
for p in ['package.json','CHANGELOG.md','dist/index.cjs','src/vault/workspace-file.ts']:
 assert p in protected,p
 altered=current.copy();altered[p]='synthetic-metadata-change';assert not allowed(p) and not unchanged(altered)
 negative.append({'path':p,'scope_rejected':not allowed(p),'changed_blob_detected':not unchanged(altered)})
Path('/private/tmp/b139-perimeter.json').write_text(json.dumps({'base':base,'head':head,'changed':changed,'changed_allowed':len(changed),'changed_total':len(changed),'protected_equal':len(protected),'protected_total':len(protected),'negative_probes':negative,'method':'Git tree object IDs and modes only, no reading protected file content; four in-memory changed object probes, no file edits'},indent=2)+'\n')
print('Perimeter',len(changed),'/',len(changed),'Protected',len(protected),'/',len(protected),'Negative',len(negative),'/',len(negative))
