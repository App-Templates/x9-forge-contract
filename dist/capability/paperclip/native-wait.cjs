"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_INTERACTION_KINDS = exports.PaperclipAnswerInteractionBodySchema = exports.PaperclipAskInteractionBodySchema = exports.PaperclipNativeAssignRefInputSchema = exports.PaperclipNativeAssignInputSchema = exports.PaperclipLabNativeCreateIssueAgentInputSchema = exports.PaperclipLabNativeCreateIssueInputSchema = exports.PaperclipLabCreateIssueAgentInputSchema = exports.PaperclipLabCreateIssueInputSchema = exports.PaperclipNativeCreateIssueInputSchema = exports.PaperclipNativeReviewInputSchema = exports.parsePaperclipLabReviewRecord = exports.paperclipLabReviewRecord = exports.parsePaperclipLabAnswerRecord = exports.paperclipLabAnswerRecord = exports.parsePaperclipLabRequestRecord = exports.paperclipLabRequestRecord = exports.PaperclipLabRequestRecordSchema = exports.PaperclipLabReviewSchema = exports.PAPERCLIP_LAB_REVIEW_OUTCOMES = exports.PaperclipLabAnswerSchema = exports.PaperclipLabRequestSchema = exports.PaperclipDirectorResolutionSchema = exports.PAPERCLIP_DIRECTOR_RESOLUTION_KINDS = exports.PaperclipDirectorAnswerSchema = exports.PaperclipAnswerLiftConditionSchema = exports.PaperclipAnswerCheckSourceSchema = exports.PaperclipAnswerHowToFixSchema = exports.PAPERCLIP_ANSWER_ACTORS = exports.PAPERCLIP_ANSWER_OUTCOMES = exports.PaperclipAskSchema = exports.PaperclipCheckLaterSchema = exports.PAPERCLIP_WAIT_REFUSALS = exports.PaperclipWaitingForSchema = exports.PaperclipWaitUnblockerSchema = exports.PAPERCLIP_WAIT_UNBLOCKERS = exports.PaperclipWaitsOnSchema = exports.PaperclipWaitRefSchema = exports.PAPERCLIP_WAIT_REF_KINDS = exports.PAPERCLIP_INTERACTION_PENDING_WAKE = exports.PAPERCLIP_ANSWER_MAX = exports.PAPERCLIP_ASK_QUESTION_MAX = exports.PAPERCLIP_ASK_QUESTION_ID = exports.PAPERCLIP_MONITOR_EXHAUSTED_TEXT = exports.PAPERCLIP_MONITOR_RECOVERY_POLICIES = exports.PaperclipFollowUpSchema = exports.PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP = exports.PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS = exports.PAPERCLIP_CHECK_LATER_MAX_SECONDS = exports.PAPERCLIP_NATIVE_WAIT_TOOLS = void 0;
exports.PaperclipCheckLaterOutputSchema = exports.PaperclipCheckLaterInputSchema = exports.PaperclipConfermaConPoliticheCorpoSchema = exports.PaperclipAskPersonInteractionBodySchema = exports.PAPERCLIP_ASK_REFUSALS = exports.PaperclipNativeCreateIssueAgentInputSchema = exports.PaperclipNativeAssignAgentRefInputSchema = exports.PaperclipNativeAssignAgentInputSchema = exports.PaperclipNativeReviewAddressedInputSchema = exports.PaperclipAddressedAskSchema = exports.PAPERCLIP_ASK_TARGETS = exports.PAPERCLIP_ASK_DECLARED_CHOICES = exports.PaperclipConfirmationResultSchema = exports.PaperclipQuestionResultSchema = exports.PaperclipInteractionReadSchema = exports.PaperclipResolverPolicyReadSchema = exports.PaperclipResolverPolicySchema = exports.PaperclipContinuationPolicySchema = exports.PaperclipInteractionStatusSchema = exports.PaperclipInteractionKindSchema = exports.PAPERCLIP_CONFIRMATION_OUTCOMES = exports.PAPERCLIP_QUESTION_EXPIRATION_REASONS = exports.PAPERCLIP_QUESTION_OUTCOMES = exports.PAPERCLIP_RESOLVER_POLICY_ALIASES = exports.PAPERCLIP_RESOLVER_POLICIES = exports.PAPERCLIP_CONTINUATION_POLICIES = exports.PAPERCLIP_INTERACTION_STATUSES = exports.PAPERCLIP_INTERACTION_CREATABLE_KINDS = void 0;
exports.paperclipMonitorBounds = paperclipMonitorBounds;
exports.isPaperclipMonitorExhausted = isPaperclipMonitorExhausted;
exports.paperclipWaitRefKey = paperclipWaitRefKey;
exports.paperclipUnblockDescriptor = paperclipUnblockDescriptor;
exports.paperclipDirectorAnswerLines = paperclipDirectorAnswerLines;
exports.paperclipLabAcceptanceCriteria = paperclipLabAcceptanceCriteria;
exports.paperclipLabCoverageProblem = paperclipLabCoverageProblem;
exports.paperclipLabFreeTextProblem = paperclipLabFreeTextProblem;
exports.paperclipAskIdempotencyKey = paperclipAskIdempotencyKey;
exports.paperclipAskInteractionBody = paperclipAskInteractionBody;
exports.paperclipAnswerInteractionBody = paperclipAnswerInteractionBody;
exports.paperclipNormalizeResolverPolicy = paperclipNormalizeResolverPolicy;
exports.decidePaperclipAsk = decidePaperclipAsk;
exports.paperclipAskPersonIdempotencyKey = paperclipAskPersonIdempotencyKey;
exports.paperclipAskPersonInteractionBody = paperclipAskPersonInteractionBody;
const zod_1 = require("zod");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const wire_scritture_js_1 = require("../paperclip-protocollo/wire-scritture.cjs");
const wire_creazione_js_1 = require("../paperclip-protocollo/wire-creazione.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const tools_js_1 = require("../lab/tools.cjs");
const wiki_js_1 = require("../lab/wiki.cjs");
const tools_js_2 = require("./tools.cjs");
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
exports.PAPERCLIP_NATIVE_WAIT_TOOLS = { checkLater: 'paperclip_check_later' };
exports.PAPERCLIP_CHECK_LATER_MAX_SECONDS = 604_800;
exports.PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS = 5;
/** Paperclip refuses a monitor with maxAttempts above 100 (validators/issue.ts:419-425). */
exports.PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP = 100;
/**
 * `attempts` = at most that many wake-ups FROM NOW, whatever the task already had. Paperclip keeps one count per task
 * that is never reset and refuses a rearm when count >= maxAttempts (server/src/services/issue-execution-policy.ts:221),
 * so the bridge writes maxAttempts = live count + attempts. A blocked wait cannot carry this field because a monitor
 * never fires on a blocked issue.
 */
exports.PaperclipFollowUpSchema = zod_1.z.strictObject({
    attempts: zod_1.z.int().min(1).max(exports.PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS),
}).describe(`Paperclip wakes the owner at most attempts times from now, whatever the task already had; after the last wake rearming is refused and the owner handles the next step. Paperclip's absolute cap is ${exports.PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP} wake-ups per task: close to it fewer than attempts wake-ups may remain, and at the cap rearming is refused; blocked waits have no monitor`);
/** The only monitor recovery policy the bridge uses; Paperclip supports three policies. */
exports.PAPERCLIP_MONITOR_RECOVERY_POLICIES = ['wake_owner'];
/**
 * The single builder of the monitor bounds sent to Paperclip; existing checks remain unbounded.
 * `attemptCount` is the live count of the task, passed only with a followUp the agent just gave; a limit the task
 * already holds is absolute and is written back with `attemptCount` omitted (0).
 */
function paperclipMonitorBounds(followUp, attemptCount = 0) {
    if (followUp === undefined)
        return undefined;
    const used = Number.isInteger(attemptCount) && attemptCount > 0 ? attemptCount : 0;
    return {
        maxAttempts: Math.min(used + followUp.attempts, exports.PAPERCLIP_MONITOR_MAX_ATTEMPTS_CAP),
        recoveryPolicy: exports.PAPERCLIP_MONITOR_RECOVERY_POLICIES[0],
    };
}
/** Exact refusal text copied from Paperclip server/src/services/issue-execution-policy.ts:75. */
exports.PAPERCLIP_MONITOR_EXHAUSTED_TEXT = 'Monitor bounds are already exhausted';
/** Paperclip supplies no error code for this refusal: status and the exact trimmed text identify it. */
function isPaperclipMonitorExhausted(httpStatus, text) {
    return httpStatus === 422 && (text ?? '').trim() === exports.PAPERCLIP_MONITOR_EXHAUSTED_TEXT;
}
/** The single question of an «ask another agent» interaction and the limits of its texts (Paperclip answers it with free text). */
exports.PAPERCLIP_ASK_QUESTION_ID = 'detail';
exports.PAPERCLIP_ASK_QUESTION_MAX = 2000;
exports.PAPERCLIP_ANSWER_MAX = 4000;
/** The wake reason Paperclip gives the addressee of a pending interaction (`routes/issues.ts`). */
exports.PAPERCLIP_INTERACTION_PENDING_WAKE = 'interaction_pending';
const ASK_IDEMPOTENCY_KEY_MAX = 255;
const Text = zod_1.z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
const IssueIds = zod_1.z.array(zod_1.z.uuid()).min(1).max(20)
    .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique');
/**
 * What a wait expects, declared with the identifiers the tools returned (`email_request_decision` gives `requestId`,
 * `research_start` gives `researchId`): the link is data, never an id written inside the free text of `action` or `notes`.
 */
exports.PAPERCLIP_WAIT_REF_KINDS = ['decision', 'research'];
exports.PaperclipWaitRefSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('decision'), requestId: decision_request_js_1.DecisionRequestIdSchema }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('research'), researchId: research_js_1.ResearchIdSchema }),
]);
/** The only key by which references are compared: `decision:<requestId>` or `research:<researchId>`. */
function paperclipWaitRefKey(ref) {
    return ref.kind === 'decision' ? `decision:${ref.requestId}` : `research:${ref.researchId}`;
}
exports.PaperclipWaitsOnSchema = zod_1.z.array(exports.PaperclipWaitRefSchema).min(1).max(20)
    .refine(refs => new Set(refs.map(paperclipWaitRefKey)).size === refs.length, 'Waited-on references must be unique')
    .describe('The decisions or researches this wait expects, with their identifiers');
