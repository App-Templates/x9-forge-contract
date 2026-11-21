import { z } from 'zod';
import { DecisionRequestIdSchema } from "../../organization/decision-request.js";
import { ResearchIdSchema } from "../ricerca/research.js";
import { PaperclipConfermaCorpoSchema } from "../paperclip-protocollo/wire-scritture.js";
import { PaperclipAgentIdSchema, PaperclipAssignAgentInputSchema, PaperclipAssignAgentRefInputSchema, PaperclipAssignInputSchema, PaperclipAssignRefInputSchema, PaperclipCreateIssueAgentInputSchema, PaperclipCreateIssueInputSchema, PaperclipIssueViewSchema, PaperclipReviewInputSchema, } from "./tools.js";
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
/** Paperclip refuses a monitor with maxAttempts above 100 (validators/issue.ts:419-425). */
export const PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP = 100;
/**
 * `attempts` = at most that many wake-ups FROM NOW, whatever the task already had. Paperclip keeps one count per task
 * that is never reset and refuses a rearm when count >= maxAttempts (server/src/services/issue-execution-policy.ts:221),
 * so the bridge writes maxAttempts = live count + attempts. A blocked wait cannot carry this field because a monitor
 * never fires on a blocked issue.
 */
export const PaperclipFollowUpSchema = z.strictObject({
    attempts: z.int().min(1).max(PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS),
}).describe(`Paperclip wakes the owner at most attempts times from now, whatever the task already had; after the last wake rearming is refused and the owner handles the next step. Paperclip's absolute cap is ${PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP} wake-ups per task: close to it fewer than attempts wake-ups may remain, and at the cap rearming is refused; blocked waits have no monitor`);
/** The only monitor recovery policy the bridge uses; Paperclip supports three policies. */
export const PAPERCLIP_MONITOR_RECOVERY_POLICIES = ['wake_owner'];
/**
 * The single builder of the monitor bounds sent to Paperclip; existing checks remain unbounded.
 * `attemptCount` is the live count of the task, passed only with a followUp the agent just gave; a limit the task
 * already holds is absolute and is written back with `attemptCount` omitted (0).
 */
export function paperclipMonitorBounds(followUp, attemptCount = 0) {
    if (followUp === undefined)
        return undefined;
    const used = Number.isInteger(attemptCount) && attemptCount > 0 ? attemptCount : 0;
    return {
        maxAttempts: Math.min(used + followUp.attempts, PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP),
        recoveryPolicy: PAPERCLIP_MONITOR_RECOVERY_POLICIES[0],
    };
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
 * The Director's answer to a request has an outcome. When it is not a go-ahead it says how to fix (one move, who makes it,
 * which tool), and a prohibition also says what lifts it, using the two native forms of waiting Paperclip has: a blocker
 * on an issue or a scheduled check. Additive and optional: closures without `answer` are unchanged (the service enforces it, 8252).
 */
