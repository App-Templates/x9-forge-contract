import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { getPortableCapabilityContracts, parsePortableOrdinaryToolCall, parsePortableAuthorityResponse, parsePortableRagToolCall } from '../../src/capability/portable-contracts.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const snapshot = { scope, capability: 'rag', version: 7, values: { 'query.topK': 5 } };
const call = { callId: 'call-1', tool: 'rag_query', input: {}, agentId: scope.agentId,
  sessionId: 'session-1', tenantId: scope.tenantId, ownerId: scope.ownerId, ordinaryConfiguration: snapshot };

describe('canonical portable subset for RAG', () => {
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