/**
 * Who unblocks a wait, declared by the agent with fixed words (the free text of `action` is never read to decide):
 * - `self`: an action of the agent itself;
 * - `external`: a contact or event outside the company's agents; the answer wakes the agent, which stays the owner;
 * - `company_agent`: another agent of the company, which Paperclip refuses (an agent names only itself, 403) and
 *   which is not awaited with this tool.
 */
exports.PAPERCLIP_WAIT_UNBLOCKERS = ['self', 'external', 'company_agent'];
exports.PaperclipWaitUnblockerSchema = zod_1.z.enum(exports.PAPERCLIP_WAIT_UNBLOCKERS);
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
exports.PaperclipWaitingForSchema = zod_1.z.strictObject({
    action: Text.max(2000),
    unblockedBy: exports.PaperclipWaitUnblockerSchema.describe('Who unblocks the wait: self (an action of your own), external (a contact or event outside the company agents); company_agent (another company agent) is refused'),
    waitsOn: exports.PaperclipWaitsOnSchema.optional(),
});
/** Closed list of the refusals of a wait declaration; the name is both the reason and the log code. */
exports.PAPERCLIP_WAIT_REFUSALS = ['wait_for_company_agent'];
/**
 * The `unblockDescriptor` Paperclip stores (strict: only `owner` and `action`; the declaration stays in the call).
 * The refusal comes from the declared `unblockedBy`, never from `action`.
 */
