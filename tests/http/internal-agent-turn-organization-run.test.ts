import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  InternalAgentTurnOrganizationRunSchema,
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
