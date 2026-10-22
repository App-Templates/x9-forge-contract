import { describe, expect, it } from 'vitest';
import {
  POLICY_APPROVAL_CHANNELS,
  POLICY_APPROVAL_SUBJECT_LABEL,
  PolicyApprovalChannelSchema,
  PolicyApprovalReplySchema,
  PolicyApprovalRequestSchema,
  PolicyApprovalSchema,
  policyApprovalFromReply,
  policyApprovalSubjectLabel,
} from '../../src/agent/index.js';

const approval = PolicyApprovalSchema.parse({
  approvalId: 'apr-00000001',
  identity: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'director-1', userId: 'person-1' },
  capability: 'email',
  tool: 'email_send',
  access: 'write',
  policyVersion: 2,
  requestedAt: '2026-10-22T10:00:00Z',
  expiresAt: '2026-10-22T10:15:00Z',
  status: 'pending',
});
const request = PolicyApprovalRequestSchema.parse({
  approval,
  channel: 'email',
  addressedTo: { ownerId: 'owner-1' },
  text: 'Approve sending the business unit action plan?',
});
const input = {
  request,
  reply: PolicyApprovalReplySchema.parse({ kind: 'approve', approvalId: approval.approvalId }),
  from: { ownerId: 'owner-1' },
  receivedAt: '2026-10-22T10:05:00Z',
};

describe('policy approval request', () => {
  it('exports the channels and subject correlation label', () => {
    expect(POLICY_APPROVAL_CHANNELS).toEqual(['email', 'telegram']);
    expect(POLICY_APPROVAL_SUBJECT_LABEL).toBe('approvazione');
    expect(policyApprovalSubjectLabel(approval.approvalId)).toBe('[approvazione apr-00000001]');
    expect(PolicyApprovalChannelSchema.safeParse('forge_panel').success).toBe(false);
    expect(PolicyApprovalRequestSchema.parse({ ...request, channel: 'telegram' }).channel).toBe('telegram');
  });

  it('rejects an already approved request', () => {
    const decided = PolicyApprovalSchema.parse({
      ...approval, status: 'approved', decidedBy: 'owner-1', decidedAt: input.receivedAt,
    });
    expect(PolicyApprovalRequestSchema.safeParse({ ...request, approval: decided }).success).toBe(false);
  });

  it('requires bounded text without surrounding whitespace and strict request fields', () => {
    for (const text of ['', ' ', ' plan', 'plan\n', 'x'.repeat(2001)]) {
      expect(PolicyApprovalRequestSchema.safeParse({ ...request, text }).success).toBe(false);
    }
    for (const text of ['x', 'x'.repeat(2000)]) {
      expect(PolicyApprovalRequestSchema.safeParse({ ...request, text }).success).toBe(true);
    }
    expect(PolicyApprovalRequestSchema.safeParse({ ...request, extra: true }).success).toBe(false);
    expect(PolicyApprovalRequestSchema.safeParse({ ...request, addressedTo: { ownerId: '' } }).success).toBe(false);
    expect(PolicyApprovalRequestSchema.safeParse({ ...request, addressedTo: { ownerId: 'owner-1', extra: true } }).success).toBe(false);
  });

  it('validates strict replies and refusal reason bounds', () => {
    for (const reason of ['', 'no', 'x'.repeat(2001)]) {
      expect(PolicyApprovalReplySchema.safeParse({ kind: 'refuse', approvalId: approval.approvalId, reason }).success).toBe(false);
    }
    for (const reason of ['No.', 'x'.repeat(2000)]) {
      expect(PolicyApprovalReplySchema.safeParse({ kind: 'refuse', approvalId: approval.approvalId, reason }).success).toBe(true);
    }
    expect(PolicyApprovalReplySchema.safeParse({ kind: 'approve', approvalId: approval.approvalId, reason: 'No.' }).success).toBe(false);
    expect(PolicyApprovalReplySchema.safeParse({ kind: 'other', approvalId: approval.approvalId }).success).toBe(false);
    expect(PolicyApprovalReplySchema.safeParse({ kind: 'unclear' }).success).toBe(false);
  });
});

describe('policy approval from reply', () => {
  it('approves the operation with the authenticated owner and received time', () => {
    expect(policyApprovalFromReply(input)).toEqual({
      ok: true,
      approval: { ...approval, status: 'approved', decidedBy: input.from.ownerId, decidedAt: input.receivedAt },
    });
    expect(request.approval).toEqual(approval);
    expect(request.approval.status).toBe('pending');
  });

  it('refuses the operation with the authenticated owner and received time', () => {
    const reply = PolicyApprovalReplySchema.parse({ kind: 'refuse', approvalId: approval.approvalId, reason: 'Revise the plan' });
    expect(policyApprovalFromReply({ ...input, reply })).toEqual({
      ok: true,
      approval: { ...approval, status: 'rejected', decidedBy: input.from.ownerId, decidedAt: input.receivedAt },
    });
  });

  it('returns mismatch for another approval id', () => {
    const reply = PolicyApprovalReplySchema.parse({ kind: 'approve', approvalId: 'apr-00000002' });
    expect(policyApprovalFromReply({ ...input, reply })).toEqual({ ok: false, code: 'mismatch' });
  });

  it('returns not_addressee for another authenticated owner', () => {
    expect(policyApprovalFromReply({ ...input, from: { ownerId: 'owner-2' } })).toEqual({ ok: false, code: 'not_addressee' });
  });

  it('returns expired after the expiry instant', () => {
    expect(policyApprovalFromReply({ ...input, receivedAt: '2026-10-22T10:15:00.001Z' })).toEqual({ ok: false, code: 'expired' });
  });

  it('returns before_request for a reply preceding the request', () => {
    expect(policyApprovalFromReply({ ...input, receivedAt: '2026-10-22T09:59:59.999Z' })).toEqual({ ok: false, code: 'before_request' });
  });

  it('returns unclear without deciding the approval', () => {
    const reply = PolicyApprovalReplySchema.parse({ kind: 'unclear', approvalId: approval.approvalId });
    expect(policyApprovalFromReply({ ...input, reply })).toEqual({ ok: false, code: 'unclear' });
  });

  it('accepts both time boundaries and compares instants across offsets', () => {
    for (const receivedAt of [approval.requestedAt, approval.expiresAt, '2026-10-22T12:05:00+02:00']) {
      expect(policyApprovalFromReply({ ...input, receivedAt })).toEqual({
        ok: true, approval: { ...approval, status: 'approved', decidedBy: input.from.ownerId, decidedAt: receivedAt },
      });
    }
  });

  it('validates the resulting approval through the existing schema', () => {
    expect(() => policyApprovalFromReply({ ...input, receivedAt: 'invalid' })).toThrow();
  });
});