function paperclipUnblockDescriptor(waitingFor, agentId) {
    const owner = zod_1.z.uuid().parse(agentId);
    const { action, unblockedBy } = exports.PaperclipWaitingForSchema.parse(waitingFor);
    if (unblockedBy === 'company_agent')
        return { ok: false, refusal: 'wait_for_company_agent' };
    return { ok: true, descriptor: { owner: { agentId: owner }, action } };
}
/** One-shot check of an async job the agent owns: Paperclip wakes it (issue_monitor_due) after afterSeconds. */
exports.PaperclipCheckLaterSchema = zod_1.z.strictObject({
    afterSeconds: zod_1.z.number().int().min(30).max(exports.PAPERCLIP_CHECK_LATER_MAX_SECONDS),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
    waitsOn: exports.PaperclipWaitsOnSchema.optional(),
    followUp: exports.PaperclipFollowUpSchema.optional(),
});
/** A decision asked of another agent (resolved from `roleRef` by the consumer): Paperclip interaction + task in_review. */
exports.PaperclipAskSchema = zod_1.z.strictObject({ roleRef: Text.max(120), question: Text.max(exports.PAPERCLIP_ASK_QUESTION_MAX) });
/**
 * The Director's answer to a request has an outcome. When it is not a go-ahead it says how to fix (one move, who makes it,
 * which tool), and a prohibition also says what lifts it, using the two native forms of waiting Paperclip has: a blocker
 * on an issue or a scheduled check. Additive and optional: closures without `answer` are unchanged (the service enforces it, 8252).
 */
exports.PAPERCLIP_ANSWER_OUTCOMES = ['approved', 'not_approved', 'forbidden'];
exports.PAPERCLIP_ANSWER_ACTORS = ['asker', 'director', 'referent'];
exports.PaperclipAnswerHowToFixSchema = zod_1.z.strictObject({
    move: Text.max(500),
    who: zod_1.z.enum(exports.PAPERCLIP_ANSWER_ACTORS),
    tool: Text.max(80).optional(),
});
/**
 * The decision state belongs to services/memory. At the native recheck the consumer reads the request and outcome
 * with the existing internalMemoryDecisionRequestReadContract: params.requestId comes from this source; query.tenantId
 * and query.agentId identify the real reader. This reference grants no access. Neither elapsed time nor state decided
 * alone lifts a prohibition. Accessibility, scope, author and linkage are checked by the consumer before closure (8252).
 */
exports.PaperclipAnswerCheckSourceSchema = zod_1.z.strictObject({
    service: zod_1.z.literal('memory'),
    requestId: decision_request_js_1.DecisionRequestIdSchema.describe('Decision read by the check source'),
});
exports.PaperclipAnswerLiftConditionSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('blocked_by_issue'), issueId: zod_1.z.uuid() }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('check_after'),
        afterSeconds: zod_1.z.number().int().min(30).max(exports.PAPERCLIP_CHECK_LATER_MAX_SECONDS),
        source: exports.PaperclipAnswerCheckSourceSchema.optional(),
    }),
]);
exports.PaperclipDirectorAnswerSchema = zod_1.z.strictObject({
    outcome: zod_1.z.enum(exports.PAPERCLIP_ANSWER_OUTCOMES),
    howToFix: exports.PaperclipAnswerHowToFixSchema.optional(),
    liftCondition: exports.PaperclipAnswerLiftConditionSchema.optional(),
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
/**
 * How the Director resolved a request: answered it (`response`, or `clearance` = a go-ahead), handed the same task to the
 * colleague it belongs to (`reroute`, by agent id, never by role), or hit a technical fault meant for a person. Without
 * it a fault could not be told from an answer, and a fault cannot become a new task for another chief. Additive and
 * optional; the service consumes it (8385). A fault code is a short machine code, never free text to be parsed.
 */
exports.PAPERCLIP_DIRECTOR_RESOLUTION_KINDS = ['answer', 'reroute', 'technical_fault'];
exports.PaperclipDirectorResolutionSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('answer'), mode: zod_1.z.enum(['response', 'clearance']) }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('reroute'), assigneeAgentId: tools_js_2.PaperclipAgentIdSchema }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('technical_fault'), faultCode: Text.max(120) }),
]);
const ANSWER_OUTCOME_LINES = { approved: 'Esito: approvato.', not_approved: 'Esito: non approvato.', forbidden: 'Esito: vietato.' };
const ANSWER_ACTOR_WORDS = { asker: 'tu', director: 'il Director', referent: 'il referente' };
/** Fixed Italian lines (the readers are the company's agents) composed from the answer; pure. */
function paperclipDirectorAnswerLines(answer) {
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
        if (lift.source !== undefined) {
            lines.push(`Fonte del ricontrollo: Memoria, richiesta ${lift.source.requestId}. Al ricontrollo nativo rileggi la richiesta e l'esito: né il tempo trascorso né lo stato decided danno da soli il via libera.`);
        }
    }
    return lines.join('\n');
}
/**
 * Lab requests (8382). The Lab used to receive free text: the topics never reached acceptanceCriteria and the closing
 * did not say which pages cover each topic. `labRequest` carries question, why and topics (written by the asker); the
 * parent and the addressee are service data, never trusted from the model. Additive and optional: the general create
 * contract is unchanged (8386 will require it for new Lab requests). No plan is required, the Director may ask the Lab
 * before a plan exists.
 */
