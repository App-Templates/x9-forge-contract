"""cap-ricerca / cap-lab / project routes (v1.28.0, Phase 54) guard mutations: assertion failure required, always restore sources."""
import pathlib, subprocess, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parents[1]
TESTS = ['tests/capability/ricerca/ricerca.test.ts', 'tests/capability/lab/lab.test.ts', 'tests/http/internal-project.test.ts']
PRJ = 'src/capability/ricerca/project.ts'
RES = 'src/capability/ricerca/research.ts'
SPD = 'src/capability/ricerca/spend.ts'
LPR = 'src/capability/lab/project.ts'
WIKI = 'src/capability/lab/wiki.ts'
CMP = 'src/capability/lab/competence.ts'
HTTP = 'src/http/endpoints/internal-project.ts'
M = [
    ('RL-01 budget per research above day', PRJ, '.refine(b => b.perResearchMaxUsd <= b.dailyUsd,', '.refine(_b => true,'),
    ('RL-02 budget may be zero', PRJ, 'const UsdSchema = z.number().positive().finite();', 'const UsdSchema = z.number().finite();'),
    ('RL-03 source rule optional', PRJ, '  sourceRule: SourceRuleSchema,\n  /** The agents', '  sourceRule: SourceRuleSchema.optional(),\n  /** The agents'),
    ('RL-04 models optional', PRJ, '  models: ResearchModelsSchema,', '  models: ResearchModelsSchema.optional(),'),
    ('RL-05 timezone unchecked', PRJ, "}, 'unknown IANA time zone');", "}, 'unknown IANA time zone').or(z.string());"),
    ('RL-06 project not strict', PRJ, '  agents: z.array(InternalAgentTurnParamsSchema.shape.agentId).min(1).max(100),\n}).strict();', '  agents: z.array(InternalAgentTurnParamsSchema.shape.agentId).min(1).max(100),\n});'),
    ('RL-07 any url scheme', RES, "return p === 'http:' || p === 'https:';", 'return p.length > 0;'),
    ('RL-08 finding without source', RES, 'sourceUrls: z.array(WebUrlSchema).min(1).max(20),', 'sourceUrls: z.array(WebUrlSchema).max(20),'),
    ('RL-09 negative cost', RES, '  usd: z.number().nonnegative().finite(),', '  usd: z.number().finite(),'),
    ('RL-10 spend cap zero', SPD, '  capUsd: z.number().positive().finite(),', '  capUsd: z.number().nonnegative().finite(),'),
    ('RL-11 repeated kinds', LPR, 'new Set(c.pageKinds).size === c.pageKinds.length &&', 'true &&'),
    ('RL-12 web source without url', WIKI, ".refine(s => s.origin !== 'web' || s.url !== undefined,", '.refine(_s => true,'),
    ('RL-13 claim without source', WIKI, 'sourceIds: z.array(WikiSourceIdSchema).min(1).max(50),', 'sourceIds: z.array(WikiSourceIdSchema).max(50),'),
    ('RL-14 self link', WIKI, ".refine(l => l.from !== l.to, { message: 'a page does not link to itself' });", ".refine(_l => true, { message: 'a page does not link to itself' });"),
    ('RL-15 level above scale', CMP, '  level: z.number().int().min(0).max(COMPETENCE_MAX_LEVEL),', '  level: z.number().min(0),'),
    ('RL-16 spend window reversed', HTTP, ".refine(q => q.from <= q.to, { message: 'from after to' });", ".refine(_q => true, { message: 'from after to' });"),
    ('RL-17 unvalidated project path', HTTP, 'return `/internal/projects/${ProjectParamsSchema.parse({ projectId }).projectId}/config`;', 'return `/internal/projects/${projectId}/config`;'),
]
selected = [m for m in M if not sys.argv[1:] or m[0].split()[0] in sys.argv[1:]]
logs = pathlib.Path(tempfile.mkdtemp(prefix='ricerca-lab-mutations-'))
results = []
for name, file, before, after in selected:
    path = ROOT/file
    original = path.read_text()
    if original.count(before) != 1:
        print(name, 'SETUP ERROR', flush=True); results.append(False); continue
    try:
        path.write_text(original.replace(before, after))
        run = subprocess.run(['pnpm', 'exec', 'vitest', 'run', *TESTS], cwd=ROOT, capture_output=True, text=True, timeout=180)
        output = run.stdout + run.stderr
        (logs/(name.split()[0]+'.log')).write_text(output)
        killed = run.returncode != 0 and 'AssertionError' in output and 'failed' in output
        results.append(killed)
        print(name, 'RED assertion' if killed else 'SURVIVED/ERROR', flush=True)
    finally:
        path.write_text(original)
restored = subprocess.run(['pnpm', 'exec', 'vitest', 'run', *TESTS], cwd=ROOT, capture_output=True).returncode == 0
print(f'{sum(results)}/{len(results)} mutations killed; restored={restored}; logs={logs}')
sys.exit(0 if selected and all(results) and restored else 1)
