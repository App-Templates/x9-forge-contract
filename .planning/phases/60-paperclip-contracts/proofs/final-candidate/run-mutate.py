from pathlib import Path
import subprocess,json,hashlib,time
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-171-1')
proof=root/'.planning/phases/60-paperclip-contracts/proofs/run-contracts'
proof.mkdir(parents=True,exist_ok=True)
native='src/capability/paperclip/native-admission.ts'
execution='src/capability/paperclip/execution-context.ts'
tool='src/capability/tool-call.ts'
ingress='src/http/endpoints/internal-agent-turn.ts'
original={f:(root/f).read_text() for f in [native,execution,tool,ingress]}
mut=[]
def add(name,file,old,new):
 if old not in original[file]: raise ValueError(name+' absent')
 mut.append((name,file,old,new))
add('native-identity-strict',native,'PaperclipNativeRunIdentitySchema = z.strictObject({','PaperclipNativeRunIdentitySchema = z.object({')
for field in ['companyId','paperclipAgentId','runId','issueId']:
 add('native-'+field+'-uuid',native,field+': z.uuid(),',field+': z.string(),')
add('challenge-format',native,'z.string().regex(/^[a-f0-9]{64}$/)','z.string()')
add('host-timestamp-iso',native,'const HostTimestamp = z.iso.datetime({ offset: true });','const HostTimestamp = z.string();')
add('admission-uuid',native,'admissionId: z.uuid(),','admissionId: z.string(),')
add('challenge-required',native,'challenge: PaperclipAdmissionChallengeSchema,','challenge: PaperclipAdmissionChallengeSchema.optional(),')
add('ordered-host-window',native,'return Date.parse(value.hostIssuedAt) < Date.parse(value.hostDeadlineAt);','return true;')
add('metadata-strict',native,'PaperclipAdmissionMetadataSchema = z.strictObject(AdmissionFields)','PaperclipAdmissionMetadataSchema = z.object(AdmissionFields)')
add('receipt-strict',native,'PaperclipNativeRunReceiptSchema = z.strictObject({','PaperclipNativeRunReceiptSchema = z.object({')
add('receipt-kind',native,"kind: z.literal('paperclip.x9-run-binding'),","kind: z.string(),")
add('receipt-schema-version',native,'schemaVersion: z.literal(1),','schemaVersion: z.number(),')
add('prepare-strict',native,"z.strictObject({ phase: z.literal('prepare'), native:","z.object({ phase: z.literal('prepare'), native:")
add('prepare-native-required',native,"phase: z.literal('prepare'), native: PaperclipNativeRunIdentitySchema","phase: z.literal('prepare'), native: PaperclipNativeRunIdentitySchema.optional()")
add('commit-strict',native,"z.strictObject({ phase: z.literal('commit'), admissionId:","z.object({ phase: z.literal('commit'), admissionId:")
add('commit-admission-required',native,"phase: z.literal('commit'), admissionId: z.uuid()","phase: z.literal('commit'), admissionId: z.uuid().optional()")
add('commit-admission-uuid',native,"phase: z.literal('commit'), admissionId: z.uuid()","phase: z.literal('commit'), admissionId: z.string()")
add('prepared-strict',native,'PaperclipAdmissionPreparedSchema = z.strictObject({','PaperclipAdmissionPreparedSchema = z.object({')
add('committed-strict',native,'PaperclipAdmissionCommittedSchema = z.strictObject({','PaperclipAdmissionCommittedSchema = z.object({')
add('committed-run-required',native,"phase: z.literal('committed'), admissionId: z.uuid(), runId: z.uuid(),","phase: z.literal('committed'), admissionId: z.uuid(), runId: z.uuid().optional(),")
add('committed-run-uuid',native,"phase: z.literal('committed'), admissionId: z.uuid(), runId: z.uuid(),","phase: z.literal('committed'), admissionId: z.uuid(), runId: z.string(),")
add('receipt-correspondence-parse',native,'if (!prepared.success || !receipt.success) return false;','if (!prepared.success || !receipt.success) return true;')
for field in ['admissionId','challenge','companyId','paperclipAgentId','runId','issueId','hostIssuedAt','hostDeadlineAt']:
 add('receipt-correspondence-'+field,native,'wanted.'+field+' === actual.'+field,'true')
add('execution-capability',execution,"capability: z.literal('paperclip'),","capability: z.string(),")
add('execution-source',execution,"source: z.literal('x9_native_admission'),","source: z.string(),")
add('execution-scope-complete',execution,'scope: CapabilityAgentScopeSchema,','scope: CapabilityAgentScopeSchema.partial(),')
add('execution-session',execution,'sessionId: InternalTurnRequestSchema.shape.sessionId,','sessionId: z.string(),')
for field in ['configVersion','provisioningRevision']:
 add('execution-'+field+'-positive',execution,field+': AgentConfigVersionSchema,',field+': z.number(),')
add('execution-correspondence-parse',execution,'if (!readback.success || !execution.success) return false;','if (!readback.success || !execution.success) return true;')
add('execution-correspondence-enabled',execution,'return actual.enabled','return true')
add('execution-correspondence-scope',execution,'sameCapabilityScope(actual.scope, admitted.scope)','true')
for fieldleft,fieldright in [('appliedVersion','configVersion'),('provisioningRevision','provisioningRevision'),('companyId','companyId'),('paperclipAgentId','paperclipAgentId')]:
 add('execution-correspondence-'+fieldright,execution,'actual.'+fieldleft+' === admitted.'+fieldright,'true')
