import hashlib,json,subprocess
from pathlib import Path
root=Path.cwd();proof=root/'.planning/phases/c5-canali-tel-web/proof';path=root/'src/http/endpoints/forge-elevenlabs-web.ts';original=path.read_bytes();source=original.decode();env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','NO_COLOR':'1'};mutations=[]
def add(name,before,after):
 assert source.count(before)==1,(name,'anchor');mutations.append((name,before,after))
add('auth-parse','if (!list.success || !access.success || !params.success) return false;', 'if (true) return false;')
add('management','if (list.data.identity.managementAgentId !== params.data.agentId) return false;', 'if (false) return false;')
add('sa', "access.data.role === 'sa' //", "false //")
add('owner','list.data.scope.ownerId === access.data.ownerId','true')
add('tenant','list.data.scope.tenantId === access.data.tenantId','true')
add('project-authorization','if (!isElevenLabsWebInvitationWithinForgeAuthorization(rawList, trustedAccess, requestedAgentId)) return null;', 'if (false) return null;')
add('project-missing-source','if (entries === null) return null;', "if (entries === null) return { status: 'available', version: list.version, observedAt: list.observedAt, entries: [] };")
add('project-private', "return ForgeElevenLabsWebInvitationListResponseSchema.parse({ status: 'available', version: list.version, observedAt: list.observedAt, entries });", "return { ...list, entries: entries };")
add('action',"if (action !== 'invite' && action !== 'revoke') return false;","if (false) return false;")
add('result-parse','if (!draft.success || !result.success) return false;', 'if (true) return false;')
add('request','actual.requestId !== intent.requestId','false')
add('version','actual.version !== intent.expectedVersion + 1','false')
add('recipient','actual.invitation.email === intent.email','true')
add('created-state',"(actual.invitation.status === 'active' || actual.invitation.status === 'pending-registration')","true")
add('revoked-id','actual.invitation.invitationId === intent.invitationId','true')
add('revoked-state',"actual.invitation.status === 'revoked'","true")
add('receipt-revision','result.invitation.revision === result.version','true')
add('response-bound','.max(512)', '.max(513)')
add('session', "authentication: 'forge-session' as const", "authentication: 'none' as const")
add('ownership', "authorization: 'sa-or-agent-owner' as const", "authorization: 'anyone' as const")
add('path-validation','encodeURIComponent(AgentManagementParamsSchema.parse({ agentId }).agentId)','encodeURIComponent(agentId)')
lines=source.splitlines()
for i,line in enumerate(lines):
 if '}).strict()' not in line:continue
 start=i
 while start>0 and 'z.object(' not in lines[start]:start-=1
 before='\n'.join(lines[start:i+1]);add('strict-'+str(i+1),before,before.replace('}).strict()','}).passthrough()'))
results=[]
try:
 for name,before,after in mutations:
  path.write_text(source.replace(before,after));report=proof/('http-invitation-mutation-'+name+'.json');r=subprocess.run(['pnpm','exec','vitest','run','tests/http/endpoints/c5-web-invitations.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(report)],env=env,capture_output=True,text=True);(proof/('http-invitation-mutation-'+name+'.log')).write_text(r.stdout+r.stderr);d=json.loads(report.read_text());failed=[a for f in d['testResults'] for a in f['assertionResults'] if a['status']=='failed'];functional=[a for a in failed if any('AssertionError' in m for m in a['failureMessages'])];other=[a for a in failed if a not in functional];q=r.returncode!=0 and bool(functional) and not other;results.append({'name':name,'exitCode':r.returncode,'tests':d['numTotalTests'],'functionalFailures':len(functional),'otherFailures':len(other),'qualified':q});print(name,q,len(functional),len(other),flush=True);path.write_bytes(original)
finally:
 path.write_bytes(original);record={'total':len(mutations),'qualified':sum(r['qualified'] for r in results),'results':results,'restored':path.read_bytes()==original,'sha256':hashlib.sha256(original).hexdigest()};(proof/'HTTP-INVITATION-MUTATIONS.json').write_text(json.dumps(record,indent=2)+'\n')
assert record['qualified']==record['total']
