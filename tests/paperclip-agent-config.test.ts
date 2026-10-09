import { describe, expect, it } from 'vitest';
import {
  PaperclipAgentConfigSchema, PaperclipAppliedAgentBindingSchema,
  PaperclipProvisioningProvenanceSchema, PaperclipConfigFingerprintSchema,
  PaperclipAgentInstallRequestSchema, PaperclipAgentReadbackSchema,
  matchesPaperclipInstallation,
} from '../src/capability/paperclip/index.js';

const nativeId = '00000000-0000-4000-8000-000000000001';
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const desired = { agentId: 'agent-a', version: 2, unitId: 'unit-a', roleRef: 'spokesperson' };
const fingerprint = 'a'.repeat(64);
const installation = { scope, version: 2, enabled: true, registryFingerprint: fingerprint };
const provenance = { source: 'native_operator_inventory', inventoryFingerprint: fingerprint };
const binding = { scope, unitId: 'unit-a', companyId: nativeId, paperclipAgentId: nativeId, enabled: true,
  roleAgents: { engineer: nativeId }, callerRoleRef: 'spokesperson', provisioningRevision: 3, provenance };
const readback = { ...binding, appliedVersion: 2, registryFingerprint: fingerprint, configFingerprint: 'b'.repeat(64) };

describe('ordinary Paperclip configuration', () => {
  it('roundtrips the generic Forge body without expectedVersion or native identity', () => {
    expect(PaperclipAgentConfigSchema.parse(desired)).toEqual(desired);
  });
  it.each(['tenantId', 'ownerId', 'companyId', 'paperclipAgentId', 'roleAgents', 'credentials', 'PAPERCLIP_RUN_ID', 'expectedVersion'])(
    'rejects owner-controlled authority/secret field %s', field => {
      expect(PaperclipAgentConfigSchema.safeParse({ ...desired, [field]: 'synthetic' }).success).toBe(false);
    });
  it.each([0, -1, 0.5, Infinity, '2', null])('rejects invalid version %s', version => {
    expect(PaperclipAgentConfigSchema.safeParse({ ...desired, version }).success).toBe(false);
  });
  it.each(['', '../agent-b', 'Agent-A', 'agent/a'])('rejects unsafe agent path %s', agentId => {
    expect(PaperclipAgentConfigSchema.safeParse({ ...desired, agentId }).success).toBe(false);
  });
  it.each(['unitId', 'roleRef'] as const)('requires nonblank bounded %s', field => {
    for (const value of ['', '   ', 'a'.repeat(4097)]) {
      expect(PaperclipAgentConfigSchema.safeParse({ ...desired, [field]: value }).success).toBe(false);
    }
    const missing = { ...desired } as Record<string, unknown>;
    delete missing[field];
    expect(PaperclipAgentConfigSchema.safeParse(missing).success).toBe(false);
  });
});

describe('applied native inventory binding', () => {
  it('preserves caller role separately from target roleAgents', () => {
    expect(PaperclipAppliedAgentBindingSchema.parse(binding)).toEqual(binding);
    expect(binding.callerRoleRef).not.toBe(Object.keys(binding.roleAgents)[0]);
  });
  it.each(['callerRoleRef', 'provisioningRevision', 'provenance'])('requires %s', field => {
    const missing = { ...binding } as Record<string, unknown>;
    delete missing[field];
    expect(PaperclipAppliedAgentBindingSchema.safeParse(missing).success).toBe(false);
  });
  it.each(['companyId', 'paperclipAgentId'])('rejects forged non-native %s', field => {
    expect(PaperclipAppliedAgentBindingSchema.safeParse({ ...binding, [field]: 'agent-a' }).success).toBe(false);
  });
  it('rejects a non-native assignment target', () => {
    expect(PaperclipAppliedAgentBindingSchema.safeParse({ ...binding, roleAgents: { engineer: 'agent-b' } }).success).toBe(false);
  });
  it('rejects credentials or a run in the binding', () => {
    for (const field of ['credentials', 'runId', 'PAPERCLIP_RUN_ID']) {
      expect(PaperclipAppliedAgentBindingSchema.safeParse({ ...binding, [field]: 'synthetic' }).success).toBe(false);
    }
  });
  it('requires inventory provenance, not model or mutable wake reason', () => {
    expect(PaperclipProvisioningProvenanceSchema.parse(provenance)).toEqual(provenance);
    for (const source of ['model', 'wakeReason', 'native_operator_inventory ']) {
      expect(PaperclipProvisioningProvenanceSchema.safeParse({ ...provenance, source }).success).toBe(false);
    }
    expect(PaperclipProvisioningProvenanceSchema.safeParse({ ...provenance, token: 'synthetic' }).success).toBe(false);
  });
  it.each(['', 'a'.repeat(63), 'a'.repeat(65), 'G'.repeat(64)])('rejects malformed config fingerprint %s', value => {
    expect(PaperclipConfigFingerprintSchema.safeParse(value).success).toBe(false);
  });
  it('rejects an unversioned inventory', () => {
    expect(PaperclipAppliedAgentBindingSchema.safeParse({ ...binding, provisioningRevision: 0 }).success).toBe(false);
  });
});

