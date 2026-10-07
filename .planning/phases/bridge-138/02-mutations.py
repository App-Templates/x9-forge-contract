from pathlib import Path
import subprocess,json,hashlib
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-73-1');p=r/'.planning/phases/bridge-138'
paths={'identity':r/'src/agent/agent-runtime-identity.ts','helper':r/'src/agent/agent-channel-configuration.ts'};originals={k:f.read_bytes()for k,f in paths.items()};sha={k:hashlib.sha256(v).hexdigest()for k,v in originals.items()};done=[];names=set()
recipes=[
('field-retention','identity','vaultAgentId: z.number().int().positive().optional()','wrongVaultAgentId: z.number().int().positive().optional()',1),
('integer','identity','vaultAgentId: z.number().int().positive().optional()','vaultAgentId: z.number().positive().optional()',1),
('positive','identity','vaultAgentId: z.number().int().positive().optional()','vaultAgentId: z.number().int().optional()',1),
('noncoercing','identity','vaultAgentId: z.number().int().positive().optional()','vaultAgentId: z.coerce.number().int().positive().optional()',1),
('numeric-domain','identity','vaultAgentId: z.number().int().positive().optional()','vaultAgentId: z.any().optional()',1),
('optional-legacy','identity','vaultAgentId: z.number().int().positive().optional()','vaultAgentId: z.number().int().positive()',1),
('explicit-root','helper','return context.identity?.vaultAgentId ?? null;','return null;',1),
('no-management','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (Number(context.identity?.managementAgentId) || null);',1),
('no-runtime','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (Number(context.identity?.runtimeAgentId) || null);',1),
('no-context-id','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (Number((context as {agentId?: string}).agentId) || null);',1),
('no-top-level','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (context as {vaultAgentId?: number}).vaultAgentId ?? null;',1),
('no-channels','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId ?? (context as {channelConfigurations?: {identity:{vaultAgentId?: number}}[]}).channelConfigurations?.[0]?.identity.vaultAgentId ?? null;',1),
('missing-null','helper','return context.identity?.vaultAgentId ?? null;','return context.identity?.vaultAgentId;',1),
('public-export','helper','export function vaultAgentIdOf','function vaultAgentIdOf',1),
('fresh-context','helper','export function vaultAgentIdOf','export function vaultAgentIdOf',1),
]
def run(label):
 subprocess.run(['python3',str(p/'01-run.py'),label],check=True);return json.loads((p/(label+'-exit.json')).read_text())
run('02-baseline-green')
try:
 for name,key,old,new,count in recipes:
  source=originals[key].decode();assert source.count(old)==count,(name,source.count(old));mutated=source.replace(old,new)
  if name=='fresh-context':
   mutated='let cachedVault: number | null | undefined;\n'+mutated
   mutated=mutated.replace('  return context.identity?.vaultAgentId ?? null;', '  if (cachedVault !== undefined) return cachedVault;\n  return cachedVault = context.identity?.vaultAgentId ?? null;',1)
  label='02-'+name
  try:
   paths[key].write_text(mutated);red=run(label+'-red');assert red['exit']!=0 and red['assertionNames']and red['failed']==len(red['assertionNames']),red;names.update(red['assertionNames']);done.append({'name':name,'file':str(paths[key]),'red':red,'sourceSha256':sha[key],'mutantSha256':hashlib.sha256(paths[key].read_bytes()).hexdigest()})
  finally:
   paths[key].write_bytes(originals[key]);assert hashlib.sha256(paths[key].read_bytes()).hexdigest()==sha[key];green=run(label+'-restore-green')
   if done and done[-1]['name']==name:done[-1].update({'green':green,'restoredSha256':sha[key]})
  (p/'02-mutations.json').write_text(json.dumps({'qualified':len(done),'total':len(recipes),'testTotal':81,'covered':len(names),'coveredNames':sorted(names),'sourceSha256':sha,'results':done},indent=2)+'\n')
 run('02-final-green');assert len(names)==81;print('qualified',len(done),'/',len(recipes),'names',len(names),'/81','SHA',len(sha),flush=True)
finally:
 for key,f in paths.items():f.write_bytes(originals[key]);assert hashlib.sha256(f.read_bytes()).hexdigest()==sha[key]
