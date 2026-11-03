from pathlib import Path
import subprocess, os, json, hashlib, re
W=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-193-2')
O=Path('/Users/admintemp/Documents/Codex/2026-10-08/tu-sei-codex-f-crea-in/work/registro-bridge-148')
O.mkdir(parents=True, exist_ok=True)
paths=['src/http/endpoints/internal-models-batch.ts','src/model-router/agent-model-configuration.ts','src/agent/agent-management.ts']
original={n:(W/n).read_text() for n in paths}
tests=['tests/model-router/model-consumer-report-http.test.ts','tests/model-router/agent-models-pending.test.ts','tests/agent/agent-command-in-progress.test.ts']
env=dict(os.environ);env['PATH']='/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin:/usr/sbin:/sbin'
mutants=[]
def add(name, index, before, after, region=None, extra=None):
    base=original[paths[index]]
    if region:
        start=base.index(region[0]); end=base.index(region[1],start)
        part=base[start:end]
        assert part.count(before)==1,(name,part.count(before))
        changed=base[:start]+part.replace(before,after,1)+base[end:]
    else:
        assert base.count(before)==1,(name,base.count(before))
        changed=base.replace(before,after,1)
    if extra:
        assert changed.count(extra[0])==1,(name,'extra')
        changed=changed.replace(extra[0],extra[1],1)
    mutants.append((name,index,changed))