export const PAPERCLIP_ANSWER_OUTCOMES = ['approved', 'not_approved', 'forbidden'];
export const PAPERCLIP_ANSWER_ACTORS = ['asker', 'director', 'referent'];
export const PaperclipAnswerHowToFixSchema = z.strictObject({
    move: Text.max(500),
    who: z.enum(PAPERCLIP_ANSWER_ACTORS),
    tool: Text.max(80).optional(),
});
export const PaperclipAnswerLiftConditionSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('blocked_by_issue'), issueId: z.uuid() }),
    z.strictObject({
        kind: z.literal('check_after'),
        afterSeconds: z.number().int().min(30).max(PAPERCLIP_CHECK_LATER_MAX_SECONDS),
    }),
]);
export const PaperclipDirectorAnswerSchema = z.strictObject({
    outcome: z.enum(PAPERCLIP_ANSWER_OUTCOMES),
    howToFix: PaperclipAnswerHowToFixSchema.optional(),
    liftCondition: PaperclipAnswerLiftConditionSchema.optional(),
}).superRefine((value, ctx) => {
    if (value.outcome === 'approved') {
        if (value.howToFix !== undefined)
            ctx.addIssue({ code: 'custom', path: ['howToFix'], message: 'An approval carries no howToFix' });
        if (value.liftCondition !== undefined)
            ctx.addIssue({ code: 'custom', path: ['liftCondition'], message: 'An approval carries no liftCondition' });
    }
    if (value.outcome !== 'approved' && value.howToFix === undefined) {
        ctx.addIssue({ code: 'custom', path: ['howToFix'], message: 'An answer that is not a go-ahead says how to fix' });
    }
    if (value.outcome === 'not_approved' && value.liftCondition !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['liftCondition'], message: 'Only a prohibition carries a liftCondition' });
    }
    if (value.outcome === 'forbidden' && value.liftCondition === undefined) {
        ctx.addIssue({ code: 'custom', path: ['liftCondition'], message: 'A prohibition says what lifts it' });
    }
});
const ANSWER_OUTCOME_LINES = { approved: 'Esito: approvato.', not_approved: 'Esito: non approvato.', forbidden: 'Esito: vietato.' };
const ANSWER_ACTOR_WORDS = { asker: 'tu', director: 'il Director', referent: 'il referente' };
/** Fixed Italian lines (the readers are the company's agents) composed from the answer; pure. */
export function paperclipDirectorAnswerLines(answer) {
    const lines = [ANSWER_OUTCOME_LINES[answer.outcome]];
    if (answer.howToFix !== undefined) {
        const tool = answer.howToFix.tool === undefined ? '' : `; strumento: ${answer.howToFix.tool}`;
        lines.push(`Come correggere: ${answer.howToFix.move} (chi: ${ANSWER_ACTOR_WORDS[answer.howToFix.who]}${tool}).`);
    }
    const lift = answer.liftCondition;
    if (lift?.kind === 'blocked_by_issue') {
        lines.push(`Il divieto cade quando l'incarico ${lift.issueId} è chiuso: blocca il tuo incarico con blockedByIssueIds.`);
    }
    else if (lift?.kind === 'check_after') {
        lines.push(`Il divieto va ricontrollato fra ${lift.afterSeconds} secondi: usa un controllo programmato (checkLater afterSeconds ${lift.afterSeconds}).`);
    }
    return lines.join('\n');
}
/**
 * `paperclip_review` with every durable disposition Paperclip accepts: `blocked` with what it waits for (tasks, or the
 * external action the agent owns), or the task kept `in_progress` with a scheduled check of an async job (P-15). The
 * check lives in review, not in a tool of its own, because a new write tool needs a policy decision of the agent
 * (agent-core asks a human for unknown writes) while review is already granted to every Paperclip agent.
 */
