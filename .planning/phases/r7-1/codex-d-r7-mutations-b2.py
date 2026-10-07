from pathlib import Path
import tempfile,subprocess,json,shutil,hashlib,time,os,signal
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-65-1');e=Path('/private/tmp/codex-d-r7-evidence');file='src/agent/agent-workspace.ts';source=(r/file).read_text();cases=[]
def add(name,old,new,decl=None):cases.append(dict(name=name,old=old,new=new,decl=decl))
add('canonical-human-name','z.enum(AGENT_WORKSPACE_HUMAN_FILES)','z.string()')
add('safe-capability-path-segment',".regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Capability must be a safe path segment')",'')
add('content-hash',"z.string().regex(/^[a-f0-9]{64}$/)",'z.string()')
add('iso-content-date','z.iso.datetime({ offset: true })','z.string()')
add('origin-discriminator',"z.object({ kind: z.literal('agent') }).strict(),", "z.object({ kind: z.literal('agent') }).strict(), z.object({ kind: z.literal('override') }).strict(),")
add('master-origin-metadata-only',"version: AgentConfigVersionSchema }).strict(),","version: AgentConfigVersionSchema }).loose(),",'AgentWorkspaceOriginSchema')
add('template-origin-metadata-only',"ownerId: OwnerIdSchema.nullable(), version: AgentConfigVersionSchema }).strict(),","ownerId: OwnerIdSchema.nullable(), version: AgentConfigVersionSchema }).loose(),")
add('agent-origin-metadata-only',"z.object({ kind: z.literal('agent') }).strict(),","z.object({ kind: z.literal('agent') }).loose(),")
add('revision-metadata-only','}).strict();','}).loose();','AgentWorkspaceFileRevisionSchema')
for name,decl,limit in [('human','AgentWorkspaceFileRevisionSchema','humanFileBytes'),('tools','AgentWorkspaceToolsSchema','toolsBytes'),('procedure','AgentWorkspaceSkillSchema','skillProcedureBytes')]:
 add(name+'-byte-integer','.int()','',decl)
 add(name+'-byte-nonnegative','.nonnegative()','',decl)
 add(name+'-byte-limit',f'.max(AGENT_WORKSPACE_LIMITS.{limit})','',decl)
