from pathlib import Path
import subprocess,json,hashlib,re
root=Path('/private/tmp/b139-consumer');dist=root/'node_modules/@x9-forge/contracts/dist'
a='agent/agent-workspace-attestation.cjs';m='agent/agent-management.cjs';w='agent/agent-workspace.cjs';h='http/endpoints/internal-agents-list.cjs';c='agent/agent-inventory-metadata.cjs';r='agent/agent-runtime-state.cjs'
original={p:(dist/p).read_text() for p in [a,m,w,h,c,r]}
recipes=[
('workspace-positive-version',a,None,'appliedVersion: agent_config_js_1.AgentConfigVersionSchema','appliedVersion: zod_1.z.number().int()'),
('workspace-safe-version',a,None,'appliedVersion: agent_config_js_1.AgentConfigVersionSchema','appliedVersion: zod_1.z.number().refine(Number.isInteger).positive()'),
('workspace-integer-version',a,None,'appliedVersion: agent_config_js_1.AgentConfigVersionSchema','appliedVersion: zod_1.z.number().positive()'),
('workspace-hash',a,None,'/^[a-f0-9]{64}$/','/^.{64}$/'),
('workspace-date',a,None,'zod_1.z.iso.datetime({ offset: true })','zod_1.z.string()'),
('workspace-strict',a,None,'}).strict();','});'),
('workspace-selector-validation',w,'function attestedWorkspaceVersionOf','return selected.success ? selected.data.appliedVersion : null;','return row.workspace?.appliedVersion ?? null;'),
('workspace-selector-no-fallback',w,'function attestedWorkspaceVersionOf','return selected.success ? selected.data.appliedVersion : null;','return selected.success ? selected.data.appliedVersion : row.configVersion ?? null;'),
('workspace-selector-null',w,'function attestedWorkspaceVersionOf','return selected.success ? selected.data.appliedVersion : null;','return selected.success ? selected.data.appliedVersion : 0;'),
('workspace-command-binding',m,None,'addWorkspaceVersionIssues(result.workspace, result.versions, ctx);','void result.workspace;'),
('workspace-state-binding',m,None,'addWorkspaceVersionIssues(state.workspace, state.versions, ctx);','void state.workspace;'),
('workspace-command-null-outcome',m,None,'result.workspace === null && !result.results.some','false && !result.results.some'),
]
for label,p,region in [('command',m,'exports.AgentManagementCommandResultSchema = zod_1.z.object('),('state',m,'exports.AgentManagementStateSchema = zod_1.z.object('),('list',h,'exports.ListAgentsAgentSchema = zod_1.z.object(')]:
 field='workspace: agent_workspace_attestation_js_1.AgentWorkspaceAttestationSchema.nullable().optional(),'
 recipes.extend([(label+'-optional',p,region,field,field.replace('.optional()','')),(label+'-nullable',p,region,field,field.replace('.nullable()','')),(label+'-retained',p,region,field,'// Workspace field removed.')])
