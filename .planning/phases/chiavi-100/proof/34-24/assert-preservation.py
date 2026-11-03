import pathlib,json,hashlib,sys,subprocess
p=pathlib.Path('/private/tmp/codex-a-chiavi-completamento/proofs/34-24');r=pathlib.Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1');x=json.loads((p/'preparation/baseline-preservation.json').read_text());rows=x['protected_sources']+x['protected18tests'];mismatch=[]
for row in rows:
 f=r/row['path'];actual=hashlib.sha256(f.read_bytes()).hexdigest()
 if actual!=row['sha256']:mismatch.append({'path':row['path'],'expected':row['sha256'],'actual':actual})
for row in x['archives']:
 f=pathlib.Path(row['path']);actual=hashlib.sha256(f.read_bytes()).hexdigest()
 if actual!=row['sha256']:mismatch.append({'path':row['path'],'expected':row['sha256'],'actual':actual})
result={'protected_sources':len(x['protected_sources']),'protected18tests':len(x['protected18tests']),'prior_archives':len(x['archives']),'mismatches':mismatch};(p/(sys.argv[1]+'.json')).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));assert not mismatch
