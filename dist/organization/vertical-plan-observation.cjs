"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalPlanAttemptObservationSchema = exports.VerticalPlanAttemptEventSchema = exports.VERTICAL_PLAN_ATTEMPT_EVENT_KINDS = exports.VerticalPlanSendThreadSchema = void 0;
exports.verticalPlanMatchesAttempt = verticalPlanMatchesAttempt;
const zod_1 = require("zod");
const action_plan_js_1 = require("./action-plan.cjs");
const business_unit_mandate_js_1 = require("./business-unit-mandate.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const shared_mailbox_js_1 = require("./shared-mailbox.cjs");
const vertical_plan_js_1 = require("./vertical-plan.cjs");
/** Thread reference only: owner and opening live in the thread registry. */
exports.VerticalPlanSendThreadSchema = shared_mailbox_js_1.SharedMailboxThreadSchema.pick({
    mailboxId: true,
    providerThreadId: true,
});
exports.VERTICAL_PLAN_ATTEMPT_EVENT_KINDS = [
    'sent', 'send_failed', 'reply_received', 'reply_delivered',
];
const attemptEventShape = {
    eventId: business_unit_mandate_js_1.MandateAttemptObservationIdSchema,
    at: zod_1.z.iso.datetime({ offset: true }),
    requestId: decision_request_js_1.DecisionRequestIdSchema,
};
exports.VerticalPlanAttemptEventSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[0]),
        plan: vertical_plan_js_1.VerticalPlanSchema,
        referent: action_plan_js_1.ActionPlanReferentRefSchema,
        to: zod_1.z.email(),
        thread: exports.VerticalPlanSendThreadSchema,
        providerMessageId: zod_1.z.string().min(1).max(512),
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[1]),
        referent: action_plan_js_1.ActionPlanReferentRefSchema,
        to: zod_1.z.email(),
        error: zod_1.z.string().min(1).max(500),
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[2]),
        thread: exports.VerticalPlanSendThreadSchema,
        providerMessageId: zod_1.z.string().min(1).max(512),
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.VERTICAL_PLAN_ATTEMPT_EVENT_KINDS[3]),
        outcome: decision_request_js_1.DecisionOutcomeSchema,
    }),
]);
/** True when the sent plan is the exact subject of the attempt and belongs to the attempt scope. */
function verticalPlanMatchesAttempt(scope, subject, plan) {
    const planSubject = (0, vertical_plan_js_1.verticalPlanDecisionSubject)(plan);
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
exports.VerticalPlanAttemptObservationSchema = zod_1.z.strictObject({
    observationId: business_unit_mandate_js_1.MandateAttemptObservationIdSchema,
    scope: business_unit_mandate_js_1.MandateAttemptScopeSchema,
    subject: decision_request_js_1.DecisionSubjectSchema,
    events: zod_1.z.array(exports.VerticalPlanAttemptEventSchema).min(1).max(50),
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
                !(0, decision_request_js_1.decisionOutcomeMatchesSubject)({ subject: value.subject }, event.outcome)) {
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