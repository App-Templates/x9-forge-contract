"""Verify each HTTP boundary mutation and a fresh restored process."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
PROOF = BASE / '.planning/phases/canali-c2-bridge/b4-proof'
PROOF.mkdir(exist_ok=True)
FILES = {k: BASE / f'src/http/endpoints/{name}' for k, name in [('internal', 'internal-agent-phone-channel.ts'), ('forge', 'forge-agent-phone-channel.ts')]}
golden = {k: p.read_text() for k, p in FILES.items()}
hashes = {k: hashlib.sha256(v.encode()).hexdigest() for k, v in golden.items()}
TESTS = ['tests/http/endpoints/agent-phone-http-internal.test.ts', 'tests/http/endpoints/agent-phone-http-forge.test.ts']
mutations = []

def replace(name, file, old, new):
    assert golden[file].count(old) == 1, (name, golden[file].count(old))
    mutations.append((name, file, golden[file].replace(old, new, 1)))

for key, source in golden.items():
    for line in source.splitlines(True):
        if '// guard:' in line:
            mutations.append((line.split('// guard:')[1].strip(), key, source.replace(line, '', 1)))
    for index, line in enumerate(source.splitlines(True)):
        if "path: '" in line:
            path = re.search(r"path: '([^']+)'", line).group(1)
            replace(f'{key}-path-{index}', key, line, line.replace(path, path + '/wrong'))
            method = re.search(r"method: '([^']+)'", line).group(1)
            replace(f'{key}-method-{index}', key, line, line.replace(f"method: '{method}'", "method: 'POST'" if method == 'GET' else "method: 'GET'"))
            if "authType: 'secret'" in line:
                replace(f'{key}-auth-{index}', key, line, line.replace("authType: 'secret'", "authType: 'none'"))
replace('params-strict', 'internal', 'AgentManagementParamsSchema.strict()', 'AgentManagementParamsSchema.passthrough()')
replace('owner-scope', 'forge', 'config.scope.ownerId === access.data.ownerId', 'true')
replace('tenant-scope', 'forge', 'config.scope.tenantId === access.data.tenantId', 'true')
replace('sa-supported', 'forge', "access.data.role === 'sa'", 'false')
replace('draft-cas-order', 'forge', 'draft => draft.expectedAppliedVersion === null || draft.expectedAppliedVersion <= draft.expectedDesiredVersion,', '_draft => true,')
replace('preview-cas-echo', 'forge', 'preview => preview.requestId === preview.draft.requestId && isForgeAgentPhoneDraftForSnapshot(preview.draft, preview.snapshot),', '_preview => true,')
replace('preview-exact-intent', 'forge', 'return JSON.stringify(draft.data) === JSON.stringify(actual.draft);', 'return true;')
replace('draft-strict', 'forge', '}).strict().refine(draft =>', '}).passthrough().refine(draft =>')
replace('preview-strict', 'forge', '}).strict().refine(preview =>', '}).passthrough().refine(preview =>')
replace('browser-session', 'forge', "authentication: 'forge-session'", "authentication: 'none'")
replace('browser-authorization', 'forge', "authorization: 'sa-or-agent-owner'", "authorization: 'none'")

records = []
def run(name):
    report = PROOF / f'{name}.json'
    result = subprocess.run(['pnpm', 'exec', 'vitest', 'run', *TESTS, '--maxWorkers=1', '--reporter=json', f'--outputFile={report}'], cwd=BASE, capture_output=True, text=True, timeout=60)
    data = json.loads(report.read_text())
    assertions = [a for s in data['testResults'] for a in s.get('assertionResults', [])]
    failures = [a for a in assertions if a['status'] == 'failed']
    semantic = [a['fullName'] for a in failures if any('AssertionError:' in m for m in a['failureMessages'])]
    return {'exit': result.returncode, 'total': data['numTotalTests'], 'passed': data['numPassedTests'], 'failed': data['numFailedTests'], 'success': data['success'], 'semantic': semantic}

try:
    initial = run('initial')
    assert initial['exit'] == 0 and initial['success'] and initial['passed'] == initial['total'], initial
    for name, key, mutated in mutations:
        try:
            FILES[key].write_text(mutated)
            red = run(name+'-red')
        finally:
            FILES[key].write_text(golden[key])
        green = run(name+'-restored')
        restored_hashes = {k: hashlib.sha256(p.read_bytes()).hexdigest() for k, p in FILES.items()}
        qualified = red['exit'] == 1 and red['total'] == initial['total'] and bool(red['semantic'])
        restored = green['exit'] == 0 and green['success'] and green['passed'] == initial['total'] and hashes == restored_hashes
        records.append({'name':name,'file':key,'qualified':qualified,'restored':restored,'red':red,'green':green,'hashes':restored_hashes})
        (PROOF/'mutations.json').write_text(json.dumps({'initial':initial,'hashes':hashes,'mutations':records},indent=2)+'\n')
        print(f"{name}: semantic={len(red['semantic'])} failures={red['failed']}/{red['total']} restored={green['passed']}/{green['total']} qualified={qualified}",flush=True)
        if not qualified or not restored: raise RuntimeError('Unqualified mutation or restoration: '+name)
finally:
    for key, path in FILES.items(): path.write_text(golden[key])
