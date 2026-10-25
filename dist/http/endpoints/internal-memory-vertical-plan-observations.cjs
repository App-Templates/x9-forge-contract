"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryVerticalPlanObservationEventWriteContract = exports.internalMemoryVerticalPlanObservationReadContract = exports.VerticalPlanObservationErrorResponseSchema = exports.VerticalPlanObservationErrorCodeSchema = exports.InternalMemoryVerticalPlanObservationEventWriteResponseSchema = exports.InternalMemoryVerticalPlanObservationReadResponseSchema = exports.InternalMemoryVerticalPlanObservationEventWriteRequestSchema = exports.InternalMemoryVerticalPlanObservationQuerySchema = exports.InternalMemoryVerticalPlanObservationParamsSchema = exports.INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH = exports.INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const business_unit_mandate_js_1 = require("../../organization/business-unit-mandate.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const vertical_plan_observation_js_1 = require("../../organization/vertical-plan-observation.cjs");
exports.INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH = '/internal/memory/vertical-plan-observations/:observationId';
exports.INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH = '/internal/memory/vertical-plan-observations/:observationId/events';
exports.InternalMemoryVerticalPlanObservationParamsSchema = zod_1.z.strictObject({
    observationId: business_unit_mandate_js_1.MandateAttemptObservationIdSchema,
});
exports.InternalMemoryVerticalPlanObservationQuerySchema = zod_1.z.strictObject({
    tenantId: business_unit_mandate_js_1.MandateAttemptScopeSchema.shape.tenantId,
    clientId: business_unit_mandate_js_1.MandateAttemptScopeSchema.shape.clientId,
    agentId: agent_identity_js_1.AgentIdSchema,
});
exports.InternalMemoryVerticalPlanObservationEventWriteRequestSchema = zod_1.z.strictObject({
    scope: business_unit_mandate_js_1.MandateAttemptScopeSchema,
    subject: decision_request_js_1.DecisionSubjectSchema,
    event: vertical_plan_observation_js_1.VerticalPlanAttemptEventSchema,
}).superRefine((value, ctx) => {
    if (value.subject.kind !== 'vertical_plan') {
        ctx.addIssue({ code: 'custom', message: 'The subject must be a vertical plan', path: ['subject', 'kind'] });
    }
    if (value.event.kind === 'sent' && !(0, vertical_plan_observation_js_1.verticalPlanMatchesAttempt)(value.scope, value.subject, value.event.plan)) {
        ctx.addIssue({
            code: 'custom',
            message: 'The sent plan must match the attempt subject and scope',
            path: ['event', 'plan'],
        });
    }
});
exports.InternalMemoryVerticalPlanObservationReadResponseSchema = zod_1.z.strictObject({
    observation: vertical_plan_observation_js_1.VerticalPlanAttemptObservationSchema,
});
exports.InternalMemoryVerticalPlanObservationEventWriteResponseSchema = zod_1.z.strictObject({
    observation: vertical_plan_observation_js_1.VerticalPlanAttemptObservationSchema,
    replayed: zod_1.z.boolean(),
});
exports.VerticalPlanObservationErrorCodeSchema = zod_1.z.enum([
    'vertical_plan_observation_conflict',
    'vertical_plan_observation_not_found',
    'vertical_plan_observation_out_of_order',
    'vertical_plan_observation_version_mismatch',
]);
exports.VerticalPlanObservationErrorResponseSchema = zod_1.z.strictObject({
    code: exports.VerticalPlanObservationErrorCodeSchema,
    message: zod_1.z.string().min(1),
});
/**
 * Read: 200 with the observation; 404 vertical_plan_observation_not_found for a
 * missing observation or a different tenant/client/agent. The service must validate
 * authenticated scope before returning data; query parameters authorize nobody.
 */
exports.internalMemoryVerticalPlanObservationReadContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalMemoryVerticalPlanObservationParamsSchema,
    querySchema: exports.InternalMemoryVerticalPlanObservationQuerySchema,
    responseSchema: exports.InternalMemoryVerticalPlanObservationReadResponseSchema,
};
/**
 * Append: 201 for a new event (replayed: false), 200 for the same eventId and
 * identical content (replayed: true); 409 vertical_plan_observation_conflict for
 * different content or scope, 409 vertical_plan_observation_out_of_order for an
 * invalid sequence, 409 vertical_plan_observation_version_mismatch for a subject
 * different from the stored subject. A different tenant/client/agent returns
 * 404 vertical_plan_observation_not_found. The service must validate authenticated
 * scope and stored scope before appending.
 */
exports.internalMemoryVerticalPlanObservationEventWriteContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalMemoryVerticalPlanObservationParamsSchema,
    bodySchema: exports.InternalMemoryVerticalPlanObservationEventWriteRequestSchema,
    responseSchema: exports.InternalMemoryVerticalPlanObservationEventWriteResponseSchema,
};
//# sourceMappingURL=internal-memory-vertical-plan-observations.js.map