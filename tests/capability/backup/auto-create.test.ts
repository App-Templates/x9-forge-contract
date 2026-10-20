import { describe, expect, it } from 'vitest';
import {
  BACKUP_AUTO_CREATE_DAILY_MAX,
  BackupActionSchema,
  BackupAutoCreateBodySchema,
  BackupAutoCreateInfoResponseSchema,
  BackupAutoCreateRefusalCodeSchema,
  BackupAutoCreateResponseSchema,
  BackupStatusQuerySchema,
  BackupStatusSchema,
  backupDeviceAutoCreateContract,
  backupDeviceAutoCreateInfoContract,
} from '../../../src/capability/index.js';

describe('automatic device snapshots', () => {
  const release = 'pre-phase-60-agent-x9';
  const resource = 'hostinger:vm:1';

  it('the auto-create body takes only a release and a resource', () => {
    expect(BackupAutoCreateBodySchema.parse({ release })).toEqual({ release });
    expect(BackupAutoCreateBodySchema.parse({ release, resource })).toEqual({ release, resource });
    for (const body of [{}, { resource }, { release: '' }, { release, resource: 'hetzner:vm:1' }, { release, extra: true }]) {
      expect(BackupAutoCreateBodySchema.safeParse(body).success).toBe(false);
    }
  });

  it('a refusal carries one of the closed codes', () => {
    const codes = ['off', 'needs-passkey', 'daily-cap', 'busy', 'invalid'];
    expect(BackupAutoCreateRefusalCodeSchema.options).toEqual(codes);
    for (const code of codes) {
      const refusal = { ok: false, code, error: 'Snapshot refused' };
      expect(BackupAutoCreateResponseSchema.parse(refusal)).toEqual(refusal);
    }
    for (const refusal of [
      { ok: false, error: 'Missing code' },
      { ok: false, code: 'unknown', error: 'Unknown code' },
      { ok: false, code: 'busy', error: '' },
      { ok: false, code: 'busy', error: 'x'.repeat(501) },
      { ok: false, code: 'busy', error: 'Busy', extra: true },
    ]) {
      expect(BackupAutoCreateResponseSchema.safeParse(refusal).success).toBe(false);
    }
  });

  it('the info answer is strict', () => {
    expect(BACKUP_AUTO_CREATE_DAILY_MAX).toBe(6);
    const info = { enabled: true, dailyMax: BACKUP_AUTO_CREATE_DAILY_MAX, usedToday: 0 };
    expect(BackupAutoCreateInfoResponseSchema.parse(info)).toEqual(info);
    expect(BackupAutoCreateInfoResponseSchema.safeParse({ ...info, enabled: false, usedToday: 6 }).success).toBe(true);
    for (const extra of [
      { extra: true }, { enabled: 'true' }, { dailyMax: 0 }, { dailyMax: 1.5 },
      { usedToday: -1 }, { usedToday: 0.5 }, { usedToday: undefined },
    ]) {
      expect(BackupAutoCreateInfoResponseSchema.safeParse({ ...info, ...extra }).success).toBe(false);
    }
  });

  it('existing backup status still parses unchanged', () => {
    // Preserve the legacy status fixture already used in backup.test.ts; no live status was supplied.
    const status = {
      resource,
      snapshot: {
        id: 325, createdAt: '2026-10-03T18:20:00Z', expiresAt: '2026-10-23T18:20:00Z',
        restoreSec: 1800, release: 'pre-phase-55-agent-x9', origin: 'approved',
      },
      action: null,
      providerBackups: [{ id: 9, createdAt: '2026-10-01T03:00:00Z', restoreSec: 3600 }],
      lastVerifiedRelease: { release: 'pre-phase-55-agent-x9', verifiedAt: '2026-10-03T19:00:00Z' },
      health: { healthy: 22, total: 23, unhealthy: ['cap-voice'], checkedAt: '2026-10-07T19:00:00Z' },
    };
    expect(BackupStatusSchema.parse(status)).toEqual(status);
    expect(BackupStatusSchema.safeParse({ ...status, enabled: true }).success).toBe(false);
    expect(BackupStatusSchema.safeParse({ ...status, snapshot: { ...status.snapshot, origin: 'automatic' } }).success).toBe(false);
  });

  it('auto-create never accepts a restore kind', () => {
    expect(BackupAutoCreateBodySchema.safeParse({ release, resource }).success).toBe(true);
    for (const kind of ['restore-snapshot', 'restore-backup', 'create']) {
      expect(BackupAutoCreateBodySchema.safeParse({ release, resource, kind }).success).toBe(false);
    }
  });

  it('returns the shared action with an explicit attachment flag', () => {
    const action = BackupActionSchema.parse({
      actionId: 'auto_snapshot_1234', kind: 'create', state: 'running', release,
      requestedAt: '2026-10-20T12:30:00Z', updatedAt: '2026-10-20T12:30:00Z', error: null,
    });
    const response = { ok: true, action, attachedToExisting: false };
    expect(BackupAutoCreateResponseSchema.parse(response)).toEqual(response);
    expect(BackupAutoCreateResponseSchema.parse({ ...response, attachedToExisting: true })).toEqual({ ...response, attachedToExisting: true });
    expect(BackupAutoCreateResponseSchema.safeParse({ ok: true, action }).success).toBe(false);
    expect(BackupAutoCreateResponseSchema.safeParse({ ...response, extra: true }).success).toBe(false);
    expect(BackupAutoCreateResponseSchema.safeParse({ ...response, action: { ...action, state: 'unknown' } }).success).toBe(false);
  });

  it('exports both device-signed contracts through the capability barrel', () => {
    expect(backupDeviceAutoCreateInfoContract).toEqual({
      method: 'GET', path: '/backup/api/auto-create', authType: 'device_signature',
      querySchema: BackupStatusQuerySchema, responseSchema: BackupAutoCreateInfoResponseSchema,
    });
    expect(backupDeviceAutoCreateContract).toEqual({
      method: 'POST', path: '/backup/api/auto-create', authType: 'device_signature',
      bodySchema: BackupAutoCreateBodySchema, responseSchema: BackupAutoCreateResponseSchema,
    });
  });
});
