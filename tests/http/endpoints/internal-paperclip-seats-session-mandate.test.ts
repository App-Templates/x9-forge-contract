import { describe, expect, it } from 'vitest';
import type { ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';
import * as seats from '../../../src/http/endpoints/internal-paperclip-seats.js';

const request = {
  organizationId: 'dispensa-pronta',
  identity: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  sourceRunId: 'chief-run-goo-172',
};
const issueId = '11111111-1111-4111-8111-111111111111';

// Reuse the GOO-172 shape from the mandate-completion test; live document texts are not available here.
const mandate = {
  tenantId: 'tenant-1', organizationId: 'dispensa-pronta', clientId: 'dispensa-pronta', projectId: 'dispensa-pronta-app',
  planSection: {
    planId: 'plan_001', planVersion: 2, planDigest: 'a'.repeat(64), deliveryShape: 'product',
    businessUnit: {
      buSlug: 'sviluppo', typeId: 'marketing', mandate: 'Build the app.', competencies: ['dev'],
      lead: { role: 'capo-bu' }, executor: 'agent', referent: { personRef: 'stefano', entryVersion: 3 },
      firstActivities: ['Start'], start: { kind: 'now' },
    },
    workBreakdown: [{
      id: 'lista-spesa', title: 'lista-spesa', expectedGoal: 'Goal', milestone: 1,
      owners: [{ buSlug: 'sviluppo', does: 'Builds' }],
      deliveryCriteria: [
        'Posso aggiungere un prodotto alla lista della spesa.',
        'Il prodotto aggiunto resta nella lista dopo aver chiuso la pagina.',
        'Posso togliere un prodotto dalla lista.',
      ],
    }],
  },
  decision: { requestId: 'decision_001', planVersion: 2 },
  referent: { personRef: 'stefano', entryVersion: 3 }, notebookPages: [],
  reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
} satisfies ReconciledMandate;

describe('session mandate route', () => {
  it('s8200 rotta-del-mandato', () => {
    const contract = seats.internalPaperclipSeatSessionMandateContract;
    expect(contract).toBeDefined();
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/paperclip/seats/session-mandate');
    expect(contract.path).toBe(seats.INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH);
    expect(contract.authType).toBe('secret');
    expect(contract.bodySchema).toBe(seats.InternalPaperclipSeatSessionMandateRequestSchema);
    expect(contract.responseSchema).toBe(seats.InternalPaperclipSeatSessionMandateResponseSchema);
    expect(contract.errorResponseSchema).toBe(seats.InternalPaperclipSeatWakeErrorResponseSchema);
    expect(contract.bodySchema.parse(request)).toEqual(request);
    expect(seats.PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS).toEqual([
      'read', 'not_enabled', 'mandate_missing', 'mandate_invalid', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS,
    ]);
    const read = { result: 'read', issueId, mandate };
    expect(contract.responseSchema.parse(read)).toEqual(read);
    expect(mandate.planSection.workBreakdown[0].deliveryCriteria).toHaveLength(3);
    for (const response of [
      { result: 'mandate_missing', issueId },
      { result: 'mandate_invalid', issueId, reason: 'not_json' },
      { result: 'mandate_invalid', issueId, reason: 'not_a_mandate' },
      ...['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS].map(result => ({ result })),
    ]) {
      expect(contract.responseSchema.parse(response)).toEqual(response);
    }
    for (const field of ['organizationId', 'identity', 'sourceRunId'] as const) {
      const { [field]: _missing, ...partial } = request;
      expect(contract.bodySchema.safeParse(partial).success).toBe(false);
    }
    expect(contract.bodySchema.safeParse({ ...request, sourceRunId: '' }).success).toBe(false);
    expect(contract.bodySchema.safeParse({ ...request, organizationId: '' }).success).toBe(false);
    expect(contract.bodySchema.safeParse({ ...request, identity: { runtimeAgentId: 'capo-sviluppo' } }).success).toBe(false);
  });

  it('s8200 read-senza-mandato', () => {
    expect(seats.InternalPaperclipSeatSessionMandateResponseSchema.safeParse({ result: 'read', issueId }).success).toBe(false);
  });

  it('s8200 mandato-malformato', () => {
    const { decision: _missing, ...malformed } = mandate;
    expect(seats.InternalPaperclipSeatSessionMandateResponseSchema.safeParse({
      result: 'read', issueId, mandate: malformed,
    }).success).toBe(false);
  });

  it('s8200 esito-incoerente', () => {
    const schema = seats.InternalPaperclipSeatSessionMandateResponseSchema;
    for (const result of ['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS]) {
      expect(schema.safeParse({ result, issueId }).success).toBe(false);
      expect(schema.safeParse({ result, mandate }).success).toBe(false);
    }
    for (const response of [
      { result: 'read', mandate },
      { result: 'read', issueId: 'invalid', mandate },
      { result: 'mandate_missing' },
      { result: 'mandate_invalid', reason: 'not_json' },
      { result: 'mandate_invalid', issueId },
      { result: 'mandate_invalid', issueId, reason: 'unknown' },
      { result: 'mandate_missing', issueId, mandate },
      { result: 'mandate_invalid', issueId, mandate, reason: 'not_a_mandate' },
      { result: 'unknown' },
    ]) {
      expect(schema.safeParse(response).success).toBe(false);
    }
    for (const response of [
      { result: 'read', issueId, mandate },
      { result: 'mandate_missing', issueId },
      ...['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS].map(result => ({ result })),
    ]) {
      expect(schema.safeParse({ ...response, reason: 'not_json' }).success).toBe(false);
    }
  });

  it('s8200 campo-in-piu', () => {
    const schema = seats.InternalPaperclipSeatSessionMandateRequestSchema;
    expect(schema.safeParse({ ...request, issueNumber: 172 }).success).toBe(false);
    expect(schema.safeParse({ ...request, parentId: issueId }).success).toBe(false);
    expect(seats.InternalPaperclipSeatSessionMandateResponseSchema.safeParse({
      result: 'read', issueId, mandate, parentId: issueId,
    }).success).toBe(false);
  });
});
