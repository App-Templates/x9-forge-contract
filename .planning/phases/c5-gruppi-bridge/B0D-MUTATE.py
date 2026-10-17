from pathlib import Path
import subprocess,json,hashlib,sys
root=Path(sys.argv[1]).resolve()
out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
a='src/agent/agent-deletion.ts';h='src/http/endpoints/internal-agents-deletion.ts'
original={p:(root/p).read_text() for p in [a,h]}
cases=[]
def add(name,p,old,new):cases.append((name,p,[(old,new)]))
def compound(name,p,edits):cases.append((name,p,edits))
add('identity-extra-field',a,'AgentRuntimeIdentitySchema.strict()','AgentRuntimeIdentitySchema.passthrough()')
add('identity-max128',a,'shape.agentId.max(128)','shape.agentId')
add('identity-safe-id',a,'if (!deletionId.safeParse(identity[key]).success)','if (false)')
add('request-id-boundary',a,'AgentDeletionCommandSchema = z.object({\n  requestId: AgentManagementRequestIdSchema','AgentDeletionCommandSchema = z.object({\n  requestId: z.string()')
add('name-max200',a,'.max(200).refine','.refine')
add('name-not-blank',a,'name.trim().length > 0 && ','')
add('name-controls',a,r'!/[\u0000-\u001f\u007f]/.test(name)','true')
add('command-strict',a,"}).strict();\nexport type AgentDeletionCommand","}).passthrough();\nexport type AgentDeletionCommand")
add('command-name-required',a,r"!/[\u0000-\u001f\u007f]/.test(name)),",r"!/[\u0000-\u001f\u007f]/.test(name)).optional(),")
add('command-identity-required',a,'identity: deletionIdentity,\n  confirmedName','identity: deletionIdentity.optional(),\n  confirmedName')
add('success-piece-strict',a,"outcome: z.literal('completed') }).strict()","outcome: z.literal('completed') }).passthrough()")
add('failure-piece-strict',a,"reason: AgentDeletionFailureCodeSchema }).strict()","reason: AgentDeletionFailureCodeSchema }).passthrough()")
add('failure-code-sanitized',a,'reason: AgentDeletionFailureCodeSchema','reason: z.string()')
add('failure-reason-required',a,'reason: AgentDeletionFailureCodeSchema','reason: AgentDeletionFailureCodeSchema.optional()')
add('blocked-reason',a,"reason: z.literal('dependency-failed')","reason: z.string()")
add('tombstone-piece-durable',a,"if (piece.step === 'tombstone' && piece.outcome !== 'completed' && piece.outcome !== 'failed')","if (false)")
compound('required-eight-scopes-composite',a,[('z.array(AgentDeletionPieceSchema).length(8)','z.array(AgentDeletionPieceSchema).min(1).max(16)'),('if (!pieces.has(step))','if (false)')])
compound('unique-scopes-composite',a,[('if (pieces.has(piece.step))','if (false)'),('if (!pieces.has(step))','if (false)')])
add('overall-derived',a,"if ((result.outcome === 'complete') !== complete)",'if (false)')
add('report-management-bound',a,'if (result.agentId !== result.identity.managementAgentId)','if (false)')
add('tombstone-flag-bound',a,"if (result.tombstoned !== (tombstone?.outcome === 'completed'))",'if (false)')
add('blocked-needs-failure',a,'if (blockedWithoutFailure)','if (false)')
add('tombstone-before-effects',a,"const tombstoneFailed = tombstone?.outcome !== 'completed'","const tombstoneFailed = false")
add('admission-before-effects',a,"const admissionFailed = piece.step !== 'admission' && !isFinished(pieces.get('admission'))","const admissionFailed = false")
add('channels-runtime-before-cleanup',a,"const runtimeOrChannelFailed = ['caches', 'context', 'workspace', 'private-state'].includes(piece.step) &&\n      (!isFinished(pieces.get('runtime')) || !isFinished(pieces.get('channels')))","const runtimeOrChannelFailed = false")
add('report-success-literal',a,'ok: z.literal(true)','ok: z.boolean()')
add('report-replay-required',a,'replayed: z.boolean()','replayed: z.boolean().optional()')
add('report-time-iso',a,'completedAt: z.string().datetime()','completedAt: z.string()')
add('report-strict',a,'}).strict().superRefine((result','}).passthrough().superRefine((result')
add('absent-counts-finished',a," || piece?.outcome === 'absent'",'')
add('correlate-request',a,'response.data.requestId === request.data.requestId','true')
add('correlate-address-namespace',a,'addressed.data === expected.managementAgentId','true')
add('correlate-report-address',a,'response.data.agentId === addressed.data','true')
add('correlate-runtime',a,'actual.runtimeAgentId === expected.runtimeAgentId','true')
add('correlate-vault',a,'actual.vaultAgentId === expected.vaultAgentId','true')
add('endpoint-secret',h,"authType: 'secret'","authType: 'token'")
add('endpoint-method',h,"method: 'POST'","method: 'DELETE'")
add('endpoint-path',h,"path: '/internal/agents/:agentId/deletion'","path: '/internal/agents/:agentId/stop'")
add('endpoint-request-schema',h,'bodySchema: AgentDeletionCommandSchema','bodySchema: z.unknown()')
add('endpoint-response-schema',h,'responseSchema: AgentDeletionResultSchema','responseSchema: z.unknown()')
add('endpoint-params-strict',h,'ReloadAgentParamsSchema.strict()','ReloadAgentParamsSchema')
add('endpoint-error-codes',h,'error: AgentDeletionErrorCodeSchema','error: z.string()')
add('endpoint-error-strict',h,'}).strict();\nexport type AgentDeletionErrorResponse','}).passthrough();\nexport type AgentDeletionErrorResponse')
add('endpoint-error-false',h,'ok: z.literal(false)','ok: z.boolean()')
add('path-validation',h,'AgentDeletionParamsSchema.parse({ agentId }).agentId','agentId')
# Redundant guards are audited individually; a survivor is never counted as qualified.
add('redundant-cardinality-alone',a,'z.array(AgentDeletionPieceSchema).length(8)','z.array(AgentDeletionPieceSchema).min(1).max(16)')
add('redundant-uniqueness-alone',a,'if (pieces.has(piece.step))','if (false)')
add('redundant-completeness-alone',a,'if (!pieces.has(step))','if (false)')
node='/Users/admintemp/.nvm/versions/node/v24.21.0/bin/node'
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.21.0/bin:/usr/bin:/bin'}
report={'sourceHashes':{p:hashlib.sha256(s.encode()).hexdigest() for p,s in original.items()},'mutations':[]}
def run(name):
 reportfile=out/(name+'.json');logfile=out/(name+'.log')
 cmd=[node,'node_modules/vitest/vitest.mjs','run','tests/agent/agent-deletion.test.ts','tests/http/endpoints/internal-agents-deletion.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(reportfile)]
 with logfile.open('w') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=60)
 data=json.loads(reportfile.read_text()) if reportfile.exists() else {}
 failures=[v for f in data.get('testResults',[]) for v in f.get('assertionResults',[]) if v['status']=='failed']
 assertion=[v['title'] for v in failures if any('AssertionError' in m for m in v.get('failureMessages',[]))]
 return {'exit':r.returncode,'total':data.get('numTotalTests'),'failed':data.get('numFailedTests'),'assertions':assertion,'report':reportfile.name}
try:
 baseline=run('baseline');report['baseline']=baseline
 if baseline['exit']!=0:raise RuntimeError('baseline not green')
 for i,(name,p,edits) in enumerate(cases,1):
  source=original[p]
  for old,new in edits:
   if old not in source:raise RuntimeError('anchor missing: '+name+': '+old)
   source=source.replace(old,new,1)
  try:
   (root/p).write_text(source)
   status=run(f'mut-{i:02d}-{name}')
   status.update({'name':name,'qualified':status['exit']!=0 and bool(status['assertions']),'edits':len(edits)})
   report['mutations'].append(status)
   print(json.dumps({'i':i,'name':name,'qualified':status['qualified'],'failed':status['failed']}),flush=True)
  finally:(root/p).write_text(original[p])
 report['restored']=run('restored')
finally:
 for p,s in original.items():(root/p).write_text(s)
 report['restoredExact']=all((root/p).read_bytes()==s.encode() for p,s in original.items())
 (out/'mutations.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'qualified':sum(v['qualified'] for v in report['mutations']),'candidates':len(cases),'restoredExact':report['restoredExact']}),flush=True)
