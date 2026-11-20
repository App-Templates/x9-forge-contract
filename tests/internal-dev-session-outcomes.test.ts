import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_OUTCOMES_PATH,
  DevSessionOutcomesRequestSchema,
  DevSessionOutcomesResponseSchema,
  devSessionOutcomesContract,
} from '../src/http/endpoints/internal-dev-session-outcomes.js';
import { deriveBusinessUnitStateSummary } from '../src/organization/business-unit-state.js';

const design = { tenantId: '1', organizationId: 'good-choice', projectId: 'orto-facile', buSlug: 'orto-design' };
const web = { ...design, buSlug: 'orto-web' };
const request = {
  scope: { tenantId: '1', ownerId: '1', agentId: 'agent-capo-orto-design' },
  organizationId: design.organizationId,
  departments: [{ projectId: design.projectId, buSlug: design.buSlug }],
};
// Outcome shapes as the executor writes them today (version 1, disposition only when not delivered).
const r21 = {
  version: 1 as const, sessionId: 'R21', attempt: 1, state: 'waiting_materials' as const,
  reason: { code: 'materials_requested' as const, text: 'materiali richiesti al referente' },
  missingMaterials: [{ ref: 'https://github.com/good-choice/orto-facile/tree/consegna/20', error: 'riferimento non trovato' }],
  disposition: { nature: 'missing_data' as const, retry: 'never' as const, nextMove: 'fix_input' as const },
  executorVersion: '0.1.0', createdAt: '2026-11-11T16:00:00+01:00',
};
const r22 = {
  version: 1 as const, sessionId: 'R22', attempt: 1, state: 'delivered' as const,
  reason: { code: 'tests_green' as const, text: 'test verdi' },
  executorVersion: '0.1.0', createdAt: '2026-11-11T18:00:00+01:00',
};
const r23Outcome = { ...r22, sessionId: 'R23' };
const response = {
  sessions: [{ scope: design, outcome: r21 }, { scope: design, outcome: r22 }],
  open: [{ scope: web, sessionId: 'R23', state: 'working' as const }],
  unreadable: 1,
  omitted: 0,
};

describe('internal dev session outcomes contract', () => {
  it('s6564 esiti-del-reparto: the request names departments and the agent scope, never a session', () => {
    expect(devSessionOutcomesContract.method).toBe('POST');
    expect(devSessionOutcomesContract.path).toBe(DEV_SESSION_OUTCOMES_PATH);
    expect(DEV_SESSION_OUTCOMES_PATH).toBe('/internal/dev/session-outcomes');
    expect(devSessionOutcomesContract.authType).toBe('secret');
    expect(DevSessionOutcomesRequestSchema.safeParse(request).success).toBe(true);
    expect(DevSessionOutcomesRequestSchema.safeParse({ ...request, sessionId: 'R22' }).success).toBe(false);
    expect(DevSessionOutcomesRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
    expect(DevSessionOutcomesRequestSchema.safeParse({
      ...request, departments: [{ ...request.departments[0], sessionNumber: 22 }],
    }).success).toBe(false);
    expect(DevSessionOutcomesRequestSchema.safeParse({ ...request, departments: [] }).success).toBe(false);
    const many = Array.from({ length: 21 }, (_, i) => ({ projectId: 'orto-facile', buSlug: `orto-bu-${i}` }));
    expect(DevSessionOutcomesRequestSchema.safeParse({ ...request, departments: many }).success).toBe(false);
    expect(DevSessionOutcomesRequestSchema.safeParse({ ...request, departments: many.slice(0, 20) }).success).toBe(true);
  });

  it('s6564 esiti-del-reparto: outcomes and open sessions arrive paired with the scope of their own assignment', () => {
    const parsed = DevSessionOutcomesResponseSchema.parse(response);
    expect(parsed.unreadable).toBe(1);
    const summary = deriveBusinessUnitStateSummary({
      scope: design, versions: [], decisions: [], leadReviews: [], assets: [], sessionOutcomes: parsed.sessions,
    });
    expect(summary.sessions.map((session) => session.sessionId)).toEqual(['R21', 'R22']);
    const webSummary = deriveBusinessUnitStateSummary({
      scope: web, versions: [], decisions: [], leadReviews: [], assets: [], sessionOutcomes: parsed.sessions,
    });
    expect(webSummary.sessions).toEqual([]);
    expect(DevSessionOutcomesResponseSchema.safeParse({
      ...response, sessions: [{ scope: web, outcome: r23Outcome }], open: [],
    }).success).toBe(true);
  });

  it('s6564 esiti-del-reparto: an invalid outcome rejects the whole answer; stopped states are not open', () => {
    expect(DevSessionOutcomesResponseSchema.safeParse({
      ...response, sessions: [{ scope: design, outcome: { ...r22, state: 'running' } }],
    }).success).toBe(false);
    for (const state of ['blocked', 'delivered', 'failed']) {
      expect(DevSessionOutcomesResponseSchema.safeParse({
        ...response, open: [{ scope: web, sessionId: 'R23', state }],
      }).success).toBe(false);
    }
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, open: [{ scope: web, sessionId: 'R23', state: 'queued' }] }).success).toBe(true);
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, unreadable: -1 }).success).toBe(false);
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, omitted: 1.5 }).success).toBe(false);
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, omitted: 3 }).success).toBe(true);
    const { omitted: _omitted, ...withoutOmitted } = response;
    expect(DevSessionOutcomesResponseSchema.safeParse(withoutOmitted).success).toBe(false);
  });

  it('s6564 esiti-del-reparto: more than 200 outcomes or open sessions are refused, never truncated', () => {
    const entry = { scope: design, outcome: r22 };
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, sessions: Array(200).fill(entry) }).success).toBe(true);
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, sessions: Array(201).fill(entry) }).success).toBe(false);
    const open = { scope: web, sessionId: 'R23', state: 'queued' as const };
    expect(DevSessionOutcomesResponseSchema.safeParse({ ...response, open: Array(201).fill(open) }).success).toBe(false);
  });
});
