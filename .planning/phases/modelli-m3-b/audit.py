"""Read-only audit of the staged bridge delta and its tested private copy."""
from pathlib import Path
import argparse,subprocess,json,hashlib,fnmatch
parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,required=True);parser.add_argument('--candidate',type=Path,required=True);parser.add_argument('--perimeter',type=Path,required=True);parser.add_argument('--evidence-dir',type=Path,required=True);args=parser.parse_args();root=args.root;base='0eccaaa3f2c70cde293d80c053707bfa421bd874'
def git(*a):return subprocess.check_output(['git',*a],cwd=root)
original={}
for record in git('ls-tree','-r','-z',base).split(b'\0'):
 if record:
  meta,path=record.split(b'\t',1);original[path.decode()]=meta.decode()
current={}
for record in git('ls-files','--stage','-z').split(b'\0'):
 if record:
  meta,path=record.split(b'\t',1);mode,sha,stage=meta.decode().split();assert stage=='0';current[path.decode()]=f'{mode} blob {sha}'
patterns=[line.strip() for line in args.perimeter.read_text().splitlines() if line.strip() and not line.startswith('#')];allowed=lambda p:any(fnmatch.fnmatchcase(p,g) for g in patterns)
changed=[p.decode() for p in git('diff','--cached','--name-only','-z',base).split(b'\0') if p];protected={p:m for p,m in original.items() if not allowed(p)}
files=['src/model-router/agent-model-configuration.ts','src/model-router/model-consumers.ts','src/model-router/index.ts','tests/model-router/model-consumers.test.ts','tests/cjs/model-consumers-smoke.mjs']
expected={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in files};actual={p:hashlib.sha256((args.candidate/p).read_bytes()).hexdigest() for p in files}
def scope_check(paths):assert all(allowed(p) for p in paths),'Outside perimeter'
def protected_check(tree):assert all(tree.get(p)==m for p,m in protected.items()),'Protected source changed'
def input_check(hashes):assert hashes==expected,'Tested input differs from delivered source'
def release_check(tree):assert all(tree.get(p)==original[p] for p in ['package.json','pnpm-lock.yaml']),'Release manifest changed'
wrong_tree=dict(current);wrong_tree[next(iter(protected))]='100644 blob '+'0'*40;wrong_input=dict(actual);wrong_input[files[0]]='0'*64;wrong_release=dict(current);wrong_release['package.json']='100644 blob '+'0'*40
negative={}
for name,check,bad in [('scope',scope_check,changed+['UNAUTHORIZED-PATH']),('protected',protected_check,wrong_tree),('tested-input',input_check,wrong_input),('release',release_check,wrong_release)]:
 try:check(bad)
 except AssertionError:negative[name]='AssertionError'
 else:raise AssertionError('Audit survived deliberate fault: '+name)
scope_check(changed);protected_check(current);input_check(actual);release_check(current);assert git('diff','--name-only','-z')==b'','Unstaged tracked source'
tests={p:m for p,m in original.items() if p.startswith('tests/')};assert all(current.get(p)==m for p,m in tests.items()),'Original test changed'
report={'base':base,'head':git('rev-parse','HEAD').decode().strip(),'changed':len(changed),'allowedChanged':len(changed),'changedPaths':changed,'applicationFiles':len([p for p in changed if not p.startswith('.planning/')]),'protectedUnchanged':len(protected),'protectedTotal':len(protected),'originalTestsUnchanged':len(tests),'originalTestsTotal':len(tests),'qualifiedInputs':len(actual),'expectedInputs':len(expected),'sourceHashes':actual,'negativeGuards':negative,'manifestUnchanged':True,'deletions':[p.decode() for p in git('diff','--cached','--name-only','--diff-filter=D','-z',base).split(b'\0') if p]};args.evidence_dir.mkdir(parents=True,exist_ok=True);(args.evidence_dir/'AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['sourceHashes','changedPaths']}))