report=('export const internalModelConsumerReportContract','export function modelConsumerReportPath')
pending=('export const AgentModelsPendingWorkSchema','export type AgentModelsPendingWork')
helper=('export function isAgentManagementCommandInProgress','/** What a target supports')
add('B1 route slot binding',0,'route.data.slotId === report.data.slotId','true')
add('B1 strict params',0,'paramsSchema: z.object({ slotId: ModelSlotIdSchema }).strict()','paramsSchema: z.object({ slotId: ModelSlotIdSchema }).strip()',report)
add('B1 strict receipt',0,'responseSchema: z.object({ ok: z.literal(true) }).strict()','responseSchema: z.object({ ok: z.literal(true) }).strip()',report)
add('B1 path slot validation',0,'const params = internalModelConsumerReportContract.paramsSchema.parse({ slotId });','const params = { slotId };')
add('B1 POST metadata',0,"method: 'POST' as const","method: 'GET' as const",report)
add('B1 secret authentication metadata',0,"authType: 'secret' as const","authType: 'none' as const",report)
add('B1 canonical auth header',0,'authHeader: INTERNAL_SECRET_HEADER','authHeader: undefined',report)
add('B1 correct core route',0,"path: '/internal/models/consumer-reports/:slotId' as const","path: '/internal/models/consumers/:slotId/report' as const",report)
add('B2 strict work',1,'}).strict().superRefine((work, ctx) => {','}).strip().superRefine((work, ctx) => {',pending)
add('B2 strict slot',1,'  }).strict()).max(64),','  }).strip()).max(64),',pending)
add('B2 strict progress',1,"}).strict().refine(value => value.completed <= value.total,","}).strip().refine(value => value.completed <= value.total,",pending)
add('B2 strict failure',1,'  }).strict().optional(),','  }).strip().optional(),',pending)
add('B2 duplicate slots',1,'new Set(work.slots.map(slot => slot.slotId)).size !== work.slots.length','false',pending)
add('B2 registered slots',1,'findModelConsumerDefinition(slot.slotId) === undefined','false',pending)
add('B2 registered failure slot',1,'work.failure?.slotId != null && findModelConsumerDefinition(work.failure.slotId) === undefined','false',pending)
add('B2 progress bound',1,'value.completed <= value.total','true',pending)
add('B2 completed nonnegative',1,'completed: z.number().int().nonnegative()','completed: z.number().int()',pending)
add('B2 completed integer',1,'completed: z.number().int().nonnegative()','completed: z.number().nonnegative()',pending)
add('B2 total integer',1,'total: z.number().int().nonnegative()','total: z.number().nonnegative()',pending)
# The comparison also rejects negative totals; bypass both barriers to exercise the numeric boundary.
add('B2 total nonnegative with overlapping bound bypassed',1,'total: z.number().int().nonnegative()','total: z.number().int()',pending,('value.completed <= value.total','true'))
add('B2 chronological update',1,'Date.parse(work.updatedAt) < Date.parse(work.startedAt)','false',pending)
add('B2 failure phase equivalence',1,"(work.phase === 'failed') !== (work.failure !== undefined)",'false',pending)
add('B2 initial version one',1,"work.kind === 'initial' && work.desiredVersion !== 1",'false',pending)
add('B2 initial requires absent saved',1,"state.pending.kind === 'initial' && state.saved !== null",'false')
add('B2 apply requires saved',1,"state.pending.kind === 'apply' && state.saved === null",'false')
add('B2 optional pending',1,'pending: AgentModelsPendingWorkSchema.nullable().optional()','pending: AgentModelsPendingWorkSchema.nullable()')
add('B2 nullable pending',1,'pending: AgentModelsPendingWorkSchema.nullable().optional()','pending: AgentModelsPendingWorkSchema.optional()')
add('B2 work kind',1,"kind: z.enum(['initial', 'apply'])","kind: z.enum(['initial', 'apply', 'reload'])",pending)
add('B2 work phase',1,"phase: z.enum(['accepted', 'installing', 'publishing', 'failed'])","phase: z.enum(['accepted', 'installing', 'publishing', 'failed', 'finished'])",pending)
add('B2 slot status',1,"status: z.enum(['waiting', 'installed', 'pending', 'failed'])","status: z.enum(['waiting', 'installed', 'pending', 'failed', 'finished'])",pending)
add('B2b valid result header',2,'AgentManagementCommandResultSchema.safeParse(input)','AgentManagementCommandResultSchema.safeParse({ ...input as object, ok: true })',helper)
add('B2b apply action',2,"if (!parsed.success || parsed.data.action !== 'apply-config') return false;","if (!parsed.success) return false;",helper)
add('B2b at least one unsuccessful target',2,'return unsuccessful.length > 0','return true',helper)
add('B2b every unsuccessful reason',2,"unsuccessful.every(entry => entry.reason?.code === 'in-progress')","unsuccessful.some(entry => entry.reason?.code === 'in-progress')",helper)
# The helper deliberately reuses this existing schema invariant instead of duplicating it.
add('B2b requested version remains unapplied',2,"if (converged !== (result.outcome === 'ok')) {",'if (false) {')
command=['/Users/admintemp/.nvm/versions/node/v24.14.1/bin/pnpm','-C',str(W),'exec','vitest','run',*tests,'--maxWorkers=1']
results=[]
try:
    baseline=subprocess.run(command,env=env,text=True,capture_output=True,timeout=30)
    (O/'targeted-baseline.log').write_text(baseline.stdout+baseline.stderr)
    assert baseline.returncode==0,'Baseline failed; see targeted-baseline.log'
    print('BASELINE PASS: 53/53 tests',flush=True)
    for number,(name,index,content) in enumerate(mutants,1):
        path=W/paths[index]
        try:
            path.write_text(content)
            run=subprocess.run(command,env=env,text=True,capture_output=True,timeout=30)
            output=run.stdout+run.stderr
            (O/f'mutant-{number:02}.log').write_text(output)
            killed=run.returncode==1 and 'AssertionError' in output
            results.append({'id':number,'name':name,'assertion_rejected':killed,'returncode':run.returncode})
            print(f'{number}/{len(mutants)} {name}: '+('ASSERTION RED' if killed else 'FAILED AUDIT'),flush=True)
            if not killed:
                raise RuntimeError(f'Mutant {number} did not produce assertion red; see log')
        finally:
            path.write_text(original[paths[index]])
finally:
    for name,data in original.items():
        (W/name).write_text(data)
    hashes={name:hashlib.sha256((W/name).read_bytes()).hexdigest() for name in paths}
    assert all((W/name).read_text()==data for name,data in original.items())
    (O/'mutations.json').write_text(json.dumps({'mutants':len(mutants),'rejected':sum(r['assertion_rejected'] for r in results),'results':results,'restored_sha256':hashes},indent=2))
    print('All 3/3 source files restored.',flush=True)
