import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH,
  INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH,
  InternalMemoryVerticalPlanObservationParamsSchema,
  InternalMemoryVerticalPlanObservationQuerySchema,
  InternalMemoryVerticalPlanObservationEventWriteRequestSchema,
  InternalMemoryVerticalPlanObservationReadResponseSchema,
  InternalMemoryVerticalPlanObservationEventWriteResponseSchema,
  VerticalPlanObservationErrorCodeSchema,
  VerticalPlanObservationErrorResponseSchema,
  internalMemoryVerticalPlanObservationReadContract,
  internalMemoryVerticalPlanObservationEventWriteContract,
} from '../src/http/endpoints/index.js';
import { VerticalPlanAttemptEventSchema } from '../src/organization/vertical-plan-observation.js';
import {
  VERTICAL_PLAN_ATTACHMENT_ROLES,
  VerticalPlanSchema,
  verticalPlanDecisionSubject,
} from '../src/organization/vertical-plan.js';

const scope = {
  tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'company-1',
  projectId: 'project-1', buSlug: 'sales',
  agent: { managementAgentId: 'lead-1', runtimeAgentId: 'runtime-1', vaultAgentId: 1 },
};
const plan = (projectId = scope.projectId) => ({
  planId: 'plan-0001', version: 1, digest: 'b'.repeat(64),
  tenantId: scope.tenantId, organizationId: scope.organizationId,
  clientId: scope.clientId, projectId, buSlug: scope.buSlug,
  actionPlan: { planId: 'action-0001', version: 2 },
  analysis: 'Start with existing clients.',
  milestones: [{ number: 1, expectedGoal: 'First ten contacts', dueDate: '2026-11-01', blockedBy: [] }],
  blockers: [], questions: [],
  attachments: VERTICAL_PLAN_ATTACHMENT_ROLES.map((role) => ({
    role,
    asset: {
      assetId: `asset-${role}`, sha256: 'a'.repeat(64), name: `${role}.pdf`,
      mediaType: 'application/pdf', sizeBytes: 10,
      origin: { kind: 'session', sessionId: 'session-1' },
      tenantId: scope.tenantId, companyId: scope.clientId, projectId,
      createdAt: '2026-10-25T10:00:00+01:00',
    },
  })),
});
const subject = verticalPlanDecisionSubject(VerticalPlanSchema.parse(plan()));
const sent = {
  kind: 'sent', eventId: 'event-sent-1', at: '2026-10-25T10:00:00+01:00',
  requestId: 'request-0001', plan: plan(),
  referent: { personRef: 'stefano', entryVersion: 2 }, to: 'stefano@example.com',
  thread: { mailboxId: 'mailbox-1', providerThreadId: 'thread-1' }, providerMessageId: 'message-1',
};
const body = { scope, subject, event: sent };
const observation = { observationId: 'attempt-001', scope, subject, events: [sent] };
const query = { tenantId: scope.tenantId, clientId: scope.clientId, agentId: 'runtime-1' };

