"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryMandateObservationEventWriteContract = exports.internalMemoryMandateObservationReadContract = exports.MandateObservationErrorResponseSchema = exports.MandateObservationErrorCodeSchema = exports.InternalMemoryMandateObservationEventWriteResponseSchema = exports.InternalMemoryMandateObservationReadResponseSchema = exports.InternalMemoryMandateObservationEventWriteRequestSchema = exports.InternalMemoryMandateObservationQuerySchema = exports.InternalMemoryMandateObservationParamsSchema = exports.INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH = exports.INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const business_unit_mandate_js_1 = require("../../organization/business-unit-mandate.cjs");
exports.INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH = '/internal/memory/mandate-observations/:observationId';
exports.INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH = '/internal/memory/mandate-observations/:observationId/events';
exports.InternalMemoryMandateObservationParamsSchema = zod_1.z.strictObject({
    observationId: business_unit_mandate_js_1.MandateAttemptObservationIdSchema,
});
exports.InternalMemoryMandateObservationQuerySchema = zod_1.z.strictObject({
    tenantId: business_unit_mandate_js_1.MandateAttemptScopeSchema.shape.tenantId,
    clientId: business_unit_mandate_js_1.MandateAttemptScopeSchema.shape.clientId,
    agentId: agent_identity_js_1.AgentIdSchema,
});
exports.InternalMemoryMandateObservationEventWriteRequestSchema = zod_1.z.strictObject({
    scope: business_unit_mandate_js_1.MandateAttemptScopeSchema,
    event: business_unit_mandate_js_1.MandateAttemptEventSchema,
});
exports.InternalMemoryMandateObservationReadResponseSchema = zod_1.z.strictObject({
    observation: business_unit_mandate_js_1.MandateAttemptObservationSchema,
});
exports.InternalMemoryMandateObservationEventWriteResponseSchema = zod_1.z.strictObject({
    observation: business_unit_mandate_js_1.MandateAttemptObservationSchema,
    replayed: zod_1.z.boolean(),
});
exports.MandateObservationErrorCodeSchema = zod_1.z.enum([
    'mandate_observation_conflict',
    'mandate_observation_not_found',
    'mandate_observation_out_of_order',
]);
exports.MandateObservationErrorResponseSchema = zod_1.z.strictObject({
    code: exports.MandateObservationErrorCodeSchema,
    message: zod_1.z.string().min(1),
});
/**
 * Read: 200 with the observation; 404 mandate_observation_not_found for a missing
 * observation or a different tenant/client/agent. The service must validate the
 * authenticated scope before returning data; query parameters authorize nobody.
 */
exports.internalMemoryMandateObservationReadContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalMemoryMandateObservationParamsSchema,
    querySchema: exports.InternalMemoryMandateObservationQuerySchema,
    responseSchema: exports.InternalMemoryMandateObservationReadResponseSchema,
};
/**
 * Append: 201 for a new event (replayed: false), 200 for the same eventId and
 * identical content (replayed: true); 409 mandate_observation_conflict for
 * different content or scope, 409 mandate_observation_out_of_order for an invalid
 * sequence. A different tenant/client/agent returns 404 mandate_observation_not_found.
 * The service must validate authenticated scope and stored scope before appending.
 */
exports.internalMemoryMandateObservationEventWriteContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalMemoryMandateObservationParamsSchema,
    bodySchema: exports.InternalMemoryMandateObservationEventWriteRequestSchema,
    responseSchema: exports.InternalMemoryMandateObservationEventWriteResponseSchema,
};
//# sourceMappingURL=internal-memory-mandate-observations.js.map