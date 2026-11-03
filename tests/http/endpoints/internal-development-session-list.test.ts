import { describe, expect, it } from 'vitest';
import {
  DevelopmentSessionListSchema,
  DevelopmentSessionListQuerySchema,
  listDevelopmentSessionsContract,
} from '../../../src/http/index.js';
import type { DevelopmentSessionList, DevelopmentSessionListQuery } from '../../../src/http/index.js';
import { DevelopmentSessionLeaseSchema } from '../../../src/capability/connect/development-session-state.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-identity.js';

const ownerOne = { tenantId: 'tenant-one', ownerId: 'owner-one', agentId: 'agent-one' };
const ownerTwo = { tenantId: 'tenant-two', ownerId: 'owner-two', agentId: 'agent-two' };
function lease(sessionId = 'session-one', scope = ownerOne): DevelopmentSessionList['items'][number] {
  return {
    binding: { scope: { ...scope }, sessionId, target: { kind: 'local', deviceId: 'device-one' }, engines: ['claude', 'codex'] },
    leaseId: `lease-${sessionId}`, consentRef: 'consent-one', status: 'connected',
    issuedAt: '2026-10-16T10:00:00Z', lastSeenAt: '2026-10-16T10:00:30Z', expiresAt: '2026-10-16T10:02:00Z',
    availableEngines: ['claude', 'codex'],
  };
}
const query = (raw: unknown) => DevelopmentSessionListQuerySchema.safeParse(raw).success;
const valid = (raw: unknown) => DevelopmentSessionListSchema.safeParse(raw).success;
const contract = listDevelopmentSessionsContract;

