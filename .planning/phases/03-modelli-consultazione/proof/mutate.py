from pathlib import Path
import subprocess, json, hashlib
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1')
out=Path(__file__).resolve().parent
model=root/'src/model-router/models-batch.ts'; http=root/'src/http/endpoints/forge-models.ts'
originals={p:p.read_text() for p in [model,http]}
cases=[
('unknown-master',model,"row.masterAgentId !== null || ","",'unqualified unknown provenance'),
('unknown-master-version',model,"row.masterConfigVersion !== null || ","",'unqualified unknown provenance'),
('unknown-readonly',model,"row.editability !== 'readonly' || row.reason === null || row.reason.trim().length === 0","false",'unqualified unknown provenance'),
('unknown-blank',model," || row.reason.trim().length === 0","",'unqualified unknown provenance'),
('complete-missing',model,"coverage.missingSlots.length !== 0 || ","",'complete cannot'),
('complete-reason',model,"coverage.missingSlots.length !== 0 || coverage.reason !== null","coverage.missingSlots.length !== 0",'complete cannot'),
('incomplete-reason',model,"coverage.status !== 'complete' && coverage.reason === null","false",'rejects missing reason'),
('missing-unique',model,"new Set(coverage.missingSlots).size !== coverage.missingSlots.length","false",'I04 rejects duplicate'),
('identity-full',model,"known !== undefined && !sameModelAgentIdentity(known, entry.identity)","false",'I01|I02'),
('owner-binding',model,"owners.has(agentId) && owners.get(agentId) !== entry.ownerId","false",'mismatching coverage owner'),
('coverage-unique',model,"covered.has(agentId)","false",'mismatching coverage owner'),
('present-missing',model,"coverage.missingSlots.some(slot => slots.has(`${agentId}:${slot}`))","false",'I04 rejects a slot'),
('namespace',model,"!AgentRuntimeIdentitiesSchema.safeParse([...identities.values()]).success","false",'cross namespace'),
('vault-unique',model,"vaultIds.has(identity.vaultAgentId)","false",'shared vault'),
('owner-access',http,"[...overview.data.rows, ...(overview.data.coverage ?? [])]","overview.data.rows",'checks access'),
('writer-coverage',model,"coverage !== undefined && coverage.status !== 'complete'","false",'W04'),
('writer-unrelated',model,"overview.coverage?.find(entry => sameModelAgentIdentity(entry.identity, agent.identity))","overview.coverage?.find(entry => entry.status !== 'complete')",'W01|W02|W03'),
('coverage-strict',model,"}).strict().superRefine((coverage, ctx)","}).superRefine((coverage, ctx)",'non-public extra fields'),
]
results=json.loads((out/'mutations-first-diagnostic.json').read_text())[:6]
cases=cases[6:]
def run(name,pattern):
 p=subprocess.run(['pnpm','exec','vitest','run','tests/model-router/models-overview-coverage.test.ts','--maxWorkers=1','-t',pattern],cwd=root,capture_output=True,text=True)
 (out/(name+'.log')).write_text(p.stdout+p.stderr)
 return p
try:
 for name,path,needle,replacement,pattern in cases:
  before=originals[path];assert before.count(needle)==1,(name,before.count(needle));path.write_text(before.replace(needle,replacement))
  red=run(name+'-red',pattern)
  path.write_text(before)
  green=run(name+'-restored',pattern)
  result={'case':name,'red_exit':red.returncode,'assertion': 'AssertionError' in red.stdout+red.stderr,'restore_exit':green.returncode,'restored_sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
  results.append(result);print(json.dumps(result),flush=True)
  if red.returncode==0 or not result['assertion'] or green.returncode!=0:raise RuntimeError(name)
finally:
 for p,s in originals.items():p.write_text(s)
 (out/'mutations.json').write_text(json.dumps(results,indent=2)+'\n')
