import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
source = root / 'src/agent/agent-channel-access.ts'
original = source.read_bytes()
text = original.decode()
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
mutations = [
    ('phone-format', 'phones: z.array(VoiceLiveCallStartRequestSchema.shape.to_number)', 'phones: z.array(z.string())'),
    ('phone-bound', 'phones: z.array(VoiceLiveCallStartRequestSchema.shape.to_number).max(2048)', 'phones: z.array(VoiceLiveCallStartRequestSchema.shape.to_number).max(2049)'),
    ('phone-unique', 'new Set(phones).size === phones.length', 'true'),
    ('phone-complete', "book.status !== 'complete' && book.phones != null", 'false'),
    ('phone-null', "{ message: 'Address-book phones must be unique' }).nullable().optional()", "{ message: 'Address-book phones must be unique' }).optional()"),
    ('phone-legacy', "{ message: 'Address-book phones must be unique' }).nullable().optional()", "{ message: 'Address-book phones must be unique' }).nullable().optional().default([])"),
]
results = []
try:
    for name, before, after in mutations:
        assert text.count(before) == 1, (name, 'anchor')
        source.write_text(text.replace(before, after))
        report = proof / f'address-mutation-{name}.json'
        command = ['pnpm', 'exec', 'vitest', 'run', 'tests/agent/c5-phone-address-book.test.ts', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile=' + str(report)]
        result = subprocess.run(command, cwd=root, env=env, capture_output=True, text=True, timeout=60)
        (proof / f'address-mutation-{name}.log').write_text(result.stdout + result.stderr)
        payload = json.loads(report.read_text())
        failures = [test for suite in payload['testResults'] for test in suite['assertionResults'] if test['status'] == 'failed']
        messages = '\n'.join(message for failure in failures for message in failure['failureMessages'])
        functional = bool(failures) and ('AssertionError' in messages or 'ZodError' in messages)
        invalid = any(value in messages for value in ['Cannot find module', 'is not a function', 'Transform failed', 'timed out'])
        qualified = result.returncode != 0 and functional and not invalid
        results.append({'name': name, 'exitCode': result.returncode, 'failedTests': len(failures), 'totalTests': payload['numTotalTests'], 'qualified': qualified, 'failingAssertions': [failure['fullName'] for failure in failures]})
        source.write_bytes(original)
        assert source.read_bytes() == original
        print(name, 'qualified=' + str(qualified), 'failures=' + str(len(failures)), flush=True)
finally:
    source.write_bytes(original)
    record = {'mutations': results, 'qualified': sum(result['qualified'] for result in results), 'total': len(mutations), 'sourceRestored': source.read_bytes() == original, 'sha256': hashlib.sha256(original).hexdigest()}
    (proof / 'ADDRESS-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
if record['qualified'] != record['total']:
    raise SystemExit(1)