const NativeReviewBase = PaperclipReviewInputSchema.extend({
    status: z.enum(['in_review', 'done', 'blocked', 'in_progress']),
    blockedByIssueIds: IssueIds.optional(),
    waitingFor: PaperclipWaitingForSchema.optional(),
    checkLater: PaperclipCheckLaterSchema.optional(),
    answer: PaperclipDirectorAnswerSchema.optional(),
});
function checkNativeReview(value, ctx) {
    if (value.ask !== undefined && (value.status !== 'in_review' || value.blockedByIssueIds !== undefined
        || value.waitingFor !== undefined || value.checkLater !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['ask'], message: 'ask requires status in_review and no other wait' });
    }
    if (value.answer !== undefined && (value.status !== 'done' || value.ask !== undefined || value.blockedByIssueIds !== undefined
        || value.waitingFor !== undefined || value.checkLater !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answer requires status done and no ask or wait' });
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
}
export const PaperclipNativeReviewInputSchema = NativeReviewBase.extend({ ask: PaperclipAskSchema.optional() })
    .superRefine(checkNativeReview);
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
const AskPayload = z.strictObject({
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
});
function requireSamePrompt(value, ctx) {
    const [set] = value.payload.questionSet.questions;
    const [view] = value.payload.questions;
    if (set.prompt !== view.prompt) {
        ctx.addIssue({ code: 'custom', path: ['payload', 'questions', 0, 'prompt'], message: 'The two views must carry the same prompt' });
    }
}
/** Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) with an addressee and no resolverPolicy. */
export const PaperclipAskInteractionBodySchema = z.strictObject({
    kind: z.literal('ask_user_questions'),
    idempotencyKey: z.string().min(1).max(ASK_IDEMPOTENCY_KEY_MAX),
    addresseeAgentId: z.uuid(),
    continuationPolicy: z.literal('wake_assignee'),
    payload: AskPayload,
}).superRefine(requireSamePrompt);
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
/**
 * Closed vocabularies of the Paperclip interactions (cards in the issue thread). Source: Paperclip
 * packages/shared/src/constants.ts:259-267 (kinds), 269-294 (resolver policies), 331-348 (statuses, continuation policies) and
 * packages/shared/src/validators/issue.ts:1223-1227, 1448-1459, 1699-1711, 1866-1876 (outcomes). A value Paperclip adds later
 * fails a read here, loudly, instead of being read as something else.
 */
export const PAPERCLIP_INTERACTION_KINDS = [
    'suggest_tasks', 'ask_user_questions', 'request_confirmation', 'request_checkbox_confirmation', 'request_item_verdicts', 'connection_intent',
];
/** The five kinds `POST /issues/:id/interactions` creates: `connection_intent` is made by the server only (validators/issue.ts:1944-2010). */
export const PAPERCLIP_INTERACTION_CREATABLE_KINDS = [
    'suggest_tasks', 'ask_user_questions', 'request_confirmation', 'request_checkbox_confirmation', 'request_item_verdicts',
];
export const PAPERCLIP_INTERACTION_STATUSES = ['pending', 'accepted', 'rejected', 'answered', 'cancelled', 'expired', 'failed'];
export const PAPERCLIP_CONTINUATION_POLICIES = ['none', 'wake_assignee', 'wake_assignee_on_accept'];
/** Who may resolve a card. `anyone` is the default (the creating run included); `human_only` keeps agents out. */
export const PAPERCLIP_RESOLVER_POLICIES = ['anyone', 'not_creator', 'human_only'];
/** Write-compatible aliases of one migration window (constants.ts:277-285): read them, never write them. */
export const PAPERCLIP_RESOLVER_POLICY_ALIASES = ['board_or_agents', 'board_only'];
export const PAPERCLIP_QUESTION_OUTCOMES = ['skipped', 'withdrawn', 'issue_closed', 'addressee_deleted'];
export const PAPERCLIP_QUESTION_EXPIRATION_REASONS = ['superseded_by_comment', 'superseded_by_newer_interaction'];
export const PAPERCLIP_CONFIRMATION_OUTCOMES = [
    'accepted', 'rejected', 'superseded_by_comment', 'superseded_by_newer_request', 'stale_target', 'skipped', 'withdrawn', 'issue_closed',
    'addressee_deleted',
];
export const PaperclipInteractionKindSchema = z.enum(PAPERCLIP_INTERACTION_KINDS);
export const PaperclipInteractionStatusSchema = z.enum(PAPERCLIP_INTERACTION_STATUSES);
export const PaperclipContinuationPolicySchema = z.enum(PAPERCLIP_CONTINUATION_POLICIES);
export const PaperclipResolverPolicySchema = z.enum(PAPERCLIP_RESOLVER_POLICIES);
export const PaperclipResolverPolicyReadSchema = z.enum([...PAPERCLIP_RESOLVER_POLICIES, ...PAPERCLIP_RESOLVER_POLICY_ALIASES]);
/** Paperclip normalizes the two aliases (constants.ts:296-302); the ponte does the same when it reads a card. */
export function paperclipNormalizeResolverPolicy(policy) {
    return policy === 'board_or_agents' ? 'anyone' : policy === 'board_only' ? 'human_only' : policy;
}
/** A card as Paperclip returns it, read tolerantly: the kind and the status are closed, the rest passes. */
export const PaperclipInteractionReadSchema = z.looseObject({
    id: z.guid(), kind: PaperclipInteractionKindSchema, status: PaperclipInteractionStatusSchema,
    addresseeAgentId: PaperclipAgentIdSchema.nullish(),
});
export const PaperclipQuestionResultSchema = z.looseObject({
    outcome: z.enum(PAPERCLIP_QUESTION_OUTCOMES).optional(), expirationReason: z.enum(PAPERCLIP_QUESTION_EXPIRATION_REASONS).optional(),
});
export const PaperclipConfirmationResultSchema = z.looseObject({ outcome: z.enum(PAPERCLIP_CONFIRMATION_OUTCOMES) });
/**
 * Where the question card of the bridge is narrower than Paperclip's `ask_user_questions` (validators/issue.ts:1251, 1270, 1371, 1390),
 * declared: one free-text question per card, and a prompt of at most 2000 characters where Paperclip takes 4000 (the bridge asks one thing at a time).
 */
export const PAPERCLIP_ASK_DECLARED_CHOICES = {
    questionsPerCard: { ours: 1, paperclip: 64 },
    promptMax: { ours: PAPERCLIP_ASK_QUESTION_MAX, paperclip: 4000 },
};
/**
 * Who a question is put to, with the recipient as an id: `agent` (the card is addressed to that agent, Paperclip wakes it with
 * `interaction_pending`, no `resolverPolicy`: SKILL.md:169,602) or `person` (a human answers: `resolverPolicy: human_only`, nobody is
 * named, the card stays open to the eligible humans; `addresseeUserId` is not offered because the stack has no exact Paperclip user id,
 * api-reference.md:927-928). `PaperclipAskSchema.roleRef` is deprecated.
 */
export const PAPERCLIP_ASK_TARGETS = ['agent', 'person'];
export const PaperclipAddressedAskSchema = z.discriminatedUnion('to', [
    z.strictObject({ to: z.literal('agent'), addresseeAgentId: PaperclipAgentIdSchema, question: AskPrompt }),
    z.strictObject({ to: z.literal('person'), question: AskPrompt }),
]);
/** `paperclip_review` that asks an agent or a person with the recipient as an id; same waits and same checks as the native review. */
export const PaperclipNativeReviewAddressedInputSchema = NativeReviewBase.extend({ ask: PaperclipAddressedAskSchema.optional() })
    .superRefine(checkNativeReview);
/** `paperclip_assign` by id that can also answer a question put to the assignee. */
export const PaperclipNativeAssignAgentInputSchema = PaperclipAssignAgentInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
export const PaperclipNativeAssignAgentRefInputSchema = PaperclipAssignAgentRefInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
/** `paperclip_create_issue` by id that also declares the wait: the parent stays blocked until the child is done. */
export const PaperclipNativeCreateIssueAgentInputSchema = PaperclipCreateIssueAgentInputSchema.extend({
    waitForChild: z.boolean().optional(),
}).superRefine((value, ctx) => {
    if (value.waitForChild === true && (value.parentIssueId === undefined || value.assigneeAgentId === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: 'Waiting for a child requires parentIssueId and assigneeAgentId' });
    }
});
/** Paperclip refuses an interaction an agent addresses to itself (422, services/issue-thread-interactions.ts:3384-3388). */
export const PAPERCLIP_ASK_REFUSALS = ['ask_to_self'];
export function decidePaperclipAsk(selfAgentId, ask) {
    return ask.to === 'agent' && ask.addresseeAgentId === selfAgentId ? { ok: false, refusal: 'ask_to_self' } : { ok: true };
}
/**
 * Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) for a PERSON: `resolverPolicy: human_only`,
 * `continuationPolicy: wake_assignee`, no addressee (api-reference.md:994-1002). The task then goes `in_review`, unchanged assignee,
 * after the card is verified `pending`; never a blocker with owner `user` or `board`.
 */