add('host-window-clock-parse',execution,'if (!execution.success || !Number.isFinite(nowMs)) return false;','if (!execution.success || !Number.isFinite(nowMs)) return true;')
add('host-window-issued',execution,'nowMs >= Date.parse(execution.data.hostIssuedAt)','true')
add('host-window-expiry',execution,'nowMs < Date.parse(execution.data.hostDeadlineAt)','true')
add('api-key-wire-name',execution,"PAPERCLIP_API_KEY = 'PAPERCLIP_API_KEY'","PAPERCLIP_API_KEY = 'FOREIGN_API_KEY'")
add('adapter-key-wire-name',execution,"PAPERCLIP_X9_ADAPTER_SECRET = 'PAPERCLIP_X9_ADAPTER_SECRET'","PAPERCLIP_X9_ADAPTER_SECRET = 'FOREIGN_ADAPTER_SECRET'")
add('tool-execution-field',tool,'  executionContext: PaperclipExecutionContextSchema.optional(),','')
add('tool-config-field',tool,'  configVersion: AgentConfigVersionSchema.optional(),','')
add('paperclip-call-strict',tool,'PaperclipToolCallRequestSchema = ToolCallRequestSchema.strict()','PaperclipToolCallRequestSchema = ToolCallRequestSchema')
add('canonical-tool-guard',tool,"if (!(Object.values(PAPERCLIP_TOOLS) as string[]).includes(call.tool)) {","if (false) {")
add('native-execution-required',tool,"    ctx.addIssue({ code: 'custom', path: ['executionContext'], message: 'Native admission required' });",'')
for field in ['tenantId','ownerId','agentId']:
 add('call-scope-'+field,tool,'call.'+field+' !== execution.scope.'+field,'false')
add('call-session',tool,'call.sessionId !== execution.sessionId','false')
add('call-config-version',tool,'call.configVersion !== execution.configVersion','false')
add('own-credential-bag',tool,"if (keys.length !== 1 || keys[0] !== PAPERCLIP_API_KEY || !call.credentials?.[PAPERCLIP_API_KEY]?.trim()) {","if (false) {")
add('minimum-credential-count',tool,'keys.length !== 1 || keys[0]','false || keys[0]')
add('credential-value-required',tool,'|| !call.credentials?.[PAPERCLIP_API_KEY]?.trim()', '|| false')
add('projection-correspondence',tool,"if (!matchesPaperclipExecution(rawReadback, rawExecution)) throw new Error('Paperclip binding mismatch');","if (false) throw new Error('Paperclip binding mismatch');")
add('projection-scope',tool,'    ...executionContext.scope,','')
add('projection-session',tool,'sessionId: executionContext.sessionId,',"sessionId: 'wrong-session',")
add('projection-config-version',tool,'configVersion: executionContext.configVersion,','configVersion: 9,')
add('ingress-admission-validation',ingress,'  paperclipAdmission: z.lazy(() => PaperclipAdmissionRequestSchema).optional(),','')
add('ingress-response-validation',ingress,'  paperclipAdmission: z.lazy(() => PaperclipAdmissionResponseSchema).optional(),','')
for condition in ['body.turn !== undefined','body.attachment !== undefined','body.history !== undefined']:
 add('ingress-excludes-'+condition.split('.')[1].split(' ')[0],ingress,condition,'false')
for condition in ["body.reply !== ''",'body.updatedHistory.length !== 0','body.moveId !== undefined','body.lead !== undefined','body.note !== undefined']:
 add('prepared-excludes-'+condition.split('.')[1].split(' ')[0],ingress,condition,'false')
command=['pnpm','exec','vitest','run','tests/paperclip-execution-context.test.ts','--maxWorkers=2']
report={'sourceHashes':{f:hashlib.sha256(s.encode()).hexdigest() for f,s in original.items()},'mutations':[]}
start=time.time()
try:
 for name,file,old,new in mut:
  target=root/file; target.write_text(original[file].replace(old,new,1))
  try:
   run=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=20)
   raw=run.stdout
   semantic=run.returncode!=0 and 'AssertionError' in raw and not any(x in raw for x in ['SyntaxError','TypeError:','Failed to resolve','Cannot find module'])
   (proof/(name+'.log')).write_text(raw)
   report['mutations'].append({'name':name,'file':file,'exitCode':run.returncode,'semanticRed':semantic,'logSha256':hashlib.sha256(raw.encode()).hexdigest()})
   print(name+': '+('ASSERTION_RED' if semantic else 'UNQUALIFIED'),flush=True)
  finally: target.write_text(original[file])
  if not semantic: break
finally:
 for file,s in original.items(): (root/file).write_text(s)
 report['exactRestore']=all((root/f).read_text()==s for f,s in original.items())
 final=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=20)
 (proof/'restored-green.log').write_text(final.stdout)
 report.update({'planned':len(mut),'qualified':sum(x['semanticRed'] for x in report['mutations']),'restoredGreenExit':final.returncode,'elapsedSeconds':round(time.time()-start,2)})
 (proof/'qualification.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps({k:v for k,v in report.items() if k not in ['sourceHashes','mutations']}),flush=True)
 if report['qualified']!=len(mut) or final.returncode!=0 or not report['exactRestore']:raise SystemExit(1)
