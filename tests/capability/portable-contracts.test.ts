import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { getPortableCapabilityContracts, parsePortableOrdinaryToolCall, parsePortableAuthorityResponse, parsePortableRagToolCall, applyPortableCapabilityRules } from '../../src/capability/portable-contracts.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const snapshot = { scope, capability: 'rag', version: 7, values: { 'query.topK': 5 } };
const call = { callId: 'call-1', tool: 'rag_query', input: {}, agentId: scope.agentId,
  sessionId: 'session-1', tenantId: scope.tenantId, ownerId: scope.ownerId, ordinaryConfiguration: snapshot };

const organization = {
  organizationRun: { schemaVersion: 1, runId: 'run-1', organizationId: 'org-1', ownerId: 'owner-1',
    identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 }, issuer: 'x9',
    issuedAt: '2026-10-14T10:00:00.000Z', expiresAt: '2026-10-14T11:00:00.000Z' },
  attempt: { runId: 'run-1', attemptId: 'att-1', attemptNumber: 1, startedAt: '2026-10-14T10:01:00.000Z', idempotencyKey: 'idem-1' },
  tenantId: 'tenant-a',
};

describe('canonical portable subset for RAG', () => {
  it('refines the organization run only when the context is present', () => {
    expect(parsePortableOrdinaryToolCall(call, snapshot)).toEqual(call);
    expect(parsePortableOrdinaryToolCall({ ...call, organization }, snapshot)).toEqual({ ...call, organization });
    const mismatched = { ...organization, attempt: { ...organization.attempt, runId: 'run-2' } };
    expect(() => parsePortableOrdinaryToolCall({ ...call, organization: mismatched }, snapshot)).toThrow();
    const rule = { op: 'equal_paths_if_present' as const, left: 'organization.attempt.runId', right: 'organization.organizationRun.runId' };
    expect(() => applyPortableCapabilityRules({ organization: mismatched }, [rule])).toThrow('Portable ordinary scope mismatch');
    expect(() => applyPortableCapabilityRules({ organization: { attempt: { runId: 'run-1' } } }, [rule])).toThrow();
    expect(() => applyPortableCapabilityRules({}, [rule])).not.toThrow();
    const expired = { ...organization, organizationRun: { ...organization.organizationRun, expiresAt: organization.organizationRun.issuedAt } };
    expect(() => parsePortableOrdinaryToolCall({ ...call, organization: expired }, snapshot)).toThrow();
  });
  it('binds ordinary calls to authenticated loaded authority, including exact values', () => {
    expect(parsePortableOrdinaryToolCall(call, snapshot)).toEqual(call);
    for (const authority of [undefined, { ...snapshot, version: 8 }, { ...snapshot, values: {} },
      { ...snapshot, scope: { ...scope, ownerId: 'foreign' } }, { ...snapshot, capability: 'news' }]) {
      expect(() => parsePortableOrdinaryToolCall(call, authority)).toThrow();
    }
    expect(() => parsePortableOrdinaryToolCall({ ...call, ownerId: 'foreign' }, snapshot)).toThrow();
    expect(() => parsePortableOrdinaryToolCall({ ...call, ordinaryConfiguration: undefined }, snapshot)).toThrow();
  });
  it('declares unsupported refinement boundaries instead of claiming portable lifecycle/config', () => {
    const catalog = getPortableCapabilityContracts();
    expect(catalog.contracts.ordinaryToolCall.supported).toBe(true);
    expect(catalog.contracts.authorityQuery!.supported).toBe(true);
    expect(catalog.contracts.authorityResponse!.supported).toBe(true);
    expect(catalog.contracts.lifecycleRequest!.supported).toBe(true);
    expect(catalog.contracts.lifecycleReceipt!.supported).toBe(true);
    for (const name of ['configuration']) {
      expect(catalog.contracts[name]!.supported).toBe(false);
      expect(catalog.contracts[name]!.gates.length).toBeGreaterThan(0);
    }
    expect(JSON.stringify(catalog)).toBe(JSON.stringify(getPortableCapabilityContracts()));
  });
  it('binds no-configuration authority to exact lookup and expected Core identity', () => {
    const identity = { managementAgentId: 'managed-a', runtimeAgentId: scope.agentId };
    const query = { view: 'ordinary-authority', tenantId: scope.tenantId, ownerId: scope.ownerId,
      runtimeAgentId: scope.agentId, capability: 'rag', requestId: 'request-1', bundleVersion: '7', bundleSha256: 'a'.repeat(64) };
    const response = { scope, identity, capability: 'rag', requestId: 'request-1',
      bundle: { appliedVersion: 7, sha256: query.bundleSha256 }, membership: 'enabled', configuration: null };
    expect(parsePortableAuthorityResponse(response, query, identity)).toEqual(response);
    const withoutSettings = (({ ordinaryConfiguration: _ordinary, ...rest }) => rest)(call);
    expect(parsePortableRagToolCall(withoutSettings, { lookup: query, identity, response })).toEqual(withoutSettings);
    expect(() => parsePortableRagToolCall(withoutSettings, { lookup: query, identity, response: { ...response, membership: 'removed' } })).toThrow();
    for (const mutation of [{ membership: 'disabled', configuration: {} }, { requestId: 'request-2' },
      { identity: { ...identity, managementAgentId: 'foreign' } }]) {
      expect(() => parsePortableAuthorityResponse({ ...response, ...mutation }, query, identity)).toThrow();
    }
  });
  it('accepts only empty frozen configurations and binds Python lifecycle and GET evidence', () => {
    const catalog = getPortableCapabilityContracts();
    const identity = { managementAgentId: 'managed-a', runtimeAgentId: scope.agentId };
    const bundle = { appliedVersion: 7, sha256: 'a'.repeat(64) };
    const configuration = { format: 'ordinary-v2', scope, capability: 'rag', version: 1, parameters: [] };
    const query = { view: 'ordinary-authority', tenantId: scope.tenantId, ownerId: scope.ownerId,
      runtimeAgentId: scope.agentId, capability: 'rag', requestId: 'request-1', bundleVersion: 7, bundleSha256: bundle.sha256 };
    const response = { scope, identity, capability: 'rag', requestId: 'request-1', bundle, membership: 'enabled', configuration };
    expect(parsePortableAuthorityResponse(response, query, identity)).toEqual(response);
    expect(parsePortableAuthorityResponse({ ...response, configuration: null }, query, identity).configuration).toBeNull();
    for (const patch of [{ parameters: [{}] }, { scope: { ...scope, ownerId: 'foreign' } }, { capability: 'news' }]) {
      expect(() => parsePortableAuthorityResponse({ ...response, configuration: { ...configuration, ...patch } }, query, identity)).toThrow();
    }
    const request = { format: 'ordinary-lifecycle-v1', requestId: 'request-1', scope, identity,
      capability: 'rag', phase: 'prepare', transition: { from: null, to: bundle }, targetMembership: 'enabled', configuration };
    const authority = { ...response, current: null, transaction: null };
    expect(() => applyPortableCapabilityRules(request, catalog.contracts.lifecycleRequest!.rules, authority)).not.toThrow();
    expect(() => applyPortableCapabilityRules(request, catalog.contracts.lifecycleRequest!.rules,
      { ...authority, configuration: { ...configuration, version: 2 } })).toThrow();
    const directory = mkdtempSync(join(tmpdir(), 'bridge-empty-portable-'));
    const catalogPath = join(directory, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(catalog));
    execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'), '--catalog', catalogPath, '--output', directory]);
    const contextPath = join(directory, 'context.json');
    writeFileSync(contextPath, JSON.stringify({ scope, identity, bundle, configuration, query, response, request, authority }));
    execFileSync('python3', ['-B', '-c', `
import copy, importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated', sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
c = json.load(open(sys.argv[2])); config = c['configuration']; request = c['request']; authority = c['authority']
def rejects(fn):
    try: fn()
    except ValueError: return
    raise AssertionError('Invalid portable evidence accepted')
lookup = dict(lookup=c['query'], identity=c['identity'])
assert m.validate_contract('authorityResponse', c['response'], authority=lookup) == c['response']
assert m.validate_contract('authorityResponse', dict(c['response'], configuration=None), authority=lookup)['configuration'] is None
for bad in (dict(config, parameters=[{}]), dict(config, scope=dict(c['scope'], ownerId='foreign')), dict(config, capability='news')):
    rejects(lambda: m.validate_contract('authorityResponse', dict(c['response'], configuration=bad), authority=lookup))
rejects(lambda: m.validate_contract('authorityResponse', dict(c['response'], membership='disabled'), authority=lookup))
assert m.validate_lifecycle_request(request, authority=authority)['replay'] is None
assert m.validate_lifecycle_request({k:v for k,v in request.items() if k != 'configuration'}, authority=dict(authority, configuration=None))['replay'] is None
rejects(lambda: m.validate_lifecycle_request(request, authority=dict(authority, configuration=dict(config, version=2))))
rejects(lambda: m.validate_lifecycle_request(dict(request, configuration=dict(config, parameters=[{}])), authority=authority))
state = dict(scope=c['scope'], capability='rag', desired=config, runtimeState='loaded', applied=dict(configuration=config, loadedAt='2026-10-11T13:00:00Z'), failed=None, effectiveParameters=[])
assert m.validate_contract('ordinaryState', state) == state
for bad in (dict(state, runtimeState='unloaded'), dict(state, desired=dict(config, scope=dict(c['scope'], ownerId='foreign'))), dict(state, applied=dict(state['applied'], configuration=dict(config, version=2))), dict(state, desired=dict(config, parameters=[{}]))):
    rejects(lambda: m.validate_contract('ordinaryState', bad))
get_query = dict(c['scope'], format='ordinary-v2', capability='rag')
route = m.portable_transport('ordinaryGet', dict(agentId=c['scope']['agentId']), query=get_query)
assert route['method'] == 'GET' and route['path'].split('?')[0] == '/internal/capability/agents/agent-a/config'
rejects(lambda: m.portable_transport('ordinaryGet', dict(agentId='agent-a'), query=dict(get_query, unknown=True)))
previous = dict(state, desired=None, runtimeState='unloaded', applied=None)
receipt = dict(request=request, operationId='operation-1', fence=1, status='complete', outcome='ok', replayed=False, ordinaryState=previous, membershipEffective='unknown', observedAt=None)
tx = dict(request=request, state='suspended', operationId='operation-1', fence=1, receipts=[receipt, dict(receipt, request=dict(request, phase='suspend'))], previousState=previous, previousMembership='removed')
activate = dict(request, phase='activate')
active = dict(receipt, request=activate, ordinaryState=state, membershipEffective='enabled', observedAt='2026-10-11T13:00:00Z')
context = dict(request=activate, transaction=tx)
assert m.validate_contract('lifecycleReceipt', active, authority=context) == active
rejects(lambda: m.validate_contract('lifecycleReceipt', dict(active, ordinaryState=previous), authority=context))
rollback = dict(request, phase='rollback', transition=dict(request['transition'], **{'from':dict(c['bundle'], appliedVersion=6)}))
old_tx = dict(tx, request=rollback, previousState=state, previousMembership='enabled')
old_receipt = dict(active, request=rollback, ordinaryState=dict(state, applied=dict(state['applied'], configuration=dict(config, version=2)), desired=dict(config, version=2)))
rejects(lambda: m.validate_contract('lifecycleReceipt', old_receipt, authority=dict(request=rollback, transaction=old_tx)))
`, join(directory, 'x9_forge_contracts_capabilities.py'), contextPath], { stdio: 'pipe' });
  });
  it('generates an importable Python consumer with fail-closed semantic parity', () => {
    const directory = mkdtempSync(join(tmpdir(), 'bridge-portable-'));
    const catalogPath = join(directory, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(getPortableCapabilityContracts()));
    const script = resolve('scripts/generate-portable-capability-contracts.mjs');
    execFileSync('node', [script, '--catalog', catalogPath, '--output', directory]);
    const modulePath = join(directory, 'x9_forge_contracts_capabilities.py');
    const first = readFileSync(modulePath, 'utf8');
    execFileSync('node', [script, '--catalog', catalogPath, '--output', directory]);
    expect(readFileSync(modulePath, 'utf8')).toBe(first);
    execFileSync('python3', ['tests/python/test_generated_capabilities.py', modulePath], { stdio: 'pipe' });
    for (const mutate of [
      (catalog: ReturnType<typeof getPortableCapabilityContracts>) => { catalog.contracts.ragQueryRequest!.schema!.unknownKeyword = true; },
      (catalog: ReturnType<typeof getPortableCapabilityContracts>) => { (catalog.contracts.ordinaryToolCall!.rules as unknown[]).push({ op: 'unknown' }); },
    ]) {
      const malformed = getPortableCapabilityContracts();
      mutate(malformed);
      writeFileSync(catalogPath, JSON.stringify(malformed));
      expect(() => execFileSync('node', [script, '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' })).toThrow();
    }
    // Temporary files are left for the runner's normal cleanup; no data deletion.
  });
});
