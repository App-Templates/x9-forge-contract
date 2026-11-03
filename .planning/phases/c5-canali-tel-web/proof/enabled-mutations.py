import hashlib
import json
from pathlib import Path
import subprocess
root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
channel = root / 'src/capability/agent-elevenlabs/web-channel.ts'
session = root / 'src/capability/agent-elevenlabs/web-session.ts'
originals = {p: p.read_bytes() for p in [channel, session]}
split = originals[channel].decode().index('export const ElevenLabsWebPolicyChangeSchema')
mutations = []
for label, start, end in [('policy', 0, split), ('change', split, len(originals[channel]))]:
    fragment = originals[channel].decode()[start:end]
    assert fragment.count('enabled: z.boolean().optional(),') == 1
    for suffix, replacement in [('type', 'enabled: z.unknown().optional(),'), ('legacy', 'enabled: z.boolean().optional().default(false),')]:
        mutations.append((channel, label + '-' + suffix, fragment, fragment.replace('enabled: z.boolean().optional(),', replacement)))
mutations.extend([
 (channel, 'enabled-readback', '(actual.policy.enabled ?? true) === (expected.enabled ?? true)', 'true'),
 (channel, 'readback-actual-legacy', '(actual.policy.enabled ?? true)', '(actual.policy.enabled ?? false)'),
 (channel, 'readback-expected-legacy', '(expected.enabled ?? true)', '(expected.enabled ?? false)'),
 (session, 'off-admission', 'policy.enabled === false || ', ''),
])
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
results = []
try:
    for path, name, before, after in mutations:
        assert originals[path].decode().count(before) == 1
        path.write_text(originals[path].decode().replace(before, after))
        report = proof / ('enabled-mutation-' + name + '.json')
        run = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/capability/agent-elevenlabs-web-channel.test.ts', 'tests/capability/agent-elevenlabs-web-session.test.ts', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile=' + str(report)], cwd=root, env=env, capture_output=True, text=True, timeout=60)
        (proof / ('enabled-mutation-' + name + '.log')).write_text(run.stdout + run.stderr)
        data = json.loads(report.read_text()); failed = [a for f in data['testResults'] for a in f['assertionResults'] if a['status'] == 'failed']
        functional = [a for a in failed if any('AssertionError' in m or 'ZodError' in m for m in a['failureMessages'])]
        other = [a for a in failed if a not in functional]
        qualified = run.returncode != 0 and bool(functional) and not other
        results.append({'name': name, 'exitCode': run.returncode, 'tests': data['numTotalTests'], 'functionalFailures': len(functional), 'otherFailures': len(other), 'qualified': qualified, 'failingAssertions': [a['fullName'] for a in functional]})
        print(name, qualified, len(functional), len(other), flush=True)
        path.write_bytes(originals[path])
finally:
    for p, raw in originals.items(): p.write_bytes(raw)
    record = {'total': len(mutations), 'qualified': sum(a['qualified'] for a in results), 'mutations': results, 'restored': all(p.read_bytes() == raw for p, raw in originals.items()), 'sha256': {str(p.relative_to(root)): hashlib.sha256(raw).hexdigest() for p, raw in originals.items()}}
    (proof / 'ENABLED-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
assert record['qualified'] == record['total']
