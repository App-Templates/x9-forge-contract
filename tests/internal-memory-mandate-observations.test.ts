import { describe, expect, it } from 'vitest';
import {
  CompanyMapHistoryQuerySchema,
  CompanyMapHistoryResponseSchema,
  INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH,
  INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH,
  INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH,
  InternalMemoryMandateObservationParamsSchema,
  InternalMemoryMandateObservationQuerySchema,
  InternalMemoryMandateObservationEventWriteRequestSchema,
  InternalMemoryMandateObservationReadResponseSchema,
  InternalMemoryMandateObservationEventWriteResponseSchema,
  MandateObservationErrorResponseSchema,
  internalMemoryCompanyMapHistoryContract,
  internalMemoryMandateObservationReadContract,
  internalMemoryMandateObservationEventWriteContract,
} from '../src/http/endpoints/index.js';
import {
  MANDATE_ATTEMPT_EVENT_KINDS,
  MandateAttemptObservationIdSchema,
  MandateAttemptScopeSchema,
  MandateAttemptEventSchema,
  MandateAttemptObservationSchema,
} from '../src/organization/business-unit-mandate.js';

const scope = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  clientId: 'client-1',
  projectId: 'project-1',
  buSlug: 'sales',
  agent: { managementAgentId: 'lead-1', runtimeAgentId: 'runtime-1', vaultAgentId: 1 },
};
const at = '2026-10-25T10:00:00+01:00';
const referent = { personRef: 'stefano', entryVersion: 2 };
const question = {
  kind: 'question_opened', eventId: 'event_question', at,
  requestId: 'request_001', referent, to: 'stefano@example.com',
};
const sent = {
  kind: 'email_sent', eventId: 'event_sent', at,
  requestId: question.requestId, to: question.to, providerMessageId: 'provider-message-1',
};
const failed = {
  kind: 'email_failed', eventId: 'event_failed', at,
  requestId: question.requestId, to: question.to, error: 'Provider rejected the message',
};
const blocked = { kind: 'blocked', eventId: 'event_blocked', at, reason: 'conflict' };
const issue = { kind: 'issue_opened', eventId: 'event_issue', at, issueRef: 'issue-1' };
const mandate = {
  tenantId: scope.tenantId,
  organizationId: scope.organizationId,
  clientId: scope.clientId,
  projectId: scope.projectId,
  planSection: {
    planId: 'plan_001', planVersion: 2, planDigest: 'a'.repeat(64),
    businessUnit: {
      buSlug: scope.buSlug, typeId: 'marketing', mandate: 'Acquire the first client.',
      competencies: ['outreach'], lead: { role: 'capo-bu' }, executor: 'agent', referent,
      firstActivities: ['Prepare the prospect list'], start: { kind: 'now' },
    },
  },
  decision: { requestId: 'decision_001', planVersion: 2 },
  referent, notebookPages: [], reconciliation: { outcome: 'agrees' }, reconciledAt: at,
};
const reconciled = { kind: 'reconciled', eventId: 'event_reconciled', at, mandate };
const observation = (events: unknown[]) => ({ observationId: 'attempt_001', scope, events });

const historyQuery = {
  tenantId: scope.tenantId, organizationId: scope.organizationId, clientId: scope.clientId,
  level: 'client', kind: 'referent', entryRef: 'stefano',
};
const entry = (version: number) => ({
  tenantId: scope.tenantId, organizationId: scope.organizationId, clientId: scope.clientId,
  level: 'client', kind: 'referent', personRef: 'stefano', name: 'Stefano', role: 'Owner',
  email: question.to, source: { kind: 'seed' }, confirmedAt: at, version, digest: 'b'.repeat(64),
});