const LabText = (max) => zod_1.z.string().trim().min(1).max(max);
const LabTopic = LabText(wire_creazione_js_1.PAPERCLIP_CRITERIO_MAX);
const uniqueTexts = (values) => new Set(values).size === values.length;
exports.PaperclipLabRequestSchema = zod_1.z.strictObject({
    question: LabText(2000),
    why: LabText(2000),
    topics: zod_1.z.array(LabTopic).min(1).max(wire_creazione_js_1.PAPERCLIP_CRITERI_MASSIMI).refine(uniqueTexts, 'Topics must be unique'),
    recipient: tools_js_1.LabPublicationRecipientSchema,
});
/** Native acceptance criteria are exactly the requested topics, not a second list with other names. */
function paperclipLabAcceptanceCriteria(request) {
    return [...request.topics];
}
const LabPageSchema = zod_1.z.strictObject({ slug: wiki_js_1.WikiPageSchema.shape.slug, version: wiki_js_1.WikiPageSchema.shape.version, digest: asset_js_1.AssetSha256Schema });
const LabTopicRowSchema = zod_1.z.discriminatedUnion('coverage', [
    zod_1.z.strictObject({ topic: LabTopic, coverage: zod_1.z.literal('covered'), pages: zod_1.z.array(LabPageSchema).min(1).max(50) }),
    zod_1.z.strictObject({ topic: LabTopic, coverage: zod_1.z.literal('gap'), reason: LabText(2000) }),
]);
/** One row per requested topic: covered by published pages (slug, version, digest) or a declared gap with its reason. */
exports.PaperclipLabAnswerSchema = zod_1.z.strictObject({
    topics: zod_1.z.array(LabTopicRowSchema).min(1).max(wire_creazione_js_1.PAPERCLIP_CRITERI_MASSIMI)
        .refine(rows => uniqueTexts(rows.map(row => row.topic)), 'A topic is answered once'),
});
/** Undefined when the answer has exactly one row for every requested topic and no other; else the problem. */
function paperclipLabCoverageProblem(request, answer) {
    const requested = new Set(request.topics);
    const answered = new Set(answer.topics.map(row => row.topic));
    if (requested.size !== answered.size)
        return 'The answer must have exactly one row for each requested topic';
    if (answer.topics.length !== answered.size)
        return 'A topic is answered more than once';
    for (const topic of answered)
        if (!requested.has(topic))
            return `Topic not requested: ${topic}`;
    return undefined;
}
/** What the asker decides on the Lab's answer: the parent is kept open, never closed by this review. */
exports.PAPERCLIP_LAB_REVIEW_OUTCOMES = ['accepted', 'changes_requested'];
exports.PaperclipLabReviewSchema = zod_1.z.strictObject({
    childIssueId: zod_1.z.uuid(),
    answerCommentId: zod_1.z.uuid(),
    outcome: zod_1.z.enum(exports.PAPERCLIP_LAB_REVIEW_OUTCOMES),
    comment: LabText(4000),
    missingTopics: zod_1.z.array(LabTopic).min(1).max(wire_creazione_js_1.PAPERCLIP_CRITERI_MASSIMI).refine(uniqueTexts, 'Missing topics must be unique').optional(),
}).superRefine((value, ctx) => {
    if (value.outcome === 'accepted' && value.missingTopics !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['missingTopics'], message: 'An accepted answer has no missing topics' });
    }
    if (value.outcome === 'changes_requested' && value.missingTopics === undefined) {
        ctx.addIssue({ code: 'custom', path: ['missingTopics'], message: 'changes_requested names the missing topics' });
    }
});
/** The service-verified facts the request record adds to the contract; the model never supplies them. */
exports.PaperclipLabRequestRecordSchema = exports.PaperclipLabRequestSchema.safeExtend({
    requesterAgentId: zod_1.z.uuid(), parentIssueId: zod_1.z.uuid(),
});
const LAB_MARKERS = { request: 'x9-lab-request:v1', answer: 'x9-lab-answer:v1', review: 'x9-lab-review:v1' };
/** The records are service-owned: model prose may not carry any of their delimiters. */
function paperclipLabFreeTextProblem(text) {
    return Object.values(LAB_MARKERS).some(marker => text.includes(marker)) ? 'Reserved Lab record marker in free text' : undefined;
}
function labRecord(marker, value) {
    const json = JSON.stringify(value);
    const problem = paperclipLabFreeTextProblem(json);
    if (problem !== undefined)
        throw new Error(problem);
    return '```' + marker + '\n' + json + '\n```';
}
/** Absent marker = historical text (undefined); a broken or doubled record throws, never falls back. */
function parseLabRecord(marker, text, schema) {
    const count = text.split(marker).length - 1;
    if (count === 0)
        return undefined;
    if (count !== 1)
        throw new Error(`Expected exactly one ${marker} record`);
    const match = new RegExp('(?:^|\\r?\\n)```' + marker + '\\r?\\n([\\s\\S]*?)\\r?\\n```(?=\\r?\\n|$)').exec(text);
    if (match === null)
        throw new Error(`Malformed ${marker} record`);
    return schema.parse(JSON.parse(match[1]));
}
const paperclipLabRequestRecord = (value) => labRecord(LAB_MARKERS.request, exports.PaperclipLabRequestRecordSchema.parse(value));
exports.paperclipLabRequestRecord = paperclipLabRequestRecord;
const parsePaperclipLabRequestRecord = (text) => parseLabRecord(LAB_MARKERS.request, text, exports.PaperclipLabRequestRecordSchema);
exports.parsePaperclipLabRequestRecord = parsePaperclipLabRequestRecord;
/** The comment id is given by Paperclip when the record is posted, never by the Lab: it is not in the record. */
const paperclipLabAnswerRecord = (value) => labRecord(LAB_MARKERS.answer, exports.PaperclipLabAnswerSchema.parse(value));
exports.paperclipLabAnswerRecord = paperclipLabAnswerRecord;
const parsePaperclipLabAnswerRecord = (text) => parseLabRecord(LAB_MARKERS.answer, text, exports.PaperclipLabAnswerSchema);
exports.parsePaperclipLabAnswerRecord = parsePaperclipLabAnswerRecord;
const paperclipLabReviewRecord = (value) => labRecord(LAB_MARKERS.review, exports.PaperclipLabReviewSchema.parse(value));
exports.paperclipLabReviewRecord = paperclipLabReviewRecord;
const parsePaperclipLabReviewRecord = (text) => parseLabRecord(LAB_MARKERS.review, text, exports.PaperclipLabReviewSchema);
exports.parsePaperclipLabReviewRecord = parsePaperclipLabReviewRecord;
/**
 * `paperclip_review` with every durable disposition Paperclip accepts: `blocked` with what it waits for (tasks, or the
 * external action the agent owns), or the task kept `in_progress` with a scheduled check of an async job (P-15). The
 * check lives in review, not in a tool of its own, because a new write tool needs a policy decision of the agent
 * (agent-core asks a human for unknown writes) while review is already granted to every Paperclip agent.
 */