add('human-always-loaded',"load: z.literal('always')","load: z.enum(['always','on-demand'])",'AgentWorkspaceHumanFileSchema')
add('history-nonempty-diagnostic','.min(1)','', 'AgentWorkspaceHumanFileSchema')
add('history-entry-limit','.max(AGENT_WORKSPACE_LIMITS.historyEntries)','')
add('human-metadata-only','}).strict().superRefine((file','}).loose().superRefine((file')
add('history-strictly-ascending','if (current.version <= previous.version)','if (false)')
add('history-date-order','if (Date.parse(current.updatedAt) < Date.parse(previous.updatedAt))','if (false)')
add('saved-latest-revision','if (file.history.at(-1)?.version !== file.versions.desired)','if (false)')
add('applied-revision-exists','if (file.versions.applied !== null && !file.history.some(entry => entry.version === file.versions.applied))','if (false)')
add('failed-revision-exists','if (file.versions.failed && !file.history.some(entry => entry.version === file.versions.failed?.version))','if (false)')
add('tools-canonical-name','name: z.literal(AGENT_WORKSPACE_TOOLS_FILE)','name: z.string()')
add('tools-generated-origin',"origin: z.literal('generated')","origin: z.enum(['generated','override'])")
add('tools-read-only','editable: z.literal(false)','editable: z.boolean()','AgentWorkspaceToolsSchema')
add('tools-always-loaded',"load: z.literal('always')","load: z.enum(['always','on-demand'])",'AgentWorkspaceToolsSchema')
add('tools-metadata-only','}).strict();','}).loose();','AgentWorkspaceToolsSchema')
add('description-trim','description: z.string().trim()','description: z.string()')
add('description-nonempty','.min(1)','', 'AgentWorkspaceSkillSchema')
add('description-utf8-limit','new TextEncoder().encode(value).length <= AGENT_WORKSPACE_LIMITS.skillDescriptionBytes','true')
add('procedure-on-demand',"load: z.literal('on-demand')","load: z.enum(['always','on-demand'])",'AgentWorkspaceSkillSchema')
add('procedure-read-only','editable: z.literal(false)','editable: z.boolean()','AgentWorkspaceSkillSchema')
add('procedure-metadata-only','  }).strict(),\n}).strict().superRefine((skill','  }).loose(),\n}).strict().superRefine((skill')
add('skill-metadata-only','}).strict().superRefine((skill','}).loose().superRefine((skill')
add('procedure-belongs-to-capability','if (skill.procedure.path !== agentWorkspaceSkillPath(skill.capability))','if (false)')
add('four-human-files','z.array(AgentWorkspaceHumanFileSchema).length(AGENT_WORKSPACE_HUMAN_FILES.length)','z.array(AgentWorkspaceHumanFileSchema)')
add('unique-human-files','if (new Set(workspace.files.map(file => file.name)).size !== AGENT_WORKSPACE_HUMAN_FILES.length)','if (false)')
add('USER-owner-boundary',"if (file.name === 'USER.md' && originOwner !== workspace.ownerId)",'if (false)')
add('registry-unique-capabilities','if (new Set(names).size !== names.length)','if (false)')
add('skill-entry-limit','.max(AGENT_WORKSPACE_LIMITS.skills)','')
add('unique-progressive-skills','if (declared.size !== workspace.skills.length)','if (false)')
add('disabled-skill-precise-diagnostic','if (!enabled.has(skill.capability))','if (false)')
add('enabled-capability-skill-bijection','if (enabled.size !== declared.size || [...enabled].some(name => !declared.has(name)))','if (false)')
add('procedure-applied-bundle-version','if (skill.procedure.version !== workspace.version)','if (false)')
add('tools-applied-bundle-version','if (workspace.tools.version !== workspace.version)','if (false)')
add('workspace-metadata-only','}).strict().superRefine((workspace','}).loose().superRefine((workspace')
add('rollback-human-file-only','file: AgentWorkspaceHumanFileNameSchema','file: z.string()','AgentWorkspaceRollbackRequestSchema')
add('rollback-request-strict','}).strict();','}).loose();','AgentWorkspaceRollbackRequestSchema')
add('rollback-authority-wrapper-strict','}).strict().superRefine(({ workspace','}).loose().superRefine(({ workspace')
add('rollback-CAS','if (request.expectedVersion !== file.versions.desired)','if (false)')
add('rollback-target-in-history','if (!file.history.some(entry => entry.version === request.targetVersion))','if (false)')
add('rollback-previous-revision','if (request.targetVersion >= request.expectedVersion)','if (false)')
for field in ['agentId','ownerId','tenantId']:add('workspace-context-'+field,f'workspace.{field} !== context.{field}','false')
add('context-reader-legacy-optional','AgentWorkspaceDescriptorSchema.optional()','AgentWorkspaceDescriptorSchema','AgentContextWithWorkspaceSchema')
add('context-writer-legacy-optional','AgentWorkspaceDescriptorSchema.optional()','AgentWorkspaceDescriptorSchema','AgentContextWithWorkspaceWriteSchema')
add('context-reader-validates-workspace','AgentWorkspaceDescriptorSchema.optional()','z.unknown().optional()','AgentContextWithWorkspaceSchema')
add('context-writer-validates-workspace','AgentWorkspaceDescriptorSchema.optional()','z.unknown().optional()','AgentContextWithWorkspaceWriteSchema')
add('context-writer-inherits-credential-guard','AgentContextWithChannelsWriteSchema.safeExtend','AgentContextWithChannelsSchema.safeExtend')
add('helper-absent-null','return ctx.workspace?.version ?? null;','return ctx.workspace?.version ?? 0;')
add('helper-applied-bundle-version','return ctx.workspace?.version ?? null;','return ctx.workspace?.files[0]?.versions.desired ?? null;')

def mutation(c):
 start=0;end=len(source)
 if c['decl']:
  start=source.index('export const '+c['decl']+' =');end=source.find('\nexport ',start+12)
  if end<0:end=len(source)
 part=source[start:end];count=part.count(c['old'])
 if c['name']=='master-origin-metadata-only':
  assert count==2;part=part.replace(c['old'],c['new'],1)
 elif c['name']=='description-nonempty':
  assert count==2;part=part.replace(c['old'],c['new'],1)
 else:assert count==1,(c['name'],count);part=part.replace(c['old'],c['new'])
 return source[:start]+part+source[end:]
