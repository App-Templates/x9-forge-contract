"""Causal qualification on a private snapshot, never mutating another worktree."""
from pathlib import Path
import tempfile, shutil, subprocess, json, hashlib
root = Path(__file__).resolve().parents[3]
trial = Path(tempfile.mkdtemp(prefix='d-paperclip-contracts-', dir='/private/tmp'))
(trial/'src/capability/paperclip').mkdir(parents=True)
(trial/'tests').mkdir()
(trial/'node_modules').symlink_to(root/'node_modules', target_is_directory=True)
for name in ('package.json', 'vitest.config.ts'):
    shutil.copyfile(root/name, trial/name)
for name in ('paperclip-contracts.test.ts', 'setup.ts'):
    shutil.copyfile(root/'tests'/name, trial/'tests'/name)
source = root/'src/capability/paperclip/index.ts'
target = trial/'src/capability/paperclip/index.ts'
original = source.read_text()
command = ['/usr/local/bin/node', str(root/'node_modules/vitest/vitest.mjs'), 'run', 'tests/paperclip-contracts.test.ts', '--maxWorkers=1']
mutations = [
 ('strict-boundary', 'z.strictObject(', 'z.object('),
 ('nonblank', "value.trim().length > 0", 'true'),
 ('max-length', '.max(4096)', '.max(10000)'),
 ('required-links', 'materialLinks: z.array(Text)', 'materialLinks: z.array(Text).optional()'),
 ('event-kind', "eventType: PaperclipMaterialEventTypeSchema", 'eventType: Text'),
 ('timestamp', 'const Timestamp = z.iso.datetime({ offset: true });', 'const Timestamp = z.string();'),
 ('test-flag', 'test: z.boolean().optional()', 'test: z.union([z.boolean(), z.string()]).optional()'),
 ('empty-decision-ref', 'decisionId: Text.nullable()', 'decisionId: z.string().nullable()'),
 ('config-version', 'schemaVersion: z.literal(1), revision:', 'schemaVersion: z.number(), revision:'),
 ('config-event-kind', 'z.partialRecord(PaperclipMaterialEventTypeSchema, Text)', 'z.record(Text, Text)'),
 ('verified-boolean', 'verified: z.boolean()', 'verified: z.union([z.boolean(), z.string()])'),
 ('config-email', "channels['email'] && !Email.test(channels['email'].address)", 'false'),
 ('route-email', "route.channel === 'email' && !Email.test(route.address)", 'false'),
 ('handoff-version', 'schemaVersion: z.literal(1), handoffId:', 'schemaVersion: z.union([z.number(), z.boolean()]), handoffId:'),
 ('handoff-id', 'handoffId: z.uuid()', 'handoffId: Text'),
 ('receipt-status', "status: z.literal('accepted')", 'status: Text'),
 ('receipt-id', 'receiptId: Text', 'receiptId: z.string()'),
 ('manual-authority', "authorization: z.literal('manual_attestation')", 'authorization: Text'),
 ('no-paperclip-effect', 'paperclipUpdated: z.literal(false)', 'paperclipUpdated: z.boolean()'),
 ('human-evidence', 'humanEvidence: Text', 'humanEvidence: z.string()'),
 ('required-changes', "record.outcome === 'changes_requested' && !record.changes.trim()", 'false'),
 ('decision-outcome', "outcome: z.enum(['approved', 'changes_requested'])", 'outcome: Text'),
 ('positive-roundtrip', "summary: Text, materialLinks:", "summary: z.literal('always-rejected'), materialLinks:"),
 ('positive-all-events', "'moodboard_ready', 'board_ready', 'plan_verified', 'decision_needed', 'release_delivered',", "'board_ready', 'plan_verified', 'decision_needed', 'release_delivered',"),
 ('positive-generic-channel', "channel: Text, address: Text", "channel: z.literal('email'), address: Text"),
]
results = []
for name, before, after in mutations:
    if before not in original: raise AssertionError('Missing mutation site: '+name)
    target.write_text(original.replace(before, after))
    result = subprocess.run(command, cwd=trial, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (trial/(name+'.log')).write_text(result.stdout)
    causal = result.returncode != 0 and 'AssertionError' in result.stdout and 'Failed Suites' not in result.stdout
    results.append(dict(name=name, assertionRed=causal, exitCode=result.returncode))
    if not causal: raise AssertionError('Not a semantic red: '+name+'; '+str(trial))
target.write_text(original)
result = subprocess.run(command, cwd=trial, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
(trial/'restored.log').write_text(result.stdout)
assert result.returncode == 0, 'Restored baseline failed'
proof = dict(sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), snapshot=str(trial), killed=len(results), total=len(mutations), restored=True, mutations=results)
(root/'.planning/phases/filiera-cap-paperclip/QUALIFICATION.json').write_text(json.dumps(proof, indent=2)+'\n')
print(json.dumps(proof, indent=2))
