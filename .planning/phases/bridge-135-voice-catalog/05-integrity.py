from pathlib import Path
import subprocess,json,fnmatch,hashlib,os
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-68-1');p=r/'.planning/phases/bridge-135-voice-catalog';base='75c5043'
patterns=Path('/Users/admintemp/Downloads/Claude/forge-v2-bacheca/perimetri/codex_bridge-135-voice-catalog.txt').read_text().splitlines()
def allowed(name):return any(fnmatch.fnmatchcase(name,pattern)for pattern in patterns if pattern.strip())
changed=subprocess.check_output(['git','-C',str(r),'diff','--name-only',base],text=True).splitlines();untracked=subprocess.check_output(['git','-C',str(r),'ls-files','--others','--exclude-standard'],text=True).splitlines();files=sorted(set(changed+untracked));bad=[f for f in files if not allowed(f)]
negatives=['package.json','dist/forbidden.cjs','CHANGELOG.md','../another-worktree/probe.ts'];assert all(not allowed(f)for f in negatives)
modified={'src/http/endpoints/index.ts'};protected=[]
for row in subprocess.check_output(['git','-C',str(r),'ls-tree','-r','-z',base]).split(b'\0'):
 if not row:continue
 metadata,name=row.split(b'\t',1);mode,kind,expected=metadata.decode().split();name=name.decode()
 if kind!='blob'or name in modified or any(x.startswith('.env')or x.lower()=='secrets'for x in Path(name).parts)or name.endswith(('.pem','.key'))or name=='.npmrc':continue
 f=r/name;actual=None
 if f.exists():
  data=os.readlink(f).encode()if mode=='120000'else f.read_bytes();actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 protected.append({'file':name,'same':actual==expected,'expectedBlob':expected,'actualBlob':actual})
result={'base':base,'candidate':subprocess.check_output(['git','-C',str(r),'rev-parse','HEAD'],text=True).strip(),'perimeter':[{'file':f,'allowed':allowed(f)}for f in files],'negativeProbes':negatives,'outOfPerimeter':bad,'protected':protected,'protectedPassed':sum(i['same']for i in protected),'protectedTotal':len(protected)}
(p/'05-integrity.json').write_text(json.dumps(result,indent=2)+'\n');print('perimeter',len(files)-len(bad),'/',len(files),'protected',result['protectedPassed'],'/',result['protectedTotal'],'negative4/4');assert not bad and all(i['same']for i in protected)
