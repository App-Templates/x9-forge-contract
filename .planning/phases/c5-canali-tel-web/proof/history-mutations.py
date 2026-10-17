import hashlib
import json
from pathlib import Path
import subprocess
root = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-143-1')
proof = root / '.planning/phases/c5-canali-tel-web/proof'
paths = [root / name for name in ['src/agent/agent-channel-history.ts', 'src/http/endpoints/forge-agent-channel-history.ts', 'src/http/endpoints/internal-agent-channel-history.ts']]
originals = {p: p.read_bytes() for p in paths}
source, forge, internal = paths
mutations = []
def add(path, name, before, after):
    assert originals[path].decode().count(before) == 1, (name, 'anchor')
    mutations.append((path, name, before, after))
for name, before in [
 ('terminal-time', 'terminal !== (entry.endedAt !== null)'),
 ('unknown-duration', 'entry.endedAt === null && entry.durationSeconds !== null'),
 ('chronology', 'elapsed < 0'),
 ('elapsed-duration', 'entry.durationSeconds !== null && entry.durationSeconds * 1000 > elapsed'),
 ('entry-binding', 'history.entries.some(entry => !sameAgentChannelAccessBinding(bindingOf(entry), bindingOf(history)))'),
 ('entry-kind', 'history.entries.some(entry => entry.kind !== history.kind)'),
 ('entry-unique', 'new Set(history.entries.map(entry => entry.entryId)).size !== history.entries.length'),
 ('total', 'history.total !== null && history.total < history.entries.length'),
 ('empty-cursor', 'history.entries.length === 0 && history.nextCursor !== null'),
 ('observed-events', 'history.entries.some(entry => Date.parse(entry.startedAt) > Date.parse(history.observedAt)\n    || (entry.endedAt !== null && Date.parse(entry.endedAt) > Date.parse(history.observedAt)))'),
]: add(source, name, before, 'false')
for name, before in [
 ('probe-entry', '!entry || '),
 ('probe-request', 'entry.requestId !== verification.requestId || '),
 ('probe-end', 'entry.endedAt !== verification.completedAt\n      || '),
 ('probe-outcome', 'entry.status !== verification.outcome'),
]:
    # Missing-entry bypass uses the first record, a valid but deliberately wrong correlation.
    if name == 'probe-entry':
        add(source, name, 'history.entries.find(value => value.entryId === verification.entryId)', 'history.entries[0]')
    else: add(source, name, before, 'false' if name == 'probe-outcome' else '')
