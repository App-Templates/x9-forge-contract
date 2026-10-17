import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  INTERNAL_AGENT_TURN_RUN_ERRORS,
  InternalAgentTurnOrganizationRunSchema,
  InternalAgentTurnResponseSchema,
  InternalAgentTurnRunErrorResponseSchema,
  ORGANIZATION_ADMISSION_REFUSAL_CODES,
  OrganizationAdmissionRefusalCodeSchema,
  InternalAgentTurnRequestSchema,
} from '../../src/http/endpoints/internal-agent-turn.js';
import { OrganizationRunContextSchema } from '../../src/organization/run-context.js';
import { RunAttemptSchema } from '../../src/organization/run-outcome.js';

const legacy = { channelId: 'web', sessionId: 'sess-1', message: 'ciao' };
const context = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};
const attempt = {
  runId: 'run-1',
  attemptId: 'att-1',
  attemptNumber: 1,
  startedAt: '2026-10-14T10:01:00.000Z',
  idempotencyKey: 'idem-1',
};
const withRun = (run: unknown) => ({ ...legacy, organizationRun: run });

describe('InternalAgentTurnRequestSchema organizationRun', () => {
  it('accepts a legacy body unchanged', () => {
    const parsed = InternalAgentTurnRequestSchema.parse(legacy);
    expect(parsed).toEqual(legacy);
    expect('organizationRun' in parsed).toBe(false);
  });

  it('accepts a coherent context and attempt', () => {
    const parsed = InternalAgentTurnRequestSchema.parse(withRun({ context, attempt }));
    expect(parsed.organizationRun?.attempt.attemptNumber).toBe(1);
    expect(parsed.organizationRun?.context.organizationId).toBe('org-1');
  });

  it('rejects a mismatching runId on organizationRun.attempt.runId', () => {
    const r = InternalAgentTurnRequestSchema.safeParse(
      withRun({ context, attempt: { ...attempt, runId: 'run-2' } }),
    );
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.map((i) => i.path.join('.'))).toContain('organizationRun.attempt.runId');
    }
  });

  it('rejects an extra key inside organizationRun', () => {
    expect(
      InternalAgentTurnRequestSchema.safeParse(withRun({ context, attempt, extra: true })).success,
    ).toBe(false);
  });

  it('rejects a context without organizationId', () => {
    const { organizationId: _omit, ...noOrg } = context;
    expect(
      InternalAgentTurnRequestSchema.safeParse(withRun({ context: noOrg, attempt })).success,
    ).toBe(false);
  });

  it('rejects an attempt with attemptNumber 0', () => {
    expect(
      InternalAgentTurnRequestSchema.safeParse(
        withRun({ context, attempt: { ...attempt, attemptNumber: 0 } }),
      ).success,
    ).toBe(false);
  });

  it('mutation: without the runId check a discordant run would pass', () => {
    const unchecked = z.strictObject({
      context: OrganizationRunContextSchema,
      attempt: RunAttemptSchema,
    });
    const discordant = { context, attempt: { ...attempt, runId: 'run-2' } };
    expect(unchecked.safeParse(discordant).success).toBe(true);
    expect(InternalAgentTurnOrganizationRunSchema.safeParse(discordant).success).toBe(false);
  });

  it('mutation: a required organizationRun would reject the legacy body', () => {
    const required = InternalAgentTurnRequestSchema.extend({
      organizationRun: InternalAgentTurnOrganizationRunSchema,
    });
    expect(required.safeParse(legacy).success).toBe(false);
    expect(InternalAgentTurnRequestSchema.safeParse(legacy).success).toBe(true);
  });
});

const outcomeBase = {
  runId: 'run-1',
  attemptId: 'att-1',
  evidence: [],
  consumption: [],
  recordedAt: '2026-10-14T10:02:00.000Z',
};
const okTurn = { ok: true as const, reply: 'fatto', updatedHistory: [] };

describe('organization run response and refusals', () => {
  it('conserva outcome in una risposta riuscita', () => {
    const parsed = InternalAgentTurnResponseSchema.parse({
      ...okTurn,
      outcome: { ...outcomeBase, status: 'succeeded' },
    });
    expect(parsed.outcome?.status).toBe('succeeded');
  });

  it('conserva duplicate: true', () => {
    const parsed = InternalAgentTurnResponseSchema.parse({
      ...okTurn,
      duplicate: true,
      outcome: { ...outcomeBase, status: 'succeeded' },
    });
    expect(parsed.duplicate).toBe(true);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...okTurn, duplicate: false }).success).toBe(false);
  });

  it('conserva un run_uncertain con motivo timeout', () => {
    const parsed = InternalAgentTurnRunErrorResponseSchema.parse({
      ok: false,
      error: 'run_uncertain',
      outcome: { ...outcomeBase, status: 'uncertain', reason: 'timeout' },
    });
    expect(parsed.outcome).toMatchObject({ status: 'uncertain', reason: 'timeout' });
    expect(INTERNAL_AGENT_TURN_RUN_ERRORS).toContain(parsed.error);
  });

  it('rifiuta un outcome con stato sconosciuto', () => {
    const bad = { ...outcomeBase, status: 'maybe' };
    expect(InternalAgentTurnResponseSchema.safeParse({ ...okTurn, outcome: bad }).success).toBe(false);
    expect(
      InternalAgentTurnRunErrorResponseSchema.safeParse({ ok: false, error: 'run_failed', outcome: bad }).success,
    ).toBe(false);
  });

  it('accetta una risposta legacy senza outcome', () => {
    const parsed = InternalAgentTurnResponseSchema.parse(okTurn);
    expect('outcome' in parsed).toBe(false);
    expect(InternalAgentTurnRunErrorResponseSchema.safeParse({ ok: false, error: 'boom' }).success).toBe(true);
  });

  it('riconosce ogni codice di rifiuto e non uno inventato', () => {
    expect(ORGANIZATION_ADMISSION_REFUSAL_CODES).toHaveLength(14);
    for (const code of ORGANIZATION_ADMISSION_REFUSAL_CODES) {
      expect(OrganizationAdmissionRefusalCodeSchema.safeParse(code).success).toBe(true);
    }
    expect(OrganizationAdmissionRefusalCodeSchema.safeParse('made_up').success).toBe(false);
  });

  it('conserva il codice e il messaggio del rifiuto', () => {
    const parsed = InternalAgentTurnRunErrorResponseSchema.parse({
      ok: false,
      error: 'tenant_mismatch',
      message: 'tenant diverso',
      code: 'x',
    });
    expect(parsed.message).toBe('tenant diverso');
    expect(parsed.code).toBe('x');
  });
});
