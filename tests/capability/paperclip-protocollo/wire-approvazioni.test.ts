import { describe, expect, it } from 'vitest';
import * as capability from '../../../src/capability/index.js';
import {
  PAPERCLIP_APPROVAL_TYPES,
  PAPERCLIP_APPROVAL_STATUSES,
  PAPERCLIP_APPROVAL_RESOLVABLE_STATUSES,
  PAPERCLIP_APPROVAL_WAKE_REASON,
  PaperclipApprovalTypeSchema,
  PaperclipApprovalStatusSchema,
  PaperclipApprovalCreaCorpoSchema,
  PaperclipBudgetOverridePayloadSchema,
  PaperclipApprovalSchema,
  PaperclipApprovalSvegliaContestoSchema,
} from '../../../src/capability/paperclip-protocollo/wire-approvazioni.js';
import { paperclipPercorsi } from '../../../src/capability/paperclip-protocollo/percorsi.js';
import { PaperclipTurnoContestoSchema } from '../../../src/capability/paperclip-protocollo/turno.js';

const COMPANY_ID = '11111111-1111-4111-8111-111111111111';
const AGENT_ID = '22222222-2222-4222-8222-222222222222';
const ISSUE_ID = '33333333-3333-4333-8333-333333333333';
const APPROVAL_ID = '44444444-4444-4444-8444-444444444444';
const POLICY_ID = '55555555-5555-4555-8555-555555555555';

const boardRequest = {
  type: 'request_board_approval',
  requestedByAgentId: AGENT_ID,
  issueIds: [ISSUE_ID],
  payload: {
    title: 'Approve the launch budget',
    summary: 'The launch needs additional spend to reach the agreed audience.',
    recommendedAction: 'Approve the proposed launch budget.',
    risks: ['The campaign may return fewer leads than forecast.'],
  },
};

