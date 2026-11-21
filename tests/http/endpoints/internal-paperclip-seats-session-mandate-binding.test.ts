import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import type { ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';
import * as seats from '../../../src/http/endpoints/internal-paperclip-seats.js';

const issueId = '11111111-1111-4111-8111-111111111111';
// Reconstruct the saved response shape from s8200; this is not a live production capture.
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
const read = { result: 'read', issueId, mandate } as const;
const schema = seats.InternalPaperclipSeatSessionMandateResponseSchema;
const require = createRequire(import.meta.url);

describe('session mandate identity binding', () => {
  it('s8400 principale', () => {
    expect(seats.sessionMandateBinding).toBeTypeOf('function');
    expect(seats.PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS).toEqual(['verified', 'criteria_only']);
    for (const mandateBinding of ['verified', 'criteria_only'] as const) {
      expect(seats.PaperclipSeatSessionMandateBindingSchema.parse(mandateBinding)).toBe(mandateBinding);
      const response = { ...read, mandateBinding };
      expect(schema.parse(response)).toEqual(response);
      expect(seats.sessionMandateBinding(schema.parse(response))).toBe(mandateBinding);
    }
    expect(seats.sessionMandateBinding(schema.parse(read))).toBe('criteria_only');
  });

  it('s8400 risposta-di-oggi-vale-solo-criteri', () => {
    for (const response of [
      read,
      { result: 'mandate_missing', issueId },
      { result: 'mandate_invalid', issueId, reason: 'not_json' },
      { result: 'mandate_invalid', issueId, reason: 'not_a_mandate' },
      ...['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS].map(result => ({ result })),
    ]) {
      const parsed = schema.parse(response);
      expect(parsed).toEqual(response);
      expect(parsed).not.toHaveProperty('mandateBinding');
      expect(seats.sessionMandateBinding(parsed)).toBe('criteria_only');
    }
  });

  it('s8400 valore-sconosciuto-rifiutato', () => {
    for (const mandateBinding of ['maybe', '']) {
      expect(seats.PaperclipSeatSessionMandateBindingSchema.safeParse(mandateBinding).success).toBe(false);
      const parsed = schema.safeParse({ ...read, mandateBinding });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues).toEqual(expect.arrayContaining([
          expect.objectContaining({ path: ['mandateBinding'] }),
        ]));
      }
    }
  });

  it('s8400 solo-con-read', () => {
    for (const response of [
      { result: 'mandate_missing', issueId },
      { result: 'mandate_invalid', issueId, reason: 'not_json' },
      ...['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS].map(result => ({ result })),
    ]) {
      const refusal = schema.parse(response);
      for (const mandateBinding of ['verified', 'criteria_only'] as const) {
        const value = { ...refusal, mandateBinding };
        const parsed = schema.safeParse(value);
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
          expect(parsed.error.issues).toEqual(expect.arrayContaining([
            expect.objectContaining({
              code: 'custom', path: ['mandateBinding'],
              message: `${response.result} must not carry mandateBinding`,
            }),
          ]));
        }
        // Reading an unparsed refusal must never promote its identity to verified.
        expect(seats.sessionMandateBinding(value)).toBe('criteria_only');
      }
    }
  });

  it('s8400 campo-in-piu-ancora-rifiutato', () => {
    expect(schema.safeParse({ ...read, mandateBinding: 'verified', foo: true }).success).toBe(false);
  });

  it('s8400 esportato-compilato', async () => {
    const esm = await import('../../../dist/http/endpoints/internal-paperclip-seats.js');
    const cjs: typeof seats = require('../../../dist/http/endpoints/internal-paperclip-seats.cjs');
    for (const built of [esm, cjs]) {
      expect(built.sessionMandateBinding).toBeTypeOf('function');
      expect(built.PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS).toEqual(['verified', 'criteria_only']);
      expect(built.sessionMandateBinding(built.InternalPaperclipSeatSessionMandateResponseSchema.parse(read)))
        .toBe('criteria_only');
      const response = { ...read, mandateBinding: 'verified' };
      expect(built.sessionMandateBinding(built.InternalPaperclipSeatSessionMandateResponseSchema.parse(response)))
        .toBe('verified');
    }
  });
});