for name, before in [
 ('current-binding', 'sameAgentChannelAccessBinding(bindingOf(actual), binding.data)'),
 ('current-kind', 'actual.kind === kind.data'),
 ('current-future', 'Date.parse(actual.observedAt) <= now'),
 ('current-fresh', 'now - Date.parse(actual.observedAt) < maximumAgeMs'),
 ('verification-success', "verification.outcome === 'completed'"),
 ('verification-request', 'verification.requestId === requestId.data'),
 ('verification-fresh', 'now - Date.parse(verification.completedAt) < maximumAgeMs'),
]: add(source, name, before, 'true')
add(source, 'finite-window', '!Number.isFinite(maximumAgeMs)', 'false')
add(source, 'verification-current', 'if (!isAgentChannelHistoryCurrent(rawHistory, rawBinding, rawKind, now, maximumAgeMs))', 'if (false)')
add(source, 'verification-required', 'const verification = history.data.lastVerification;', "const verification = history.data.lastVerification ?? { outcome: 'completed', requestId: requestId.data, completedAt: history.data.observedAt };")
add(source, 'page-bound', 'z.array(AgentChannelHistoryEntrySchema).max(100)', 'z.array(AgentChannelHistoryEntrySchema).max(101)')
add(source, 'duration-nonnegative', 'z.number().finite().nonnegative().nullable()', 'z.number().finite().nullable()')
add(source, 'total-integer', 'total: z.number().int().nonnegative()', 'total: z.number().nonnegative()')
add(source, 'content-strict', 'transcript: AgentChannelHistoryContentStateSchema }).strict()', 'transcript: AgentChannelHistoryContentStateSchema }).passthrough()')
add(source, 'entry-strict', '}).superRefine((entry, ctx)', '}).passthrough().superRefine((entry, ctx)')
add(source, 'history-strict', '}).superRefine((history, ctx)', '}).passthrough().superRefine((history, ctx)')
add(source, 'probe-strict', "completedAt: time, outcome: z.enum(['completed', 'failed']),\n}).strict()", "completedAt: time, outcome: z.enum(['completed', 'failed']),\n}).passthrough()")
add(source, 'unavailable-not-empty', "observedAt: time.nullable(), error: AgentChannelAccessErrorCodeSchema,\n});", "observedAt: time.nullable(), error: AgentChannelAccessErrorCodeSchema,\n}).passthrough();")
add(forge, 'url-management', 'if (source.identity.managementAgentId !== params.data.agentId)', 'if (false)')
add(forge, 'owner-tenant', 'source.scope.tenantId === access.data.tenantId', 'true')
add(forge, 'owner-owner', 'source.scope.ownerId === access.data.ownerId', 'true')
add(forge, 'sa', "access.data.role === 'sa'", 'false')
add(internal, 'query-min', '.int().min(1).max(100)', '.int().min(0).max(100)')
add(internal, 'query-max', '.int().min(1).max(100)', '.int().min(1).max(101)')
add(internal, 'query-integer', 'z.coerce.number().int().min(1)', 'z.coerce.number().min(1)')
add(internal, 'query-strict', 'cursor: AgentManagementRequestIdSchema.optional(),\n}).strict()', 'cursor: AgentManagementRequestIdSchema.optional(),\n}).passthrough()')
add(internal, 'params-strict', 'extend({ kind: AgentChannelHistoryKindSchema }).strict()', 'extend({ kind: AgentChannelHistoryKindSchema }).passthrough()')
add(internal, 'internal-auth', "authType: 'secret' as const", "authType: 'none' as const")
add(internal, 'internal-method', "method: 'GET' as const", "method: 'POST' as const")
add(forge, 'browser-session', "authentication: 'forge-session' as const", "authentication: 'none' as const")
add(forge, 'browser-authorization', "authorization: 'sa-or-agent-owner' as const", "authorization: 'none' as const")
add(forge, 'browser-method', "method: 'GET' as const", "method: 'POST' as const")
env = {'HOME': '/Users/admintemp', 'PATH': '/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin', 'NO_COLOR': '1'}
results = []
try:
    for path, name, before, after in mutations:
        path.write_text(originals[path].decode().replace(before, after))
        report = proof / ('history-mutation-' + name + '.json')
        run = subprocess.run(['pnpm', 'exec', 'vitest', 'run', 'tests/agent/c5-channel-history.test.ts', 'tests/http/endpoints/c5-channel-history.test.ts', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile=' + str(report)], cwd=root, env=env, capture_output=True, text=True, timeout=60)
        (proof / ('history-mutation-' + name + '.log')).write_text(run.stdout + run.stderr)
        data = json.loads(report.read_text())
        failed = [a for f in data['testResults'] for a in f['assertionResults'] if a['status'] == 'failed']
        functional = [a for a in failed if any('AssertionError' in m or 'ZodError' in m for m in a['failureMessages'])]
        other = [a for a in failed if a not in functional]
        qualified = run.returncode != 0 and bool(functional) and not other
        results.append({'name': name, 'file': str(path.relative_to(root)), 'exitCode': run.returncode, 'tests': data['numTotalTests'], 'functionalFailures': len(functional), 'otherFailures': len(other), 'qualified': qualified, 'failingAssertions': [a['fullName'] for a in functional]})
        print(name, qualified, len(functional), len(other), flush=True)
        path.write_bytes(originals[path])
finally:
    for path, original in originals.items(): path.write_bytes(original)
    record = {'total': len(mutations), 'qualified': sum(a['qualified'] for a in results), 'mutations': results, 'restored': all(p.read_bytes() == raw for p, raw in originals.items()), 'sha256': {str(p.relative_to(root)): hashlib.sha256(raw).hexdigest() for p, raw in originals.items()}}
    (proof / 'HISTORY-MUTATIONS.json').write_text(json.dumps(record, indent=2) + '\n')
if record['qualified'] != record['total']: raise SystemExit(1)