describe('mandate observation and company map history contracts', () => {
  it('exposes exact paths, methods, authentication and schemas', () => {
    expect(INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH).toBe('/internal/memory/company-map/history');
    expect(INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH).toBe('/internal/memory/mandate-observations/:observationId');
    expect(INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH).toBe('/internal/memory/mandate-observations/:observationId/events');
    expect(internalMemoryCompanyMapHistoryContract).toEqual({
      method: 'GET', path: INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH, authType: 'secret',
      querySchema: CompanyMapHistoryQuerySchema, responseSchema: CompanyMapHistoryResponseSchema,
    });
    expect(internalMemoryMandateObservationReadContract).toEqual({
      method: 'GET', path: INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH, authType: 'secret',
      paramsSchema: InternalMemoryMandateObservationParamsSchema,
      querySchema: InternalMemoryMandateObservationQuerySchema,
      responseSchema: InternalMemoryMandateObservationReadResponseSchema,
    });
    expect(internalMemoryMandateObservationEventWriteContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH, authType: 'secret',
      paramsSchema: InternalMemoryMandateObservationParamsSchema,
      bodySchema: InternalMemoryMandateObservationEventWriteRequestSchema,
      responseSchema: InternalMemoryMandateObservationEventWriteResponseSchema,
    });
  });

  it('requires a complete history key and a coherent level scope', () => {
    expect(CompanyMapHistoryQuerySchema.parse({ ...historyQuery, after: '1', limit: '50' }))
      .toEqual({ ...historyQuery, after: 1, limit: 50 });
    for (const kind of ['referent', 'person', 'responsibility', 'access', 'asset']) {
      expect(CompanyMapHistoryQuerySchema.safeParse({ ...historyQuery, kind }).success).toBe(true);
    }
    for (const change of [
      { kind: undefined }, { entryRef: undefined }, { entryRef: '' }, { entryRef: 'x'.repeat(65) },
      { level: 'project' }, { level: 'business_unit', projectId: 'project-1' },
      { projectId: 'project-1' }, { buSlug: 'sales' }, { extra: true },
      { limit: 51 }, { limit: 0 }, { limit: 1.5 }, { after: 0 }, { after: 1.5 },
    ]) {
      expect(CompanyMapHistoryQuerySchema.safeParse({ ...historyQuery, ...change }).success).toBe(false);
    }
    expect(CompanyMapHistoryQuerySchema.safeParse({
      ...historyQuery, level: 'business_unit', projectId: 'project-1', buSlug: 'sales',
    }).success).toBe(true);
  });

  it('validates increasing history versions and continuation cursors', () => {
    const page = { versions: [entry(1), entry(2)], currentVersion: 3, nextAfter: 2 };
    expect(CompanyMapHistoryResponseSchema.safeParse(page).success).toBe(true);
    expect(CompanyMapHistoryResponseSchema.safeParse({ ...page, currentVersion: 2, nextAfter: null }).success).toBe(true);
    expect(CompanyMapHistoryResponseSchema.safeParse({ versions: [], currentVersion: 3, nextAfter: null }).success).toBe(true);
    for (const change of [
      { versions: [entry(2), entry(1)], nextAfter: 1 },
      { versions: [entry(1), entry(1)], nextAfter: 1 },
      { versions: [entry(4)], nextAfter: null },
      { nextAfter: 1 }, { nextAfter: 3 }, { nextAfter: null },
      { versions: [], nextAfter: 1 }, { currentVersion: 2 },
    ]) {
      expect(CompanyMapHistoryResponseSchema.safeParse({ ...page, ...change }).success).toBe(false);
    }
    const versions = Array.from({ length: 50 }, (_, index) => entry(index + 1));
    expect(CompanyMapHistoryResponseSchema.safeParse({ versions, currentVersion: 51, nextAfter: 50 }).success).toBe(true);
    expect(CompanyMapHistoryResponseSchema.safeParse({
      versions: [...versions, entry(51)], currentVersion: 51, nextAfter: null,
    }).success).toBe(false);
  });

  it('validates scoped mandate event sequences', () => {
    expect(MandateAttemptObservationSchema.safeParse(observation([reconciled, question, failed, sent, issue])).success).toBe(true);
    expect(MandateAttemptObservationSchema.safeParse(observation([reconciled, blocked, question, sent])).success).toBe(true);
    for (const event of [sent, failed]) {
      for (const events of [
        [event], [event, question], [question, { ...event, to: 'other@example.com' }],
        [question, { ...event, requestId: 'request_002' }],
      ]) {
        expect(MandateAttemptObservationSchema.safeParse(observation(events)).success).toBe(false);
      }
    }
    expect(MandateAttemptObservationSchema.safeParse(observation([question, { ...sent, eventId: question.eventId }])).success).toBe(false);
    expect(MandateAttemptObservationSchema.safeParse(observation([blocked, issue])).success).toBe(false);
    expect(MandateAttemptObservationSchema.safeParse(observation([issue, blocked])).success).toBe(false);
  });

  it('requires the complete agent identity and strict scope fields', () => {
    expect(MandateAttemptScopeSchema.safeParse(scope).success).toBe(true);
    for (const change of [
      { agent: undefined }, { agent: { managementAgentId: 'lead-1', runtimeAgentId: 'runtime-1' } },
      { agent: { ...scope.agent, runtimeAgentId: '' } }, { agent: { ...scope.agent, vaultAgentId: 0 } },
      { tenantId: '' }, { organizationId: '' }, { clientId: '' }, { projectId: '' },
      { buSlug: undefined }, { buSlug: 'Invalid Slug' }, { extra: true },
    ]) {
      expect(MandateAttemptScopeSchema.safeParse({ ...scope, ...change }).success).toBe(false);
    }
  });

  it('validates every event kind and rejects extra fields and invalid payloads', () => {
    const events = [reconciled, blocked, question, sent, failed, issue];
    expect(events.map((event) => event.kind)).toEqual([...MANDATE_ATTEMPT_EVENT_KINDS]);
    for (const event of events) {
      expect(MandateAttemptEventSchema.safeParse(event).success).toBe(true);
      expect(MandateAttemptEventSchema.safeParse({ ...event, extra: true }).success).toBe(false);
      expect(MandateAttemptEventSchema.safeParse({ ...event, eventId: 'short' }).success).toBe(false);
      expect(MandateAttemptEventSchema.safeParse({ ...event, at: '2026-10-25T10:00:00' }).success).toBe(false);
    }
    for (const event of [
      { ...blocked, reason: 'other' }, { ...question, referent: { personRef: 'stefano' } },
      { ...sent, providerMessageId: '' }, { ...sent, providerMessageId: 'x'.repeat(513) },
      { ...failed, error: '' }, { ...failed, error: 'x'.repeat(501) },
      { ...issue, issueRef: '' }, { ...issue, issueRef: 'x'.repeat(201) },
      { ...question, to: 'invalid' }, { ...question, requestId: 'short' },
      { ...reconciled, mandate: { ...mandate, decision: { requestId: 'decision_001', planVersion: 3 } } },
    ]) {
      expect(MandateAttemptEventSchema.safeParse(event).success).toBe(false);
    }
  });

  it('bounds identifiers and observation event counts', () => {
    for (const id of ['short', 'x'.repeat(65), 'invalid.id']) {
      expect(MandateAttemptObservationIdSchema.safeParse(id).success).toBe(false);
    }
    for (const id of ['id_001', 'x'.repeat(64)]) {
      expect(MandateAttemptObservationIdSchema.safeParse(id).success).toBe(true);
    }
    for (const [count, valid] of [[0, false], [1, true], [50, true], [51, false]] as const) {
      const events = Array.from({ length: count }, (_, index) => ({ ...issue, eventId: `event_${index}` }));
      expect(MandateAttemptObservationSchema.safeParse(observation(events)).success).toBe(valid);
    }
  });

  it('validates scoped HTTP requests, replay receipts and errors', () => {
    const value = observation([question, sent]);
    const query = { tenantId: scope.tenantId, clientId: scope.clientId, agentId: scope.agent.managementAgentId };
    expect(InternalMemoryMandateObservationParamsSchema.safeParse({ observationId: value.observationId }).success).toBe(true);
    expect(InternalMemoryMandateObservationQuerySchema.safeParse(query).success).toBe(true);
    for (const field of ['tenantId', 'clientId', 'agentId']) {
      expect(InternalMemoryMandateObservationQuerySchema.safeParse({ ...query, [field]: undefined }).success).toBe(false);
    }
    expect(InternalMemoryMandateObservationQuerySchema.safeParse({ ...query, extra: true }).success).toBe(false);
    expect(InternalMemoryMandateObservationEventWriteRequestSchema.safeParse({ scope, event: sent }).success).toBe(true);
    expect(InternalMemoryMandateObservationEventWriteRequestSchema.safeParse({ scope, event: sent, extra: true }).success).toBe(false);
    expect(InternalMemoryMandateObservationReadResponseSchema.safeParse({ observation: value }).success).toBe(true);
    for (const replayed of [false, true]) {
      expect(InternalMemoryMandateObservationEventWriteResponseSchema.safeParse({ observation: value, replayed }).success).toBe(true);
    }
    expect(InternalMemoryMandateObservationEventWriteResponseSchema.safeParse({ observation: value }).success).toBe(false);
    expect(InternalMemoryMandateObservationReadResponseSchema.safeParse({ observation: observation([sent]) }).success).toBe(false);
    for (const code of ['mandate_observation_conflict', 'mandate_observation_not_found', 'mandate_observation_out_of_order']) {
      expect(MandateObservationErrorResponseSchema.safeParse({ code, message: 'Observation rejected' }).success).toBe(true);
    }
    expect(MandateObservationErrorResponseSchema.safeParse({ code: 'unknown', message: 'Rejected' }).success).toBe(false);
  });
});
