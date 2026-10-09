import json,hashlib,subprocess,os,time
from pathlib import Path
repo=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1')
work=Path('/Users/admintemp/Documents/Codex/2026-10-08/tu-sei-codex-f-crea-in/work/c5-modelli-consumatori')
files=['src/model-router/model-consumers.ts','src/model-router/model-slot.ts','src/model-router/model-catalog.ts','src/model-router/capability-model-settings.ts','src/model-router/agent-model-configuration.ts','src/model-router/model-consumer-execution.ts','src/model-router/models-batch.ts','src/agent/agent-management.ts']
original={f:(repo/f).read_bytes() for f in files};report={'mutations':[],'started':time.strftime('%Y-%m-%dT%H:%M:%S%z')}
mutations=[]
def add(name,f,old,new,section=None):
 text=original[f].decode();a=text.index(section) if section else 0
 if text[a:].count(old)!=1:raise ValueError((name,old,text[a:].count(old)))
 index=text.index(old,a);mutations.append((name,f,text[:index]+new+text[index+len(old):]))
f='src/model-router/model-consumers.ts'
add('definition-label',f,'label: z.string().trim().min(1).max(120)','label: z.string().trim().min(1).max(120).optional()')
for field,old in [('scope',"z.enum(['agent', 'service', 'session', 'remote-agent', 'pipeline'])"),('boundary',"z.enum(['next-turn', 'next-call', 'next-session', 'rebuild', 'remote-update'])"),('routing',"z.enum(['tiered', 'single', 'failover'])")]:add('definition-'+field,f,old,old+'.optional()')
add('inventory-empty',f,'.min(1).max(34)','.min(0).max(34)')
add('inventory-range',f,'/^C(?:0[1-9]|[12][0-9]|3[0-4])$/','/^C[0-9]{2}$/')
add('inventory-unique',f,'new Set(ids).size === ids.length','true')
add('definition-strict',f,"}).strict();\nexport type ModelConsumerDefinition", "}).passthrough();\nexport type ModelConsumerDefinition")
add('definition-detached',f,'return structuredClone(definitions);','return definitions;')
add('definition-lookup-detached',f,'return found === undefined ? undefined : structuredClone(found);','return found;',section='export function findModelConsumerDefinition')
add('definition-label-distinct',f,"label: value.slotId.split('_').map(word => word[0]!.toUpperCase() + word.slice(1)).join(' ')","label: 'Same label'")
f='src/model-router/model-slot.ts'
add('source-version-blank',f,'z.string().trim().min(1).max(128)','z.string().trim().max(128)')
add('bootstrap-absence',f,'expectedAbsent: z.literal(true)','expectedAbsent: z.boolean()')
f='src/model-router/model-catalog.ts'
add('vision-boolean',f,'vision: z.boolean().optional()','vision: z.any().optional()')
add('websearch-boolean',f,'webSearch: z.boolean().optional()','webSearch: z.any().optional()')
f='src/model-router/capability-model-settings.ts'
add('single-dimension-required',f,"if ((settings.function === 'embedding') !== (settings.embeddingDimensions !== undefined))",'if (false)')
add('single-dimension-positive',f,'embeddingDimensions: z.number().int().positive().optional()','embeddingDimensions: z.number().optional()')
add('single-strict',f,"}).strict().superRefine((settings, ctx) => {\n  if ((settings.function === 'embedding')", "}).passthrough().superRefine((settings, ctx) => {\n  if ((settings.function === 'embedding')")
add('failover-strict',f,"}).strict().superRefine((settings, ctx) => {\n  if (settings.function === 'embedding')", "}).passthrough().superRefine((settings, ctx) => {\n  if (settings.function === 'embedding')")
add('catalog-vision',f,'settings.requirements.vision === true && entry.features.vision !== true','false')
add('catalog-websearch',f,'settings.requirements.webSearch === true && entry.features.webSearch !== true','false')
add('catalog-dimension',f,"if (settings.mode === 'single' && settings.function === 'embedding' && entry.embeddingDimensions !== settings.embeddingDimensions)",'if (false)')
add('single-position',f,"[{ tier: 'primary', descriptor: settings.descriptor }]","[{ tier: 'standard', descriptor: settings.descriptor }]")
add('failover-position',f,"[{ tier: 'primary', descriptor: settings.primary }, { tier: 'fallback', descriptor: settings.fallback }]","[{ tier: 'primary', descriptor: settings.primary }]")
add('settings-equivalence-mode-authority',f,'if (x.capability !== y.capability || x.function !== y.function || x.catalogVersion !== y.catalogVersion || x.mode !== y.mode)','if (false)')
add('settings-equivalence-features',f,'if (!sameModelFeatures(x.requirements, y.requirements))','if (false)')
f='src/model-router/agent-model-configuration.ts'
add('source-role',f,"role: z.literal('master'), authority: z.literal('runtime-loaded')","role: z.string(), authority: z.literal('runtime-loaded')")
add('source-authority',f,"authority: z.literal('runtime-loaded')","authority: z.string()")
add('source-strict',f,"}).strict().superRefine((source, ctx) => {","}).passthrough().superRefine((source, ctx) => {")
add('source-scope',f,'if (source.scope.agentId !== source.identity.runtimeAgentId)','if (false)')
add('source-validity-order',f,'if (Date.parse(source.validUntil) <= Date.parse(source.observedAt))','if (false)')
add('source-coverage',f,'if (new Set(all).size !== all.length || all.length !== registered.length || registered.some(slot => !all.includes(slot)))','if (false)')
add('source-complete-missing',f,"if ((source.coverage === 'complete') !== (source.missingSlots.length === 0) || (source.coverage === 'complete' && source.selections.length === 0))", "if (source.coverage === 'complete' && source.selections.length === 0)")
add('source-complete-empty',f,"if ((source.coverage === 'complete') !== (source.missingSlots.length === 0) || (source.coverage === 'complete' && source.selections.length === 0))", "if ((source.coverage === 'complete') !== (source.missingSlots.length === 0))")
add('source-consumer-binding',f,"if (consumer === undefined || consumer.capability !== actual.capability || consumer.function !== actual.function || !sameModelFeatures(consumer.requirements, actual.requirements) || consumer.routing !== (actual.mode === 'single' ? 'single' : actual.mode === 'failover' ? 'failover' : 'tiered'))",'if (false)')
add('source-exclusion-state',f,"state: z.enum(['not-installed', 'not-applicable'])","state: z.string()")
add('source-exclusion-reason',f,"reason: z.string().trim().min(1).max(500) }).strict()","reason: z.string().trim().max(500) }).strict()")
add('source-exclusion-strict',f,"reason: z.string().trim().min(1).max(500) }).strict()","reason: z.string().trim().min(1).max(500) }).passthrough()")
add('source-current-complete',f,"source.coverage !== 'complete' || source.selections.length === 0 || ",'')
add('source-current-freshness',f,"!Number.isFinite(time) || time < Date.parse(source.observedAt) - 5_000 || time >= Date.parse(source.validUntil)",'false')
add('source-current-generation',f,'source.sourceVersion === expectation.sourceVersion','true')
add('source-current-identity',f,'sameModelAgentIdentity(source.identity, expectation.identity)','true')
add('source-current-owner',f,'sameCapabilityScope(source.scope, expectation.scope)','true')
add('source-state-identity',f,'if (!sameModelAgentIdentity(state.identity, state.bootstrapSource.identity))','if (false)')
add('source-state-no-saved-claim',f,'if (state.saved !== null || state.runtime !== null || state.versions !== null)','if (false)')
add('runtime-match-identity-version',f,'if (!sameModelAgentIdentity(saved.identity, actual.identity) || saved.configVersion !== actual.configVersion)','if (false)',section='export function isAgentModelRuntimeConfigurationMatching')
add('runtime-match-freshness',f,'if (!Number.isFinite(timestamp) || timestamp < observed - 5_000 || timestamp > observed + 60_000)','if (false)',section='export function isAgentModelRuntimeConfigurationMatching')
add('runtime-match-count',f,'if (actual.selections.length !== saved.selections.reduce((count, slot) => count + modelSettingsSelections(slot.settings).length, 0))','if (false)',section='export function isAgentModelRuntimeConfigurationMatching')
add('runtime-match-dimension',f,"const dimensionMatches = slot.settings.mode !== 'single' || slot.settings.function !== 'embedding' || selection?.embeddingDimensions === slot.settings.embeddingDimensions;",'const dimensionMatches = true;')
add('runtime-match-descriptor',f,'sameModelDescriptor(selection.descriptor, descriptor)','true',section='export function isAgentModelRuntimeConfigurationMatching')
f='src/model-router/model-consumer-execution.ts'
add('install-canonical-binding',f,'definition.capability === settings.capability && definition.function === settings.function && definition.routing === routing && sameModelFeatures(definition.requirements, settings.requirements)','true')
add('install-scope',f,'if (value.scope.agentId !== value.identity.runtimeAgentId)','if (false)')
add('install-request-strict',f,'}).strict().superRefine((request, ctx) => {\n  checkScope(request, ctx);\n  if (!isRegistered','}).passthrough().superRefine((request, ctx) => {\n  checkScope(request, ctx);\n  if (!isRegistered')
add('readback-registered-selection',f,'if (state.settings !== null && !isRegisteredModelConsumerSelection(state.slotId, state.settings))','if (false)')
add('readback-window-order',f,'if (Date.parse(state.validUntil) <= Date.parse(state.observedAt))','if (false)')
add('readback-status-reason',f,"if ((state.status === 'installed') !== (state.reason === null))",'if (false)')
add('readback-installed-completeness',f,"if (state.status === 'installed' && (state.settings === null || state.configVersion === null || state.requestId === null))",'if (false)')
add('readback-strict',f,'}).strict().superRefine((state, ctx) => {','}).passthrough().superRefine((state, ctx) => {')
add('readback-rebuild-complete',f,"if (state.status === 'installed' && state.embedding.state !== 'completed')",'if (false)')
add('receipt-correspondence',f,"if (receipt.outcome === 'installed' && (receipt.state.status !== 'installed' || receipt.state.requestId !== receipt.requestId))",'if (false)')
add('receipt-pending-not-installed',f,"if (receipt.outcome !== 'installed' && receipt.state.status === 'installed')",'if (false)')
add('receipt-strict',f,'}).strict().superRefine((receipt, ctx) => {','}).passthrough().superRefine((receipt, ctx) => {')
add('install-cas-generation',f,'request.data.expectedSourceVersion === source.data.sourceVersion','true')
add('install-cas-identity',f,'sameModelAgentIdentity(request.data.identity, source.data.identity)','true')
add('install-cas-scope',f,'sameCapabilityScope(request.data.scope, source.data.scope)','true')
add('confirmation-clock',f,"!Number.isFinite(time) || time < Date.parse(state.observedAt) - 5_000 || time >= Date.parse(state.validUntil)",'false')
add('confirmation-receipt-authority',f,'if (receipt.requestId !== request.requestId || state.requestId !== request.requestId || state.configVersion !== request.configVersion || state.slotId !== request.slotId)','if (false)')
add('confirmation-identity',f,'sameModelAgentIdentity(request.identity, state.identity)','true')
add('confirmation-scope',f,'sameCapabilityScope(request.scope, state.scope)','true')
add('confirmation-settings',f,'sameCapabilityModelSettings(request.settings, state.settings)','true')
add('route-body-slot',f,'path.data.slotId === request.data.slotId','true')
f='src/agent/agent-management.ts'
add('bootstrap-replay',f," && a.modelBootstrap?.expectedSourceVersion === b.modelBootstrap?.expectedSourceVersion && a.modelBootstrap?.expectedAbsent === b.modelBootstrap?.expectedAbsent",'')
# one serialized test process; each mutant restored even on exception
node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node'
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/opt/homebrew/bin:/usr/bin:/bin'}
def run(label):
 out=work/(label+'.json');log=work/(label+'.log')
 with log.open('w') as stream:
  result=subprocess.run([node,'node_modules/vitest/vitest.mjs','run','tests/model-router/c5-model-consumers.test.ts','tests/model-router/c5-model-consumer-execution.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(out)],cwd=repo,env=env,stdout=stream,stderr=subprocess.STDOUT,timeout=80)
 data=json.loads(out.read_text())
 failures=[{'name':t['fullName'],'message':t['failureMessages'][0].split('\n')[0]} for s in data['testResults'] for t in s['assertionResults'] if t['status']=='failed']
 return result.returncode,data,failures
try:
 code,data,fail=run('MUT-BASE')
 if code or data['numFailedTests']:raise RuntimeError(('baseline',code,fail))
 report['baseline']={'exit':code,'passed':data['numPassedTests'],'total':data['numTotalTests']}
 for index,(name,file,mutated) in enumerate(mutations):
  path=repo/file
  try:
   path.write_text(mutated)
   code,data,fail=run('MUT-'+str(index+1).zfill(3))
   semantic=[f for f in fail if f['message'].startswith('AssertionError')]
   technical=[f for f in fail if not f['message'].startswith('AssertionError')]
   entry={'name':name,'file':file,'exit':code,'assertions':len(semantic),'technical':technical,'witnesses':semantic[:3]}
   report['mutations'].append(entry)
   if code==0 or not semantic: raise RuntimeError(('not-qualified',entry))
  finally:path.write_bytes(original[file])
  print(f'{index+1}/{len(mutations)} {name} semantic={len(semantic)}',flush=True)
 code,data,fail=run('MUT-RESTORED')
 report['restored']={'exit':code,'passed':data['numPassedTests'],'total':data['numTotalTests']}
 if code or fail:raise RuntimeError(('restore-green',code,fail))
finally:
 for f,content in original.items():(repo/f).write_bytes(content)
 report['hashesRestored']={f:hashlib.sha256((repo/f).read_bytes()).hexdigest()==hashlib.sha256(b).hexdigest() for f,b in original.items()}
 report['finished']=time.strftime('%Y-%m-%dT%H:%M:%S%z')
 (work/'MUTATIONS.json').write_text(json.dumps(report,indent=2))