describe('development session list', () => {
  it('exports GET metadata', () => {
    expect(contract.method === 'GET').toBe(true);
  });

  it('exports path metadata', () => {
    expect(contract.path === '/internal/connect/development-sessions').toBe(true);
  });

  it('exports secret metadata', () => {
    expect(contract.authType === 'secret').toBe(true);
  });

  it('has no body schema', () => {
    expect(!('bodySchema' in contract)).toBe(true);
  });

  it('has no params schema', () => {
    expect(!('paramsSchema' in contract)).toBe(true);
  });

  it('reuses the exact lease item schema', () => {
    expect(DevelopmentSessionListSchema.shape.items.element === DevelopmentSessionLeaseSchema).toBe(true);
  });
  it('reuses the exact scope schema', () => {
    expect(DevelopmentSessionListQuerySchema.shape.scope === CapabilityAgentScopeSchema).toBe(true);
  });
  it('reuses public response and query schemas', () => {
    expect(contract.responseSchema === DevelopmentSessionListSchema && contract.querySchema === DevelopmentSessionListQuerySchema).toBe(true);
  });

  it('defaults limit to twenty', () => {
    const parsed: DevelopmentSessionListQuery = contract.querySchema.parse({ scope: ownerOne });
    expect(parsed.limit === 20 && parsed.cursor === undefined).toBe(true);
  });

  it('rejects empty cursor', () => {
    expect(!query({ scope: ownerOne, cursor: '' })).toBe(true);
  });

  it('rejects blank cursor', () => {
    expect(!query({ scope: ownerOne, cursor: '   ' })).toBe(true);
  });

  it('rejects oversized cursor', () => {
    expect(!query({ scope: ownerOne, cursor: 'x'.repeat(513) })).toBe(true);
  });

  it('trims cursor', () => {
    expect(DevelopmentSessionListQuerySchema.parse({ scope: ownerOne, cursor: ' next ' }).cursor === 'next').toBe(true);
  });

  it('accepts maximum cursor', () => {
    expect(query({ scope: ownerOne, cursor: 'x'.repeat(512) })).toBe(true);
  });

  it('rejects empty nextCursor', () => {
    expect(!valid({ items: [], nextCursor: '' })).toBe(true);
  });

  it('rejects blank nextCursor', () => {
    expect(!valid({ items: [], nextCursor: '   ' })).toBe(true);
  });

  it('rejects oversized nextCursor', () => {
    expect(!valid({ items: [], nextCursor: 'x'.repeat(513) })).toBe(true);
  });

  it('trims nextCursor', () => {
    expect(DevelopmentSessionListSchema.parse({ items: [], nextCursor: ' next ' }).nextCursor === 'next').toBe(true);
  });

  it('accepts maximum nextCursor', () => {
    expect(valid({ items: [], nextCursor: 'x'.repeat(512) })).toBe(true);
  });

  it('requires nullable next cursor', () => {
    expect(valid({ items: [], nextCursor: null }) && !valid({ items: [] })).toBe(true);
  });

  it('accepts empty pages with or without a cursor', () => {
    expect(valid({ items: [], nextCursor: null }) && valid({ items: [], nextCursor: 'page-two' })).toBe(true);
  });

  it('rejects zero limit', () => {
    expect(!query({ scope: ownerOne, limit: 0 })).toBe(true);
  });

  it('rejects fractional limit', () => {
    expect(!query({ scope: ownerOne, limit: 1.5 })).toBe(true);
  });

  it('rejects oversized limit', () => {
    expect(!query({ scope: ownerOne, limit: 51 })).toBe(true);
  });

  it('accepts limit boundaries without coercion', () => {
    expect(query({ scope: ownerOne, limit: 1 }) && query({ scope: ownerOne, limit: 50 }) && !query({ scope: ownerOne, limit: '20' })).toBe(true);
  });

  it('rejects query extras', () => {
    expect(!query({ scope: ownerOne, unexpected: true })).toBe(true);
  });

  it('rejects response extras', () => {
    expect(!valid({ items: [], nextCursor: null, unexpected: true })).toBe(true);
  });

  it('rejects oversized page', () => {
    const items = Array.from({ length: 51 }, (_, i) => lease(`session-${i}`));
    expect(!valid({ items, nextCursor: null })).toBe(true);
  });

  it('accepts fifty sessions', () => {
    const items = Array.from({ length: 50 }, (_, i) => lease(`session-${i}`));
    expect(valid({ items, nextCursor: 'next' })).toBe(true);
  });

  it('rejects duplicate session IDs', () => {
    const first = lease(); const second = { ...lease(), leaseId: 'different-lease' };
    expect(DevelopmentSessionLeaseSchema.safeParse(first).success && DevelopmentSessionLeaseSchema.safeParse(second).success && !valid({ items: [first, second], nextCursor: null })).toBe(true);
  });

  it('rejects mixed tenantId', () => {
    const first = lease(); const second = lease('session-two', { ...ownerOne, tenantId: 'different' });
    expect(DevelopmentSessionLeaseSchema.safeParse(first).success && DevelopmentSessionLeaseSchema.safeParse(second).success && !valid({ items: [first, second], nextCursor: null })).toBe(true);
  });

  it('rejects mixed ownerId', () => {
    const first = lease(); const second = lease('session-two', { ...ownerOne, ownerId: 'different' });
    expect(DevelopmentSessionLeaseSchema.safeParse(first).success && DevelopmentSessionLeaseSchema.safeParse(second).success && !valid({ items: [first, second], nextCursor: null })).toBe(true);
  });

  it('rejects mixed agentId', () => {
    const first = lease(); const second = lease('session-two', { ...ownerOne, agentId: 'different' });
    expect(DevelopmentSessionLeaseSchema.safeParse(first).success && DevelopmentSessionLeaseSchema.safeParse(second).success && !valid({ items: [first, second], nextCursor: null })).toBe(true);
  });

  it('keeps separate owners local cloud and real statuses', () => {
    for (const scope of [ownerOne, ownerTwo]) {
      const local = lease('local-session', scope); local.status = 'offline'; local.binding.engines = ['claude']; local.availableEngines = [];
      const cloud = lease('cloud-session', scope); cloud.status = 'revoked'; cloud.binding.target = { kind: 'cloud', connectionRef: 'adapter-one' }; cloud.binding.engines = ['codex']; cloud.availableEngines = [];
      expect(DevelopmentSessionListSchema.parse({ items: [local, cloud], nextCursor: 'page-two' })).toEqual({ items: [local, cloud], nextCursor: 'page-two' });
      expect(DevelopmentSessionListSchema.parse({ items: [], nextCursor: null })).toEqual({ items: [], nextCursor: null });
      expect(valid({ items: [], nextCursor: 'page-two' })).toBe(true);
    }
  });

  it('rejects malformed data without an empty fallback', () => {
    const item = lease();
    for (const raw of [
      { ...item, binding: undefined, ...item.binding },
      { ...item, unexpected: true },
      { ...item, status: 'invented' },
      { ...item, binding: { ...item.binding, scope: { ...ownerOne, ownerId: '' } } },
      { ...item, binding: { ...item.binding, scope: { ...ownerOne, unexpected: true } } },
      { ...item, expiresAt: item.lastSeenAt },
    ]) expect(valid({ items: [raw], nextCursor: null })).toBe(false);
    expect(query({ scope: { ...ownerOne, ownerId: '' } })).toBe(false);
    expect(query({ scope: { ...ownerOne, unexpected: true } })).toBe(false);
    expect(query({})).toBe(false);
  });
});
