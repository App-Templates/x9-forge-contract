import { z } from 'zod';
import { DecisionRequestIdSchema } from "../../organization/decision-request.js";
import { ResearchIdSchema } from "../ricerca/research.js";
import { PaperclipAssignInputSchema, PaperclipAssignRefInputSchema, PaperclipCreateIssueInputSchema, PaperclipIssueViewSchema, PaperclipReviewInputSchema, } from "./tools.js";
/**
 * Native waits of the P6 «C» variant (PROTOCOLLO-PAPERCLIP-P6.md): what a task waits for is declared to Paperclip, never
 * kept by X9 (P-04, P-05, P-15). Additive: the existing tool inputs and PAPERCLIP_TOOLS are unchanged; a consumer exposes
 * these schemas only behind its own experimental flag.
 *
 * Paperclip 2026.1005.0 semantics these schemas follow:
 * - entering `blocked` needs unresolved blockers, a pending interaction/approval or an `unblockDescriptor`, and an agent
 *   may name only itself as the unblock owner (`routes/issues.ts` PATCH, 422/403);
 * - a parent that truly waits on a child models it with blockers, `parentId` alone is not a dependency
 *   (`doc/execution-semantics.md` «Blockers»); `POST /issues/:id/children` with `blockParentUntilDone` adds the blocker;
 * - an async external job owned by the assignee is a one-shot monitor (`executionPolicy.monitor.nextCheckAt`, notes up to
 *   500 characters, serviceName up to 120), consumed by an `issue_monitor_due` wake.
 * Paperclip monitors support timeoutAt, maxAttempts and recoveryPolicy (validators/issue.ts:390-430).
 * The bridge uses maxAttempts with wake_owner and bounds the first check to one week, equal to retryAfterSeconds.
 */
export const PAPERCLIP_NATIVE_WAIT_TOOLS = { checkLater: 'paperclip_check_later' };
export const PAPERCLIP_CHECK_LATER_MAX_SECONDS = 604_800;
export const PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS = 5;
/**
 * Paperclip wakes the owner at most `attempts` times in total: the count survives rearming
 * (server/src/services/issue-execution-policy.ts:221). After the last wake, rearming is refused and the owner acts.
 * A blocked wait cannot carry this field because a monitor never fires on a blocked issue.
 */
export const PaperclipFollowUpSchema = z.strictObject({
    attempts: z.int().min(1).max(PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS),
}).describe('Paperclip wakes the owner at most attempts times in total across rearms, then refuses rearming and the owner handles the next step; blocked waits have no monitor');
/** The only monitor recovery policy the bridge uses; Paperclip supports three policies. */
export const PAPERCLIP_MONITOR_RECOVERY_POLICIES = ['wake_owner'];
/** The single builder of the monitor bounds sent to Paperclip; existing checks remain unbounded. */
export function paperclipMonitorBounds(followUp) {
    if (followUp === undefined)
        return undefined;
    return { maxAttempts: followUp.attempts, recoveryPolicy: PAPERCLIP_MONITOR_RECOVERY_POLICIES[0] };
}
/** Exact refusal text copied from Paperclip server/src/services/issue-execution-policy.ts:75. */
export const PAPERCLIP_MONITOR_EXHAUSTED_TEXT = 'Monitor bounds are already exhausted';
/** Paperclip supplies no error code for this refusal: status and the exact trimmed text identify it. */
export function isPaperclipMonitorExhausted(httpStatus, text) {
    return httpStatus === 422 && (text ?? '').trim() === PAPERCLIP_MONITOR_EXHAUSTED_TEXT;
}
/** The single question of an «ask another agent» interaction and the limits of its texts (Paperclip answers it with free text). */
export const PAPERCLIP_ASK_QUESTION_ID = 'detail';
export const PAPERCLIP_ASK_QUESTION_MAX = 2000;
export const PAPERCLIP_ANSWER_MAX = 4000;
/** The wake reason Paperclip gives the addressee of a pending interaction (`routes/issues.ts`). */
export const PAPERCLIP_INTERACTION_PENDING_WAKE = 'interaction_pending';
const ASK_IDEMPOTENCY_KEY_MAX = 255;
const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
const IssueIds = z.array(z.uuid()).min(1).max(20)
    .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique');
/**
 * What a wait expects, declared with the identifiers the tools returned (`email_request_decision` gives `requestId`,
 * `research_start` gives `researchId`): the link is data, never an id written inside the free text of `action` or `notes`.
 */
