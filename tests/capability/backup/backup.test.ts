import { describe, expect, it } from 'vitest';
import {
  canonicalDeviceRequest,
  deviceTimestampInWindow,
  AuthDeviceSignatureSchema,
  DEVICE_ID_HEADER,
  DEVICE_NONCE_HEADER,
  DEVICE_SIGNATURE_HEADER,
  DEVICE_TIMESTAMP_HEADER,
} from '../../../src/auth/index.js';
import {
  BACKUP_APPROVAL_TYPES,
  BackupCreateBindingsSchema,
  BackupDeviceRequestBodySchema,
  BackupResourceRefSchema,
  BackupResourceSchema,
  BackupRestoreInputSchema,
  BackupRestoreSnapshotBindingsSchema,
  BackupStatusSchema,
  backupDeviceRequestContract,
  backupDeviceStatusContract,
  backupDeviceVerifiedContract,
} from '../../../src/capability/index.js';
import { ApprovalActionTypeSchema } from '../../../src/capability/index.js';

describe('resources', () => {
  it('accepts known providers only', () => {
    expect(BackupResourceRefSchema.safeParse('hostinger:vm:123456').success).toBe(true);
    expect(BackupResourceRefSchema.safeParse('hetzner:vm:1').success).toBe(false);
    expect(BackupResourceRefSchema.safeParse('hostinger:vm:').success).toBe(false);
    expect(BackupResourceRefSchema.safeParse('hostinger:vm:12/../3').success).toBe(false);
  });

  it('keeps ref, provider and machine id consistent', () => {
    const r = { ref: 'hostinger:vm:123456', provider: 'hostinger', machineId: '123456', expectedIp: '187.77.154.18', name: 'VPS stack' };
    expect(BackupResourceSchema.safeParse(r).success).toBe(true);
    expect(BackupResourceSchema.safeParse({ ...r, machineId: '654321' }).success).toBe(false);
    expect(BackupResourceSchema.safeParse({ ...r, expectedIp: 'srv.example.com' }).success).toBe(false);
  });
});

describe('approval types and bindings', () => {
  it('declares valid action types of client backup', () => {
    for (const t of Object.values(BACKUP_APPROVAL_TYPES)) {
      expect(ApprovalActionTypeSchema.safeParse(t).success).toBe(true);
      expect(t.startsWith('backup.')).toBe(true);
    }
  });

  it('binds a snapshot to resource, release and the snapshot it overwrites', () => {
    expect(BackupCreateBindingsSchema.safeParse({ resource: 'hostinger:vm:1', release: 'pre-phase-60-agent-x9', overwrites: 325 }).success).toBe(true);
    expect(BackupCreateBindingsSchema.safeParse({ resource: 'hostinger:vm:1', release: 'pre-phase-60-agent-x9', overwrites: 'none' }).success).toBe(true);
    expect(BackupCreateBindingsSchema.safeParse({ resource: 'hostinger:vm:1', release: 'pre-phase-60-agent-x9' }).success).toBe(false);
    expect(BackupCreateBindingsSchema.safeParse({ resource: 'hostinger:vm:1', release: 'pre-phase-60-agent-x9', overwrites: 'old' }).success).toBe(false);
  });

  it('binds a restore to the exact snapshot id and date', () => {
    const b = { resource: 'hostinger:vm:1', snapshotId: 325, snapshotCreatedAt: '2026-10-03T18:20:00Z' };
    expect(BackupRestoreSnapshotBindingsSchema.safeParse(b).success).toBe(true);
    expect(BackupRestoreSnapshotBindingsSchema.safeParse({ ...b, snapshotCreatedAt: undefined }).success).toBe(false);
  });
});