const NativeReviewBase = tools_js_2.PaperclipReviewInputSchema.extend({
    status: zod_1.z.enum(['in_review', 'done', 'blocked', 'in_progress']),
    blockedByIssueIds: IssueIds.optional(),
    waitingFor: exports.PaperclipWaitingForSchema.optional(),
    checkLater: exports.PaperclipCheckLaterSchema.optional(),
    answer: exports.PaperclipDirectorAnswerSchema.optional(),
    resolution: exports.PaperclipDirectorResolutionSchema.optional(),
    labAnswer: exports.PaperclipLabAnswerSchema.optional(),
    labReview: exports.PaperclipLabReviewSchema.optional(),
});
/** The resolution rules; each one needs the answer (8250) to be present, which the first guard enforces on its own. */
function checkResolution(value, ctx, routes) {
    const resolution = value.resolution;
    if (resolution === undefined)
        return;
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (value.resolution !== undefined && value.answer === undefined) {
        issue('answer', 'A resolution needs the answer: no negative reply without how to fix');
    }
    if (value.comment === undefined)
        issue('comment', 'A resolution needs a non-empty comment');
    if (value.ask !== undefined || value.blockedByIssueIds !== undefined || value.waitingFor !== undefined || value.checkLater !== undefined) {
        issue('resolution', 'A resolution carries no ask or wait');
    }
    if (routes && value.status !== 'in_review')
        issue('status', 'reroute and technical_fault require status in_review (routing intent)');
    if (!routes && value.status !== 'done')
        issue('status', 'An answer resolution requires status done');
    const answer = value.answer;
    if (answer === undefined)
        return;
    if (answer.outcome !== 'approved' && (answer.howToFix?.tool === undefined || answer.howToFix.tool.length === 0)) {
        issue('answer', 'With a resolution, a negative answer names the tool of howToFix');
    }
    if (routes && answer.outcome === 'approved')
        issue('answer', 'reroute and technical_fault need an answer that is not approved');
    if (resolution.kind === 'answer' && resolution.mode === 'clearance' && answer.outcome !== 'approved') {
        issue('answer', 'clearance needs an approved answer');
    }
}
/** labAnswer closes the child as a result the asker must judge; labReview concerns the parent, which stays open. */
function checkLabReview(value, ctx) {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    const others = value.ask !== undefined || value.blockedByIssueIds !== undefined || value.waitingFor !== undefined
        || value.resolution !== undefined || value.answer !== undefined;
    if (value.labAnswer !== undefined) {
        if (value.status !== 'done' || others || value.checkLater !== undefined || value.labReview !== undefined) {
            issue('labAnswer', 'labAnswer requires status done and no other wait, answer, resolution or labReview');
        }
    }
    if (value.labReview !== undefined) {
        if (value.status !== 'in_progress' || value.checkLater === undefined || others) {
            issue('labReview', 'labReview keeps the parent in_progress with checkLater, never done, without answer, resolution or ask');
        }
    }
}
function checkNativeReview(value, ctx) {
    checkLabReview(value, ctx);
    if (value.ask !== undefined && (value.status !== 'in_review' || value.blockedByIssueIds !== undefined
        || value.waitingFor !== undefined || value.checkLater !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['ask'], message: 'ask requires status in_review and no other wait' });
    }
    const routes = value.resolution?.kind === 'reroute' || value.resolution?.kind === 'technical_fault';
    if (value.answer !== undefined && ((value.status !== 'done' && !routes) || value.ask !== undefined || value.blockedByIssueIds !== undefined
        || value.waitingFor !== undefined || value.checkLater !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answer requires status done and no ask or wait' });
    }
    checkResolution(value, ctx, routes);
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
exports.PaperclipNativeReviewInputSchema = NativeReviewBase.extend({ ask: exports.PaperclipAskSchema.optional() })
    .superRefine(checkNativeReview);
/** `paperclip_create_issue` that also declares the wait: the parent stays blocked until this child is done. */
exports.PaperclipNativeCreateIssueInputSchema = tools_js_2.PaperclipCreateIssueInputSchema.extend({
    waitForChild: zod_1.z.boolean().optional(),
}).superRefine((value, ctx) => {
    if (value.waitForChild === true && (value.parentIssueId === undefined || value.assigneeRoleRef === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: 'Waiting for a child requires parentIssueId and assigneeRoleRef' });
    }
});
/** Create inputs (by role, by id, and their native forms with waitForChild) that can also carry `labRequest`. */
const LabRequestField = { labRequest: exports.PaperclipLabRequestSchema.optional() };
function checkWaitForChild(value, ctx, assignee, name) {
    if (value.waitForChild === true && (value.parentIssueId === undefined || assignee === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: `Waiting for a child requires parentIssueId and ${name}` });
    }
}
exports.PaperclipLabCreateIssueInputSchema = tools_js_2.PaperclipCreateIssueInputSchema.extend(LabRequestField);
exports.PaperclipLabCreateIssueAgentInputSchema = tools_js_2.PaperclipCreateIssueAgentInputSchema.extend(LabRequestField);
exports.PaperclipLabNativeCreateIssueInputSchema = tools_js_2.PaperclipCreateIssueInputSchema.extend({ waitForChild: zod_1.z.boolean().optional(), ...LabRequestField })
    .superRefine((value, ctx) => checkWaitForChild(value, ctx, value.assigneeRoleRef, 'assigneeRoleRef'));
