"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationOperationSchema = exports.SubmitDeliverableOperationSchema = exports.DeliverableVisibilitySchema = exports.AcknowledgeStopOperationSchema = exports.RequestStopOperationSchema = exports.StopReasonSchema = exports.ReportOutcomeOperationSchema = exports.AssignWorkOperationSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const run_context_js_1 = require("./run-context.cjs");
/** Assign a unit of work to an agent. `instructionRef` is a reference, never the private text. */
exports.AssignWorkOperationSchema = zod_1.z.strictObject({
    operation: zod_1.z.literal('assign_work'),
    context: run_context_js_1.OrganizationRunContextSchema,
    assigneeAgentId: agent_identity_js_1.AgentIdSchema,
    title: zod_1.z.string().min(1).max(200),
    instructionRef: zod_1.z.string().min(1),
});
/** Report the outcome of an attempt, by reference. */
exports.ReportOutcomeOperationSchema = zod_1.z.strictObject({
    operation: zod_1.z.literal('report_outcome'),
    context: run_context_js_1.OrganizationRunContextSchema,
    attemptId: zod_1.z.string().min(1),
    outcomeRef: zod_1.z.string().min(1),
});
exports.StopReasonSchema = zod_1.z.enum(['owner', 'budget', 'policy', 'error']);
exports.RequestStopOperationSchema = zod_1.z.strictObject({
    operation: zod_1.z.literal('request_stop'),
    context: run_context_js_1.OrganizationRunContextSchema,
    reason: exports.StopReasonSchema,
});
exports.AcknowledgeStopOperationSchema = zod_1.z.strictObject({
    operation: zod_1.z.literal('acknowledge_stop'),
    context: run_context_js_1.OrganizationRunContextSchema,
    stoppedAt: zod_1.z.iso.datetime(),
});
/** `team` = explicit sharing; `private` stays with the owner. */
exports.DeliverableVisibilitySchema = zod_1.z.enum(['private', 'team']);
exports.SubmitDeliverableOperationSchema = zod_1.z.strictObject({
    operation: zod_1.z.literal('submit_deliverable'),
    context: run_context_js_1.OrganizationRunContextSchema,
    deliverableRef: zod_1.z.string().min(1),
    visibility: exports.DeliverableVisibilitySchema,
});
/** The only operations an organization participant may request. */
exports.OrganizationOperationSchema = zod_1.z.discriminatedUnion('operation', [
    exports.AssignWorkOperationSchema,
    exports.ReportOutcomeOperationSchema,
    exports.RequestStopOperationSchema,
    exports.AcknowledgeStopOperationSchema,
    exports.SubmitDeliverableOperationSchema,
]);
//# sourceMappingURL=operations.js.map