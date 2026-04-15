import { describe, it, expect } from 'vitest';
import {
  MemoryScopeSchema,
  MemoryTypeSchema,
  MemoryStatusSchema,
  MemoryCorrectiveActionSchema,
  TemporalSemanticsSchema,
  MemoryIdentityEnvelopeSchema,
  MemoryWriteCandidateSchema,
  RecallBundleSchema,
  RetentionPolicyMetadataSchema,
  type MemoryScope,
  type MemoryType,
  type MemoryStatus,
  type MemoryCorrectiveAction,
  type TemporalSemantics,
  type MemoryIdentityEnvelope,
  type MemoryWriteCandidate,
  type RecallBundle,
  type RetentionPolicyMetadata,
} from '../src/memory/index';

describe('memory contracts — enums', () => {
  it('MemoryScope accepts platform | owner | agent | user', () => {
    expect(MemoryScopeSchema.safeParse('platform').success).toBe(true);
    expect(MemoryScopeSchema.safeParse('owner').success).toBe(true);
    expect(MemoryScopeSchema.safeParse('agent').success).toBe(true);
    expect(MemoryScopeSchema.safeParse('user').success).toBe(true);
    expect(MemoryScopeSchema.safeParse('tenant').success).toBe(false);
  });

  it('MemoryType accepts profile | procedural | episodic | relationship', () => {
    expect(MemoryTypeSchema.safeParse('profile').success).toBe(true);
    expect(MemoryTypeSchema.safeParse('procedural').success).toBe(true);
    expect(MemoryTypeSchema.safeParse('episodic').success).toBe(true);
    expect(MemoryTypeSchema.safeParse('relationship').success).toBe(true);
    expect(MemoryTypeSchema.safeParse('declarative').success).toBe(false);
  });

  it('MemoryStatus covers full lifecycle', () => {
    for (const s of ['active', 'invalidated', 'superseded', 'redacted', 'archived']) {
      expect(MemoryStatusSchema.safeParse(s).success).toBe(true);
    }
    expect(MemoryStatusSchema.safeParse('pending').success).toBe(false);
  });

  it('MemoryStatus Phase 36.1 additions (draft/rejected/needs_review)', () => {
    for (const s of ['draft', 'rejected', 'needs_review']) {
      expect(MemoryStatusSchema.safeParse(s).success).toBe(true);
    }
    // Backward compat: old 5 values still valid
    for (const s of ['active', 'invalidated', 'superseded', 'redacted', 'archived']) {
      expect(MemoryStatusSchema.safeParse(s).success).toBe(true);
    }
    // Total 8 values, nothing else passes
    expect(MemoryStatusSchema.safeParse('unknown').success).toBe(false);
  });

  it('MemoryCorrectiveAction accepts all 10 actions aligned with ADR §14.3', () => {
    for (const a of [
      'invalidate',
      'forget',
      'redact',
      'pin',
      'promote',
      'demote',
      'merge_entity',
      'split_entity',
      'mark_sensitive',
      'change_retention',
    ]) {
      expect(MemoryCorrectiveActionSchema.safeParse(a).success).toBe(true);
    }
    expect(MemoryCorrectiveActionSchema.safeParse('delete').success).toBe(false);
    expect(MemoryCorrectiveActionSchema.safeParse('archive').success).toBe(false);
    // Legacy 'merge' was removed — use 'merge_entity'
    expect(MemoryCorrectiveActionSchema.safeParse('merge').success).toBe(false);
  });
});

describe('memory contracts — envelopes', () => {
  it('TemporalSemantics requires validAt, others optional', () => {
    const minimal: TemporalSemantics = { validAt: '2026-04-15T10:00:00Z' };
    expect(TemporalSemanticsSchema.safeParse(minimal).success).toBe(true);

    const full: TemporalSemantics = {
      validAt: '2026-04-15T10:00:00Z',
      invalidAt: '2026-04-16T10:00:00Z',
      supersedes: 'mem_01',
      supersededBy: 'mem_03',
    };
    expect(TemporalSemanticsSchema.safeParse(full).success).toBe(true);

    expect(TemporalSemanticsSchema.safeParse({}).success).toBe(false);
  });

  it('MemoryIdentityEnvelope requires only tenantId', () => {
    const minimal: MemoryIdentityEnvelope = { tenantId: 'tenant_x' };
    expect(MemoryIdentityEnvelopeSchema.safeParse(minimal).success).toBe(true);

    const full: MemoryIdentityEnvelope = {
      tenantId: 'tenant_x',
      ownerId: 'owner_1',
      agentId: 'agent_chief',
      userId: 'user_42',
    };
    expect(MemoryIdentityEnvelopeSchema.safeParse(full).success).toBe(true);

    expect(MemoryIdentityEnvelopeSchema.safeParse({}).success).toBe(false);
  });
});

