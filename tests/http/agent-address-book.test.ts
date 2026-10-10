import { describe, it, expect } from 'vitest';
import * as publicHttp from '../../src/http/index.js';
import { INTERNAL_TOKEN_HEADER } from '../../src/auth/index.js';
import { AgentChannelAccessErrorResponseSchema } from '../../src/agent/index.js';
const api = publicHttp;
const now = Date.parse('2026-01-01T00:00:00Z');
const binding = () => ({ scope: { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' }, identity: { managementAgentId: 'managed-a', runtimeAgentId: 'runtime-a', vaultAgentId: 17 } });
const book = () => ({ ...binding(), status: 'complete', version: 7, observedAt: '2026-01-01T00:00:00Z', emails: [], phoneNumbers: [] });
const response = () => ({ kind: 'phone', addressBook: book() });
const params = () => ({ agentId: 'managed-a', kind: 'phone' });
function schema(name: 'AgentAddressBookParamsSchema' | 'AgentAddressBookResponseSchema' | 'AgentAddressBookErrorResponseSchema') { expect(api[name]).toBeDefined(); return api[name]; }
function matches(r: unknown = response(), p: unknown = params(), b: unknown = binding(), time = now, ttl?: number) {
  expect(api.isAgentAddressBookResponseForRequest).toBeTypeOf('function'); return api.isAgentAddressBookResponseForRequest(r, p, b, time, ttl);
}
describe('Forge knowledge address-book HTTP', () => {
  it('declares GET token and canonical header/path/schema', () => {
    expect(api.internalAgentAddressBookContract).toBeDefined(); const c = api.internalAgentAddressBookContract;
    expect(c.method).toBe('GET'); expect(c.path).toBe('/internal/agents/:agentId/channels/:kind/address-book');
    expect(c.authType).toBe('token'); expect(c.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(c.paramsSchema).toBe(schema('AgentAddressBookParamsSchema')); expect(c.responseSchema).toBe(schema('AgentAddressBookResponseSchema'));
    expect(c.errorResponseSchema).toBe(AgentChannelAccessErrorResponseSchema); expect('bodySchema' in c).toBe(false);
  });
  it.each(['email', 'phone'])('builds %s scoped management path', kind => { expect(api.agentAddressBookPath).toBeTypeOf('function'); expect(api.agentAddressBookPath('managed-a', kind as publicHttp.AgentAddressBookChannel)).toBe(`/internal/agents/managed-a/channels/${kind}/address-book`); expect(schema('AgentAddressBookParamsSchema').parse({ agentId: 'managed-a', kind })).toEqual({ agentId: 'managed-a', kind }); });
  it.each(['', '../other', 'a/b', '%2F', 'Upper', ' a ', 'a?b', 'a#b'])('rejects invalid management id %s', agentId => { expect(api.agentAddressBookPath).toBeTypeOf('function'); expect(() => api.agentAddressBookPath(agentId, 'phone')).toThrow(); expect(schema('AgentAddressBookParamsSchema').safeParse({ agentId, kind: 'phone' }).success).toBe(false); });
  it.each(['telegram', 'voice', '', 'PHONE', '../email'])('rejects unsupported channel %s', kind => { expect(api.agentAddressBookPath).toBeTypeOf('function'); expect(() => api.agentAddressBookPath('managed-a', kind as publicHttp.AgentAddressBookChannel)).toThrow(); expect(schema('AgentAddressBookParamsSchema').safeParse({ agentId: 'managed-a', kind }).success).toBe(false); });
  it('rejects extra params instead of stripping authority', () => { expect(schema('AgentAddressBookParamsSchema').safeParse({ ...params(), tenantId: 'foreign' }).success).toBe(false); });
  it('parses complete response with empty available source', () => { expect(schema('AgentAddressBookResponseSchema').parse(response())).toEqual(response()); expect(matches()).toBe(true); });
  it.each(['partial', 'unavailable'])('parses but never credits %s source', status => { const r = { ...response(), addressBook: { ...book(), status, emails: null, phoneNumbers: null } }; expect(schema('AgentAddressBookResponseSchema').parse(r)).toEqual(r); expect(matches(r)).toBe(false); });
  it.each(['kind', 'addressBook'])('requires response field %s', field => { const r: Record<string, unknown> = response(); delete r[field]; expect(schema('AgentAddressBookResponseSchema').safeParse(r).success).toBe(false); });
  it('rejects extra response fields', () => { expect(schema('AgentAddressBookResponseSchema').safeParse({ ...response(), rawProvider: 'x' }).success).toBe(false); });
  it('rejects unsupported response channel', () => { expect(schema('AgentAddressBookResponseSchema').safeParse({ ...response(), kind: 'telegram' }).success).toBe(false); });
  it('rejects malformed nested book', () => { expect(schema('AgentAddressBookResponseSchema').safeParse({ ...response(), addressBook: { ...book(), phoneNumbers: null } }).success).toBe(false); });
  it('requires valid response and request', () => { expect(matches(null)).toBe(false); expect(matches(response(), null)).toBe(false); });
  it('requires same channel', () => { expect(matches(response(), { ...params(), kind: 'email' })).toBe(false); expect(matches({ ...response(), kind: 'email' }, { ...params(), kind: 'email' })).toBe(true); });
  it('requires requested management alias rather than runtime ID', () => { expect(matches(response(), { ...params(), agentId: 'runtime-a' })).toBe(false); });
  it('denies foreign owner and inherited credentials do not grant scope', () => { const b = binding(); b.scope.ownerId = 'owner-b'; expect(matches(response(), params(), b)).toBe(false); });
  it('rejects stale and future dated responses', () => { expect(matches(response(), params(), binding(), now + 60001)).toBe(false); expect(matches(response(), params(), binding(), now - 1)).toBe(false); });
  it('forwards explicit TTL including zero and rejects invalid clock', () => { expect(matches(response(), params(), binding(), now + 1, 0)).toBe(false); expect(matches(response(), params(), binding(), Infinity)).toBe(false); expect(matches(response(), params(), binding(), now, -1)).toBe(false); });
  it('uses fixed sanitized shared errors', () => { expect(schema('AgentAddressBookErrorResponseSchema')).toBe(AgentChannelAccessErrorResponseSchema); expect(schema('AgentAddressBookErrorResponseSchema').parse({ ok: false, error: 'source_unavailable' })).toEqual({ ok: false, error: 'source_unavailable' }); expect(schema('AgentAddressBookErrorResponseSchema').safeParse({ ok: false, error: 'rawProviderFailure' }).success).toBe(false); expect(schema('AgentAddressBookErrorResponseSchema').safeParse({ ok: false, error: 'source_unavailable', detail: 'raw' }).success).toBe(false); });
});
