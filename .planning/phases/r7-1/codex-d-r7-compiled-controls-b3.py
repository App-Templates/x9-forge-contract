from pathlib import Path
import json,subprocess,hashlib,time
e=Path('/private/tmp/codex-d-r7-evidence');quality=json.loads((e/'QUALITY.json').read_text());client=Path(quality['packedConsumer']);package=client/'node_modules/@x9-forge/contracts';file=package/'dist/agent/agent-workspace.cjs';original=file.read_text();node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node'
cases=[]
def add(name,old,new):
 assert original.count(old)==1,(name,original.count(old));cases.append({'name':name,'old':old,'new':new})
add('canonical-root-files',"['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'USER.md']","['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'OTHER.md']")
add('generated-tools-readonly',"origin: zod_1.z.literal('generated'),\n    editable: zod_1.z.literal(false)","origin: zod_1.z.literal('generated'),\n    editable: zod_1.z.boolean()")
add('rollback-CAS','if (request.expectedVersion !== file.versions.desired)','if (false)')
add('rollback-existing-revision','if (!file.history.some(entry => entry.version === request.targetVersion))','if (false)')
add('rollback-result-binding','return exports.AgentWorkspaceRollbackValidationSchema.parse({ request, workspace: authoritativeWorkspace }).request;','return exports.AgentWorkspaceRollbackValidationSchema.parse({ request, workspace: authoritativeWorkspace }).workspace;')
add('progressive-owned-path','if (skill.procedure.path !== agentWorkspaceSkillPath(skill.capability))','if (false)')
add('absent-applied-helper','return ctx.workspace?.version ?? null;','return ctx.workspace?.version ?? 99;')
add('context-scope-binding','if (workspace && (workspace.agentId !== context.agentId || workspace.ownerId !== context.ownerId || workspace.tenantId !== context.tenantId))','if (false)')
add('canonical-writer-protection','exports.AgentContextWithWorkspaceWriteSchema = agent_channel_configuration_js_1.AgentContextWithChannelsWriteSchema.safeExtend','exports.AgentContextWithWorkspaceWriteSchema = agent_channel_configuration_js_1.AgentContextWithChannelsSchema.safeExtend')
add('safe-procedure-segment',".regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Capability must be a safe path segment')",'')
hashes={p.relative_to(package).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in package.rglob('*') if p.is_file()}
def run(name):
 start=time.time();p=subprocess.run([node,'r7-workspace-smoke.cjs'],cwd=client,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=20);(e/(name+'.log')).write_text(p.stdout)
 return {'exitCode':p.returncode,'seconds':round(time.time()-start,2),'assertionError':'AssertionError' in p.stdout,'passed15':'15/15 probes passed' in p.stdout,'failedProbe':next((line for line in p.stdout.splitlines() if line.startswith('R7 CJS probe failed:')),None)}
summary={'campaign':3,'consumer':str(client),'compiledFile':str(file),'recipes':cases,'files':len(hashes),'hashes':hashes,'baseline':run('COMPILED-B3-BASELINE'),'rows':[]};assert summary['baseline']['exitCode']==0 and summary['baseline']['passed15']
for i,c in enumerate(cases,1):
 try:
  file.write_text(original.replace(c['old'],c['new']));result=run(f'COMPILED-B3-B3-MUT-{i:02}');row={'name':c['name'],'run':result,'qualifiedKilled':result['exitCode']!=0 and result['assertionError']}
 finally:file.write_text(original)
 row['restoredSHA']=hashlib.sha256(file.read_bytes()).hexdigest()==hashes[file.relative_to(package).as_posix()];summary['rows'].append(row);print(json.dumps(row),flush=True)
summary['final']=run('COMPILED-B3-RESTORE');summary['restored']={p:hashlib.sha256((package/p).read_bytes()).hexdigest()==sha for p,sha in hashes.items()};(e/'COMPILED-B3-CONTROLS.json').write_text(json.dumps(summary,indent=2));assert all(r['qualifiedKilled'] and r['restoredSHA'] for r in summary['rows']) and all(summary['restored'].values()) and summary['final']['exitCode']==0
print(json.dumps({'qualified':len(summary['rows']),'denominator':len(cases),'restored':sum(summary['restored'].values()),'files':len(hashes),'final':summary['final']}),flush=True)
b=Path('/private/tmp/codex-d-r7-budget.json');budget=json.loads(b.read_text());budget['mutationCampaigns']=3;b.write_text(json.dumps(budget,indent=2))
