import { describe, expect, it } from 'vitest';
import {
  ParticipantBindingResolutionSchema,
  ParticipantBindingSchema,
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
