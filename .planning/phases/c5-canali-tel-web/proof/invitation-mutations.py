import hashlib,json,subprocess
from pathlib import Path
root=Path.cwd();proof=root/'.planning/phases/c5-canali-tel-web/proof';path=root/'src/capability/agent-elevenlabs/web-invitations.ts';original=path.read_bytes();source=original.decode();env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','NO_COLOR':'1'};mutations=[]
def add(name,before,after):
 assert source.count(before)==1,(name,'anchor');mutations.append((name,before,after))
for marker in ['invite-expiry','invite-revocation','invite-list-scope','invite-list-id','invite-list-email','invite-list-version','invite-list-events','invite-public-state','invite-current-parse','invite-recipient-parse','invite-recipient-target','invite-recipient-time']:
 line=next(line for line in source.splitlines() if '// guard:'+marker in line);end=line.index(' ctx.addIssue') if ' ctx.addIssue' in line else line.index(' issue(') if ' issue(' in line else line.index(' return false;');cond=line[:end];add(marker,line,line.replace(cond,'  if ('+('true' if marker in ['invite-current-parse','invite-recipient-parse'] else 'false')+')'))
add('invite-list-bound','.max(512)', '.max(513)')
add('invite-current-binding','sameAgentChannelAccessBinding({ scope, identity }, binding.data)','true')
add('invite-current-future','Date.parse(observedAt) <= now','true')
add('invite-current-age','now - Date.parse(observedAt) < maximumAgeMs','true')
add('invite-project-unavailable','if (!isElevenLabsWebInvitationListCurrent(rawList, rawBinding, now)) return null;', 'if (!isElevenLabsWebInvitationListCurrent(rawList, rawBinding, now)) return [];')
add('invite-recipient-c3','return isElevenLabsWebInvitationCurrent(record.data.invitation, scope.data, lookup.data.recipientUserId, expectedRevision, new Date(now));','return true;')
add('invite-project-expiry',"Date.parse(record.expiresAt) <= now ? 'expired'", "false ? 'expired'")
add('invite-project-pending',"entry.status === 'registered' ? 'active' : 'pending-registration'", "entry.status === 'registered' ? 'active' : 'active'")
filter="return ElevenLabsWebPublicInvitationSchema.parse({ invitationId: record.invitationId, revision: record.revision, email: entry.email, status,\n      createdAt: record.createdAt, expiresAt: record.expiresAt, revokedAt: record.revokedAt });"
add('invite-project-private-fields',filter,'return { ...record, email: entry.email, status };')
add('invite-project-revocation',filter,filter.replace('email: entry.email, status,','email: entry.email, status: record.revokedAt !== null ? \'active\' : status,').replace('revokedAt: record.revokedAt','revokedAt: null'))
# Mutate every new strict object independently; canonical child validators remain unchanged.
lines=source.splitlines()
for i,line in enumerate(lines):
 if '}).strict()' not in line:continue
 start=i
 while start>0 and not ('z.object(' in lines[start] or 'PublicMetadata.safeExtend(' in lines[start] or 'AgentChannelAccessBindingSchema.safeExtend(' in lines[start]):start-=1
 before='\n'.join(lines[start:i+1]);add('invite-strict-'+str(i+1),before,before.replace('}).strict()','}).passthrough()'))
results=[]
try:
 for name,before,after in mutations:
  path.write_text(source.replace(before,after));report=proof/('invitation-mutation-'+name+'.json');r=subprocess.run(['pnpm','exec','vitest','run','tests/capability/c5-web-invitations.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(report)],env=env,capture_output=True,text=True);(proof/('invitation-mutation-'+name+'.log')).write_text(r.stdout+r.stderr);d=json.loads(report.read_text());failed=[a for f in d['testResults'] for a in f['assertionResults'] if a['status']=='failed'];functional=[a for a in failed if any('AssertionError' in m for m in a['failureMessages'])];other=[a for a in failed if a not in functional];q=r.returncode!=0 and bool(functional) and not other;results.append({'name':name,'exitCode':r.returncode,'tests':d['numTotalTests'],'functionalFailures':len(functional),'otherFailures':len(other),'qualified':q});print(name,q,len(functional),len(other),flush=True);path.write_bytes(original)
finally:
 path.write_bytes(original);record={'total':len(mutations),'qualified':sum(r['qualified'] for r in results),'results':results,'restored':path.read_bytes()==original,'sha256':hashlib.sha256(original).hexdigest()};(proof/'INVITATION-MUTATIONS.json').write_text(json.dumps(record,indent=2)+'\n')
assert record['qualified']==record['total']
