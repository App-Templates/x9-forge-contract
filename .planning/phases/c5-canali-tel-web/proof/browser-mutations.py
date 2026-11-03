import hashlib
import json
from pathlib import Path
import subprocess
root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
browser = root / 'src/capability/agent-elevenlabs/web-browser.ts'
session = root / 'src/capability/agent-elevenlabs/web-session.ts'
originals = {p: p.read_bytes() for p in [browser, session]}
mutations = []
def add(path, name, before, after):
    assert originals[path].decode().count(before) == 1, (name, 'anchor')
    mutations.append((path, name, before, after))
add(browser, 'browser-request-strict', '}).strict();', '}).passthrough();')
add(browser, 'browser-response-strict', '}).strict().superRefine((lease, ctx)', '}).passthrough().superRefine((lease, ctx)')
add(browser, 'browser-window', 'duration <= 0 || duration > 15 * 60_000', 'false')
add(browser, 'browser-url', 'if (!isElevenLabsWebSignedConnectionUrl(lease.signedUrl, providerId))', 'if (false)')
add(browser, 'browser-request-id', 'browser.data.requestId !== request.data.requestId || ', '')
add(browser, 'browser-link-id', 'browser.data.linkId !== request.data.linkId', 'false')
add(browser, 'projection-session', 'if (!isElevenLabsWebSessionCurrent(request.data, result.data, evidence.snapshot, evidence.viewer, evidence.configuredOrigin, evidence.now))', 'if (false)')
add(browser, 'projection-authority', 'if (!isElevenLabsWebAuthorityUsable(authorityRequest, evidence.authorityResponse, evidence.viewer, evidence.configuredOrigin,\n    evidence.authorityVersion, evidence.agentIdentity, evidence.now))', 'if (false)')
add(browser, 'after-phase', "phase: 'after'", "phase: 'before'")
add(browser, 'projection-private-fields', 'return ElevenLabsWebBrowserSessionSchema.parse({ ok: true, requestId: result.data.requestId, linkId: result.data.link.linkId,\n    issuedAt: result.data.issuedAt, expiresAt: result.data.expiresAt, signedUrl: result.data.signedUrl });', 'return { ...result.data, linkId: result.data.link.linkId };')
transport = originals[session].decode()
start = transport.index('export function isElevenLabsWebSignedConnectionUrl')
end = transport.index('\n}', start) + 2
transport = transport[start:end]
for name, before in [
 ('url-protocol', "url.protocol === 'wss:'"), ('url-host', "url.host === 'api.elevenlabs.io'"),
 ('url-path', "url.pathname === '/v1/convai/conversation'"), ('url-username', "url.username === ''"),
 ('url-password', "url.password === ''"), ('url-fragment', "url.hash === ''"),
 ('url-one-resource', "url.searchParams.getAll('agent_id').length === 1"),
 ('url-bound-resource', "url.searchParams.get('agent_id') === provider.data"),
 ('url-one-signature', "url.searchParams.getAll('conversation_signature').length === 1"),
 ('url-signature', "!!url.searchParams.get('conversation_signature')"),
]:
    assert transport.count(before) == 1
    add(session, name, transport, transport.replace(before, 'true'))
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
results = []
try:
    for path, name, before, after in mutations:
        path.write_text(originals[path].decode().replace(before, after))
        report = proof / ('browser-mutation-' + name + '.json')
        run = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/capability/c5-web-browser.test.ts', 'tests/capability/agent-elevenlabs-web-session.test.ts', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile=' + str(report)], cwd=root, env=env, capture_output=True, text=True, timeout=60)
        (proof / ('browser-mutation-' + name + '.log')).write_text(run.stdout + run.stderr)
        data = json.loads(report.read_text()); failed = [a for f in data['testResults'] for a in f['assertionResults'] if a['status'] == 'failed']
        functional = [a for a in failed if any('AssertionError' in m for m in a['failureMessages'])]; other = [a for a in failed if a not in functional]
        qualified = run.returncode != 0 and bool(functional) and not other
        results.append({'name': name, 'exitCode': run.returncode, 'tests': data['numTotalTests'], 'functionalFailures': len(functional), 'otherFailures': len(other), 'qualified': qualified, 'failingAssertions': [a['fullName'] for a in functional]})
        print(name, qualified, len(functional), len(other), flush=True)
        path.write_bytes(originals[path])
finally:
    for p, raw in originals.items(): p.write_bytes(raw)
    record = {'total': len(mutations), 'qualified': sum(a['qualified'] for a in results), 'mutations': results, 'restored': all(p.read_bytes() == raw for p, raw in originals.items()), 'sha256': {str(p.relative_to(root)): hashlib.sha256(raw).hexdigest() for p, raw in originals.items()}}
    (proof / 'BROWSER-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
assert record['qualified'] == record['total']
