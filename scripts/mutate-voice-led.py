"""Voice-led onboarding (v1.27.0) guard mutations: assertion failure required, always restore sources."""
import pathlib, subprocess, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parents[1]
TEST = 'tests/capability/voice-led-onboarding.test.ts'
CAP = 'src/capability/capability-turn-lead.ts'
HTTP = 'src/http/endpoints/internal-agent-turn.ts'
M = [
    ('VL-01 prepare words', CAP, "kind: z.literal('prepare'), turnId: id, text: z.literal('')", "kind: z.literal('prepare'), turnId: id, text: sourceText"),
    ('VL-02 prepare strict', CAP, "text: z.literal('') }).strict(),\n  /** Voice-led session", "text: z.literal('') }),\n  /** Voice-led session"),
    ('VL-03 exchange ended optional', CAP, 'ended: z.boolean() }', 'ended: z.boolean().optional() }'),
    ('VL-04 exchange strict', CAP, 'ended: z.boolean() }).strict()', 'ended: z.boolean() })'),
    ('VL-05 instructions bound', CAP, 'z.string().max(CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS)', 'z.string()'),
    ('VL-06 instructions nonblank', CAP, "text.trim().length > 0, 'Expected instructions'", "true, 'Expected instructions'"),
    ('VL-07 note bound', CAP, 'z.string().max(CAPABILITY_NOTE_MAX_CHARS)', 'z.string()'),
    ('VL-08 note nonblank', CAP, "text.trim().length > 0, 'Expected a note'", "true, 'Expected a note'"),
    ('VL-09 lead strict', CAP, "instructions: CapabilityLeadInstructionsSchema }).strict()", "instructions: CapabilityLeadInstructionsSchema })"),
    ('VL-10 noted strict', CAP, "note: CapabilityNoteSchema.optional() }).strict()", "note: CapabilityNoteSchema.optional() })"),
    ('VL-11 agent response lead', HTTP, 'lead: CapabilityLeadInstructionsSchema.optional(), ', ''),
    ('VL-12 agent response note', HTTP, ', note: CapabilityNoteSchema.optional() });', ' });'),
]
selected = [m for m in M if not sys.argv[1:] or m[0].split()[0] in sys.argv[1:]]
logs = pathlib.Path(tempfile.mkdtemp(prefix='voice-led-mutations-'))
results = []
for name, file, before, after in selected:
    path = ROOT/file
    original = path.read_text()
    if original.count(before) != 1:
        print(name, 'SETUP ERROR', flush=True); results.append(False); continue
    try:
        path.write_text(original.replace(before, after))
        run = subprocess.run(['pnpm', 'exec', 'vitest', 'run', TEST], cwd=ROOT, capture_output=True, text=True, timeout=120)
        output = run.stdout + run.stderr
        (logs/(name.split()[0]+'.log')).write_text(output)
        killed = run.returncode != 0 and 'AssertionError' in output and 'failed' in output
        results.append(killed)
        print(name, 'RED assertion' if killed else 'SURVIVED/ERROR', flush=True)
    finally:
        path.write_text(original)
restored = subprocess.run(['pnpm', 'exec', 'vitest', 'run', TEST], cwd=ROOT, capture_output=True).returncode == 0
print(f'{sum(results)}/{len(results)} mutations killed; restored={restored}; logs={logs}')
sys.exit(0 if selected and all(results) and restored else 1)
