"""Fresh-process semantic guard mutations with an independently verified restoration."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
SOURCE = BASE / 'src/agent/agent-phone-commands.ts'
PROOF = BASE / '.planning/phases/canali-c2-bridge/b2-proof'
PROOF.mkdir(exist_ok=True)
TEST = 'tests/agent/agent-phone-commands.test.ts'
golden = SOURCE.read_text()
original_hash = hashlib.sha256(golden.encode()).hexdigest()
records = []

def run(name):
    report = PROOF / f'{name}.json'
    command = ['pnpm', 'exec', 'vitest', 'run', TEST, '--maxWorkers=1', '--reporter=json', f'--outputFile={report}']
    result = subprocess.run(command, cwd=BASE, capture_output=True, text=True, timeout=60)
    report_data = json.loads(report.read_text())
    assertions = [a for suite in report_data['testResults'] for a in suite.get('assertionResults', [])]
    failures = [a for a in assertions if a['status'] == 'failed']
    semantic = [a['fullName'] for a in failures if any('AssertionError:' in message for message in a['failureMessages'])]
    return {'exit': result.returncode, 'total': report_data['numTotalTests'], 'passed': report_data['numPassedTests'],
            'failed': report_data['numFailedTests'], 'success': report_data['success'], 'semantic': semantic}

mutations = []
for line in golden.splitlines(True):
    if '// guard:' in line:
        name = line.split('// guard:')[1].strip()
        mutated = golden.replace(line, '', 1)
        if name == 'route-unique':
            mutated = golden.replace('if (matches.length !== 1) return null;', 'if (matches.length === 0) return null;', 1)
        mutations.append((name, mutated))
strict_patterns = {
 'strict-snapshot': ('}).strict().superRefine((snapshot, ctx)', '}).passthrough().superRefine((snapshot, ctx)'),
 'strict-command': ('expectedRoutingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity.nullable(),\n}).strict();', 'expectedRoutingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity.nullable(),\n}).passthrough();'),
 'strict-receipt': ('}).strict().superRefine((result, ctx) => {\n  const config = result.snapshot.configuration;', '}).passthrough().superRefine((result, ctx) => {\n  const config = result.snapshot.configuration;'),
 'strict-route-result': ('}).strict().superRefine((result, ctx) => {\n  const issue =', '}).passthrough().superRefine((result, ctx) => {\n  const issue ='),
 'strict-event': ('routingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity, receivedAt: time,\n}).strict();', 'routingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity, receivedAt: time,\n}).passthrough();'),
 'strict-inventory': ('}).strict().superRefine((inventory, ctx)', '}).passthrough().superRefine((inventory, ctx)'),
 'strict-source': ('source: AgentRuntimeSourceSchema.strict()', 'source: AgentRuntimeSourceSchema'),
 'no-request-queue': ('requestChanges: z.null()', 'requestChanges: AgentChannelAccessApplyCommandSchema.shape.requestChanges'),
 'clock-and-age': ('return Number.isFinite(now) && Number.isFinite(maximumAgeMs) && age >= 0 && age <= maximumAgeMs;', 'return true;'),
 'route-selector': ('snapshot.configuration.routing?.routingIdentity === event.data.routingIdentity', 'snapshot.configuration.routing != null'),
 'route-number': ('snapshot.configuration.routing.number === event.data.toNumber', 'true'),
}
for name, (old, new) in strict_patterns.items():
    assert golden.count(old) == 1, (name, golden.count(old))
    mutations.append((name, golden.replace(old, new, 1)))

try:
    initial = run('initial')
    assert initial['exit'] == 0 and initial['success'] and initial['passed'] == initial['total'], initial
    for name, mutated in mutations:
        try:
            SOURCE.write_text(mutated)
            red = run(f'{name}-red')
        finally:
            SOURCE.write_text(golden)
        green = run(f'{name}-restored')
        restored_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
        qualified = red['exit'] == 1 and red['total'] == initial['total'] and bool(red['semantic'])
        restored = green['exit'] == 0 and green['success'] and green['passed'] == initial['total'] and restored_hash == original_hash
        records.append({'name': name, 'qualified': qualified, 'restored': restored, 'red': red, 'green': green, 'hash': restored_hash})
        (PROOF/'mutations.json').write_text(json.dumps({'initial': initial, 'hash': original_hash, 'mutations': records}, indent=2)+'\n')
        print(f"{name}: semantic={len(red['semantic'])} failures={red['failed']}/{red['total']} restored={green['passed']}/{green['total']} qualified={qualified}", flush=True)
        if not qualified or not restored:
            raise RuntimeError(f'Unqualified mutation or restoration failure: {name}')
finally:
    SOURCE.write_text(golden)
