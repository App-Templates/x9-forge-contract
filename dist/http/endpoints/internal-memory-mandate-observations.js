import { z } from 'zod';
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { MandateAttemptEventSchema, MandateAttemptObservationIdSchema, MandateAttemptObservationSchema, MandateAttemptScopeSchema, } from "../../organization/business-unit-mandate.js";
export const INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH = '/internal/memory/mandate-observations/:observationId';
export const INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH = '/internal/memory/mandate-observations/:observationId/events';
export const InternalMemoryMandateObservationParamsSchema = z.strictObject({
    observationId: MandateAttemptObservationIdSchema,
});
export const InternalMemoryMandateObservationQuerySchema = z.strictObject({
    tenantId: MandateAttemptScopeSchema.shape.tenantId,
    clientId: MandateAttemptScopeSchema.shape.clientId,
    agentId: AgentIdSchema,
});
export const InternalMemoryMandateObservationEventWriteRequestSchema = z.strictObject({
    scope: MandateAttemptScopeSchema,
    event: MandateAttemptEventSchema,
});
export const InternalMemoryMandateObservationReadResponseSchema = z.strictObject({
    observation: MandateAttemptObservationSchema,
});
export const InternalMemoryMandateObservationEventWriteResponseSchema = z.strictObject({
    observation: MandateAttemptObservationSchema,
    replayed: z.boolean(),
});
export const MandateObservationErrorCodeSchema = z.enum([
    'mandate_observation_conflict',
    'mandate_observation_not_found',
    'mandate_observation_out_of_order',
]);
export const MandateObservationErrorResponseSchema = z.strictObject({
    code: MandateObservationErrorCodeSchema,
    message: z.string().min(1),
});
/**
 * Read: 200 with the observation; 404 mandate_observation_not_found for a missing
 * observation or a different tenant/client/agent. The service must validate the
 * authenticated scope before returning data; query parameters authorize nobody.
 */
export const internalMemoryMandateObservationReadContract = {
    method: 'GET',
    path: INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH,
    authType: 'secret',
    paramsSchema: InternalMemoryMandateObservationParamsSchema,
    querySchema: InternalMemoryMandateObservationQuerySchema,
    responseSchema: InternalMemoryMandateObservationReadResponseSchema,
};
/**
 * Append: 201 for a new event (replayed: false), 200 for the same eventId and
 * identical content (replayed: true); 409 mandate_observation_conflict for
 * different content or scope, 409 mandate_observation_out_of_order for an invalid
 * sequence. A different tenant/client/agent returns 404 mandate_observation_not_found.
 * The service must validate authenticated scope and stored scope before appending.
 */
export const internalMemoryMandateObservationEventWriteContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH,
    authType: 'secret',
    paramsSchema: InternalMemoryMandateObservationParamsSchema,
    bodySchema: InternalMemoryMandateObservationEventWriteRequestSchema,
    responseSchema: InternalMemoryMandateObservationEventWriteResponseSchema,
};
//# sourceMappingURL=internal-memory-mandate-observations.js.map