export const PAPERCLIP_WAIT_REF_KINDS = ['decision', 'research'];
export const PaperclipWaitRefSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('decision'), requestId: DecisionRequestIdSchema }),
    z.strictObject({ kind: z.literal('research'), researchId: ResearchIdSchema }),
]);
/** The only key by which references are compared: `decision:<requestId>` or `research:<researchId>`. */
export function paperclipWaitRefKey(ref) {
    return ref.kind === 'decision' ? `decision:${ref.requestId}` : `research:${ref.researchId}`;
}
export const PaperclipWaitsOnSchema = z.array(PaperclipWaitRefSchema).min(1).max(20)
    .refine(refs => new Set(refs.map(paperclipWaitRefKey)).size === refs.length, 'Waited-on references must be unique')
    .describe('The decisions or researches this wait expects, with their identifiers');
/**
 * Who unblocks a wait, declared by the agent with fixed words (the free text of `action` is never read to decide):
 * - `self`: an action of the agent itself;
 * - `external`: a contact or event outside the company's agents; the answer wakes the agent, which stays the owner;
 * - `company_agent`: another agent of the company, which Paperclip refuses (an agent names only itself, 403) and
 *   which is not awaited with this tool.
 */
export const PAPERCLIP_WAIT_UNBLOCKERS = ['self', 'external', 'company_agent'];
export const PaperclipWaitUnblockerSchema = z.enum(PAPERCLIP_WAIT_UNBLOCKERS);
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
export const PaperclipWaitingForSchema = z.strictObject({
    action: Text.max(2000),
    unblockedBy: PaperclipWaitUnblockerSchema.describe('Who unblocks the wait: self (an action of your own), external (a contact or event outside the company agents); company_agent (another company agent) is refused'),
    waitsOn: PaperclipWaitsOnSchema.optional(),
});
/** Closed list of the refusals of a wait declaration; the name is both the reason and the log code. */
export const PAPERCLIP_WAIT_REFUSALS = ['wait_for_company_agent'];
/**
 * The `unblockDescriptor` Paperclip stores (strict: only `owner` and `action`; the declaration stays in the call).
 * The refusal comes from the declared `unblockedBy`, never from `action`.
 */
export function paperclipUnblockDescriptor(waitingFor, agentId) {
    const owner = z.uuid().parse(agentId);
    const { action, unblockedBy } = PaperclipWaitingForSchema.parse(waitingFor);
    if (unblockedBy === 'company_agent')
        return { ok: false, refusal: 'wait_for_company_agent' };
    return { ok: true, descriptor: { owner: { agentId: owner }, action } };
}
/** One-shot check of an async job the agent owns: Paperclip wakes it (issue_monitor_due) after afterSeconds. */
export const PaperclipCheckLaterSchema = z.strictObject({
    afterSeconds: z.number().int().min(30).max(PAPERCLIP_CHECK_LATER_MAX_SECONDS),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
    waitsOn: PaperclipWaitsOnSchema.optional(),
    followUp: PaperclipFollowUpSchema.optional(),
});
/** A decision asked of another agent (resolved from `roleRef` by the consumer): Paperclip interaction + task in_review. */
export const PaperclipAskSchema = z.strictObject({ roleRef: Text.max(120), question: Text.max(PAPERCLIP_ASK_QUESTION_MAX) });
/**
 * `paperclip_review` with every durable disposition Paperclip accepts: `blocked` with what it waits for (tasks, or the
 * external action the agent owns), or the task kept `in_progress` with a scheduled check of an async job (P-15). The
 * check lives in review, not in a tool of its own, because a new write tool needs a policy decision of the agent
 * (agent-core asks a human for unknown writes) while review is already granted to every Paperclip agent.
 */
