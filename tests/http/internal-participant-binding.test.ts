import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PARTICIPANT_BINDING_APPLY_PATH,
  InternalParticipantBindingApplyRequestSchema,
  InternalParticipantBindingApplyResponseSchema,
  InternalParticipantBindingListRequestSchema,
  InternalParticipantBindingReadRequestSchema,
  InternalParticipantBindingResolveResponseSchema,
  InternalParticipantBindingWithdrawRequestSchema,
  internalParticipantBindingApplyContract,
  internalParticipantBindingWithdrawContract,
} from '../../src/http/endpoints/internal-participant-binding.js';

const identity = () => ({ managementAgentId: 'mgmt-1', runtimeAgentId: 'run-1', vaultAgentId: 7 });
const key = () => ({
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentIdentity: identity(),
  organizationId: 'org-1',
  personRef: 'person-1',
});
const binding = () => ({
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentIdentity: identity(),
  participantId: 'pc-9',
  personRef: 'person-1',
  roles: ['member'],
  recipients: [{ kind: 'project', id: 'proj-1' }],
  appliedVersion: 1,
  appliedAt: '2026-10-15T10:00:00.000Z',
});
const receipt = () => ({
  key: key(),
  appliedVersion: 1,
  digest: 'sha256:abc',
  appliedAt: '2026-10-15T10:00:00.000Z',
});
const apply = () => ({ key: key(), binding: binding(), expectedVersion: 0 });

describe('apply request', () => {
  it('accepts matching key and binding', () => {
    expect(InternalParticipantBindingApplyRequestSchema.safeParse(apply()).success).toBe(true);
  });
  it('rejects a key different from the binding', () => {
    const r = { ...apply(), key: { ...key(), personRef: 'person-2' } };
    expect(InternalParticipantBindingApplyRequestSchema.safeParse(r).success).toBe(false);
  });
  it('rejects a binding without personRef', () => {
    const { personRef: _p, ...b } = binding();
    expect(InternalParticipantBindingApplyRequestSchema.safeParse({ ...apply(), binding: b }).success).toBe(
      false,
    );
  });
  it('rejects an extra field', () => {
    expect(InternalParticipantBindingApplyRequestSchema.safeParse({ ...apply(), runId: 'x' }).success).toBe(
      false,
    );
  });
  it('rejects a key without personRef', () => {
    const { personRef: _p, ...k } = key();
    expect(InternalParticipantBindingReadRequestSchema.safeParse({ key: k }).success).toBe(false);
  });
  it('accepts ok and error responses, rejects a receipt without digest', () => {
    const S = InternalParticipantBindingApplyResponseSchema;
    expect(S.safeParse({ ok: true, receipt: receipt() }).success).toBe(true);
    expect(S.safeParse({ ok: false, error: 'version_conflict', reason: 'r' }).success).toBe(true);
    expect(S.safeParse({ ok: false, error: 'person_required', reason: 'r' }).success).toBe(true);
    const { digest: _d, ...r } = receipt();
    expect(S.safeParse({ ok: true, receipt: r }).success).toBe(false);
  });
});

describe('list request', () => {
  const list = (limit: number) => ({
    tenantId: 't',
    ownerId: 'o',
    agentIdentity: identity(),
    organizationId: 'org-1',
    limit,
  });
  it.each([0, 101])('rejects limit %i', (limit) => {
    expect(InternalParticipantBindingListRequestSchema.safeParse(list(limit)).success).toBe(false);
  });
  it.each([1, 100])('accepts limit %i', (limit) => {
    expect(InternalParticipantBindingListRequestSchema.safeParse(list(limit)).success).toBe(true);
  });
});

describe('withdraw request', () => {
  it('requires expectedVersion > 0 and a reason', () => {
    const S = InternalParticipantBindingWithdrawRequestSchema;
    expect(S.safeParse({ key: key(), expectedVersion: 1, reason: 'left' }).success).toBe(true);
    expect(S.safeParse({ key: key(), expectedVersion: 0, reason: 'left' }).success).toBe(false);
    expect(S.safeParse({ key: key(), expectedVersion: 1, reason: '' }).success).toBe(false);
  });
});

describe('resolve response', () => {
  it('accepts the three outcomes', () => {
    const S = InternalParticipantBindingResolveResponseSchema;
    expect(S.safeParse({ outcome: 'bound', binding: binding(), receipt: receipt() }).success).toBe(true);
    expect(S.safeParse({ outcome: 'not_found', reason: 'r' }).success).toBe(true);
    expect(S.safeParse({ outcome: 'ambiguous', reason: 'r' }).success).toBe(true);
    expect(S.safeParse({ outcome: 'other', reason: 'r' }).success).toBe(false);
  });
});

describe('contracts', () => {
  it('uses secret auth and the exported paths', () => {
    expect(internalParticipantBindingApplyContract.path).toBe(INTERNAL_PARTICIPANT_BINDING_APPLY_PATH);
    expect(internalParticipantBindingApplyContract.authType).toBe('secret');
    expect(internalParticipantBindingWithdrawContract.path).toBe('/internal/participant-binding/withdraw');
  });
});
