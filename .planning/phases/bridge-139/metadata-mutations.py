from pathlib import Path
import subprocess, json, hashlib, os
root=Path(__file__).resolve().parents[3]
c='src/agent/agent-inventory-metadata.ts';r='src/agent/agent-runtime-state.ts';h='src/http/endpoints/internal-agents-list.ts';i='src/agent/index.ts'
original={p:(root/p).read_text() for p in [c,r,h,i]}
cap='CapabilityRegistryEntrySchema.pick({ name: true, enabled: true }).strict()'
recipes=[
('cap-name-type',c,cap,cap.replace('.strict()', '.extend({ name: z.any() }).strict()')),
('cap-name-required',c,cap,cap.replace('.strict()', '.extend({ name: CapabilityRegistryEntrySchema.shape.name.optional() }).strict()')),
('cap-name-nonempty',c,cap,cap.replace('.strict()', '.extend({ name: z.string() }).strict()')),
('cap-enabled-type',c,cap,cap.replace('.strict()', '.extend({ enabled: z.any() }).strict()')),
('cap-enabled-required',c,cap,cap.replace('.strict()', '.extend({ enabled: z.boolean().optional() }).strict()')),
('cap-metadata-only',c,cap,cap.replace('.strict()', '')),
('cap-array',c,'z.array(AgentInventoryCapabilitySchema)','z.any()'),
('cap-row-object',c,"if (row === null || typeof row !== 'object') return null;","if (row !== null && typeof row === 'object') return null;"),
('cap-selector-validation',c,'return selected.success ? selected.data : null;','return (row as { capabilities?: unknown }).capabilities as AgentInventoryCapability[];'),
('cap-unknown-no-empty',c,'return selected.success ? selected.data : null;','return selected.success ? selected.data : [];'),
('cap-fresh-selection',c,'return selected.success ? selected.data : null;',"return selected.success ? [] : null;"),
('cap-schema-export',c,'export const AgentInventoryCapabilitySchema','const AgentInventoryCapabilitySchema'),
('cap-helper-export',c,'export function agentCapabilitiesOf','function agentCapabilitiesOf'),
('cap-agent-export',i,"export * from './agent-inventory-metadata.js';",'// Public inventory metadata exports removed.'),
('row-cap-optional',h,'capabilities: AgentInventoryCapabilitiesSchema.nullable().optional(),','capabilities: AgentInventoryCapabilitiesSchema.nullable(),'),
('row-cap-nullable',h,'capabilities: AgentInventoryCapabilitiesSchema.nullable().optional(),','capabilities: AgentInventoryCapabilitiesSchema.optional(),'),
('row-cap-retained',h,'capabilities: AgentInventoryCapabilitiesSchema.nullable().optional(),','// Capability observation removed.'),
('telegram-username-type',r,'botUsername: z.string().optional(),','botUsername: z.any().optional(),'),
('telegram-username-optional',r,'botUsername: z.string().optional(),','botUsername: z.string(),'),
('telegram-username-retained',r,'botUsername: z.string().optional(),','// Username field removed.'),
('telegram-count-numeric',r,'allowFromCount: z.number().int().nonnegative().optional(),','allowFromCount: z.any().optional(),'),
('telegram-count-integer',r,'allowFromCount: z.number().int().nonnegative().optional(),','allowFromCount: z.number().nonnegative().optional(),'),
('telegram-count-safe',r,'allowFromCount: z.number().int().nonnegative().optional(),','allowFromCount: z.number().refine(Number.isInteger).nonnegative().optional(),'),
('telegram-count-nonnegative',r,'allowFromCount: z.number().int().nonnegative().optional(),','allowFromCount: z.number().int().optional(),'),
('telegram-count-optional',r,'allowFromCount: z.number().int().nonnegative().optional(),','allowFromCount: z.number().int().nonnegative(),'),
('telegram-count-retained',r,'allowFromCount: z.number().int().nonnegative().optional(),','// Count field removed.'),
('telegram-kind-only',r,"channel.kind !== 'telegram' && (channel.botUsername !== undefined || channel.allowFromCount !== undefined)",'false'),
('telegram-name-kind',r,"(channel.botUsername !== undefined || channel.allowFromCount !== undefined)","channel.allowFromCount !== undefined"),
('telegram-count-kind',r,"(channel.botUsername !== undefined || channel.allowFromCount !== undefined)","channel.botUsername !== undefined"),
('telegram-selector-validation',r,'if (!selected.success) return null;','if (selected.success) return null;'),
('telegram-unknown-no-empty',r,'if (botUsername === undefined && allowFromCount === undefined) return null;','if (botUsername === undefined && allowFromCount === undefined) return {};'),
('telegram-name-only',r,'if (botUsername === undefined && allowFromCount === undefined) return null;','if (allowFromCount === undefined) return null;'),
('telegram-count-only',r,'if (botUsername === undefined && allowFromCount === undefined) return null;','if (botUsername === undefined) return null;'),
('telegram-no-ids',r,"return {\n    ...(botUsername === undefined ? {} : { botUsername }),\n    ...(allowFromCount === undefined ? {} : { allowFromCount }),\n  };",'return channel as AgentTelegramChannelMetadata;'),
('telegram-no-name-default',r,'...(botUsername === undefined ? {} : { botUsername }),',"botUsername: botUsername ?? '',"),
('telegram-no-count-default',r,'...(allowFromCount === undefined ? {} : { allowFromCount }),','allowFromCount: allowFromCount ?? 0,'),
('telegram-helper-export',r,'export function telegramChannelMetadataOf','function telegramChannelMetadataOf'),
('source-validation',h,"if (!response.success || response.data.source?.availability !== 'available') return null;",'if (response.success) return null;'),
('source-available',h,"if (!response.success || response.data.source?.availability !== 'available') return null;",'if (!response.success) return null;'),
('source-runtime-identity',h,"const agent = response.data.agents.find((candidate) => candidate.agentId === agentId\n    || candidate.identity?.managementAgentId === agentId);","const agent = response.data.agents.find((candidate) => candidate.identity?.managementAgentId === agentId);"),
('source-management-identity',h,"const agent = response.data.agents.find((candidate) => candidate.agentId === agentId\n    || candidate.identity?.managementAgentId === agentId);","const agent = response.data.agents.find((candidate) => candidate.agentId === agentId);"),
('source-no-other-agent',h,"return agentCapabilitiesOf(agent);",'return agentCapabilitiesOf(agent ?? response.data.agents[0]);'),
('source-no-display-identity',h,"const agent = response.data.agents.find((candidate) => candidate.agentId === agentId\n    || candidate.identity?.managementAgentId === agentId);","const agent = response.data.agents.find((candidate) => candidate.agentId === agentId || candidate.displayName === agentId || candidate.ownerId === agentId\n    || candidate.identity?.managementAgentId === agentId);"),
('source-helper-export',h,'export function getListAgentsCapabilities','function getListAgentsCapabilities'),
]
def run(label):
 report=Path('/private/tmp/b139-meta-'+label+'.json');log=report.with_suffix('.log')
 env=os.environ.copy();env['PATH']='/Users/admintemp/.nvm/versions/node/v24.14.1/bin:'+env['PATH']
 cmd=['pnpm','exec','vitest','run','tests/agent/bridge139-inventory-metadata.test.ts','--maxWorkers=1','--no-file-parallelism','--testTimeout=60000','--reporter=json','--outputFile='+str(report)]
 with log.open('w') as f: result=subprocess.run(cmd,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT)
 d=json.loads(report.read_text());failed=[t for s in d['testResults'] for t in s.get('assertionResults',[]) if t['status']=='failed'];sem=[t['fullName'] for t in failed if any('AssertionError' in m for m in t.get('failureMessages',[]))]
 return {'exit':result.returncode,'passed':d['numPassedTests'],'total':d['numTotalTests'],'semantic':sem,'report':str(report)}
records=[]
try:
 baseline=run('baseline');assert baseline['exit']==0
 for label,p,old,new in recipes:
  text=original[p];assert text.count(old)==1,(label,text.count(old));(root/p).write_text(text.replace(old,new,1))
  red=run(label);(root/p).write_text(text);green=run(label+'-restore')
  entry={'name':label,'file':p,'qualified':red['exit']!=0 and bool(red['semantic']),'red':red,'restore':green,'sha_restored':(root/p).read_text()==text};records.append(entry)
  Path('/private/tmp/b139-metadata-mutations.json').write_text(json.dumps({'baseline':baseline,'records':records,'sha256':{p:hashlib.sha256(s.encode()).hexdigest() for p,s in original.items()}},indent=2)+'\n')
  print(label,entry['qualified'],flush=True)
  assert entry['qualified'] and green['exit']==0 and entry['sha_restored'],label
finally:
 for p,text in original.items():(root/p).write_text(text)
