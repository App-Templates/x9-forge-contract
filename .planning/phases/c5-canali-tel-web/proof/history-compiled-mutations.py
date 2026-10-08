import hashlib
import json
from pathlib import Path
import subprocess

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
barrel = root / 'src/agent/index.ts'
original = barrel.read_bytes()
anchor = "export * from './agent-channel-history.js';"
assert original.decode().count(anchor) == 1
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
results = []

def build(name):
    result = subprocess.run(['pnpm', 'build'], cwd=root, env=env, capture_output=True, text=True, timeout=120)
    (proof / f'history-compiled-{name}-build.log').write_text(result.stdout + result.stderr)
    assert result.returncode == 0, ('native build failed', name)
    return result.returncode

try:
    barrel.write_text(original.decode().replace(anchor, ''))
    build('missing-export')
    for variant in ['esm', 'cjs']:
        result = subprocess.run(['node', 'tests/cjs/c5-phone-web-smoke.mjs', variant], cwd=root, env=env, capture_output=True, text=True, timeout=30)
        (proof / f'history-compiled-missing-export-{variant}.log').write_text(result.stdout + result.stderr)
        qualified = result.returncode != 0 and 'AssertionError' in result.stderr and f'{variant}: public history' in result.stderr
        results.append({'variant': variant, 'exitCode': result.returncode, 'qualified': qualified, 'failure': 'public export expected function, got undefined'})
finally:
    barrel.write_bytes(original)
    build('restored')
    result = subprocess.run(['node', 'tests/cjs/c5-phone-web-smoke.mjs'], cwd=root, env=env, capture_output=True, text=True, timeout=30)
    (proof / 'B0a-history-compiled-restored.json').write_text(result.stdout)
    restored = result.returncode == 0 and barrel.read_bytes() == original
    record = {'mutations': results, 'qualified': sum(result['qualified'] for result in results), 'total': 2, 'sourceRestored': restored, 'sha256': hashlib.sha256(original).hexdigest()}
    (proof / 'HISTORY-COMPILED-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
assert record['qualified'] == 2 and restored
print(json.dumps(record))