exports.PaperclipLabNativeCreateIssueAgentInputSchema = tools_js_2.PaperclipCreateIssueAgentInputSchema.extend({ waitForChild: zod_1.z.boolean().optional(), ...LabRequestField })
    .superRefine((value, ctx) => checkWaitForChild(value, ctx, value.assigneeAgentId, 'assigneeAgentId'));
const AnswerFields = {
    answersInteractionId: zod_1.z.uuid().optional(),
};
function requireAnswerText(value, ctx) {
    if (value.answersInteractionId !== undefined && value.comment === undefined) {
        ctx.addIssue({ code: 'custom', path: ['comment'], message: 'Answering an interaction requires the answer text in comment' });
    }
}
/** `paperclip_assign` that can also answer a question another agent put to the assignee (the comment is the answer). */
exports.PaperclipNativeAssignInputSchema = tools_js_2.PaperclipAssignInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
exports.PaperclipNativeAssignRefInputSchema = tools_js_2.PaperclipAssignRefInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
const AskPrompt = Text.max(exports.PAPERCLIP_ASK_QUESTION_MAX);
const AskPayload = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    questionSet: zod_1.z.strictObject({
        schema: zod_1.z.literal('paperclip.question_set.v1'),
        questions: zod_1.z.tuple([zod_1.z.strictObject({
                id: zod_1.z.literal(exports.PAPERCLIP_ASK_QUESTION_ID), prompt: AskPrompt, answerMode: zod_1.z.literal('text'), required: zod_1.z.literal(true),
            })]),
    }),
    questions: zod_1.z.tuple([zod_1.z.strictObject({
            id: zod_1.z.literal(exports.PAPERCLIP_ASK_QUESTION_ID), prompt: AskPrompt, selectionMode: zod_1.z.literal('single'), required: zod_1.z.literal(true),
            options: zod_1.z.tuple([zod_1.z.strictObject({ id: zod_1.z.literal('text'), label: zod_1.z.string().min(1).max(120), freeText: zod_1.z.literal(true) })]),
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
exports.PaperclipAskInteractionBodySchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('ask_user_questions'),
    idempotencyKey: zod_1.z.string().min(1).max(ASK_IDEMPOTENCY_KEY_MAX),
    addresseeAgentId: zod_1.z.uuid(),
    continuationPolicy: zod_1.z.literal('wake_assignee'),
    payload: AskPayload,
}).superRefine(requireSamePrompt);
/** Body of `POST /issues/:id/interactions/:interactionId/respond` for that question: free text, no option. */
exports.PaperclipAnswerInteractionBodySchema = zod_1.z.strictObject({
    answers: zod_1.z.tuple([zod_1.z.strictObject({
            questionId: zod_1.z.literal(exports.PAPERCLIP_ASK_QUESTION_ID), optionIds: zod_1.z.tuple([]), otherText: Text.max(exports.PAPERCLIP_ANSWER_MAX),
        })]),
});
/** `ask:<issueId>:<callId>`, at most 255 characters (throws beyond). */
function paperclipAskIdempotencyKey(issueId, callId) {
    const key = `ask:${issueId}:${callId}`;
    if (key.length > ASK_IDEMPOTENCY_KEY_MAX)
        throw new Error('Ask idempotency key longer than 255 characters');
    return key;
}
function paperclipAskInteractionBody(input) {
    return exports.PaperclipAskInteractionBodySchema.parse({
        kind: 'ask_user_questions', idempotencyKey: input.idempotencyKey, addresseeAgentId: input.addresseeAgentId,
        continuationPolicy: 'wake_assignee',
        payload: {
            version: 1,
            questionSet: { schema: 'paperclip.question_set.v1', questions: [{ id: exports.PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, answerMode: 'text', required: true }] },
            questions: [{ id: exports.PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, selectionMode: 'single', required: true,
                    options: [{ id: 'text', label: 'Risposta', freeText: true }] }],
        },
    });
}
function paperclipAnswerInteractionBody(text) {
    return exports.PaperclipAnswerInteractionBodySchema.parse({
        answers: [{ questionId: exports.PAPERCLIP_ASK_QUESTION_ID, optionIds: [], otherText: text.trim() }],
    });
}
/**
 * Closed vocabularies of the Paperclip interactions (cards in the issue thread). Source: Paperclip
 * packages/shared/src/constants.ts:259-267 (kinds), 269-294 (resolver policies), 331-348 (statuses, continuation policies) and
 * packages/shared/src/validators/issue.ts:1223-1227, 1448-1459, 1699-1711, 1866-1876 (outcomes). A value Paperclip adds later
 * fails a read here, loudly, instead of being read as something else.
 */
exports.PAPERCLIP_INTERACTION_KINDS = [
    'suggest_tasks', 'ask_user_questions', 'request_confirmation', 'request_checkbox_confirmation', 'request_item_verdicts', 'connection_intent',
];
/** The five kinds `POST /issues/:id/interactions` creates: `connection_intent` is made by the server only (validators/issue.ts:1944-2010). */
exports.PAPERCLIP_INTERACTION_CREATABLE_KINDS = [
    'suggest_tasks', 'ask_user_questions', 'request_confirmation', 'request_checkbox_confirmation', 'request_item_verdicts',
];
exports.PAPERCLIP_INTERACTION_STATUSES = ['pending', 'accepted', 'rejected', 'answered', 'cancelled', 'expired', 'failed'];
exports.PAPERCLIP_CONTINUATION_POLICIES = ['none', 'wake_assignee', 'wake_assignee_on_accept'];
/** Who may resolve a card. `anyone` is the default (the creating run included); `human_only` keeps agents out. */
exports.PAPERCLIP_RESOLVER_POLICIES = ['anyone', 'not_creator', 'human_only'];
/** Write-compatible aliases of one migration window (constants.ts:277-285): read them, never write them. */
exports.PAPERCLIP_RESOLVER_POLICY_ALIASES = ['board_or_agents', 'board_only'];
exports.PAPERCLIP_QUESTION_OUTCOMES = ['skipped', 'withdrawn', 'issue_closed', 'addressee_deleted'];
exports.PAPERCLIP_QUESTION_EXPIRATION_REASONS = ['superseded_by_comment', 'superseded_by_newer_interaction'];
exports.PAPERCLIP_CONFIRMATION_OUTCOMES = [
    'accepted', 'rejected', 'superseded_by_comment', 'superseded_by_newer_request', 'stale_target', 'skipped', 'withdrawn', 'issue_closed',
    'addressee_deleted',
];
exports.PaperclipInteractionKindSchema = zod_1.z.enum(exports.PAPERCLIP_INTERACTION_KINDS);
exports.PaperclipInteractionStatusSchema = zod_1.z.enum(exports.PAPERCLIP_INTERACTION_STATUSES);
exports.PaperclipContinuationPolicySchema = zod_1.z.enum(exports.PAPERCLIP_CONTINUATION_POLICIES);
exports.PaperclipResolverPolicySchema = zod_1.z.enum(exports.PAPERCLIP_RESOLVER_POLICIES);
exports.PaperclipResolverPolicyReadSchema = zod_1.z.enum([...exports.PAPERCLIP_RESOLVER_POLICIES, ...exports.PAPERCLIP_RESOLVER_POLICY_ALIASES]);
/** Paperclip normalizes the two aliases (constants.ts:296-302); the ponte does the same when it reads a card. */
function paperclipNormalizeResolverPolicy(policy) {
    return policy === 'board_or_agents' ? 'anyone' : policy === 'board_only' ? 'human_only' : policy;
}
/** A card as Paperclip returns it, read tolerantly: the kind and the status are closed, the rest passes. */
exports.PaperclipInteractionReadSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(), kind: exports.PaperclipInteractionKindSchema, status: exports.PaperclipInteractionStatusSchema,
    addresseeAgentId: tools_js_2.PaperclipAgentIdSchema.nullish(),
});
exports.PaperclipQuestionResultSchema = zod_1.z.looseObject({
    outcome: zod_1.z.enum(exports.PAPERCLIP_QUESTION_OUTCOMES).optional(), expirationReason: zod_1.z.enum(exports.PAPERCLIP_QUESTION_EXPIRATION_REASONS).optional(),
});
exports.PaperclipConfirmationResultSchema = zod_1.z.looseObject({ outcome: zod_1.z.enum(exports.PAPERCLIP_CONFIRMATION_OUTCOMES) });
/**
 * Where the question card of the bridge is narrower than Paperclip's `ask_user_questions` (validators/issue.ts:1251, 1270, 1371, 1390),
 * declared: one free-text question per card, and a prompt of at most 2000 characters where Paperclip takes 4000 (the bridge asks one thing at a time).
 */
