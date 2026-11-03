import { z } from 'zod';
import { AgentIdSchema } from '../../agent/agent-identity.js';
import {
  MandateAttemptObservationIdSchema,
  MandateAttemptScopeSchema,
} from '../../organization/business-unit-mandate.js';
import { DecisionSubjectSchema } from '../../organization/decision-request.js';
import {
  VerticalPlanAttemptEventSchema,
  VerticalPlanAttemptObservationSchema,
  verticalPlanMatchesAttempt,
} from '../../organization/vertical-plan-observation.js';

export const INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH = '/internal/memory/vertical-plan-observations/:observationId' as const;
export const INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH = '/internal/memory/vertical-plan-observations/:observationId/events' as const;

export const InternalMemoryVerticalPlanObservationParamsSchema = z.strictObject({
  observationId: MandateAttemptObservationIdSchema,
});
export type InternalMemoryVerticalPlanObservationParams = z.infer<typeof InternalMemoryVerticalPlanObservationParamsSchema>;

export const InternalMemoryVerticalPlanObservationQuerySchema = z.strictObject({
  tenantId: MandateAttemptScopeSchema.shape.tenantId,
  clientId: MandateAttemptScopeSchema.shape.clientId,
  agentId: AgentIdSchema,
});
export type InternalMemoryVerticalPlanObservationQuery = z.infer<typeof InternalMemoryVerticalPlanObservationQuerySchema>;

export const InternalMemoryVerticalPlanObservationEventWriteRequestSchema = z.strictObject({
  scope: MandateAttemptScopeSchema,
  subject: DecisionSubjectSchema,
  event: VerticalPlanAttemptEventSchema,
}).superRefine((value, ctx) => {
  if (value.subject.kind !== 'vertical_plan') {
    ctx.addIssue({ code: 'custom', message: 'The subject must be a vertical plan', path: ['subject', 'kind'] });
  }
  if (value.event.kind === 'sent' && !verticalPlanMatchesAttempt(value.scope, value.subject, value.event.plan)) {
    ctx.addIssue({
      code: 'custom',
      message: 'The sent plan must match the attempt subject and scope',
      path: ['event', 'plan'],
    });
  }
});
export type InternalMemoryVerticalPlanObservationEventWriteRequest = z.infer<typeof InternalMemoryVerticalPlanObservationEventWriteRequestSchema>;

export const InternalMemoryVerticalPlanObservationReadResponseSchema = z.strictObject({
  observation: VerticalPlanAttemptObservationSchema,
});
export type InternalMemoryVerticalPlanObservationReadResponse = z.infer<typeof InternalMemoryVerticalPlanObservationReadResponseSchema>;

export const InternalMemoryVerticalPlanObservationEventWriteResponseSchema = z.strictObject({
  observation: VerticalPlanAttemptObservationSchema,
  replayed: z.boolean(),
});
export type InternalMemoryVerticalPlanObservationEventWriteResponse = z.infer<typeof InternalMemoryVerticalPlanObservationEventWriteResponseSchema>;

export const VerticalPlanObservationErrorCodeSchema = z.enum([
  'vertical_plan_observation_conflict',
  'vertical_plan_observation_not_found',
  'vertical_plan_observation_out_of_order',
  'vertical_plan_observation_version_mismatch',
]);
export type VerticalPlanObservationErrorCode = z.infer<typeof VerticalPlanObservationErrorCodeSchema>;

export const VerticalPlanObservationErrorResponseSchema = z.strictObject({
  code: VerticalPlanObservationErrorCodeSchema,
  message: z.string().min(1),
});
export type VerticalPlanObservationErrorResponse = z.infer<typeof VerticalPlanObservationErrorResponseSchema>;

/**
 * Read: 200 with the observation; 404 vertical_plan_observation_not_found for a
 * missing observation or a different tenant/client/agent. The service must validate
 * authenticated scope before returning data; query parameters authorize nobody.
 */
export const internalMemoryVerticalPlanObservationReadContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalMemoryVerticalPlanObservationParamsSchema,
  querySchema: InternalMemoryVerticalPlanObservationQuerySchema,
  responseSchema: InternalMemoryVerticalPlanObservationReadResponseSchema,
} as const;

/**
 * Append: 201 for a new event (replayed: false), 200 for the same eventId and
 * identical content (replayed: true); 409 vertical_plan_observation_conflict for
 * different content or scope, 409 vertical_plan_observation_out_of_order for an
 * invalid sequence, 409 vertical_plan_observation_version_mismatch for a subject
 * different from the stored subject. A different tenant/client/agent returns
 * 404 vertical_plan_observation_not_found. The service must validate authenticated
 * scope and stored scope before appending.
 */
export const internalMemoryVerticalPlanObservationEventWriteContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalMemoryVerticalPlanObservationParamsSchema,
  bodySchema: InternalMemoryVerticalPlanObservationEventWriteRequestSchema,
  responseSchema: InternalMemoryVerticalPlanObservationEventWriteResponseSchema,
} as const;
