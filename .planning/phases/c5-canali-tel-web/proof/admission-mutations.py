import hashlib
import json
from pathlib import Path
import re
import subprocess

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
source = root / 'src/agent/agent-phone-admission.ts'
original = source.read_bytes()
text = original.decode()
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
mutations = []

def add(name, before, after):
    assert text.count(before) == 1, (name, before)
    mutations.append((name, before, after))

def guard(name, before, after):
    lines = [line for line in text.splitlines() if '// guard:' + name in line]
    assert len(lines) == 1, name
    add(name, lines[0], lines[0].replace(before, after))

guard('authority-ttl', 'duration <= 0 || duration > 60_000', 'false')
guard('authority-order', 'Date.parse(authority.requestedAt) > Date.parse(authority.observedAt)', 'false')
add('clock-window', 'Number.isFinite(maximumAgeMs) && age >= 0 && age <= maximumAgeMs', 'age >= 0 && age <= maximumAgeMs')
add('clock-future', 'age >= 0 && age <= maximumAgeMs', 'age <= maximumAgeMs')
add('clock-stale', 'age >= 0 && age <= maximumAgeMs', 'age >= 0')
for name in ['book-parse', 'book-complete', 'book-binding']:
    guard(name, 'return false', 'return true')
guard('book-match', 'fresh(book.data.observedAt, now, maximumAgeMs) && book.data.phones.includes(number.data)', 'true')
guard('active-parse', 'return null', 'return snapshot.success ? snapshot.data : null')
for name in ['active-lifecycle', 'active-application', 'active-error', 'active-handler', 'active-observation', 'active-voice']:
    guard(name, 'return null', 'return current')
for name in ['inbound-parse', 'inbound-caller', 'inbound-route', 'outbound-parse', 'outbound-authority', 'outbound-correlation', 'outbound-request']:
    guard(name, 'return false', 'return true')
add('inbound-policy', "return config.access.appliedPolicy!.inbound === 'anyone'\n    || isPhoneNumberInAddressBook(event.data.fromNumber, rawBook, rawBinding, now, maximumAgeMs)", 'return true')
guard('outbound-book', 'isPhoneNumberInAddressBook(request.data.toNumber, rawBook, rawBinding, now, maximumAgeMs)', 'true')
for field, expression in [('phone', 'request.data.expectedPhoneVersion !== config.applied!.version'), ('number', 'request.data.expectedNumberVersion !== config.sharedNumber.version'), ('selector', 'request.data.expectedRoutingIdentity !== config.routing!.routingIdentity')]:
    add('outbound-generation-' + field, expression, 'false')
add('pending-phone', "config.applied?.state !== 'active'", "config.desired.state !== 'active'")
add('pending-voice', "voice.data.applied?.mode !== 'voice' || !voice.data.applied.transports.includes('phone')", "voice.data.desired.mode !== 'voice' || !voice.data.desired.transports.includes('phone')")
add('request-strict', "expectedRoutingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity,\n}).strict();", "expectedRoutingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity,\n}).passthrough();")
add('authority-strict', '}).strict().superRefine((authority, ctx) => {', '}).passthrough().superRefine((authority, ctx) => {')

def run(name, source_text):
    source.write_text(source_text)
    report = proof / f'admission-mutation-{name}.json'
    result = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/agent/c5-phone-admission.test.ts', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile=' + str(report)], cwd=root, env=env, capture_output=True, text=True, timeout=60)
    (proof / f'admission-mutation-{name}.log').write_text(result.stdout + result.stderr)
    payload = json.loads(report.read_text())
    failures = [test for suite in payload['testResults'] for test in suite['assertionResults'] if test['status'] == 'failed']
    functional = [test for test in failures if any(message.startswith('AssertionError:') or message.startswith('ZodError:') for message in test['failureMessages'])]
    qualified = result.returncode != 0 and bool(functional)
    return {'name': name, 'exitCode': result.returncode, 'totalTests': payload['numTotalTests'], 'functionalAssertions': [test['fullName'] for test in functional], 'otherFailureCount': len(failures) - len(functional), 'qualified': qualified}

results = []
try:
    # Validate the corrected canonical fixture against the original fail-closed behavior.
    closed = text.replace('return fresh(book.data.observedAt, now, maximumAgeMs) && book.data.phones.includes(number.data);', 'return false;')
    closed = closed.replace("return config.access.appliedPolicy!.inbound === 'anyone'\n    || isPhoneNumberInAddressBook(event.data.fromNumber, rawBook, rawBinding, now, maximumAgeMs);", 'return false;')
    closed = closed.replace('return isPhoneNumberInAddressBook(request.data.toNumber, rawBook, rawBinding, now, maximumAgeMs);', 'return false;')
    baseline = run('valid-fixture-closed-baseline', closed)
    (proof / 'ADMISSION-VALID-BASELINE.json').write_text(json.dumps(baseline, indent=2) + '\n')
    assert baseline['qualified'] and baseline['otherFailureCount'] == 0
    source.write_bytes(original)
    for name, before, after in mutations:
        result = run(name, text.replace(before, after))
        results.append(result)
        source.write_bytes(original)
        assert source.read_bytes() == original
        print(name, 'qualified=' + str(result['qualified']), 'assertions=' + str(len(result['functionalAssertions'])), 'other=' + str(result['otherFailureCount']), flush=True)
finally:
    source.write_bytes(original)
    record = {'mutations': results, 'qualified': sum(result['qualified'] for result in results), 'total': len(mutations), 'sourceRestored': source.read_bytes() == original, 'sha256': hashlib.sha256(original).hexdigest()}
    (proof / 'ADMISSION-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
if record['qualified'] != record['total']:
    raise SystemExit(1)