exports.PAPERCLIP_ASK_DECLARED_CHOICES = {
    questionsPerCard: { ours: 1, paperclip: 64 },
    promptMax: { ours: exports.PAPERCLIP_ASK_QUESTION_MAX, paperclip: 4000 },
};
/**
 * Who a question is put to, with the recipient as an id: `agent` (the card is addressed to that agent, Paperclip wakes it with
 * `interaction_pending`, no `resolverPolicy`: SKILL.md:169,602) or `person` (a human answers: `resolverPolicy: human_only`, nobody is
 * named, the card stays open to the eligible humans; `addresseeUserId` is not offered because the stack has no exact Paperclip user id,
 * api-reference.md:927-928). `PaperclipAskSchema.roleRef` is deprecated.
 */
exports.PAPERCLIP_ASK_TARGETS = ['agent', 'person'];
exports.PaperclipAddressedAskSchema = zod_1.z.discriminatedUnion('to', [
    zod_1.z.strictObject({ to: zod_1.z.literal('agent'), addresseeAgentId: tools_js_2.PaperclipAgentIdSchema, question: AskPrompt }),
    zod_1.z.strictObject({ to: zod_1.z.literal('person'), question: AskPrompt }),
]);
/** `paperclip_review` that asks an agent or a person with the recipient as an id; same waits and same checks as the native review. */
exports.PaperclipNativeReviewAddressedInputSchema = NativeReviewBase.extend({ ask: exports.PaperclipAddressedAskSchema.optional() })
    .superRefine(checkNativeReview);