export const PaperclipAskPersonInteractionBodySchema = z.strictObject({
    kind: z.literal('ask_user_questions'),
    idempotencyKey: z.string().min(1).max(ASK_IDEMPOTENCY_KEY_MAX),
    title: z.string().trim().min(1).max(240).optional(),
    resolverPolicy: z.literal('human_only'),
    continuationPolicy: z.literal('wake_assignee'),
    payload: AskPayload,
}).superRefine(requireSamePrompt);
/** `ask-person:<issueId>:<callId>`, at most 255 characters (throws beyond). */
export function paperclipAskPersonIdempotencyKey(issueId, callId) {
    const key = `ask-person:${issueId}:${callId}`;
    if (key.length > ASK_IDEMPOTENCY_KEY_MAX)
        throw new Error('Ask idempotency key longer than 255 characters');
    return key;
}
export function paperclipAskPersonInteractionBody(input) {
    return PaperclipAskPersonInteractionBodySchema.parse({
        kind: 'ask_user_questions', idempotencyKey: input.idempotencyKey, ...(input.title === undefined ? {} : { title: input.title }),
        resolverPolicy: 'human_only', continuationPolicy: 'wake_assignee',
        payload: {
            version: 1,
            questionSet: { schema: 'paperclip.question_set.v1', questions: [{ id: PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, answerMode: 'text', required: true }] },
            questions: [{ id: PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, selectionMode: 'single', required: true,
                    options: [{ id: 'text', label: 'Risposta', freeText: true }] }],
        },
    });
}
/**
 * The plan confirmation with the two policies Paperclip lets the creator choose. The default stays what it is today (no field:
 * `continuationPolicy: none`, `resolverPolicy: anyone`); `wake_assignee_on_accept` makes Paperclip wake the assignee when the
 * plan is accepted, which today nothing does (routes/issues.ts:2595-2602). Choosing it is an adoption decision, not made here.
 */
export const PaperclipConfermaConPoliticheCorpoSchema = PaperclipConfermaCorpoSchema.extend({
    resolverPolicy: PaperclipResolverPolicySchema.optional(),
    continuationPolicy: PaperclipContinuationPolicySchema.optional(),
});
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