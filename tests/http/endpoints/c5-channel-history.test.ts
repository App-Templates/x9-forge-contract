import { expect, it } from 'vitest';
import { AgentChannelHistoryParamsSchema as Params, AgentChannelHistoryQuerySchema as Query,
  internalAgentChannelHistoryContract as internal, internalAgentChannelHistoryPath as internalPath } from '../../../src/http/endpoints/internal-agent-channel-history.js';
import { forgeAgentChannelHistoryContract as browser, forgeAgentChannelHistoryPath as browserPath,
  isAgentChannelHistoryWithinForgeAuthorization as authorized } from '../../../src/http/endpoints/forge-agent-channel-history.js';
const binding = { scope: { tenantId: 'history-tenant', ownerId: 'history-owner', agentId: 'history-runtime' }, identity: { managementAgentId: 'history-management', runtimeAgentId: 'history-runtime', vaultAgentId: 101 } };
const history = { ...binding, status: 'available', kind: 'phone', observedAt: '2026-10-08T12:00:00.000Z', entries: [], total: 0, nextCursor: null, lastVerification: null };
const owner = { role: 'owner', tenantId: binding.scope.tenantId, ownerId: binding.scope.ownerId };
it.each(['telegram', 'email', 'phone', 'web'])('uses the same canonical authenticated %s reader for Forge and X9', kind => {
  expect(internal.authType).toBe('secret'); expect(internal.method).toBe('GET');
  expect(browser.authentication).toBe('forge-session'); expect(browser.authorization).toBe('sa-or-agent-owner'); expect(browser.method).toBe('GET');
  expect(internal.responseSchema).toBe(browser.responseSchema); expect(internal.querySchema).toBe(browser.querySchema);
  expect(internalPath('history-runtime', kind)).toBe('/internal/agents/history-runtime/channels/' + kind + '/history');
  expect(browserPath('history-management', kind)).toBe('/api/agents/history-management/channels/' + kind + '/history');
});
it('permits the real owner and SA while keeping unavailable distinct from empty', () => {
  expect(authorized(history, owner, 'history-management')).toBe(true); expect(authorized(history, { role: 'sa' }, 'history-management')).toBe(true);
  expect(authorized({ ...binding, status: 'unavailable', kind: 'web', observedAt: null, error: 'source_unavailable' }, owner, 'history-management')).toBe(true);
});
it.each(['tenantId', 'ownerId'])('rejects an owner from another %s', key => {
  expect(authorized(history, { ...owner, [key]: 'foreign-history' }, 'history-management')).toBe(false);
});
it('rejects mismatch between URL management id and runtime/source', () => {
  expect(authorized(history, owner, 'history-runtime')).toBe(false); expect(authorized(history, { role: 'sa' }, 'other-history')).toBe(false);
});
it.each([null, {}, { role: 'anonymous' }, { ...owner, role: 'admin' }, { role: 'owner' }])('rejects invalid or unauthenticated server authority %j', value => {
  expect(authorized(history, value, 'history-management')).toBe(false);
});
it('rejects malformed source without confusing it with missing credentials', () => {
  expect(authorized(null, owner, 'history-management')).toBe(false);
  expect(authorized({ ...history, signedUrl: 'synthetic' }, owner, 'history-management')).toBe(false);
});
it('bounds native pagination and rejects browser scope/authority fields', () => {
  expect(Query.parse({})).toEqual({ limit: 20 }); expect(Query.parse({ limit: '100', cursor: 'cursor-history' })).toEqual({ limit: 100, cursor: 'cursor-history' });
  for (const limit of [0, 101, 1.5, 'NaN', 'Infinity']) expect(Query.safeParse({ limit }).success).toBe(false);
  for (const key of ['scope', 'identity', 'viewer', 'ownerId', 'tenantId', 'credentials']) expect(Query.safeParse({ [key]: 'synthetic' }).success).toBe(false);
  expect(Params.safeParse({ agentId: 'history-runtime', kind: 'voice' }).success).toBe(false);
  expect(Params.safeParse({ agentId: 'history-runtime', kind: 'phone', scope: binding.scope }).success).toBe(false);
  expect(() => browserPath('../foreign-history', 'phone')).toThrow(); expect(() => internalPath('history-runtime', 'invalid')).toThrow();
});