/** `paperclip_assign` by id that can also answer a question put to the assignee. */
exports.PaperclipNativeAssignAgentInputSchema = tools_js_2.PaperclipAssignAgentInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
exports.PaperclipNativeAssignAgentRefInputSchema = tools_js_2.PaperclipAssignAgentRefInputSchema.extend(AnswerFields).superRefine(requireAnswerText);
/** `paperclip_create_issue` by id that also declares the wait: the parent stays blocked until the child is done. */
exports.PaperclipNativeCreateIssueAgentInputSchema = tools_js_2.PaperclipCreateIssueAgentInputSchema.extend({
    waitForChild: zod_1.z.boolean().optional(),
}).superRefine((value, ctx) => {
    if (value.waitForChild === true && (value.parentIssueId === undefined || value.assigneeAgentId === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: 'Waiting for a child requires parentIssueId and assigneeAgentId' });
    }
});
/** Paperclip refuses an interaction an agent addresses to itself (422, services/issue-thread-interactions.ts:3384-3388). */
exports.PAPERCLIP_ASK_REFUSALS = ['ask_to_self'];
function decidePaperclipAsk(selfAgentId, ask) {
    return ask.to === 'agent' && ask.addresseeAgentId === selfAgentId ? { ok: false, refusal: 'ask_to_self' } : { ok: true };
}
/**
 * Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) for a PERSON: `resolverPolicy: human_only`,
 * `continuationPolicy: wake_assignee`, no addressee (api-reference.md:994-1002). The task then goes `in_review`, unchanged assignee,
 * after the card is verified `pending`; never a blocker with owner `user` or `board`.
 */
exports.PaperclipAskPersonInteractionBodySchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('ask_user_questions'),
    idempotencyKey: zod_1.z.string().min(1).max(ASK_IDEMPOTENCY_KEY_MAX),
    title: zod_1.z.string().trim().min(1).max(240).optional(),
    resolverPolicy: zod_1.z.literal('human_only'),
    continuationPolicy: zod_1.z.literal('wake_assignee'),
    payload: AskPayload,
}).superRefine(requireSamePrompt);
/** `ask-person:<issueId>:<callId>`, at most 255 characters (throws beyond). */
function paperclipAskPersonIdempotencyKey(issueId, callId) {
    const key = `ask-person:${issueId}:${callId}`;
    if (key.length > ASK_IDEMPOTENCY_KEY_MAX)
        throw new Error('Ask idempotency key longer than 255 characters');
    return key;
}
function paperclipAskPersonInteractionBody(input) {
    return exports.PaperclipAskPersonInteractionBodySchema.parse({
        kind: 'ask_user_questions', idempotencyKey: input.idempotencyKey, ...(input.title === undefined ? {} : { title: input.title }),
        resolverPolicy: 'human_only', continuationPolicy: 'wake_assignee',
        payload: {
            version: 1,
            questionSet: { schema: 'paperclip.question_set.v1', questions: [{ id: exports.PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, answerMode: 'text', required: true }] },
            questions: [{ id: exports.PAPERCLIP_ASK_QUESTION_ID, prompt: input.question, selectionMode: 'single', required: true,
                    options: [{ id: 'text', label: 'Risposta', freeText: true }] }],
        },
    });
}
/**
 * The plan confirmation with the two policies Paperclip lets the creator choose. The default stays what it is today (no field:
 * `continuationPolicy: none`, `resolverPolicy: anyone`); `wake_assignee_on_accept` makes Paperclip wake the assignee when the
 * plan is accepted, which today nothing does (routes/issues.ts:2595-2602). Choosing it is an adoption decision, not made here.
 */
exports.PaperclipConfermaConPoliticheCorpoSchema = wire_scritture_js_1.PaperclipConfermaCorpoSchema.extend({
    resolverPolicy: exports.PaperclipResolverPolicySchema.optional(),
    continuationPolicy: exports.PaperclipContinuationPolicySchema.optional(),
});
/** One-shot Paperclip monitor on a task the agent owns, for an async job it will check later (no recurring interval). */
exports.PaperclipCheckLaterInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(),
    afterSeconds: zod_1.z.number().int().min(30).max(exports.PAPERCLIP_CHECK_LATER_MAX_SECONDS),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
    waitsOn: exports.PaperclipWaitsOnSchema.optional(),
    followUp: exports.PaperclipFollowUpSchema.optional(),
});
exports.PaperclipCheckLaterOutputSchema = zod_1.z.strictObject({
    issue: tools_js_2.PaperclipIssueViewSchema,
    nextCheckAt: zod_1.z.iso.datetime({ offset: true }),
});
//# sourceMappingURL=native-wait.js.map