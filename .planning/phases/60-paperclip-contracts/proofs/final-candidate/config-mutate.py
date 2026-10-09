from pathlib import Path
import subprocess,json,hashlib,time
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-171-1')
proof=root/'.planning/phases/60-paperclip-contracts/proofs/candidate-config'
proof.mkdir(parents=True,exist_ok=True)
config='src/capability/paperclip/agent-config.ts'
http='src/http/endpoints/internal-capability-agent.ts'
core='src/agent/agent-context-core.ts'
reload='src/http/endpoints/internal-agents-reload.ts'
original={f:(root/f).read_text() for f in [config,http,core,reload]}
mut=[]
def add(name,file,old,new):
 if old not in original[file]: raise ValueError(name+' absent')
 mut.append((name,file,old,new))
add('desired-strict',config,'PaperclipAgentConfigSchema = z.strictObject({','PaperclipAgentConfigSchema = z.object({')
add('desired-agent-path',config,'agentId: CapabilityAgentIdSchema,','agentId: z.string(),')
add('desired-version',config,'version: AgentConfigVersionSchema,','version: z.number(),')
add('desired-unit',config,'unitId: PaperclipAgentBindingSchema.shape.unitId,','unitId: z.string(),')
add('desired-role',config,'roleRef: PaperclipAgentBindingSchema.shape.unitId,','roleRef: z.string(),')
add('fingerprint-format',config,"z.string().regex(/^[a-f0-9]{64}$/)","z.string()")
add('provenance-source',config,"source: z.literal('native_operator_inventory'),","source: z.string(),")
add('provenance-strict',config,'PaperclipProvisioningProvenanceSchema = z.strictObject({','PaperclipProvisioningProvenanceSchema = z.object({')
add('binding-caller-role-required',config,'callerRoleRef: PaperclipAgentConfigSchema.shape.roleRef,','callerRoleRef: PaperclipAgentConfigSchema.shape.roleRef.optional(),')
add('binding-provision-revision',config,'provisioningRevision: AgentConfigVersionSchema,','provisioningRevision: AgentConfigVersionSchema.optional(),')
add('binding-provenance-required',config,'provenance: PaperclipProvisioningProvenanceSchema,','provenance: PaperclipProvisioningProvenanceSchema.optional(),')
add('install-strict',config,'PaperclipAgentInstallRequestSchema = z.strictObject({','PaperclipAgentInstallRequestSchema = z.object({')
add('install-scope-required',config,'scope: CapabilityAgentScopeSchema,\n  version:','scope: CapabilityAgentScopeSchema.partial(),\n  version:')
add('install-version',config,'scope: CapabilityAgentScopeSchema,\n  version: AgentConfigVersionSchema,','scope: CapabilityAgentScopeSchema,\n  version: z.number(),')
add('install-state-type',config,'version: AgentConfigVersionSchema,\n  enabled: z.boolean(),','version: AgentConfigVersionSchema,\n  enabled: z.coerce.boolean(),')
add('install-registry-required',config,'registryFingerprint: PaperclipConfigFingerprintSchema,','registryFingerprint: PaperclipConfigFingerprintSchema.optional(),')
add('readback-applied-version',config,'appliedVersion: AgentConfigVersionSchema,','appliedVersion: z.number(),')
add('readback-config-required',config,'configFingerprint: PaperclipConfigFingerprintSchema,','configFingerprint: PaperclipConfigFingerprintSchema.optional(),')
add('correspondence-shape',config,'if (!request.success || !readback.success) return false;','if (!request.success || !readback.success) return true;')
add('correspondence-scope',config,'sameCapabilityScope(wanted.scope, actual.scope)','true')
add('correspondence-version',config,'wanted.version === actual.appliedVersion','true')
add('correspondence-enabled',config,'wanted.enabled === actual.enabled','true')
add('correspondence-registry',config,'wanted.registryFingerprint === actual.registryFingerprint','true')
add('installation-wrapper-strict',config,'PaperclipCapabilityInstallationSchema = z.strictObject({','PaperclipCapabilityInstallationSchema = z.object({')
add('attestation-wrapper-strict',config,'PaperclipCapabilityAttestationSchema = z.strictObject({','PaperclipCapabilityAttestationSchema = z.object({')
add('installation-capability',config,"capability: z.literal('paperclip'),\n  installation:","capability: z.string(),\n  installation:")
add('attestation-capability',config,"capability: z.literal('paperclip'),\n  readback:","capability: z.string(),\n  readback:")
add('context-bound',core,'z.array(PaperclipCapabilityInstallationSchema).max(1)','z.array(PaperclipCapabilityInstallationSchema).max(2)')
add('context-install-validation',core,'    capabilityInstallations: z.array(PaperclipCapabilityInstallationSchema).max(1).optional(),','')
add('reload-bound',reload,'z.array(PaperclipCapabilityAttestationSchema).max(1)','z.array(PaperclipCapabilityAttestationSchema).max(2)')
add('reload-attestation-validation',reload,'  capabilityAttestations: z.array(PaperclipCapabilityAttestationSchema).max(1).optional(),','')
for name,method,tail in [('paperclipAgentConfigPutContract','PUT','config'),('paperclipAgentConfigGetContract','GET','config'),('paperclipAgentInstallContract','POST','install'),('paperclipAgentReadbackContract','GET','readback')]:
 add(name+'-auth',http,f"export const {name} = {{\n  method: '{method}' as const,\n  path: '/internal/capability/agents/:agentId/{tail}' as const,\n  authType: 'secret' as const,",f"export const {name} = {{\n  method: '{method}' as const,\n  path: '/internal/capability/agents/:agentId/{tail}' as const,\n  authType: 'token' as const,")
 add(name+'-path',http,f"export const {name} = {{\n  method: '{method}' as const,\n  path: '/internal/capability/agents/:agentId/{tail}' as const,",f"export const {name} = {{\n  method: '{method}' as const,\n  path: '/internal/capability/agents/:agentId/wrong' as const,")
 add(name+'-method',http,f"export const {name} = {{\n  method: '{method}' as const,",f"export const {name} = {{\n  method: 'DELETE' as const,")