describe('status and tools', () => {
  const status = {
    resource: 'hostinger:vm:1',
    snapshot: { id: 325, createdAt: '2026-10-03T18:20:00Z', expiresAt: '2026-10-23T18:20:00Z', restoreSec: 1800, release: 'pre-phase-55-agent-x9', origin: 'approved' },
    action: null,
    providerBackups: [{ id: 9, createdAt: '2026-10-01T03:00:00Z', restoreSec: 3600 }],
    lastVerifiedRelease: { release: 'pre-phase-55-agent-x9', verifiedAt: '2026-10-03T19:00:00Z' },
    health: { healthy: 22, total: 23, unhealthy: ['cap-voice'], checkedAt: '2026-10-07T19:00:00Z' },
  };

  it('accepts a full status and rejects inconsistent health counts', () => {
    expect(BackupStatusSchema.safeParse(status).success).toBe(true);
    expect(BackupStatusSchema.safeParse({ ...status, health: { ...status.health, unhealthy: [] } }).success).toBe(false);
    expect(BackupStatusSchema.safeParse({ ...status, snapshot: { ...status.snapshot, origin: 'manual' } }).success).toBe(false);
  });

  it('requires backupId exactly when restoring a provider backup', () => {
    expect(BackupRestoreInputSchema.safeParse({ source: 'snapshot' }).success).toBe(true);
    expect(BackupRestoreInputSchema.safeParse({ source: 'backup', backupId: 9 }).success).toBe(true);
    expect(BackupRestoreInputSchema.safeParse({ source: 'backup' }).success).toBe(false);
    expect(BackupRestoreInputSchema.safeParse({ source: 'snapshot', backupId: 9 }).success).toBe(false);
  });
});

describe('device API', () => {
  it('pins the device endpoints to device signatures', () => {
    expect([backupDeviceStatusContract, backupDeviceRequestContract, backupDeviceVerifiedContract].map((c) => [c.method, c.path, c.authType])).toEqual([
      ['GET', '/backup/api/status', 'device_signature'],
      ['POST', '/backup/api/requests', 'device_signature'],
      ['POST', '/backup/api/verified', 'device_signature'],
    ]);
  });

  it('needs a release to ask for a snapshot', () => {
    expect(BackupDeviceRequestBodySchema.safeParse({ kind: 'create', release: 'pre-phase-60-agent-x9' }).success).toBe(true);
    expect(BackupDeviceRequestBodySchema.safeParse({ kind: 'create' }).success).toBe(false);
    expect(BackupDeviceRequestBodySchema.safeParse({ kind: 'restore-snapshot' }).success).toBe(true);
    expect(BackupDeviceRequestBodySchema.safeParse({ kind: 'restore-backup' }).success).toBe(false);
  });

  const parts = { method: 'POST', path: '/backup/api/requests', timestamp: '2026-10-07T19:00:00Z', nonce: 'BBBBBBBBBBBBBBBBBBBBBB', bodySha256: 'c'.repeat(64) } as const;

  it('builds the exact signed message', () => {
    expect(canonicalDeviceRequest(parts)).toBe(`x9-device-request-v1\nPOST\n/backup/api/requests\n2026-10-07T19:00:00Z\nBBBBBBBBBBBBBBBBBBBBBB\n${'c'.repeat(64)}`);
    expect(() => canonicalDeviceRequest({ ...parts, path: '/backup/api/requests\nGET' })).toThrow();
    expect(() => canonicalDeviceRequest({ ...parts, method: 'DELETE' as never })).toThrow();
  });

  it('checks the clock window at ±60 s', () => {
    const now = Date.parse('2026-10-07T19:00:00Z');
    expect(deviceTimestampInWindow('2026-10-07T19:01:00Z', now)).toBe(true);
    expect(deviceTimestampInWindow('2026-10-07T18:59:00Z', now)).toBe(true);
    expect(deviceTimestampInWindow('2026-10-07T19:01:01Z', now)).toBe(false);
    expect(deviceTimestampInWindow('2026-10-07T18:58:59Z', now)).toBe(false);
    expect(deviceTimestampInWindow('yesterday', now)).toBe(false);
  });

  it('types the four device headers', () => {
    const h = { [DEVICE_ID_HEADER]: 'mac-stefano', [DEVICE_TIMESTAMP_HEADER]: parts.timestamp, [DEVICE_NONCE_HEADER]: parts.nonce, [DEVICE_SIGNATURE_HEADER]: 'A'.repeat(86) };
    expect(AuthDeviceSignatureSchema.safeParse(h).success).toBe(true);
    expect(AuthDeviceSignatureSchema.safeParse({ ...h, [DEVICE_SIGNATURE_HEADER]: 'A'.repeat(85) }).success).toBe(false);
  });
});
