import { describe, expect, it } from 'vitest';
import {
  ConnectionCompletedBodySchema,
  ConnectionCompletedResponseSchema,
  connectionCompletedContract,
} from '../../../src/http/endpoints/internal-connection-completed.js';

const event = {
  cardId: 'card-1',
  correlationId: 'corr-1',
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentId: 'agent-1',
  personRef: 'person-1',
  provider: 'google',
  grantedPermissions: ['calendar_events'],
  outcome: 'connected',
  completedAt: 1_800_000_000,
};

describe('connection completed contract', () => {
  it('accepts a valid event', () => {
    expect(ConnectionCompletedBodySchema.parse(event)).toEqual(event);
  });

  it.each(['cardId', 'correlationId', 'tenantId', 'ownerId', 'agentId', 'personRef'])(
    'rejects an event without %s',
    (field) => {
      const { [field]: _omitted, ...rest } = event as Record<string, unknown>;
      expect(ConnectionCompletedBodySchema.safeParse(rest).success).toBe(false);
    },
  );

  it('rejects an empty personRef', () => {
    expect(ConnectionCompletedBodySchema.safeParse({ ...event, personRef: '' }).success).toBe(false);
  });

  it('rejects an extra field', () => {
    expect(ConnectionCompletedBodySchema.safeParse({ ...event, token: 'x' }).success).toBe(false);
  });

  it('rejects an unknown outcome', () => {
    expect(ConnectionCompletedBodySchema.safeParse({ ...event, outcome: 'revoked' }).success).toBe(false);
  });

  it('accepts denied and expired outcomes with no permissions', () => {
    for (const outcome of ['denied', 'expired']) {
      expect(
        ConnectionCompletedBodySchema.safeParse({ ...event, outcome, grantedPermissions: [] }).success,
      ).toBe(true);
    }
  });

  it('rejects duplicate permissions', () => {
    expect(
      ConnectionCompletedBodySchema.safeParse({
        ...event,
        grantedPermissions: ['calendar_events', 'calendar_events'],
      }).success,
    ).toBe(false);
  });

  it('round-trips success and named error responses', () => {
    const ok = { ok: true, resumed: true };
    expect(ConnectionCompletedResponseSchema.parse(ok)).toEqual(ok);
    for (const error of ['unauthenticated', 'identity_mismatch', 'unknown_correlation', 'invalid_event']) {
      const body = { ok: false, error, reason: 'motivo' };
      expect(ConnectionCompletedResponseSchema.parse(body)).toEqual(body);
    }
    expect(ConnectionCompletedResponseSchema.safeParse({ ok: false, error: 'conflict', reason: 'x' }).success).toBe(false);
  });

  it('exposes an internal POST contract', () => {
    expect(connectionCompletedContract.method).toBe('POST');
    expect(connectionCompletedContract.path.startsWith('/internal/')).toBe(true);
    expect(connectionCompletedContract.authType).toBe('secret');
  });
});
