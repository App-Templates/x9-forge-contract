import { describe, expect, it } from 'vitest';
import { DevelopmentSessionLeaseSchema as schema, isDevelopmentSessionUsable as usable } from '../../../src/capability/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const local = { kind: 'local', deviceId: 'device-1' };
const cloud = { kind: 'cloud', connectionRef: 'connection-1' };
const binding = { scope, sessionId: 'session-1', target: local, engines: ['claude', 'codex'] };
const lease = {
  binding, leaseId: 'lease-1', consentRef: 'consent-1', status: 'connected',
  issuedAt: '2026-10-16T10:00:00.000Z', lastSeenAt: '2026-10-16T10:01:00.000Z',
  expiresAt: '2026-10-16T10:02:00.000Z', availableEngines: ['claude', 'codex'],
};
const now = Date.parse(lease.lastSeenAt);

describe('development session lease', () => {
  for (const target of [local, cloud]) {
    for (const engines of [['claude'], ['codex'], ['claude', 'codex']]) {
      it(`accepts fresh ${target.kind} ${engines.join('+')}`, () => {
        const configured = { ...binding, target, engines };
        expect(usable({ ...lease, binding: configured, availableEngines: engines }, configured, engines[0], now)).toBe(true);
      });
    }
    it(`accepts partial availability for ${target.kind}`, () => {
      const configured = { ...binding, target };
      expect(usable({ ...lease, binding: configured, availableEngines: ['codex'] }, configured, 'codex', now)).toBe(true);
    });
  }
  it('accepts engine set in reversed order', () => {
    expect(usable(lease, { ...binding, engines: ['codex', 'claude'] }, 'claude', now)).toBe(true);
  });
  it('accepts empty availability as offline execution capacity', () => {
    expect(schema.safeParse({ ...lease, availableEngines: [] }).success).toBe(true);
  });
  it('accepts issuance equal to last seen', () => {
    expect(schema.safeParse({ ...lease, issuedAt: lease.lastSeenAt }).success).toBe(true);
  });
  it('accepts last millisecond before expiry', () => {
    expect(usable(lease, binding, 'codex', Date.parse(lease.expiresAt) - 1)).toBe(true);
  });
  it('rejects empty lease id', () => {
    expect(schema.safeParse({ ...lease, leaseId: '' }).success).toBe(false);
  });
  it('rejects empty consent reference', () => {
    expect(schema.safeParse({ ...lease, consentRef: '' }).success).toBe(false);
  });
  it('rejects unknown status', () => {
    expect(schema.safeParse({ ...lease, status: 'ready' }).success).toBe(false);
  });
  it('rejects non ISO issuedAt', () => {
    expect(schema.safeParse({ ...lease, issuedAt: 'October 16, 2026 10:00:00 GMT' }).success).toBe(false);
  });
  it('rejects non ISO lastSeenAt', () => {
    expect(schema.safeParse({ ...lease, lastSeenAt: 'October 16, 2026 10:01:00 GMT' }).success).toBe(false);
  });
  it('rejects non ISO expiresAt', () => {
    expect(schema.safeParse({ ...lease, expiresAt: 'October 16, 2026 10:02:00 GMT' }).success).toBe(false);
  });
  it('rejects unknown available engine', () => {
    expect(schema.safeParse({ ...lease, binding: { ...binding, engines: ['claude'] }, availableEngines: ['other'] }).success).toBe(false);
  });
  it('rejects duplicate available engines', () => {
    expect(schema.safeParse({ ...lease, availableEngines: ['claude', 'claude'] }).success).toBe(false);
  });
  it('reports available engine upper bound', () => {
    expect(schema.safeParse({ ...lease, availableEngines: ['claude', 'codex', 'claude'] }).error?.issues.some((issue) => issue.code === 'too_big') ?? false).toBe(true);
  });
  it('rejects extra lease fields', () => {
    expect(schema.safeParse({ ...lease, extra: true }).success).toBe(false);
  });
  it('rejects issuance after last seen', () => {
    expect(schema.safeParse({ ...lease, issuedAt: '2026-10-16T10:01:00.001Z' }).success).toBe(false);
  });
  it('rejects last seen at expiry', () => {
    expect(schema.safeParse({ ...lease, lastSeenAt: lease.expiresAt }).success).toBe(false);
  });
  it('rejects last seen after expiry', () => {
    expect(schema.safeParse({ ...lease, lastSeenAt: '2026-10-16T10:02:00.001Z' }).success).toBe(false);
  });
  it('rejects unattached available engine', () => {
    expect(schema.safeParse({ ...lease, binding: { ...binding, engines: ['claude'] } }).success).toBe(false);
  });
  it('rejects offline lease', () => {
    expect(usable({ ...lease, status: 'offline' }, binding, 'claude', now)).toBe(false);
  });
  it('rejects revoked lease', () => {
    expect(usable({ ...lease, status: 'revoked' }, binding, 'claude', now)).toBe(false);
  });
  it('rejects exact expiry', () => {
    expect(usable(lease, binding, 'claude', Date.parse(lease.expiresAt))).toBe(false);
  });
  it('rejects clock before last seen', () => {
    expect(usable(lease, binding, 'claude', now - 1)).toBe(false);
  });
  it('rejects NaN clock independently', () => {
    expect(usable(lease, binding, 'claude', Number.NaN)).toBe(false);
  });
  it('rejects positive infinity', () => {
    expect(usable(lease, binding, 'claude', Number.POSITIVE_INFINITY)).toBe(false);
  });
  it('rejects negative infinity', () => {
    expect(usable(lease, binding, 'claude', Number.NEGATIVE_INFINITY)).toBe(false);
  });
  it('rejects engine without attestation', () => {
    expect(usable({ ...lease, availableEngines: ['claude'] }, binding, 'codex', now)).toBe(false);
  });
  it('rejects engine without authorization', () => {
    expect(usable({ ...lease, binding: { ...binding, engines: ['claude'] }, availableEngines: ['claude'] }, { ...binding, engines: ['claude'] }, 'codex', now)).toBe(false);
  });
  it('rejects foreign target kind', () => {
    expect(usable(lease, { ...binding, target: cloud }, 'claude', now)).toBe(false);
  });
  it('rejects foreign device', () => {
    expect(usable(lease, { ...binding, target: { ...local, deviceId: 'device-2' } }, 'claude', now)).toBe(false);
  });
  it('rejects foreign connection', () => {
    expect(usable({ ...lease, binding: { ...binding, target: cloud } }, { ...binding, target: { ...cloud, connectionRef: 'connection-2' } }, 'claude', now)).toBe(false);
  });
  it('rejects foreign session', () => {
    expect(usable(lease, { ...binding, sessionId: 'session-2' }, 'claude', now)).toBe(false);
  });
  it('rejects foreign tenantId', () => {
    expect(usable(lease, { ...binding, scope: { ...scope, tenantId: 'foreign' } }, 'claude', now)).toBe(false);
  });
  it('rejects foreign ownerId', () => {
    expect(usable(lease, { ...binding, scope: { ...scope, ownerId: 'foreign' } }, 'claude', now)).toBe(false);
  });
  it('rejects foreign agentId', () => {
    expect(usable(lease, { ...binding, scope: { ...scope, agentId: 'foreign' } }, 'claude', now)).toBe(false);
  });
  it('rejects expanded expected engines', () => {
    expect(usable({ ...lease, binding: { ...binding, engines: ['claude'] }, availableEngines: ['claude'] }, binding, 'claude', now)).toBe(false);
  });
  it('rejects different expected engine set', () => {
    expect(usable({ ...lease, binding: { ...binding, engines: ['claude'] }, availableEngines: ['claude'] }, { ...binding, engines: ['codex'] }, 'claude', now)).toBe(false);
  });
  it('rejects null lease', () => {
    expect(usable(null, binding, 'claude', now)).toBe(false);
  });
  it('rejects invalid expected binding', () => {
    expect(usable(lease, null, 'claude', now)).toBe(false);
  });
  it('rejects unknown requested engine', () => {
    expect(usable(lease, binding, 'other', now)).toBe(false);
  });
  it('rejects extra expected binding fields', () => {
    expect(usable(lease, { ...binding, extra: true }, 'claude', now)).toBe(false);
  });
  it('rejects extra nested binding fields', () => {
    expect(usable({ ...lease, binding: { ...binding, extra: true } }, binding, 'claude', now)).toBe(false);
  });
  it('rejects extra scope fields', () => {
    expect(usable(lease, { ...binding, scope: { ...scope, userId: 'person-1' } }, 'claude', now)).toBe(false);
  });
  it('rejects invalid requested engine object', () => {
    expect(usable(lease, binding, {}, now)).toBe(false);
  });
  it('rejects missing available engines', () => {
    expect(schema.safeParse({ ...lease, availableEngines: undefined }).success).toBe(false);
  });
  it('rejects missing binding', () => {
    expect(schema.safeParse({ ...lease, binding: undefined }).success).toBe(false);
  });
  it('rejects invalid date', () => {
    expect(schema.safeParse({ ...lease, issuedAt: 'invalid' }).success).toBe(false);
  });
  it('rejects duplicate expected engines', () => {
    expect(usable(lease, { ...binding, engines: ['claude', 'claude'] }, 'claude', now)).toBe(false);
  });
  it('rejects unobserved engine with empty attestation', () => {
    expect(usable({ ...lease, availableEngines: [] }, binding, 'claude', now)).toBe(false);
  });
});