describe('installation correspondence', () => {
  it('returns the native applied binding so the host can verify its own identity', () => {
    const observation = { ...binding, ...readback };
    expect(PaperclipAgentReadbackSchema.safeParse(observation).success).toBe(true);
  });
  it('matches exactly one valid installation and permits a disabled readback', () => {
    expect(matchesPaperclipInstallation(installation, readback)).toBe(true);
    expect(matchesPaperclipInstallation({ ...installation, enabled: false }, { ...readback, enabled: false })).toBe(true);
  });
  it.each(['tenantId', 'ownerId', 'agentId'] as const)('denies different %s', field => {
    expect(matchesPaperclipInstallation(installation, { ...readback, scope: { ...scope, [field]: 'other' } })).toBe(false);
  });
  it('denies a different applied revision', () => {
    expect(matchesPaperclipInstallation(installation, { ...readback, appliedVersion: 1 })).toBe(false);
  });
  it('denies a different enabled state', () => {
    expect(matchesPaperclipInstallation(installation, { ...readback, enabled: false })).toBe(false);
  });
  it('denies a different registry fingerprint', () => {
    expect(matchesPaperclipInstallation(installation, { ...readback, registryFingerprint: 'c'.repeat(64) })).toBe(false);
  });
  it('denies malformed request and observation before comparing them', () => {
    expect(matchesPaperclipInstallation({ ...installation, version: 0 }, readback)).toBe(false);
    expect(matchesPaperclipInstallation(installation, { ...readback, provisioningRevision: 0 })).toBe(false);
  });
  it('does not accept a desired configuration as applied observation', () => {
    expect(PaperclipAgentReadbackSchema.safeParse(desired).success).toBe(false);
    expect(PaperclipAgentInstallRequestSchema.safeParse(readback).success).toBe(false);
    for (const field of ['companyId', 'paperclipAgentId']) {
      expect(PaperclipAgentInstallRequestSchema.safeParse({ ...installation, [field]: nativeId }).success).toBe(false);
    }
  });
  it('rejects secrets and runs from installation metadata and readback', () => {
    for (const field of ['credentials', 'key', 'runId']) {
      expect(PaperclipAgentInstallRequestSchema.safeParse({ ...installation, [field]: nativeId }).success).toBe(false);
      expect(PaperclipAgentReadbackSchema.safeParse({ ...readback, [field]: nativeId }).success).toBe(false);
    }
  });
  it('requires strict complete scope', () => {
    for (const field of ['tenantId', 'ownerId', 'agentId']) {
      const incomplete = { ...scope } as Record<string, unknown>;
      delete incomplete[field];
      expect(PaperclipAgentInstallRequestSchema.safeParse({ ...installation, scope: incomplete }).success).toBe(false);
    }
    expect(PaperclipAgentReadbackSchema.safeParse({ ...readback, scope: { ...scope, userId: 'foreign' } }).success).toBe(false);
  });
  it('requires every installation field and exact boolean state', () => {
    for (const field of ['scope', 'version', 'enabled', 'registryFingerprint']) {
      const incomplete = { ...installation } as Record<string, unknown>;
      delete incomplete[field];
      expect(PaperclipAgentInstallRequestSchema.safeParse(incomplete).success).toBe(false);
    }
    for (const enabled of ['false', 0, null]) {
      expect(PaperclipAgentInstallRequestSchema.safeParse({ ...installation, enabled }).success).toBe(false);
      expect(PaperclipAgentReadbackSchema.safeParse({ ...readback, enabled }).success).toBe(false);
    }
  });
  it('requires both fingerprints and positive readback versions', () => {
    for (const field of ['registryFingerprint', 'configFingerprint', 'appliedVersion', 'provisioningRevision']) {
      const incomplete = { ...readback } as Record<string, unknown>;
      delete incomplete[field];
      expect(PaperclipAgentReadbackSchema.safeParse(incomplete).success).toBe(false);
    }
  });
});