for c in cases:mutation(c)
private=Path(tempfile.mkdtemp(prefix='codex-d-r7-mutations-',dir='/private/tmp'))
names=subprocess.check_output(['git','ls-files','src','tests','scripts'],cwd=r,text=True).splitlines()+subprocess.check_output(['git','ls-files','--others','--exclude-standard','src','tests'],cwd=r,text=True).splitlines()
files=sorted(set(p for p in names if not any(part.startswith('.env') or part=='secrets' for part in Path(p).parts)))+['vitest.config.ts']
for f in files:p=private/f;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(r/f,p)
(private/'package.json').write_text('{"type":"module"}\n');modules=private/'node_modules';modules.mkdir()
for item in (r/'node_modules').iterdir():
 if item.name in ['.vite','.vite-temp','.cache']:continue
 if item.name.startswith('@') and item.is_dir():
  scope=modules/item.name;scope.mkdir()
  for child in item.iterdir():(scope/child.name).symlink_to(child.resolve())
 else:(modules/item.name).symlink_to(item.resolve())
hashes={f:hashlib.sha256((private/f).read_bytes()).hexdigest() for f in files}
def run(name):
 report=e/(name+'.json');argv=['/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node',str(r/'node_modules/vitest/vitest.mjs'),'run','tests/agent/agent-workspace.test.ts','--maxWorkers=1','--no-file-parallelism','--testTimeout=60000','--reporter=json',f'--outputFile={report}']
 start=time.time();timeout=False
 with (e/(name+'.log')).open('w') as log:
  proc=subprocess.Popen(argv,cwd=private,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try:code=proc.wait(timeout=30)
  except subprocess.TimeoutExpired:timeout=True;os.killpg(proc.pid,signal.SIGTERM);code=proc.wait(timeout=5)
 rec={'exitCode':code,'timeout':timeout,'seconds':round(time.time()-start,2)}
 if report.exists():
  d=json.loads(report.read_text());rec.update({k:d.get(k) for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests']});failed=[a for s in d['testResults'] for a in s['assertionResults'] if a['status']=='failed'];rec['assertionFailures']=sum(any('AssertionError' in m for m in a.get('failureMessages',[])) for a in failed);rec['failedNames']=[a['fullName'] for a in failed]
 (e/(name+'-exit.json')).write_text(json.dumps(rec,indent=2));return rec
summary={'private':str(private),'planned':len(cases),'sourceFiles':len(files),'sourceHashes':hashes,'baseline':run('MUT-B2-BASELINE'),'rows':[]}
(e/'MUTATIONS-B2.json').write_text(json.dumps(summary,indent=2));print(json.dumps({'baseline':summary['baseline'],'planned':len(cases)}),flush=True);assert summary['baseline']['exitCode']==0
for i,c in enumerate(cases,1):
 (private/file).write_text(mutation(c))
 try:res=run(f'MUT-B2-{i:02}');row={'id':i,'name':c['name'],'run':res,'qualifiedKilled':res.get('exitCode')==1 and not res.get('timeout') and res.get('assertionFailures',0)>0}
 finally:(private/file).write_text(source)
 row['restoredSHA']=hashlib.sha256((private/file).read_bytes()).hexdigest()==hashes[file];summary['rows'].append(row);(e/'MUTATIONS-B2.json').write_text(json.dumps(summary,indent=2));print(json.dumps({'id':i,'name':c['name'],'killed':row['qualifiedKilled'],'restored':row['restoredSHA'],'assertions':res.get('assertionFailures'),'failedNames':res.get('failedNames')}),flush=True)
 if res.get('timeout'):break
summary['final']=run('MUT-B2-RESTORE');summary['sourcesRestored']={f:hashlib.sha256((private/f).read_bytes()).hexdigest()==sha for f,sha in hashes.items()};(e/'MUTATIONS-B2.json').write_text(json.dumps(summary,indent=2));print(json.dumps({'final':summary['final'],'allRestored':all(summary['sourcesRestored'].values()),'sourceFiles':len(files)}),flush=True)
