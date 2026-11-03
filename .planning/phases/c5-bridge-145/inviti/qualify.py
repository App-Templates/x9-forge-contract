from pathlib import Path
import subprocess,json,hashlib,time
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1')
out=Path.cwd()/'work/c5-bridge-145-inviti/raw'
node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node'
n20='/Users/admintemp/.nvm/versions/node/v20.20.2/bin/node'
env={'HOME':'/Users/admintemp','PATH':str(Path(node).parent)+':/usr/bin:/bin:/usr/sbin:/sbin'}
report={'mutations':[],'checks':[]}
def save(): (out/'QUALIFICATION.json').write_text(json.dumps(report,indent=2)+'\n')
def run(name,cmd):
 dest=out/(name+'.txt');assert not dest.exists(),name
 start=time.time()
 with dest.open('w') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=300)
 row={'name':name,'exit':r.returncode,'elapsedSeconds':round(time.time()-start,2),'command':cmd,'log':dest.name}
 print(json.dumps(row),flush=True);return row
def test(name):
 dest=out/(name+'.json')
 row=run(name,[node,'node_modules/vitest/vitest.mjs','run','tests/capability/c5-web-invitations.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(dest)])
 data=json.loads(dest.read_text());failed=[v for f in data['testResults'] for v in f['assertionResults'] if v['status']=='failed']
 row.update(passed=data['numPassedTests'],total=data['numTotalTests'],assertionFailures=[v['fullName'] for v in failed if any('AssertionError' in m for m in v['failureMessages'])],otherFailures=sum(not any('AssertionError' in m for m in v['failureMessages']) for v in failed),report=dest.name)
 return row
def green(name,cmd):
 row=run(name,cmd);report['checks'].append(row);save();assert row['exit']==0,name
p=root/'src/capability/agent-elevenlabs/web-invitations.ts';b=root/'src/capability/index.ts';original=p.read_bytes();barrel=b.read_bytes()
privacy="return ElevenLabsWebPublicInvitationSchema.parse({ invitationId: record.invitationId, revision: record.revision, email: entry.email, status,\n      createdAt: record.createdAt, expiresAt: record.expiresAt, revokedAt: record.revokedAt });"
cases=[('full-binding','sameAgentChannelAccessBinding({ scope, identity }, binding.data)','true'),('target-email','if (record.data.email !== email.data || lookup.data.email !== email.data) return false;',''),('lookup-age','if (Date.parse(lookup.data.observedAt) > now || now - Date.parse(lookup.data.observedAt) >= 60_000) return false;',''),('public-privacy',privacy,privacy.replace('return ElevenLabsWebPublicInvitationSchema.parse(','return { ...ElevenLabsWebPublicInvitationSchema.parse(').replace('revokedAt: record.revokedAt });','revokedAt: record.revokedAt }), recipientUserId: \'synthetic-review-principal\' };'))]
try:
 report['baseline']=test('SOURCE-BASELINE');assert report['baseline']['exit']==0
 for name,old,new in cases:
  s=original.decode();assert s.count(old)==1,name
  try:
   p.write_text(s.replace(old,new,1));row=test('SOURCE-'+name+'-RED');row['qualified']=row['exit']!=0 and bool(row['assertionFailures']) and row['otherFailures']==0;report['mutations'].append(row);save();assert row['qualified'],row
  finally:p.write_bytes(original)
 report['restoredSource']=test('SOURCE-RESTORED');assert report['restoredSource']['exit']==0
 green('BUILD-BASELINE',['pnpm','build'])
 smoke='.planning/phases/c5-canali-tel-web/proof/invitation-smoke.mjs'
 green('PUBLIC-BASELINE',[node,smoke])
 try:
  anchor="export * from './agent-elevenlabs/web-invitations.js';";s=barrel.decode();assert s.count(anchor)==1;b.write_text(s.replace(anchor,''))
  green('BUILD-EXPORT-FAULT',['pnpm','build'])
  formats=[]
  for fmt in ['esm','cjs']:
   row=run('PUBLIC-EXPORT-'+fmt+'-RED',[node,smoke,fmt]);log=(out/row['log']).read_text();row['qualified']=row['exit']!=0 and 'AssertionError' in log and 'ERR_MODULE_NOT_FOUND' not in log;formats.append(row);assert row['qualified'],row
  report['mutations'].append({'name':'public-export','qualified':all(v['qualified'] for v in formats),'formats':formats});save()
 finally:b.write_bytes(barrel)
 green('BUILD-FINAL',['pnpm','build'])
 report['restoredExact']=p.read_bytes()==original and b.read_bytes()==barrel
 report['sourceHashes']={str(v.relative_to(root)):hashlib.sha256(v.read_bytes()).hexdigest() for v in [p,b]};save();assert report['restoredExact']
 dest=out/'FULL-FINAL.json'
 green('FULL-FINAL',[node,'node_modules/vitest/vitest.mjs','run','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(dest)])
 data=json.loads(dest.read_text());report['full']={k:data.get(k) for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTotalTestSuites','numPassedTestSuites','success']};save()
 for label,args in [('TYPECHECK',['pnpm','typecheck']),('LINT',['pnpm','lint']),('PACK',['pnpm','check:pack'])]:green(label,args)
 for version,runner in [('24',node),('20',n20)]:
  for label,file in [('NATIVE-CJS','tests/cjs/smoke.cjs'),('E-DELETION','tests/cjs/agent-deletion-smoke.cjs'),('C-PHONE-WEB','tests/cjs/c5-phone-web-smoke.mjs'),('B-RESOURCE','tests/cjs/c5-resource-independent.mjs'),('C-ROUNDTRIP','.planning/phases/c5-canali-tel-web/proof/round-trip-smoke.mjs'),('C-INVITATIONS',smoke)]:green(label+'-NODE'+version,[runner,file])
 green('E-PUBLIC-TYPES',[node,'node_modules/typescript/bin/tsc','--ignoreConfig','--noEmit','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023','--strict','--skipLibCheck','--ignoreDeprecations','6.0','tests/cjs/agent-deletion-types.cts'])
finally:
 p.write_bytes(original);b.write_bytes(barrel);report['restoredExact']=p.read_bytes()==original and b.read_bytes()==barrel;save()
print(json.dumps({'full':report.get('full'),'mutations':sum(v['qualified'] for v in report['mutations']),'candidates':5,'checks':len(report['checks']),'restoredExact':report['restoredExact']}),flush=True)
