import { describe, expect, it } from 'vitest';
import { selectDevelopmentSessionList } from '../../../src/http/index.js';
import type { DevelopmentSessionList } from '../../../src/http/index.js';

type Lease = DevelopmentSessionList['items'][number];
const scope = { tenantId: 'tenant-one', ownerId: 'owner-one', agentId: 'agent-one' };

function lease(sessionId: string, overrides: Partial<Lease> = {}, leaseScope = scope): Lease {
  return {
    binding: { scope: { ...leaseScope }, sessionId, target: { kind: 'local', deviceId: 'device-one' }, engines: ['claude', 'codex'] },
    leaseId: `lease-${sessionId}`, consentRef: 'consent-one', status: 'connected',
    issuedAt: '2026-10-16T10:00:00Z', lastSeenAt: '2026-10-16T10:00:30Z', expiresAt: '2026-10-16T10:02:00Z',
    availableEngines: ['claude', 'codex'],
    ...overrides,
  };
}
function page(items: Lease[], nextCursor: string | null = null): DevelopmentSessionList {
  return { items, nextCursor };
}
const empty = page([]);

describe('bridge229', () => {
  it('preserves local cloud and engine choices', () => {
    const cloud = lease('session-cloud', {
      binding: { scope: { ...scope }, sessionId: 'session-cloud', target: { kind: 'cloud', connectionRef: 'conn-one' }, engines: ['codex'] },
      availableEngines: ['codex'],
    });
    const local = lease('session-local', { availableEngines: ['claude'] });
    const selected = selectDevelopmentSessionList(page([local, cloud]), { scope, limit: 5 });
    expect(selected?.items.map(item => item.binding.sessionId)).toEqual(['session-local', 'session-cloud']);
    expect(selected?.items.map(item => item.binding.target.kind)).toEqual(['local', 'cloud']);
    expect(selected?.items.map(item => item.binding.engines)).toEqual([['claude', 'codex'], ['codex']]);
    expect(selected?.items.map(item => item.availableEngines)).toEqual([['claude'], ['codex']]);
  });

  it('preserves offline and revoked states', () => {
    const items = [lease('session-a'), lease('session-b', { status: 'offline', availableEngines: [] }), lease('session-c', { status: 'revoked', availableEngines: [] })];
    const selected = selectDevelopmentSessionList(page(items), { scope });
    expect(selected?.items.map(item => item.status)).toEqual(['connected', 'offline', 'revoked']);
    expect(selected?.items[1]?.availableEngines).toEqual([]);
    expect(selected?.items[2]?.availableEngines).toEqual([]);
  });

  it('rejects each foreign scope component', () => {
    const foreignTenant = { ...scope, tenantId: 'tenant-two' };
    const foreignOwner = { ...scope, ownerId: 'owner-two' };
    const foreignAgent = { ...scope, agentId: 'agent-two' };
    const homogeneous = (foreign: typeof scope) => page([lease('session-a', {}, foreign), lease('session-b', {}, foreign)]);
    expect(selectDevelopmentSessionList(homogeneous(foreignTenant), { scope, limit: 5 })).toBeNull();
    expect(selectDevelopmentSessionList(homogeneous(foreignOwner), { scope, limit: 5 })).toBeNull();
    expect(selectDevelopmentSessionList(homogeneous(foreignAgent), { scope, limit: 5 })).toBeNull();
    expect(selectDevelopmentSessionList(page([lease('session-a'), lease('session-b', {}, foreignAgent)]), { scope, limit: 5 })).toBeNull();
  });

  it('rejects oversized page and invalid query', () => {
    const three = page([lease('session-a'), lease('session-b'), lease('session-c')]);
    expect(selectDevelopmentSessionList(three, { scope, limit: 2 })).toBeNull();
    expect(selectDevelopmentSessionList(three, { scope, limit: 3 })?.items).toHaveLength(3);
    expect(selectDevelopmentSessionList(empty, { scope, limit: 0 })).toBeNull();
    expect(selectDevelopmentSessionList(empty, { scope, limit: 51 })).toBeNull();
  });

  it('distinguishes valid empty page from malformed input', () => {
    expect(selectDevelopmentSessionList(empty, { scope, extra: true })).toBeNull();
    expect(selectDevelopmentSessionList({ items: [], nextCursor: null, extra: 1 }, { scope })).toBeNull();
    expect(selectDevelopmentSessionList(empty, { scope: { tenantId: 'tenant-one' } })).toBeNull();
    expect(selectDevelopmentSessionList(undefined, { scope })).toBeNull();
    expect(selectDevelopmentSessionList(empty, { scope })).toEqual({ items: [], nextCursor: null });
  });

  it('returns independent page and preserves cursor', () => {
    const raw = page([lease('session-a'), lease('session-b')], 'cursor-2');
    const selected = selectDevelopmentSessionList(raw, { scope, cursor: 'cursor-1', limit: 2 });
    expect(selected).not.toBe(raw);
    expect(selected?.items[0]).not.toBe(raw.items[0]);
    expect(selected?.nextCursor).toBe('cursor-2');
    raw.items[0]!.binding.scope.tenantId = 'tenant-changed';
    expect(selected?.items[0]?.binding.scope.tenantId).toBe('tenant-one');
  });
});