describe('approvazioni di Paperclip', () => {
  it('s7407_enum_chiusi', () => {
    const types = ['hire_agent', 'approve_ceo_strategy', 'budget_override_required', 'request_board_approval'];
    const statuses = ['pending', 'revision_requested', 'approved', 'rejected', 'cancelled'];
    expect(PAPERCLIP_APPROVAL_TYPES).toEqual(types);
    expect(PaperclipApprovalTypeSchema.options).toEqual(types);
    expect(PAPERCLIP_APPROVAL_STATUSES).toEqual(statuses);
    expect(PaperclipApprovalStatusSchema.options).toEqual(statuses);
    expect(PAPERCLIP_APPROVAL_RESOLVABLE_STATUSES).toEqual(['pending', 'revision_requested']);
    for (const type of types) expect(PaperclipApprovalTypeSchema.parse(type)).toBe(type);
    for (const status of statuses) expect(PaperclipApprovalStatusSchema.parse(status)).toBe(status);
    for (const type of ['approval', 'hire', '']) {
      expect(PaperclipApprovalTypeSchema.safeParse(type).success).toBe(false);
    }
    for (const status of ['approvata', 'denied']) {
      expect(PaperclipApprovalStatusSchema.safeParse(status).success).toBe(false);
    }
  });

  it('s7407_richiesta_al_board', () => {
    expect(PaperclipApprovalCreaCorpoSchema.parse(boardRequest)).toEqual(boardRequest);
    const { requestedByAgentId, ...anonymous } = boardRequest;
    const { recommendedAction, ...incompletePayload } = boardRequest.payload;
    const { issueIds, ...unlinked } = boardRequest;
    expect(requestedByAgentId).toBe(AGENT_ID);
    expect(recommendedAction).toBe('Approve the proposed launch budget.');
    expect(issueIds).toEqual([ISSUE_ID]);
    expect(PaperclipApprovalCreaCorpoSchema.parse(unlinked)).toEqual(unlinked);
    for (const invalid of [
      anonymous,
      { ...boardRequest, requestedByAgentId: null },
      { ...boardRequest, payload: incompletePayload },
      { ...boardRequest, payload: { ...boardRequest.payload, risks: Array.from({ length: 21 }, () => 'Risk') } },
      { ...boardRequest, issueIds: [] },
      { ...boardRequest, issueIds: Array.from({ length: 51 }, () => ISSUE_ID) },
      { ...boardRequest, extra: true },
    ]) {
      expect(PaperclipApprovalCreaCorpoSchema.safeParse(invalid).success).toBe(false);
    }
    const extended = { ...boardRequest, payload: { ...boardRequest.payload, evidence: 'Launch forecast' } };
    expect(PaperclipApprovalCreaCorpoSchema.parse(extended)).toEqual(extended);
    expect(PaperclipApprovalCreaCorpoSchema.safeParse({
      ...boardRequest,
      issueIds: Array.from({ length: 50 }, () => ISSUE_ID),
      payload: { ...boardRequest.payload, risks: Array.from({ length: 20 }, () => 'Risk') },
    }).success).toBe(true);
  });

  it('s7407_tipi_non_creabili', () => {
    for (const type of ['hire_agent', 'budget_override_required', 'invented']) {
      expect(PaperclipApprovalCreaCorpoSchema.safeParse({ ...boardRequest, type }).success).toBe(false);
    }
    const strategy = { ...boardRequest, type: 'approve_ceo_strategy', payload: { strategy: ['Launch'], version: 1 } };
    expect(PaperclipApprovalCreaCorpoSchema.parse(strategy)).toEqual(strategy);
  });

  it('s7407_payload_del_tetto', () => {
    const payload = {
      scopeType: 'agent', scopeId: AGENT_ID, scopeName: 'Director', metric: 'billed_cents',
      windowKind: 'calendar_month_utc', thresholdType: 'hard', budgetAmount: 10000,
      observedAmount: 10200, warnPercent: 80, windowStart: '2026-11-01T00:00:00Z',
      windowEnd: '2026-12-01T00:00:00Z', policyId: POLICY_ID,
      guidance: 'Ask the board to approve additional budget.',
    };
    expect(Object.keys(payload)).toHaveLength(13);
    expect(PaperclipBudgetOverridePayloadSchema.parse(payload)).toEqual(payload);
    expect(PaperclipBudgetOverridePayloadSchema.safeParse({ ...payload, warnPercent: 99 }).success).toBe(true);
    for (const extra of [
      { scopeType: 'team' }, { thresholdType: 'medium' }, { warnPercent: 100 },
      { windowStart: 'not a date' }, { policyId: 'not a guid' }, { metric: 'tokens' },
    ]) {
      expect(PaperclipBudgetOverridePayloadSchema.safeParse({ ...payload, ...extra }).success).toBe(false);
    }
  });

  it('s7407_riga_letta', () => {
    const approval = {
      id: APPROVAL_ID, companyId: COMPANY_ID, type: 'request_board_approval', status: 'pending',
      requestedByAgentId: AGENT_ID, requestedByUserId: null, payload: boardRequest.payload,
    };
    expect(PaperclipApprovalSchema.parse(approval)).toEqual(approval);
    expect(PaperclipApprovalSchema.safeParse({ ...approval, status: 'approvata' }).success).toBe(false);
    for (const requestedByUserId of [null, 'board-user']) {
      const systemApproval = { ...approval, requestedByAgentId: null, requestedByUserId };
      expect(PaperclipApprovalSchema.parse(systemApproval)).toEqual(systemApproval);
    }
  });

  it('s7407_sveglia_del_richiedente', () => {
    const context = {
      source: 'approval.approved', approvalId: APPROVAL_ID, approvalStatus: 'approved',
      issueId: ISSUE_ID, issueIds: [ISSUE_ID], taskId: ISSUE_ID, wakeReason: 'approval_approved',
    };
    expect(PAPERCLIP_APPROVAL_WAKE_REASON).toBe('approval_approved');
    expect(PaperclipApprovalSvegliaContestoSchema.parse(context)).toEqual(context);
    expect(PaperclipTurnoContestoSchema.safeParse(context).success).toBe(true);
    for (const extra of [{ approvalStatus: 'rejected' }, { wakeReason: 'approval_rejected' }]) {
      expect(PaperclipApprovalSvegliaContestoSchema.safeParse({ ...context, ...extra }).success).toBe(false);
    }
    const unlinked = { ...context, issueId: null, taskId: null, issueIds: [] };
    expect(PaperclipApprovalSvegliaContestoSchema.parse(unlinked)).toEqual(unlinked);
  });

  it('s7407_percorso', () => {
    expect(paperclipPercorsi.approvazioni(COMPANY_ID)).toBe(`/api/companies/${COMPANY_ID}/approvals`);
    expect(() => paperclipPercorsi.approvazioni(`${COMPANY_ID}/other`)).toThrow();
  });

  it('s7407_esportazioni', () => {
    expect(capability.PaperclipApprovalCreaCorpoSchema).toBeDefined();
    expect(capability.PaperclipApprovalCreaCorpoSchema).toBe(PaperclipApprovalCreaCorpoSchema);
  });
});