describe('memory contracts — write candidate', () => {
  it('accepts a well-formed candidate payload', () => {
    const candidate: MemoryWriteCandidate = {
      scope: 'user',
      type: 'profile',
      subtype: 'preference.timezone',
      confidence: 0.95,
      content: { timezone: 'Europe/Rome' },
      identity: {
        tenantId: 'tenant_x',
        ownerId: 'owner_1',
        agentId: 'agent_chief',
        userId: 'user_42',
      },
      temporal: { validAt: '2026-04-15T10:00:00Z' },
      source: {
        kind: 'chat-message',
        ref: 'msg_123',
        capturedAt: '2026-04-15T10:00:05Z',
      },
      privacy: {
        containsPii: true,
        containsSensitive: false,
        shareability: 'tenant-only',
      },
    };
    expect(MemoryWriteCandidateSchema.safeParse(candidate).success).toBe(true);
  });

  it('rejects out-of-range confidence', () => {
    const bad = {
      scope: 'user',
      type: 'profile',
      confidence: 1.5,
      content: {},
      identity: { tenantId: 't' },
      temporal: { validAt: '2026-04-15T10:00:00Z' },
      source: { kind: 'test', capturedAt: '2026-04-15T10:00:00Z' },
      privacy: { containsPii: false, containsSensitive: false, shareability: 'tenant-only' },
    };
    expect(MemoryWriteCandidateSchema.safeParse(bad).success).toBe(false);
  });
});

describe('memory contracts — recall bundle', () => {
  it('accepts an empty bundle with required sections + auditMeta', () => {
    const bundle: RecallBundle = {
      profile: [],
      procedural: [],
      relationships: [],
      episodes: [],
      auditMeta: {
        recalledAt: '2026-04-15T10:00:00Z',
        latencyMs: 12,
        sourceStoreVersion: 'v2.0.0-alpha.1',
        policyApplied: ['scope-filter', 'privacy-filter'],
      },
    };
    expect(RecallBundleSchema.safeParse(bundle).success).toBe(true);
  });

  it('rejects bundle missing a required section', () => {
    const bad = {
      profile: [],
      procedural: [],
      // relationships missing
      episodes: [],
      auditMeta: {
        recalledAt: '2026-04-15T10:00:00Z',
        latencyMs: 12,
        sourceStoreVersion: 'v2.0.0',
        policyApplied: [],
      },
    };
    expect(RecallBundleSchema.safeParse(bad).success).toBe(false);
  });
});

describe('memory contracts — retention', () => {
  it('accepts a valid retention policy', () => {
    const policy: RetentionPolicyMetadata = {
      retentionClass: 'standard',
      ttlSeconds: 2592000, // 30 days
      archivalPolicy: 'archive-cold',
      purgeEligible: false,
    };
    expect(RetentionPolicyMetadataSchema.safeParse(policy).success).toBe(true);
  });

  it('rejects negative ttlSeconds', () => {
    const bad = {
      retentionClass: 'standard',
      ttlSeconds: -1,
      archivalPolicy: 'delete',
      purgeEligible: true,
    };
    expect(RetentionPolicyMetadataSchema.safeParse(bad).success).toBe(false);
  });
});

describe('memory contracts — type inference', () => {
  it('type-level assertions compile (smoke for z.infer)', () => {
    // compile-time smoke: if these lines compile, z.infer is working correctly
    const scope: MemoryScope = 'agent';
    const type: MemoryType = 'procedural';
    const status: MemoryStatus = 'active';
    const action: MemoryCorrectiveAction = 'pin';
    expect([scope, type, status, action]).toEqual(['agent', 'procedural', 'active', 'pin']);
  });
});
