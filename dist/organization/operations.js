import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { OrganizationRunContextSchema } from "./run-context.js";
/** Assign a unit of work to an agent. `instructionRef` is a reference, never the private text. */
export const AssignWorkOperationSchema = z.strictObject({
    operation: z.literal('assign_work'),
    context: OrganizationRunContextSchema,
    assigneeAgentId: AgentIdSchema,
    title: z.string().min(1).max(200),
    instructionRef: z.string().min(1),
});
/** Report the outcome of an attempt, by reference. */
export const ReportOutcomeOperationSchema = z.strictObject({
    operation: z.literal('report_outcome'),
    context: OrganizationRunContextSchema,
    attemptId: z.string().min(1),
    outcomeRef: z.string().min(1),
});
export const StopReasonSchema = z.enum(['owner', 'budget', 'policy', 'error']);
export const RequestStopOperationSchema = z.strictObject({
    operation: z.literal('request_stop'),
    context: OrganizationRunContextSchema,
    reason: StopReasonSchema,
});
export const AcknowledgeStopOperationSchema = z.strictObject({
    operation: z.literal('acknowledge_stop'),
    context: OrganizationRunContextSchema,
    stoppedAt: z.iso.datetime(),
});
/** `team` = explicit sharing; `private` stays with the owner. */
export const DeliverableVisibilitySchema = z.enum(['private', 'team']);
export const SubmitDeliverableOperationSchema = z.strictObject({
    operation: z.literal('submit_deliverable'),
    context: OrganizationRunContextSchema,
    deliverableRef: z.string().min(1),
    visibility: DeliverableVisibilitySchema,
});
/** The only operations an organization participant may request. */
export const OrganizationOperationSchema = z.discriminatedUnion('operation', [
    AssignWorkOperationSchema,
    ReportOutcomeOperationSchema,
    RequestStopOperationSchema,
    AcknowledgeStopOperationSchema,
    SubmitDeliverableOperationSchema,
]);
//# sourceMappingURL=operations.js.map