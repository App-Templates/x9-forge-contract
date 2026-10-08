import hashlib
import json
from pathlib import Path
import subprocess

root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
source = root / 'src/capability/agent-elevenlabs/web-context.ts'
original = source.read_bytes()
text = original.decode()
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
mutations = []
for field in ['tenantId', 'ownerId', 'agentId']:
    mutations.append(('identity-' + field, field + ': identity.' + field, field + ': snapshot.scope.' + field))
mutations.extend([
 ('diagnostic-identity', 'if (response.snapshot?.agentIdentity != null)', 'if (false)'),
 ('active-lifecycle', "if (snapshot.lifecycle !== 'active')", 'if (false)'),
 ('resolved-identity', 'agentIdentity: AgentContextIdentitySchema,', 'agentIdentity: AgentContextIdentitySchema.nullable(),'),
 ('expected-identity', 'AgentContextIdentitySchema.safeParse(expectedIdentity)', 'AgentContextIdentitySchema.safeParse(response.success && response.data.ok ? response.data.snapshot.agentIdentity : expectedIdentity)'),
 ('identity-match', 'JSON.stringify(response.data.snapshot.agentIdentity) === JSON.stringify(identity.data)', 'true'),
 ('current-authority', 'isElevenLabsWebAuthorityCurrent(rawRequest, response.data.snapshot, expectedViewer, configuredOrigin, expectedVersion, now)', 'true'),
 ('success-strict', "}).strict().superRefine((response, ctx) => {\n  const request = response.request, snapshot = response.snapshot;", "}).passthrough().superRefine((response, ctx) => {\n  const request = response.request, snapshot = response.snapshot;"),
])
# Change only the successful correlation guard, leaving the legacy diagnostics intact.
start = text.index('const ElevenLabsWebAuthoritySuccessSchema')
for name, before in [
 ('request', 'snapshot.requestId !== request.requestId'),
 ('scope', '!sameCapabilityScope(snapshot.scope, request.scope)'),
 ('link', 'snapshot.linkId !== request.linkId'),
 ('phase', 'snapshot.phase !== request.phase'),
]:
    fragment = text[start:]
    assert fragment.count(before) == 1
    mutations.append(('success-' + name, fragment, fragment.replace(before, 'false')))
results = []
try:
    for name, before, after in mutations:
        assert text.count(before) == 1, (name, 'anchor')
        source.write_text(text.replace(before, after))
        report = proof / ('web-identity-mutation-' + name + '.json')
        result = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/http/c5-web-identity.test.ts', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile=' + str(report)], cwd=root, env=env, capture_output=True, text=True, timeout=60)
        (proof / ('web-identity-mutation-' + name + '.log')).write_text(result.stdout + result.stderr)
        payload = json.loads(report.read_text())
        failed = [a for f in payload['testResults'] for a in f['assertionResults'] if a['status'] == 'failed']
        functional = [a for a in failed if any('AssertionError' in m or 'ZodError' in m for m in a['failureMessages'])]
        other = [a for a in failed if a not in functional]
        qualified = result.returncode != 0 and len(functional) > 0 and not other
        results.append({'name': name, 'exitCode': result.returncode, 'totalTests': payload['numTotalTests'], 'functionalFailures': len(functional), 'otherFailures': len(other), 'qualified': qualified, 'failingAssertions': [a['fullName'] for a in functional]})
        print(name, qualified, len(functional), len(other), flush=True)
        source.write_bytes(original)
finally:
    source.write_bytes(original)
    record = {'total': len(mutations), 'qualified': sum(a['qualified'] for a in results), 'sourceRestored': source.read_bytes() == original, 'sha256': hashlib.sha256(original).hexdigest(), 'mutations': results}
    (proof / 'WEB-IDENTITY-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
if record['qualified'] != record['total']:
    raise SystemExit(1)
