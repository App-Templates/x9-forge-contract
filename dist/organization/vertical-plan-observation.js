import { z } from 'zod';
import { ActionPlanReferentRefSchema } from "./action-plan.js";
import { MandateAttemptObservationIdSchema, MandateAttemptScopeSchema } from "./business-unit-mandate.js";
import { DecisionOutcomeSchema, DecisionRequestIdSchema, DecisionSubjectSchema, decisionOutcomeMatchesSubject, } from "./decision-request.js";
import { SharedMailboxThreadSchema } from "./shared-mailbox.js";
import { VerticalPlanSchema, verticalPlanDecisionSubject } from "./vertical-plan.js";
/** Thread reference only: owner and opening live in the thread registry. */
export const VerticalPlanSendThreadSchema = SharedMailboxThreadSchema.pick({
    mailboxId: true,
    providerThreadId: true,
});
export const VERTICAL_PLAN_ATTEMPT_EVENT_KINDS = [
    'sent', 'send_failed', 'reply_received', 'reply_delivered',
];
const attemptEventShape = {
    eventId: MandateAttemptObservationIdSchema,
    at: z.iso.datetime({ offset: true }),
    requestId: DecisionRequestIdSchema,
};
export const VerticalPlanAttemptEventSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[0]),
        plan: VerticalPlanSchema,
        referent: ActionPlanReferentRefSchema,
        to: z.email(),
        thread: VerticalPlanSendThreadSchema,
        providerMessageId: z.string().min(1).max(512),
    }),
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[1]),
        referent: ActionPlanReferentRefSchema,
        to: z.email(),
        error: z.string().min(1).max(500),
    }),
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[2]),
        thread: VerticalPlanSendThreadSchema,
        providerMessageId: z.string().min(1).max(512),
    }),
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[3]),
        outcome: DecisionOutcomeSchema,
    }),
]);
/** True when the sent plan is the exact subject of the attempt and belongs to the attempt scope. */
export function verticalPlanMatchesAttempt(scope, subject, plan) {
    const planSubject = verticalPlanDecisionSubject(plan);
    return planSubject.kind === subject.kind
        && planSubject.planId === subject.planId
        && planSubject.planVersion === subject.planVersion
        && planSubject.digest === subject.digest
        && plan.tenantId === scope.tenantId
        && plan.organizationId === scope.organizationId
        && plan.clientId === scope.clientId
        && plan.projectId === scope.projectId
        && plan.buSlug === scope.buSlug;
}
/** Ordered events of one scoped send attempt; persistence owns event replay detection. */
export const VerticalPlanAttemptObservationSchema = z.strictObject({
    observationId: MandateAttemptObservationIdSchema,
    scope: MandateAttemptScopeSchema,
    subject: DecisionSubjectSchema,
    events: z.array(VerticalPlanAttemptEventSchema).min(1).max(50),
}).superRefine((value, ctx) => {
    if (value.subject.kind !== 'vertical_plan') {
        ctx.addIssue({ code: 'custom', message: 'The subject must be a vertical plan', path: ['subject', 'kind'] });
    }
    const eventIds = new Set();
    const requestId = value.events[0]?.requestId;
    let sentThread;
    let sentCount = 0;
    let replyReceived = false;
    for (const [index, event] of value.events.entries()) {
        if (eventIds.has(event.eventId)) {
            ctx.addIssue({ code: 'custom', message: 'Event IDs must be unique', path: ['events', index, 'eventId'] });
        }
        eventIds.add(event.eventId);
        if (event.requestId !== requestId) {
            ctx.addIssue({
                code: 'custom',
                message: 'Every event must carry the requestId of the first event',
                path: ['events', index, 'requestId'],
            });
        }
        if (event.kind === 'sent') {
            sentCount += 1;
            if (sentCount > 1) {
                ctx.addIssue({ code: 'custom', message: 'An attempt has at most one sent event', path: ['events', index] });
            }
            if (!verticalPlanMatchesAttempt(value.scope, value.subject, event.plan)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'The sent plan must match the attempt subject and scope',
                    path: ['events', index, 'plan'],
                });
            }
            sentThread ??= event.thread;
        }
        if (event.kind === 'reply_received') {
            if (sentThread === undefined ||
                sentThread.mailboxId !== event.thread.mailboxId ||
                sentThread.providerThreadId !== event.thread.providerThreadId) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'A reply requires a preceding sent event on the same mailbox and thread',
                    path: ['events', index, 'thread'],
                });
            }
            replyReceived = true;
        }
        if (event.kind === 'reply_delivered') {
            if (!replyReceived) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'A delivered reply requires a preceding received reply',
                    path: ['events', index],
                });
            }
            if (event.outcome.requestId !== event.requestId ||
                !decisionOutcomeMatchesSubject({ subject: value.subject }, event.outcome)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'The outcome must answer the same request and plan version as the subject',
                    path: ['events', index, 'outcome'],
                });
            }
        }
    }
});
//# sourceMappingURL=vertical-plan-observation.js.map