"""MVP turn-lead guard mutations: assertion failure required, always restore sources."""
import pathlib, subprocess, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parents[1]
TEST = 'tests/capability/capability-turn-lead.test.ts'
M = [
('B0-28', 'src/capability/capability-turn-lead.ts', "z.literal('release')", "z.enum(['release', 'ack'])"),
    ('B0-01', 'src/capability/capability-turn-lead.ts', 'z.string().min(1).max(120)', 'z.string().max(120)'),
    ('B0-02', 'src/capability/capability-turn-lead.ts', 'z.string().min(1).max(120)', 'z.string().min(1)'),
    ('B0-03', 'src/capability/capability-turn-lead.ts', 'z.string().max(AGENT_TURN_MAX_TEXT_CHARS)', 'z.string()'),
    ('B0-04', 'src/capability/capability-turn-lead.ts', "text.trim().length > 0, 'Expected spoken words'", "true, 'Expected spoken words'"),
    ('B0-05', 'src/capability/capability-turn-lead.ts', "kind: z.literal('opening'), turnId: id, text: z.literal('')", "kind: z.literal('opening'), turnId: id, text: sourceText"),
    ('B0-06', 'src/capability/capability-turn-lead.ts', "kind: z.literal('delivery'), turnId: id, text: z.literal('')", "kind: z.literal('delivery'), turnId: id, text: sourceText"),
    ('B0-07', 'src/capability/capability-turn-lead.ts', 'moveId: id, spokenText: sourceText', 'moveId: id.optional(), spokenText: sourceText'),
    ('B0-08', 'src/capability/capability-turn-lead.ts', 'moveId: id, spokenText: sourceText', 'moveId: id, spokenText: sourceText.optional()'),
    ('B0-09', 'src/capability/capability-turn-lead.ts', "kind: z.literal('incomplete')", "kind: z.enum(['incomplete', 'resume'])"),
    ('B0-10', 'src/capability/capability-turn-lead.ts', "kind: z.literal('opening'), turnId: id, text: z.literal('') }).strict()", "kind: z.literal('opening'), turnId: id, text: z.literal('') })"),
    ('B0-11', 'src/capability/capability-turn-lead.ts', "'Expected spoken words') }).strict()", "'Expected spoken words') })"),
    ('B0-12', 'src/capability/capability-turn-lead.ts', 'text: sourceText }).strict()', 'text: sourceText })'),
    ('B0-13', 'src/capability/capability-turn-lead.ts', 'spokenText: sourceText }).strict()', 'spokenText: sourceText })'),
    ('B0-14', 'src/capability/capability-turn-lead.ts', 'CapabilityTurnLeadDeclarationSchema = z.object({}).strict()', 'CapabilityTurnLeadDeclarationSchema = z.object({})'),
    ('B0-15', 'src/capability/capability-turn-lead.ts', 'turn: AgentTurnSchema,\n}).strict()', 'turn: AgentTurnSchema,\n})'),
    ('B0-16', 'src/capability/capability-turn-lead.ts', 'turn: AgentTurnSchema,', 'turn: AgentTurnSchema.optional(),'),
    ('B0-17', 'src/capability/capability-turn-lead.ts', 'z.string().max(CAPABILITY_TURN_LEAD_MAX_CHARS)', 'z.string()'),
    ('B0-18', 'src/capability/capability-turn-lead.ts', "text.trim().length > 0, 'Expected a question or message'", "true, 'Expected a question or message'"),
    ('B0-19', 'src/capability/capability-turn-lead.ts', "'Expected a question or message') }).strict()", "'Expected a question or message') })"),
    ('B0-20', 'src/capability/capability-turn-lead.ts', "z.object({ kind: z.literal('release') }).strict()", "z.object({ kind: z.literal('release') })"),
    ('B0-21', 'src/capability/capability-manifest.ts', 'turnLead: CapabilityTurnLeadDeclarationSchema.optional(),', 'turnLead: CapabilityTurnLeadDeclarationSchema.optional().default({}),'),
    ('B0-22', 'src/capability/capability-registry-entry.ts', 'turnLead: CapabilityTurnLeadDeclarationSchema.optional(),', 'turnLead: CapabilityTurnLeadDeclarationSchema.optional().default({}),'),
    ('B0-23', 'src/capability/capability-manifest.ts', 'turnLead: CapabilityTurnLeadDeclarationSchema.optional(),', ''),
    ('B0-24', 'src/capability/capability-registry-entry.ts', 'turnLead: CapabilityTurnLeadDeclarationSchema.optional(),', ''),
    ('B0-25', 'src/http/endpoints/internal-agent-turn.ts', 'turn: AgentTurnSchema.optional(),', ''),
    ('B0-26', 'src/http/endpoints/internal-agent-turn.ts', 'moveId: AgentTurnMoveIdSchema.optional(),', ''),
    ('B0-27', 'src/http/endpoints/cap-turn-lead.ts', "authType: 'secret'", "authType: 'none'"),
]

selected = [m for m in M if not sys.argv[1:] or m[0] in sys.argv[1:]]
logs = pathlib.Path(tempfile.mkdtemp(prefix='mvp07-b0-mutations-'))
results = []
for name, file, before, after in selected:
    path = ROOT/file
    original = path.read_text()
    if original.count(before) != 1:
        print(name, 'SETUP ERROR', flush=True); results.append(False); continue
    try:
        path.write_text(original.replace(before, after))
        run = subprocess.run(['pnpm', 'exec', 'vitest', 'run', TEST], cwd=ROOT, capture_output=True, text=True, timeout=60)
        output = run.stdout + run.stderr
        (logs/(name+'.log')).write_text(output)
        killed = run.returncode != 0 and 'AssertionError' in output and 'Tests ' in output and 'failed' in output
        results.append(killed)
        print(name, 'RED assertion' if killed else 'SURVIVED/ERROR', flush=True)
    finally:
        path.write_text(original)
restored = subprocess.run(['pnpm', 'exec', 'vitest', 'run', TEST], cwd=ROOT).returncode == 0
print(f'{sum(results)}/{len(results)} mutations killed; restored={restored}; logs={logs}')
sys.exit(0 if selected and all(results) and restored else 1)