cap='capability_registry_entry_js_1.CapabilityRegistryEntrySchema.pick({ name: true, enabled: true }).strict()'
recipes.extend([
('cap-name',c,None,cap,cap.replace('.strict()', '.extend({ name: zod_1.z.any() }).strict()')),
('cap-enabled',c,None,cap,cap.replace('.strict()', '.extend({ enabled: zod_1.z.any() }).strict()')),
('cap-strict',c,None,cap,cap.replace('.strict()','')),
('cap-array',c,None,'zod_1.z.array(exports.AgentInventoryCapabilitySchema)','zod_1.z.any()'),
('cap-selector-null',c,None,'return selected.success ? selected.data : null;','return selected.success ? selected.data : [];'),
('cap-selector-current',c,None,'return selected.success ? selected.data : null;','return selected.success ? [] : null;'),
('cap-row-optional',h,None,'capabilities: agent_inventory_metadata_js_1.AgentInventoryCapabilitiesSchema.nullable().optional(),','capabilities: agent_inventory_metadata_js_1.AgentInventoryCapabilitiesSchema.nullable(),'),
('cap-row-nullable',h,None,'capabilities: agent_inventory_metadata_js_1.AgentInventoryCapabilitiesSchema.nullable().optional(),','capabilities: agent_inventory_metadata_js_1.AgentInventoryCapabilitiesSchema.optional(),'),
('cap-row-retained',h,None,'capabilities: agent_inventory_metadata_js_1.AgentInventoryCapabilitiesSchema.nullable().optional(),','// Capability observation removed.'),
('telegram-name-type',r,None,'botUsername: zod_1.z.string().optional(),','botUsername: zod_1.z.any().optional(),'),
('telegram-count-safe',r,None,'allowFromCount: zod_1.z.number().int().nonnegative().optional(),','allowFromCount: zod_1.z.number().refine(Number.isInteger).nonnegative().optional(),'),
('telegram-count-integer',r,None,'allowFromCount: zod_1.z.number().int().nonnegative().optional(),','allowFromCount: zod_1.z.number().nonnegative().optional(),'),
('telegram-count-positive',r,None,'allowFromCount: zod_1.z.number().int().nonnegative().optional(),','allowFromCount: zod_1.z.number().int().optional(),'),
('telegram-count-retained',r,None,'allowFromCount: zod_1.z.number().int().nonnegative().optional(),','// Count field removed.'),
('telegram-kind',r,None,"channel.kind !== 'telegram' && (channel.botUsername !== undefined || channel.allowFromCount !== undefined)",'false'),
('telegram-no-ids',r,None,"return {\n        ...(botUsername === undefined ? {} : { botUsername }),\n        ...(allowFromCount === undefined ? {} : { allowFromCount }),\n    };",'return channel;'),
('telegram-name-no-default',r,None,'...(botUsername === undefined ? {} : { botUsername }),',"botUsername: botUsername ?? '',"),
('telegram-count-no-default',r,None,'...(allowFromCount === undefined ? {} : { allowFromCount }),','allowFromCount: allowFromCount ?? 0,'),
('source-available',h,'function getListAgentsCapabilities',"if (!response.success || response.data.source?.availability !== 'available')",'if (!response.success)'),
('source-exact-agent',h,'function getListAgentsCapabilities',"return (0, agent_inventory_metadata_js_1.agentCapabilitiesOf)(agent);","return (0, agent_inventory_metadata_js_1.agentCapabilitiesOf)(agent ?? response.data.agents[0]);"),
])
def run(label):
 log=Path('/private/tmp/b139-compiled-'+label+'.tap');cmd=['/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node','--test','--test-reporter=tap','workspace.cjs','metadata.cjs'];result=subprocess.run(cmd,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);log.write_text(result.stdout)
 return {'exit':result.returncode,'assertion_errors':result.stdout.count("code: 'ERR_ASSERTION'"),'pass':int(re.search(r'^# pass (\d+)$',result.stdout,re.M)[1]),'tests':int(re.search(r'^# tests (\d+)$',result.stdout,re.M)[1]),'log':str(log)}
records=[]
try:
 baseline=run('baseline');assert baseline['exit']==0 and baseline['tests']==85
 for label,p,region,old,new in recipes:
  s=original[p];start=s.index(region) if region else 0;pos=s.index(old,start);(dist/p).write_text(s[:pos]+s[pos:].replace(old,new,1));red=run(label);(dist/p).write_text(s);green=run(label+'-restore')
  entry={'name':label,'file':p,'qualified':red['exit']!=0 and red['assertion_errors']>0,'red':red,'restore':green,'sha_restored':(dist/p).read_text()==s};records.append(entry)
  Path('/private/tmp/b139-compiled-mutations.json').write_text(json.dumps({'baseline':baseline,'records':records,'sha256':{p:hashlib.sha256(s.encode()).hexdigest() for p,s in original.items()}},indent=2)+'\n');print(label,entry['qualified'],flush=True)
  assert entry['qualified'] and green['exit']==0 and green['tests']==85 and entry['sha_restored'],label
finally:
 for p,s in original.items():(dist/p).write_text(s)
