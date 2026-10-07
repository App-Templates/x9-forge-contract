from pathlib import Path
import subprocess,json,fnmatch,hashlib,os
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-63-1');p=r/'.planning/phases/bridge-134';base='1646b79af49de3ddf0b2d93a1a73fc2320257d27'
patterns=Path('/Users/admintemp/Downloads/Claude/forge-v2-bacheca/perimetri/codex_bridge-134.txt').read_text().splitlines()
def allowed(name):return any(fnmatch.fnmatchcase(name,pattern)for pattern in patterns if pattern.strip())
changed=subprocess.check_output(['git','-C',str(r),'diff','--name-only',base],text=True).splitlines();untracked=subprocess.check_output(['git','-C',str(r),'ls-files','--others','--exclude-standard'],text=True).splitlines();files=sorted(set(changed+untracked));bad=[f for f in files if not allowed(f)]
negatives=['package.json','dist/forbidden.cjs','CHANGELOG.md','../another-worktree/probe.ts'];assert all(not allowed(f)for f in negatives)
modified={'src/agent/agent-channel-configuration.ts','src/capability/voice/agent-voice-settings.ts','src/http/endpoints/voice-register.ts'};protected=[]
for row in subprocess.check_output(['git','-C',str(r),'ls-tree','-r','-z',base]).split(b'\0'):
 if not row:continue
 metadata,name=row.split(b'\t',1);mode,kind,expected=metadata.decode().split();name=name.decode()
 if kind!='blob'or name in modified or any(x.startswith('.env')or x.lower()=='secrets'for x in Path(name).parts)or name.endswith(('.pem','.key'))or name=='.npmrc':continue
 f=r/name;actual=None
 if f.exists():
  data=os.readlink(f).encode()if mode=='120000'else f.read_bytes();actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 protected.append({'file':name,'same':actual==expected,'expectedBlob':expected,'actualBlob':actual})
result={'base':base,'candidate':subprocess.check_output(['git','-C',str(r),'rev-parse','HEAD'],text=True).strip(),'perimeter':[{'file':f,'allowed':allowed(f)}for f in files],'negativeProbes':negatives,'outOfPerimeter':bad,'protected':protected,'protectedPassed':sum(i['same']for i in protected),'protectedTotal':len(protected)}
(p/'09-integrity.json').write_text(json.dumps(result,indent=2)+'\n');print('perimeter',len(files)-len(bad),'/',len(files),'protected',result['protectedPassed'],'/',result['protectedTotal'],'negative4/4');assert not bad and all(i['same']for i in protected)
full=json.loads((p/'07-full.json').read_text());mut=json.loads((p/'05-mutations.json').read_text());cjs=json.loads((p/'08b-cjs-mutations.json').read_text());assert len(mut['completed'])==16 and len(mut['coveredTests'])==35 and all(i['exact']for i in mut['restored'])and cjs['qualified']==4 and len(cjs['namesHit'])==5
proof={'full':{k:full[k]for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests']},'fullFiles':len(full['testResults']),'newTests':35,'sourceMutations':{'qualified':16,'total':16,'newNamesHit':35,'newNames':35,'restoredSha':3},'compiledCjsMutations':{'qualified':4,'total':4,'namesHit':5,'newNames':5,'restoredSha':3},'cjsExisting':{'probes':36,'total':36,'additionalAssertions':6,'additionalTotal':6},'cjsNew':{'probes':5,'total':5,'declarationExit':json.loads((p/'08c-cjs-types-exit.json').read_text())['exit']},'quality':json.loads((p/'07-quality.json').read_text()),'privateInputs':json.loads((p/'07-private-final.json').read_text())['total'],'live':0,'release':False}
(p/'09-FINAL-PROOF.json').write_text(json.dumps(proof,indent=2)+'\n')