add('install-helper-tail',http,"agentPath(agentId, 'install')","agentPath(agentId, 'config')")
add('readback-helper-tail',http,"agentPath(agentId, 'readback')","agentPath(agentId, 'config')")
add('readback-strict',config,'PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.extend({','PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.loose().extend({')
add('readback-scope-strict',config,'PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.extend({','PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.extend({\n  scope: CapabilityAgentScopeSchema.passthrough(),')
add('readback-state-type',config,'PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.extend({','PaperclipAgentReadbackSchema = PaperclipAppliedAgentBindingSchema.extend({\n  enabled: z.coerce.boolean(),')
command=['pnpm','exec','vitest','run','tests/paperclip-agent-config.test.ts','tests/paperclip-http-contracts.test.ts','--maxWorkers=2']
report={'sourceHashes':{f:hashlib.sha256(s.encode()).hexdigest() for f,s in original.items()},'mutations':[]}
start=time.time()
try:
 for name,file,old,new in mut:
  target=root/file
  target.write_text(original[file].replace(old,new,1))
  try:
   run=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=20)
   raw=run.stdout
   semantic=run.returncode!=0 and 'AssertionError' in raw and not any(x in raw for x in ['SyntaxError','TypeError:','Failed to resolve','Cannot find module'])
   (proof/(name+'.log')).write_text(raw)
   report['mutations'].append({'name':name,'file':file,'exitCode':run.returncode,'semanticRed':semantic,'logSha256':hashlib.sha256(raw.encode()).hexdigest()})
   print(name+': '+('ASSERTION_RED' if semantic else 'UNQUALIFIED'),flush=True)
  finally:
   target.write_text(original[file])
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