export const PaperclipNativeReviewInputSchema = PaperclipReviewInputSchema.extend({
    status: z.enum(['in_review', 'done', 'blocked', 'in_progress']),
    blockedByIssueIds: IssueIds.optional(),
    waitingFor: PaperclipWaitingForSchema.optional(),
    checkLater: PaperclipCheckLaterSchema.optional(),
    ask: PaperclipAskSchema.optional(),
}).superRefine((value, ctx) => {
    if (value.ask !== undefined && (value.status !== 'in_review' || value.blockedByIssueIds !== undefined
        || value.waitingFor !== undefined || value.checkLater !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['ask'], message: 'ask requires status in_review and no other wait' });
    }
    if ((value.blockedByIssueIds !== undefined || value.waitingFor !== undefined) && value.status !== 'blocked') {
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'A wait reason requires status blocked' });
    }
    if ((value.checkLater !== undefined) !== (value.status === 'in_progress')) {
        ctx.addIssue({ code: 'custom', path: ['checkLater'], message: 'Status in_progress is kept only with checkLater, and checkLater only with in_progress' });
    }
    if (value.blockedByIssueIds?.includes(value.issueId) === true) {
        ctx.addIssue({ code: 'custom', path: ['blockedByIssueIds'], message: 'A task cannot wait for itself' });
    }
});
/** `paperclip_create_issue` that also declares the wait: the parent stays blocked until this child is done. */
export const PaperclipNativeCreateIssueInputSchema = PaperclipCreateIssueInputSchema.extend({
    waitForChild: z.boolean().optional(),
}).superRefine((value, ctx) => {
    if (value.waitForChild === true && (value.parentIssueId === undefined || value.assigneeRoleRef === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: 'Waiting for a child requires parentIssueId and assigneeRoleRef' });
    }
});
const AnswerFields = {
    answersInteractionId: z.uuid().optional(),
};
function requireAnswerText(value, ctx) {
    if (value.answersInteractionId !== undefined && value.comment === undefined) {
        ctx.addIssue({ code: 'custom', path: ['comment'], message: 'Answering an interaction requires the answer text in comment' });
    }
}
/** `paperclip_assign` that can also answer a question another agent put to the assignee (the comment is the answer). */
export const PaperclipNativeAssignInputSchema = PaperclipAssignInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
export const PaperclipNativeAssignRefInputSchema = PaperclipAssignRefInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
const AskPrompt = Text.max(PAPERCLIP_ASK_QUESTION_MAX);
/** Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) with an addressee and no resolverPolicy. */
export const PaperclipAskInteractionBodySchema = z.strictObject({
    kind: z.literal('ask_user_questions'),
    idempotencyKey: z.string().min(1).max(ASK_IDEMPOTENCY_KEY_MAX),
    addresseeAgentId: z.uuid(),
    continuationPolicy: z.literal('wake_assignee'),
    payload: z.strictObject({
        version: z.literal(1),
        questionSet: z.strictObject({
            schema: z.literal('paperclip.question_set.v1'),
            questions: z.tuple([z.strictObject({
                    id: z.literal(PAPERCLIP_ASK_QUESTION_ID), prompt: AskPrompt, answerMode: z.literal('text'), required: z.literal(true),
                })]),
        }),
        questions: z.tuple([z.strictObject({
                id: z.literal(PAPERCLIP_ASK_QUESTION_ID), prompt: AskPrompt, selectionMode: z.literal('single'), required: z.literal(true),
                options: z.tuple([z.strictObject({ id: z.literal('text'), label: z.string().min(1).max(120), freeText: z.literal(true) })]),
            })]),
    }),
}).superRefine((value, ctx) => {
    const [set] = value.payload.questionSet.questions;
    const [view] = value.payload.questions;
    if (set.prompt !== view.prompt) {
        ctx.addIssue({ code: 'custom', path: ['payload', 'questions', 0, 'prompt'], message: 'The two views must carry the same prompt' });
    }
});
/** Body of `POST /issues/:id/interactions/:interactionId/respond` for that question: free text, no option. */
export const PaperclipAnswerInteractionBodySchema = z.strictObject({
    answers: z.tuple([z.strictObject({
            questionId: z.literal(PAPERCLIP_ASK_QUESTION_ID), optionIds: z.tuple([]), otherText: Text.max(PAPERCLIP_ANSWER_MAX),
        })]),
});
/** `ask:<issueId>:<callId>`, at most 255 characters (throws beyond). */
export function paperclipAskIdempotencyKey(issueId, callId) {
    const key = `ask:${issueId}:${callId}`;
    if (key.length > ASK_IDEMPOTENCY_KEY_MAX)
        throw new Error('Ask idempotency key longer than 255 characters');
    return key;
}
export function paperclipAskInteractionBody(input) {
    return PaperclipAskInteractionBodySchema.parse({
        kind: 'ask_user_questions', idempotencyKey: input.idempotencyKey, addresseeAgentId: input.addresseeAgentId,
        continuationPolicy: 'wake_assignee',
        payload: {
            version: 1,
            questionSet: { schema: 'paperclip.question_set.v1', questions: [{ id: PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, answerMode: 'text', required: true }] },
            questions: [{ id: PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, selectionMode: 'single', required: true,
                    options: [{ id: 'text', label: 'Risposta', freeText: true }] }],
        },
    });
}
export function paperclipAnswerInteractionBody(text) {
    return PaperclipAnswerInteractionBodySchema.parse({
        answers: [{ questionId: PAPERCLIP_ASK_QUESTION_ID, optionIds: [], otherText: text.trim() }],
    });
}
/** One-shot Paperclip monitor on a task the agent owns, for an async job it will check later (no recurring interval). */
export const PaperclipCheckLaterInputSchema = z.strictObject({
    issueId: z.uuid(),
    afterSeconds: z.number().int().min(30).max(PAPERCLIP_CHECK_LATER_MAX_SECONDS),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
    waitsOn: PaperclipWaitsOnSchema.optional(),
    followUp: PaperclipFollowUpSchema.optional(),
});
export const PaperclipCheckLaterOutputSchema = z.strictObject({
    issue: PaperclipIssueViewSchema,
    nextCheckAt: z.iso.datetime({ offset: true }),
});
//# sourceMappingURL=native-wait.js.map