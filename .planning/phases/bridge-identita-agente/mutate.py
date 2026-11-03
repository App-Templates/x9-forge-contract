from pathlib import Path
import subprocess,os,json,time,hashlib
from datetime import datetime
R=Path('/private/tmp/d-bridge-identita-agente-20261008');W=R/'checkout';OUT=R/'mutations';OUT.mkdir(exist_ok=True)
P=W/'src/agent/agent-context-identity.ts';BAR=W/'src/agent/index.ts'
ENV={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/Applications/ChatGPT.app/Contents/Resources/codex-cli/codex-path:/usr/bin:/bin'}
original=P.read_text();bar=BAR.read_text();test=W/'tests/agent/bridge-identita-agente.test.ts';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inputs={str(p.relative_to(W)):sha(p) for p in [P,BAR,test]}
recipes=[]
def recipe(name,edits):recipes.append({'name':name,'edits':edits})
def edit(before,after,count=1):return {'path':str(P.relative_to(W)),'before':before,'after':after,'count':count}
recipe('required-context-agent',[edit('agentId: NonblankAgentId,','agentId: NonblankAgentId.optional(),'),edit('value.agentId !== value.identity.runtimeAgentId','value.agentId !== undefined && value.agentId !== value.identity.runtimeAgentId')])
recipe('required-owner',[edit("OwnerIdSchema.refine(value => value.trim().length > 0, 'Owner identity must not be blank')","OwnerIdSchema.refine(value => value.trim().length > 0, 'Owner identity must not be blank').optional()")])
recipe('required-tenant',[edit("'Tenant identity must not be blank'),","'Tenant identity must not be blank').optional(),")])
recipe('required-root-identity',[edit('identity: ContextRuntimeIdentity,',"identity: ContextRuntimeIdentity.default({managementAgentId:'forge-a',runtimeAgentId:'runtime-a',vaultAgentId:17}),")])
recipe('required-management',[edit('managementAgentId: NonblankAgentId,','managementAgentId: NonblankAgentId.optional(),')])
recipe('required-runtime',[edit('runtimeAgentId: NonblankAgentId,','runtimeAgentId: NonblankAgentId.optional(),'),edit('value.agentId !== value.identity.runtimeAgentId','value.identity.runtimeAgentId !== undefined && value.agentId !== value.identity.runtimeAgentId')])
recipe('required-vault',[edit('vaultAgentId: z.number().int().positive(),','vaultAgentId: z.number().int().positive().optional(),')])
recipe('nonblank-agent-identifiers',[edit("AgentIdSchema.refine(value => value.trim().length > 0, 'Agent identity must not be blank')",'AgentIdSchema')])
recipe('nonblank-owner',[edit("OwnerIdSchema.refine(value => value.trim().length > 0, 'Owner identity must not be blank')",'OwnerIdSchema')])
recipe('nonblank-tenant',[edit("z.string().min(1).refine(value => value.trim().length > 0, 'Tenant identity must not be blank')",'z.string().min(1)')])
recipe('positive-vault',[edit('vaultAgentId: z.number().int().positive(),','vaultAgentId: z.number().int(),')])
recipe('integer-vault',[edit('vaultAgentId: z.number().int().positive(),','vaultAgentId: z.number().positive(),')])
recipe('strict-runtime-identity',[edit('vaultAgentId: z.number().int().positive(),\n}).strict();','vaultAgentId: z.number().int().positive(),\n}).passthrough();')])
recipe('strict-authority-root',[edit("masterAgentId: z.never().optional() }).strict();","masterAgentId: z.never().optional() }).passthrough();"),edit('masterAgentId: NonblankAgentId }).strict();','masterAgentId: NonblankAgentId }).passthrough();')])
recipe('declared-role',[edit("role: z.literal('master')","role: z.enum(['master','child'])")])
recipe('master-without-parent',[edit('masterAgentId: z.never().optional()','masterAgentId: NonblankAgentId.optional()')])
recipe('heir-explicit-parent',[edit('masterAgentId: NonblankAgentId }).strict();','masterAgentId: NonblankAgentId.optional() }).strict();')])
recipe('runtime-correlation',[edit('if (value.agentId !== value.identity.runtimeAgentId)','if (false)')])
recipe('heir-self-runtime',[edit("if (value.role === 'erede' && value.masterAgentId === value.identity.runtimeAgentId)",'if (false)')])
recipe('heir-self-management',[edit("if (value.role === 'erede' && value.masterAgentId === value.identity.managementAgentId)",'if (false)')])
recipe('constructor-validation-and-clone',[edit('return AgentContextIdentitySchema.parse(input);','return input;')])
recipe('modern-reader-authority',[edit("export const AgentContextWithIdentitySchema = z.discriminatedUnion('role', [","export const AgentContextWithIdentitySchema = AgentContextWithChannelsSchema; const ReaderMutation = z.discriminatedUnion('role', [")])
recipe('modern-writer-platform-guard',[edit("export const AgentContextWithIdentityWriteSchema = z.discriminatedUnion('role', [","export const AgentContextWithIdentityWriteSchema = AgentContextWithIdentitySchema; const WriterMutation = z.discriminatedUnion('role', [")])
recipe('modern-inherited-channel-guards',[edit("import { z } from 'zod';","import { z } from 'zod';\nimport { AgentContextFileSchema, AgentContextFileWriteSchema } from './agent-context-file.js';"),edit('AgentContextWithChannelsSchema.safeExtend','AgentContextFileSchema.safeExtend',2),edit('AgentContextWithChannelsWriteSchema.safeExtend','AgentContextFileWriteSchema.safeExtend',2)])
recipe('public-agent-exports',[{'path':str(BAR.relative_to(W)),'before':"export * from './agent-context-identity.js';",'after':'// mutation: omitted context identity exports','count':1}])
(R/'MUTATIONS.json').write_text(json.dumps(recipes,indent=2)+'\n')
if os.environ.get('RECIPE_ONLY')=='1':print(len(recipes));raise SystemExit(0)
def run(name):
 report=OUT/(name+'.json');log=OUT/(name+'.log');cmd=['pnpm','exec','vitest','run','tests/agent/bridge-identita-agente.test.ts','--maxWorkers=1','--no-file-parallelism','--reporter=json','--outputFile='+str(report)]
 remaining=(datetime.fromisoformat(json.loads((R/'TIMER.json').read_text())['deadline'])-datetime.now().astimezone()).total_seconds()
 assert remaining>0, 'deadline reached before command'
 with log.open('w') as f:p=subprocess.run(cmd,cwd=W,env=ENV,stdout=f,stderr=subprocess.STDOUT,timeout=remaining)
 assert report.exists(), 'missing native report '+name
 d=json.loads(report.read_text());return p.returncode,d
results=[]
try:
 for i,item in enumerate(recipes,1):
  if datetime.now().astimezone()>=datetime.fromisoformat(json.loads((R/'TIMER.json').read_text())['deadline']):raise RuntimeError('deadline reached')
  for patch in item['edits']:
   target=W/patch['path'];s=target.read_text();assert s.count(patch['before'])==patch['count'], 'recipe anchor '+item['name'];target.write_text(s.replace(patch['before'],patch['after']))
  code,d=run(f'{i:02d}-red');failed=[t for s in d['testResults'] for t in s['assertionResults'] if t['status']=='failed']
  witnesses=[t['fullName'] for t in failed if t['failureMessages'] and all('AssertionError' in m for m in t['failureMessages'])]
  assert code!=0 and witnesses and len(witnesses)==len(failed) and not d['numPendingTests'], 'nonsemantic mutation '+item['name']
  P.write_text(original);BAR.write_text(bar);assert all(sha(W/path)==value for path,value in inputs.items()), 'input SHA changed'
  restore,green=run(f'{i:02d}-restore');assert restore==0 and green['success'] and green['numPassedTests']==173 and not green['numFailedTests'] and not green['numPendingTests'],'restore failed '+item['name']
  result={'index':i,'name':item['name'],'witnesses':witnesses,'restore':173,'completedAt':datetime.now().astimezone().isoformat()};results.append(result)
  (R/'MUTATION-PROOF.json').write_text(json.dumps({'qualified':len(results),'total':len(recipes),'inputs':inputs,'mutations':results},indent=2)+'\n');print(json.dumps({'qualified':len(results),'total':len(recipes),'name':item['name'],'witnesses':len(witnesses)}),flush=True)
finally:
 P.write_text(original);BAR.write_text(bar)