describe('vertical plan observation contracts', () => {
  it('exposes exact paths, methods, secret authentication and schemas', () => {
    expect(INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH)
      .toBe('/internal/memory/vertical-plan-observations/:observationId');
    expect(INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH)
      .toBe('/internal/memory/vertical-plan-observations/:observationId/events');
    expect(internalMemoryVerticalPlanObservationReadContract).toEqual({
      method: 'GET', path: INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH, authType: 'secret',
      paramsSchema: InternalMemoryVerticalPlanObservationParamsSchema,
      querySchema: InternalMemoryVerticalPlanObservationQuerySchema,
      responseSchema: InternalMemoryVerticalPlanObservationReadResponseSchema,
    });
    expect(internalMemoryVerticalPlanObservationEventWriteContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH, authType: 'secret',
      paramsSchema: InternalMemoryVerticalPlanObservationParamsSchema,
      bodySchema: InternalMemoryVerticalPlanObservationEventWriteRequestSchema,
      responseSchema: InternalMemoryVerticalPlanObservationEventWriteResponseSchema,
    });
    expect(InternalMemoryVerticalPlanObservationParamsSchema.safeParse({ observationId: 'attempt-001' }).success).toBe(true);
    expect(InternalMemoryVerticalPlanObservationParamsSchema.safeParse({ observationId: '' }).success).toBe(false);
  });

  it('requires a complete strict tenant client and agent query', () => {
    expect(InternalMemoryVerticalPlanObservationQuerySchema.safeParse(query).success).toBe(true);
    for (const change of [{ tenantId: undefined }, { clientId: undefined }, { agentId: undefined }, { extra: true }]) {
      expect(InternalMemoryVerticalPlanObservationQuerySchema.safeParse({ ...query, ...change }).success).toBe(false);
    }
  });

  it('accepts a valid body and rejects extra fields', () => {
    expect(InternalMemoryVerticalPlanObservationEventWriteRequestSchema.safeParse(body).success).toBe(true);
    expect(InternalMemoryVerticalPlanObservationEventWriteRequestSchema.safeParse({ ...body, extra: true }).success).toBe(false);
  });

  it('rejects a sent plan from another version or project at event.plan', () => {
    for (const otherPlan of [{ ...plan(), version: 2 }, plan('project-2')]) {
      const event = { ...sent, plan: otherPlan };
      // Each event is valid alone: only the request correlation must reject it.
      expect(VerticalPlanAttemptEventSchema.safeParse(event).success).toBe(true);
      const result = InternalMemoryVerticalPlanObservationEventWriteRequestSchema.safeParse({ ...body, event });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.path)).toContainEqual(['event', 'plan']);
      }
    }
  });

  it('rejects a confirmation subject independently of sent plan correlation', () => {
    const event = {
      kind: 'send_failed', eventId: sent.eventId, at: sent.at, requestId: sent.requestId,
      referent: sent.referent, to: sent.to, error: 'Provider rejected the message',
    };
    expect(InternalMemoryVerticalPlanObservationEventWriteRequestSchema.safeParse({ ...body, event }).success).toBe(true);
    const result = InternalMemoryVerticalPlanObservationEventWriteRequestSchema.safeParse({
      ...body, event, subject: { ...subject, kind: 'confirmation' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path)).toContainEqual(['subject', 'kind']);
    }
  });

  it('requires replayed in write responses and validates read observations', () => {
    expect(InternalMemoryVerticalPlanObservationReadResponseSchema.safeParse({ observation }).success).toBe(true);
    for (const replayed of [false, true]) {
      expect(InternalMemoryVerticalPlanObservationEventWriteResponseSchema.safeParse({ observation, replayed }).success).toBe(true);
    }
    expect(InternalMemoryVerticalPlanObservationEventWriteResponseSchema.safeParse({ observation }).success).toBe(false);
    expect(InternalMemoryVerticalPlanObservationReadResponseSchema.safeParse({}).success).toBe(false);
  });

  it('accepts only the four observation error codes and a nonempty message', () => {
    const codes = [
      'vertical_plan_observation_conflict', 'vertical_plan_observation_not_found',
      'vertical_plan_observation_out_of_order', 'vertical_plan_observation_version_mismatch',
    ];
    expect(VerticalPlanObservationErrorCodeSchema.options).toEqual(codes);
    for (const code of codes) {
      expect(VerticalPlanObservationErrorResponseSchema.safeParse({ code, message: 'Observation rejected' }).success).toBe(true);
    }
    expect(VerticalPlanObservationErrorCodeSchema.safeParse('unknown_error').success).toBe(false);
    expect(VerticalPlanObservationErrorResponseSchema.safeParse({ code: 'unknown_error', message: 'Rejected' }).success).toBe(false);
    expect(VerticalPlanObservationErrorResponseSchema.safeParse({ code: codes[0], message: '' }).success).toBe(false);
  });
});
