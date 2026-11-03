import { describe, expect, it } from 'vitest';
import {
  ParticipantBindingKeySchema,
  ParticipantBindingReceiptSchema,
  ParticipantBindingResolutionSchema,
  ParticipantBindingSchema,
  ParticipantBindingSelectorSchema,
} from '../../src/organization/participant-binding.js';

const valid = () => ({
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentIdentity: { managementAgentId: 'mgmt-1', runtimeAgentId: 'run-1', vaultAgentId: 7 },
  participantId: 'pc-participant-9',
  roles: ['member'],
  recipients: [{ kind: 'project', id: 'proj-1' }],
  appliedVersion: 1,
  appliedAt: '2026-10-15T10:00:00.000Z',
});

describe('ParticipantBindingSchema', () => {
  it('accepts a valid binding', () => {
    expect(ParticipantBindingSchema.safeParse(valid()).success).toBe(true);
  });

  it('rejects an incomplete identity (missing vaultAgentId)', () => {
    const v = valid();
    delete (v.agentIdentity as Record<string, unknown>).vaultAgentId;
    expect(ParticipantBindingSchema.safeParse(v).success).toBe(false);
  });

  it('rejects empty roles', () => {
    expect(ParticipantBindingSchema.safeParse({ ...valid(), roles: [] }).success).toBe(false);
  });

  it('rejects a runId field', () => {
    expect(ParticipantBindingSchema.safeParse({ ...valid(), runId: 'run-x' }).success).toBe(false);
  });

  it('rejects appliedVersion below 1', () => {
    expect(ParticipantBindingSchema.safeParse({ ...valid(), appliedVersion: 0 }).success).toBe(false);
  });

  it('round trips', () => {
    const parsed = ParticipantBindingSchema.parse(valid());
    expect(ParticipantBindingSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  });
});

describe('ParticipantBindingSchema agentRole (1.65.0)', () => {
  it('accepts a server-written agent role and a binding saved before without it', () => {
    expect(ParticipantBindingSchema.safeParse({ ...valid(), agentRole: 'lab' }).success).toBe(true);
    expect(ParticipantBindingSchema.safeParse({ ...valid(), agentRole: 'director' }).success).toBe(true);
    expect(ParticipantBindingSchema.safeParse(valid()).success).toBe(true);
  });

  it('rejects a role outside the agent roles', () => {
    expect(ParticipantBindingSchema.safeParse({ ...valid(), agentRole: 'Lab' }).success).toBe(false);
    expect(ParticipantBindingSchema.safeParse({ ...valid(), agentRole: 'lead' }).success).toBe(false);
  });
});

describe('ParticipantBindingResolutionSchema', () => {
  it.each(['bound', 'unknown_participant', 'ambiguous', 'foreign_scope'])('accepts %s', (outcome) => {
    expect(
      ParticipantBindingResolutionSchema.safeParse({ outcome, participantId: 'p', reason: 'r' }).success,
    ).toBe(true);
  });

  it('rejects unknown outcome and missing reason', () => {
    expect(
      ParticipantBindingResolutionSchema.safeParse({ outcome: 'maybe', participantId: 'p', reason: 'r' }).success,
    ).toBe(false);
    expect(ParticipantBindingResolutionSchema.safeParse({ outcome: 'bound', participantId: 'p' }).success).toBe(false);
  });
});

const key = () => ({
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentIdentity: { managementAgentId: 'mgmt-1', runtimeAgentId: 'run-1', vaultAgentId: 7 },
  organizationId: 'org-1',
  personRef: 'person-1',
});

describe('ParticipantBindingKeySchema', () => {
  it('accepts a complete key', () => {
    expect(ParticipantBindingKeySchema.safeParse(key()).success).toBe(true);
  });
  it('rejects a key without personRef', () => {
    const { personRef: _p, ...k } = key();
    expect(ParticipantBindingKeySchema.safeParse(k).success).toBe(false);
  });
  it('rejects an empty personRef', () => {
    expect(ParticipantBindingKeySchema.safeParse({ ...key(), personRef: '' }).success).toBe(false);
  });
  it('rejects an extra field', () => {
    expect(ParticipantBindingKeySchema.safeParse({ ...key(), runId: 'x' }).success).toBe(false);
  });
});

describe('ParticipantBindingSelectorSchema', () => {
  it('rejects a selector without personRef', () => {
    const { personRef: _p, ...k } = key();
    expect(ParticipantBindingSelectorSchema.safeParse(k).success).toBe(false);
  });
});

describe('ParticipantBindingReceiptSchema', () => {
  const receipt = () => ({
    key: key(),
    appliedVersion: 1,
    digest: 'sha256:abc',
    appliedAt: '2026-10-15T10:00:00.000Z',
  });
  it('accepts a valid receipt', () => {
    expect(ParticipantBindingReceiptSchema.safeParse(receipt()).success).toBe(true);
  });
  it('rejects a receipt without digest', () => {
    const { digest: _d, ...r } = receipt();
    expect(ParticipantBindingReceiptSchema.safeParse(r).success).toBe(false);
  });
  it('rejects appliedVersion 0', () => {
    expect(ParticipantBindingReceiptSchema.safeParse({ ...receipt(), appliedVersion: 0 }).success).toBe(false);
  });
});
