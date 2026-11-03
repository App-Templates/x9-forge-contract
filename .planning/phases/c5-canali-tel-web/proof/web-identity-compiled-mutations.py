import hashlib
import json
from pathlib import Path
import subprocess
root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
source = root / 'src/capability/agent-elevenlabs/web-context.ts'
original = source.read_bytes()
anchor = 'return isElevenLabsWebAuthorityCurrent(rawRequest, response.data.snapshot, expectedViewer, configuredOrigin, expectedVersion, now)'
assert original.decode().count(anchor) == 1
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
results = []
def build(name):
    run = subprocess.run(['pnpm', 'build'], cwd=root, env=env, capture_output=True, text=True, timeout=120)
    (proof / ('web-compiled-' + name + '-build.log')).write_text(run.stdout + run.stderr)
    assert run.returncode == 0, ('native build', name)
try:
    source.write_text(original.decode().replace(anchor, 'return !isElevenLabsWebAuthorityCurrent(rawRequest, response.data.snapshot, expectedViewer, configuredOrigin, expectedVersion, now)'))
    build('closed-identity')
    for variant in ['esm', 'cjs']:
        run = subprocess.run(['node', 'tests/cjs/c5-phone-web-smoke.mjs', variant], cwd=root, env=env, capture_output=True, text=True, timeout=30)
        (proof / ('web-compiled-closed-identity-' + variant + '.log')).write_text(run.stdout + run.stderr)
        qualified = run.returncode != 0 and 'AssertionError' in run.stderr and variant + ': usable canonical web identity' in run.stderr
        results.append({'variant': variant, 'exitCode': run.returncode, 'qualified': qualified, 'functionalFailure': 'canonical scoped active identity expected true, got false'})
finally:
    source.write_bytes(original)
    build('restored')
    run = subprocess.run(['node', 'tests/cjs/c5-phone-web-smoke.mjs'], cwd=root, env=env, capture_output=True, text=True, timeout=30)
    (proof / 'B0b-compiled-restored.json').write_text(run.stdout)
    record = {'mutations': results, 'total': 2, 'qualified': sum(a['qualified'] for a in results), 'sourceRestored': source.read_bytes() == original, 'sha256': hashlib.sha256(original).hexdigest(), 'restoredSmokeExitCode': run.returncode}
    (proof / 'WEB-IDENTITY-COMPILED-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
assert record['qualified'] == 2 and record['sourceRestored'] and run.returncode == 0
print(json.dumps(record))
