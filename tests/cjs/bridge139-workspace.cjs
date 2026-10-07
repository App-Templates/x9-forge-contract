const test = require('node:test');
const assert = require('node:assert/strict');
const a = require('@x9-forge/contracts/agent');
const h = require('@x9-forge/contracts/http');
const att = { appliedVersion: 8, sha256: 'a'.repeat(64), loadedAt: '2026-10-07T11:00:00Z' };
const runtime = { kind: 'runtime', targetId: 'synthetic-agent' };
const command = { ok: true, agentId: 'synthetic-agent', requestId: 'synthetic-request', action: 'apply-config', replayed: false, outcome: 'ok', results: [{ target: runtime, outcome: 'ok' }], requestedVersion: 8, versions: { desired: 8, applied: 8, failed: null }, completedAt: att.loadedAt };
const state = { agentId: 'synthetic-agent', versions: { desired: 9, applied: 8, failed: null }, targets: [{ target: runtime, actions: ['start'] }] };
const list = { agentId: 'synthetic-agent', displayName: 'Synthetic', ownerId: 'synthetic-owner' };
function parsed(schema, value) { assert.equal(typeof schema?.safeParse, 'function'); return schema.safeParse(value); }
function preserves(schema, value) { const p = parsed(schema, value); assert.equal(p.success, true); assert.deepEqual(p.data, value); }
test('resolves the installed archive CJS subpath', () => assert.match(require.resolve('@x9-forge/contracts/agent'), /b139-consumer\/node_modules\/@x9-forge\/contracts\/dist\/agent\/index\.cjs$/));
test('exports canonical attestation and helper', () => { assert.equal(typeof a.AgentWorkspaceAttestationSchema?.safeParse, 'function'); assert.equal(typeof a.attestedWorkspaceVersionOf, 'function'); });
const invalid = [['zero', { ...att, appliedVersion: 0 }], ['unsafe', { ...att, appliedVersion: Number.MAX_SAFE_INTEGER + 1 }], ['fraction', { ...att, appliedVersion: 1.5 }], ['hash', { ...att, sha256: 'g'.repeat(64) }], ['date', { ...att, loadedAt: '2026-02-30T00:00:00Z' }], ['missing', { appliedVersion: 8, sha256: att.sha256 }], ['extra', { ...att, desired: 9 }], ['string', 'synthetic'], ['array', [att]]];
for (const [name, schema, base] of [['command', a.AgentManagementCommandResultSchema, command], ['state', a.AgentManagementStateSchema, state], ['list', h.ListAgentsAgentSchema, list]]) {
  test(name + ' preserves legacy absence', () => preserves(schema, base));
  test(name + ' preserves complete attestation', () => preserves(schema, { ...base, workspace: att }));
  for (const [label, workspace] of invalid) test(name + ' rejects ' + label, () => assert.equal(parsed(schema, { ...base, workspace }).success, false));
}
for (const [label, input] of [['missing', {}], ['null', { workspace: null }], ['config', { configVersion: 8 }], ['desired', { workspace: { version: 8 } }], ['other row', { agents: [{ workspace: att }] }]]) {
  test('selector rejects fallback ' + label, () => { assert.equal(typeof a.attestedWorkspaceVersionOf, 'function'); assert.equal(a.attestedWorkspaceVersionOf(input), null); });
}
test('selector returns only full valid attestation', () => { assert.equal(typeof a.attestedWorkspaceVersionOf, 'function'); assert.equal(a.attestedWorkspaceVersionOf({ workspace: att, configVersion: 99 }), 8); assert.equal(a.attestedWorkspaceVersionOf({ workspace: { ...att, sha256: '' } }), null); });
for (const [name, schema, base] of [['command', a.AgentManagementCommandResultSchema, command], ['state', a.AgentManagementStateSchema, state]]) {
  for (const version of [7, 9]) test(name + ' rejects contradictory applied ' + version, () => assert.equal(parsed(schema, { ...base, workspace: { ...att, appliedVersion: version } }).success, false));
}
test('null command requires explicit runtime failure', () => assert.equal(parsed(a.AgentManagementCommandResultSchema, { ...command, workspace: null }).success, false));
test('failed command retains explicit null and previous applied version', () => preserves(a.AgentManagementCommandResultSchema, { ...command, workspace: null, outcome: 'error', results: [{ target: runtime, outcome: 'error', reason: { code: 'load-failed' } }], versions: { desired: 8, applied: 7, failed: { version: 8, reason: { code: 'load-failed' } } } }));
test('state and inventory preserve explicit unknown null', () => { preserves(a.AgentManagementStateSchema, { ...state, workspace: null }); preserves(h.ListAgentsAgentSchema, { ...list, workspace: null }); });
