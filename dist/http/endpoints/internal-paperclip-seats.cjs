"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipSeatSessionContractResultSchema = exports.PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS = exports.InternalPaperclipSeatSessionContractRequestSchema = exports.INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH = exports.internalPaperclipSeatSessionChildContract = exports.InternalPaperclipSeatSessionChildResponseSchema = exports.PaperclipSeatSessionChildResultSchema = exports.PAPERCLIP_SEAT_SESSION_CHILD_RESULTS = exports.InternalPaperclipSeatSessionChildRequestSchema = exports.DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX = exports.INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH = exports.internalPaperclipSeatNativeWakeContract = exports.InternalPaperclipSeatNativeWakeResponseSchema = exports.PaperclipSeatNativeWakeResultSchema = exports.PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS = exports.InternalPaperclipSeatNativeWakeRequestSchema = exports.PaperclipSeatNativeWakeEventSchema = exports.PaperclipSeatResearchDoneDossierEntrySchema = exports.PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES = exports.INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH = exports.internalPaperclipSeatReplyWakeContract = exports.InternalPaperclipSeatWakeErrorResponseSchema = exports.PaperclipSeatWakeErrorCodeSchema = exports.PAPERCLIP_SEAT_WAKE_ERROR_CODES = exports.InternalPaperclipSeatReplyWakeResponseSchema = exports.PaperclipSeatReplyWakeViaSchema = exports.PAPERCLIP_SEAT_REPLY_WAKE_VIA = exports.PaperclipSeatReplyWakeResultSchema = exports.PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = exports.PAPERCLIP_SOURCE_RUN_REFUSALS = exports.InternalPaperclipSeatReplyWakeRequestSchema = exports.INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH = exports.internalPaperclipSeatActivityReadContract = exports.InternalPaperclipSeatActivityResponseSchema = exports.InternalPaperclipSeatActivityQuerySchema = exports.INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH = exports.internalPaperclipSeatSearchReadContract = exports.InternalPaperclipSeatSearchResponseSchema = exports.InternalPaperclipSeatSearchQuerySchema = exports.INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH = exports.internalPaperclipSeatIssuesReadContract = exports.InternalPaperclipSeatIssuesResponseSchema = exports.InternalPaperclipSeatIssueSchema = exports.InternalPaperclipSeatIssuesParamsSchema = exports.INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = exports.internalPaperclipSeatsReadContract = exports.InternalPaperclipSeatsResponseSchema = exports.InternalPaperclipSeatSchema = exports.InternalPaperclipSeatsQuerySchema = exports.INTERNAL_PAPERCLIP_SEATS_PATH = void 0;
exports.internalPaperclipSeatSessionProofsContract = exports.InternalPaperclipSeatSessionProofsResponseSchema = exports.PaperclipSeatSessionProofsResultSchema = exports.PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS = exports.InternalPaperclipSeatSessionProofsRequestSchema = exports.INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH = exports.internalPaperclipSeatSessionMandateContract = exports.InternalPaperclipSeatSessionMandateResponseSchema = exports.PaperclipSeatSessionMandateBindingSchema = exports.PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS = exports.PaperclipSeatSessionMandateResultSchema = exports.PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS = exports.InternalPaperclipSeatSessionMandateRequestSchema = exports.INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH = exports.internalPaperclipSeatSessionContractContract = exports.InternalPaperclipSeatSessionContractResponseSchema = void 0;
exports.sessionMandateBinding = sessionMandateBinding;
const zod_1 = require("zod");
const tool_call_js_1 = require("../../capability/tool-call.cjs");
const inbound_event_js_1 = require("../../capability/paperclip/inbound-event.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
const business_unit_mandate_js_1 = require("../../organization/business-unit-mandate.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
const asset_version_js_1 = require("../../organization/asset-version.cjs");
const session_acceptance_paperclip_js_1 = require("../../capability/dev/session-acceptance-paperclip.cjs");
const wire_documenti_js_1 = require("../../capability/paperclip-protocollo/wire-documenti.cjs");
const capability_call_identity_js_1 = require("../../capability/capability-call-identity.cjs");
const agent_request_js_1 = require("../../organization/agent-request.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const research_js_1 = require("../../capability/ricerca/research.cjs");
const session_assignment_js_1 = require("../../capability/dev/session-assignment.cjs");
const tools_js_1 = require("../../capability/paperclip/tools.cjs");
exports.INTERNAL_PAPERCLIP_SEATS_PATH = '/internal/paperclip/seats';
exports.InternalPaperclipSeatsQuerySchema = zod_1.z.strictObject({
    organizationId: zod_1.z.string().min(1).max(64),
});
/** Read-only seat status. Credential values must never cross this boundary. */
exports.InternalPaperclipSeatSchema = zod_1.z.strictObject({
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    paperclipAgentId: zod_1.z.uuid(),
    companyId: zod_1.z.uuid(),
    reportsToPaperclipAgentId: zod_1.z.uuid(),
    enrollment: zod_1.z.strictObject({
        state: zod_1.z.enum(['key_pending', 'enrolled']),
        attempts: zod_1.z.int().min(0),
        lastReason: zod_1.z.string().min(1).max(64).optional(),
        updatedAt: zod_1.z.iso.datetime(),
    }),
});
exports.InternalPaperclipSeatsResponseSchema = zod_1.z.strictObject({
    seats: zod_1.z.array(exports.InternalPaperclipSeatSchema).max(200),
});
exports.internalPaperclipSeatsReadContract = {
    method: 'GET',
    path: exports.INTERNAL_PAPERCLIP_SEATS_PATH,
    authType: 'secret',
    querySchema: exports.InternalPaperclipSeatsQuerySchema,
    responseSchema: exports.InternalPaperclipSeatsResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = '/internal/paperclip/seats/:paperclipAgentId/issues';
exports.InternalPaperclipSeatIssuesParamsSchema = zod_1.z.strictObject({
    paperclipAgentId: zod_1.z.uuid(),
});
exports.InternalPaperclipSeatIssueSchema = zod_1.z.strictObject({
    issueId: zod_1.z.string().min(1).max(64),
    title: zod_1.z.string().min(1).max(300),
    status: zod_1.z.string().min(1).max(32),
    projectId: zod_1.z.uuid().nullable(),
    goalId: zod_1.z.uuid().nullable(),
    assigneeComments: zod_1.z.int().min(0),
});
exports.InternalPaperclipSeatIssuesResponseSchema = zod_1.z.strictObject({
    paperclipAgentId: zod_1.z.uuid(),
    issues: zod_1.z.array(exports.InternalPaperclipSeatIssueSchema).max(100),
});
exports.internalPaperclipSeatIssuesReadContract = {
    method: 'GET',
    path: exports.INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalPaperclipSeatIssuesParamsSchema,
    responseSchema: exports.InternalPaperclipSeatIssuesResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH = '/internal/paperclip/seats/:paperclipAgentId/search';
const SEARCH_KIND_ALTERNATION = tools_js_1.PaperclipSearchKindSchema.options.join('|');
const SEARCH_KINDS_PATTERN = new RegExp(`^(?:${SEARCH_KIND_ALTERNATION})(?:,(?:${SEARCH_KIND_ALTERNATION}))*$`);
exports.InternalPaperclipSeatSearchQuerySchema = zod_1.z.strictObject({
    q: tools_js_1.PaperclipSearchInputSchema.shape.query,
    kinds: zod_1.z.string().regex(SEARCH_KINDS_PATTERN)
        .refine(value => new Set(value.split(',')).size === value.split(',').length, 'Search kinds must be unique')
        .optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
});
exports.InternalPaperclipSeatSearchResponseSchema = zod_1.z.strictObject({
    paperclipAgentId: zod_1.z.uuid(),
    ...tools_js_1.PaperclipSearchOutputSchema.shape,
});
exports.internalPaperclipSeatSearchReadContract = {
    method: 'GET',
    path: exports.INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalPaperclipSeatIssuesParamsSchema,
    querySchema: exports.InternalPaperclipSeatSearchQuerySchema,
    responseSchema: exports.InternalPaperclipSeatSearchResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH = '/internal/paperclip/seats/:paperclipAgentId/activity';
exports.InternalPaperclipSeatActivityQuerySchema = zod_1.z.strictObject({
    since: tools_js_1.PaperclipActivityInputSchema.shape.since,
    issueId: tools_js_1.PaperclipActivityInputSchema.shape.issueId,
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
});
exports.InternalPaperclipSeatActivityResponseSchema = zod_1.z.strictObject({
    paperclipAgentId: zod_1.z.uuid(),
    ...tools_js_1.PaperclipActivityOutputSchema.shape,
});
exports.internalPaperclipSeatActivityReadContract = {
    method: 'GET',
    path: exports.INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalPaperclipSeatIssuesParamsSchema,
    querySchema: exports.InternalPaperclipSeatActivityQuerySchema,
    responseSchema: exports.InternalPaperclipSeatActivityResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH = '/internal/paperclip/seats/reply-wake';
// Una risposta email esterna è arrivata a un agente dell'organizzazione: cap-paperclip lo sveglia sul Mandato
// che ha messo `blocked` con la propria attesa, e su nient'altro. `messageId` è la chiave di idempotenza.
exports.InternalPaperclipSeatReplyWakeRequestSchema = zod_1.z.strictObject({
    organizationId: exports.InternalPaperclipSeatsQuerySchema.shape.organizationId,
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    messageId: zod_1.z.string().min(1).max(998).refine(v => v.trim().length > 0, 'Non-blank message id required'),
    // The Paperclip run in which the agent sent the email this one answers; cap-paperclip reads the incarico from that run, never from the text.
    sourceRunId: run_context_js_1.RunIdSchema.optional(),
});
exports.PAPERCLIP_SOURCE_RUN_REFUSALS = [
    'source_run_unknown', // The run does not exist for this agent.
    'source_run_without_issue', // The run has no incarico.
    'source_issue_not_agents', // The incarico does not belong to this agent.
    'source_issue_closed', // The incarico is closed.
];
exports.PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = [
    'woken', 'skipped', 'duplicate', 'not_waiting', 'no_mandate', 'ambiguous', ...exports.PAPERCLIP_SOURCE_RUN_REFUSALS,
];
exports.PaperclipSeatReplyWakeResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_REPLY_WAKE_RESULTS);
/**
 * How a `woken` answer reached the agent when no run id is known: `monitor_check` = cap-paperclip asked Paperclip to run the
 * issue's scheduled monitor now (POST /api/issues/:id/monitor/check-now) and Paperclip wakes the assignee with `issue_monitor_due`.
 */
exports.PAPERCLIP_SEAT_REPLY_WAKE_VIA = ['monitor_check'];
exports.PaperclipSeatReplyWakeViaSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_REPLY_WAKE_VIA);
exports.InternalPaperclipSeatReplyWakeResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatReplyWakeResultSchema,
    issueId: zod_1.z.uuid().optional(),
    runId: zod_1.z.uuid().optional(),
    disposition: inbound_event_js_1.InboundEventDispositionSchema.optional(),
    via: exports.PaperclipSeatReplyWakeViaSchema.optional(),
}).superRefine((value, ctx) => {
    if (value.result === 'woken' && (value.issueId === undefined || (value.runId === undefined && value.via === undefined))) {
        ctx.addIssue({ code: 'custom', message: 'woken requires issueId and runId', path: ['runId'] });
    }
    if (value.via !== undefined && (value.result !== 'woken' || value.runId !== undefined || value.disposition !== undefined)) {
        ctx.addIssue({ code: 'custom', message: 'via monitor_check is only a woken answer without runId and disposition', path: ['via'] });
    }
    if (value.result !== 'woken' && value.runId !== undefined) {
        ctx.addIssue({ code: 'custom', message: 'runId is only allowed with woken', path: ['runId'] });
    }
    if ((value.result === 'skipped' || value.result === 'not_waiting' || value.result === 'source_issue_closed') && value.issueId === undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
    }
    if ((value.result === 'no_mandate' || value.result === 'ambiguous' || value.result === 'source_run_unknown'
        || value.result === 'source_run_without_issue' || value.result === 'source_issue_not_agents')
        && value.issueId !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
    }
    const disposition = value.disposition;
    if (disposition?.outcome === 'commented' && disposition.woke) {
        if (value.result !== 'woken') {
            ctx.addIssue({ code: 'custom', message: 'A woken disposition requires result woken', path: ['result'] });
        }
        if (value.issueId !== disposition.issueId) {
            ctx.addIssue({ code: 'custom', message: 'Disposition issueId must match the response', path: ['disposition', 'issueId'] });
        }
        if (value.runId !== undefined && disposition.runId !== undefined && value.runId !== disposition.runId) {
            ctx.addIssue({ code: 'custom', message: 'Disposition runId must match the response', path: ['disposition', 'runId'] });
        }
    }
    if (disposition?.outcome === 'duplicate' && value.result !== 'duplicate') {
        ctx.addIssue({ code: 'custom', message: 'A duplicate disposition requires result duplicate', path: ['result'] });
    }
});
/**
 * Error codes of a failed seat wake. They name whose fault the failure is.
 * - `paperclip_unavailable`: Paperclip answered with an error or could not be reached.
 * - `wake_timeout`: OUR time limit ran out while Paperclip was answering; Paperclip is not in error.
 */
exports.PAPERCLIP_SEAT_WAKE_ERROR_CODES = ['paperclip_unavailable', 'wake_timeout'];
exports.PaperclipSeatWakeErrorCodeSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_WAKE_ERROR_CODES);
exports.InternalPaperclipSeatWakeErrorResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: exports.PaperclipSeatWakeErrorCodeSchema,
});
exports.internalPaperclipSeatReplyWakeContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatReplyWakeRequestSchema,
    responseSchema: exports.InternalPaperclipSeatReplyWakeResponseSchema,
    errorResponseSchema: exports.InternalPaperclipSeatWakeErrorResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH = '/internal/paperclip/seats/native-wake';
exports.PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES = ['request', 'reply', 'decision'];
exports.PaperclipSeatResearchDoneDossierEntrySchema = zod_1.z.strictObject({
    researchId: research_js_1.ResearchIdSchema,
    state: research_js_1.ResearchStateSchema,
});
exports.PaperclipSeatNativeWakeEventSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        kind: zod_1.z.literal('email'),
        messageId: exports.InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
        threadKey: exports.InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
        mode: zod_1.z.enum(exports.PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES),
        // Memory A project of the decision request this email answers, when cap-email knows it; never guessed.
        projectRef: decision_request_js_1.DecisionRequestSchema.shape.projectId,
        // The Paperclip run in which the agent sent the email this one answers; cap-paperclip reads the incarico from that run, never from the text.
        sourceRunId: run_context_js_1.RunIdSchema.optional(),
        from: zod_1.z.string().min(1).max(320),
        subject: zod_1.z.string().min(1).max(300),
        receivedAt: zod_1.z.iso.datetime(),
        excerpt: zod_1.z.string().max(8000),
        attachments: zod_1.z.array(zod_1.z.strictObject({
            name: zod_1.z.string().min(1).max(255),
            contentType: zod_1.z.string().min(1).max(255),
            size: zod_1.z.int().min(0),
        })).max(20),
        decision: zod_1.z.strictObject({
            requestId: decision_request_js_1.DecisionRequestIdSchema,
            outcome: zod_1.z.union(decision_request_js_1.DecisionOutcomeSchema.options.map(o => o.shape.outcome)),
        }).optional(),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('research_done'),
        researchId: research_js_1.ResearchIdSchema,
        state: research_js_1.ResearchStateSchema,
        question: zod_1.z.string().min(1).max(1000),
        // Tutte le ricerche del dossier chiuse da questa sveglia, l'evento compreso; senza dossier: la sola ricerca dell'evento.
        dossier: zod_1.z.array(exports.PaperclipSeatResearchDoneDossierEntrySchema).min(1).max(20).optional(),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('dev_delivered'),
        sessionIssue: session_assignment_js_1.DevSessionResultSchema.shape.issue,
        commit: session_assignment_js_1.DevSessionCommitSchema,
        projectId: session_assignment_js_1.DevSessionAssignmentSchema.shape.projectId,
        // The Paperclip run in which the chief opened the session; cap-paperclip reads the issue from that run, never from the text.
        sourceRunId: run_context_js_1.RunIdSchema.optional(),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('work_stalled'),
        issueId: zod_1.z.uuid(),
        identifier: zod_1.z.string().min(1).max(40),
        title: zod_1.z.string().min(1).max(300),
        unitId: zod_1.z.string().min(1).max(200),
        status: tools_js_1.PaperclipIssueStatusSchema,
        stalledSince: zod_1.z.iso.datetime({ offset: true }),
        reason: zod_1.z.enum(['no_activity', 'waiting_too_long', 'queue_not_continued']),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('approved_units_failed'),
        requestId: decision_request_js_1.DecisionRequestIdSchema,
        directorIssueId: zod_1.z.uuid(),
        units: zod_1.z.array(zod_1.z.strictObject({
            unitId: zod_1.z.string().min(1).max(200),
            reason: zod_1.z.string().min(1).max(200),
        })).min(1).max(20),
        attempt: zod_1.z.int().min(1).max(10),
        maxAttempts: zod_1.z.int().min(1).max(10),
    }).refine(e => e.attempt <= e.maxAttempts, { path: ['attempt'], message: 'attempt must not exceed maxAttempts' }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('agent_request'), request: agent_request_js_1.AgentRequestSchema }),
    // The final project delivery was sent and recorded (`ProjectDeliveryRecord` stage `sent`, kind `final`); `digest` is the
    // reconciliation digest and makes the event idempotent; sent by cap-email, never by the model.
    zod_1.z.strictObject({
        kind: zod_1.z.literal('project_delivered'),
        projectId: asset_js_1.AssetRefSchema.shape.projectId,
        messageId: zod_1.z.string().min(1).max(512),
        sentAt: zod_1.z.iso.datetime({ offset: true }),
        digest: asset_js_1.AssetSha256Schema,
    }),
    // The company spend cap no longer holds this agent back; sent by agent-core, once per agent, never by the model.
    zod_1.z.strictObject({
        kind: zod_1.z.literal('limit_lifted'),
        limit: zod_1.z.literal('company_spend'),
        revision: zod_1.z.int().min(1),
        liftedAt: zod_1.z.iso.datetime({ offset: true }),
    }),
]);
// Un evento del prodotto (email ammessa, ricerca finita, consegna verificata) apre o risveglia l'incarico Paperclip
// dell'agente, come il canale email di Paperclip: incarico assegnato a sé (sveglia d'assegnazione) oppure commento
// più `wakeup` `automation`/`callback`. `eventId` è la chiave di idempotenza.
exports.InternalPaperclipSeatNativeWakeRequestSchema = zod_1.z.strictObject({
    scope: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    eventId: zod_1.z.string().min(1).max(200).refine(v => v.trim().length > 0, 'Non-blank event id required'),
    organizationId: exports.InternalPaperclipSeatsQuerySchema.shape.organizationId.optional(),
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema.optional(),
    event: exports.PaperclipSeatNativeWakeEventSchema,
}).superRefine((value, ctx) => {
    if (value.event.kind !== 'research_done') {
        if (value.organizationId === undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.event.kind} requires organizationId`, path: ['organizationId'] });
        }
        if (value.identity === undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.event.kind} requires identity`, path: ['identity'] });
        }
    }
    if (value.identity !== undefined && value.identity.runtimeAgentId !== value.scope.agentId) {
        ctx.addIssue({ code: 'custom', message: 'identity.runtimeAgentId must equal scope.agentId', path: ['identity', 'runtimeAgentId'] });
    }
    if (value.event.kind === 'research_done' && value.event.dossier !== undefined) {
        const { researchId, state, dossier } = value.event;
        const own = dossier.find(d => d.researchId === researchId);
        if (own === undefined || own.state !== state) {
            ctx.addIssue({ code: 'custom', message: 'dossier must include the event research with the same state', path: ['event', 'dossier'] });
        }
        if (new Set(dossier.map(d => d.researchId)).size !== dossier.length) {
            ctx.addIssue({ code: 'custom', message: 'dossier must not repeat a researchId', path: ['event', 'dossier'] });
        }
    }
    if (value.event.kind === 'email') {
        if (value.event.mode === 'request' && value.event.sourceRunId !== undefined) {
            ctx.addIssue({ code: 'custom', message: 'sourceRunId needs a reply or a decision', path: ['event', 'sourceRunId'] });
        }
        const isDecision = value.event.mode === 'decision';
        if (isDecision && value.event.decision === undefined) {
            ctx.addIssue({ code: 'custom', message: 'decision mode requires decision', path: ['event', 'decision'] });
        }
        if (!isDecision && value.event.decision !== undefined) {
            ctx.addIssue({ code: 'custom', message: 'decision is only allowed with decision mode', path: ['event', 'decision'] });
        }
    }
});
// For `limit_lifted`, `deferred` (with the issueId) means "check requested from Paperclip" and `no_task` means "no issue waiting on the cap".
exports.PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS = [
    'opened', 'woken', 'deferred', 'duplicate', 'already_open', 'not_waiting', 'no_task', 'ambiguous', 'not_enabled', 'rate_limited',
    // The event belongs to an existing open incarico of the seat that waits on open blockers held by other agents;
    // Paperclip resumes it when they are done (`issue_blockers_resolved`), nothing was written and no run was started.
    'waiting_on_blockers',
    ...exports.PAPERCLIP_SOURCE_RUN_REFUSALS,
];
exports.PaperclipSeatNativeWakeResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS);
exports.InternalPaperclipSeatNativeWakeResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatNativeWakeResultSchema,
    issueId: zod_1.z.uuid().optional(),
    commentId: zod_1.z.uuid().optional(),
    runId: zod_1.z.uuid().optional(),
    disposition: inbound_event_js_1.InboundEventDispositionSchema.optional(),
}).superRefine((value, ctx) => {
    if (value.result === 'woken' && (value.issueId === undefined || value.runId === undefined)) {
        ctx.addIssue({ code: 'custom', message: 'woken requires issueId and runId', path: ['runId'] });
    }
    if (value.result !== 'woken' && value.runId !== undefined) {
        ctx.addIssue({ code: 'custom', message: 'runId is only allowed with woken', path: ['runId'] });
    }
    if (value.result !== 'woken' && value.commentId !== undefined) {
        ctx.addIssue({ code: 'custom', message: 'commentId is only allowed with woken', path: ['commentId'] });
    }
    if ((value.result === 'opened' || value.result === 'deferred' || value.result === 'already_open' || value.result === 'not_waiting'
        || value.result === 'waiting_on_blockers' || value.result === 'source_issue_closed')
        && value.issueId === undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
    }
    if ((value.result === 'no_task' || value.result === 'ambiguous' || value.result === 'not_enabled' || value.result === 'rate_limited'
        || value.result === 'source_run_unknown' || value.result === 'source_run_without_issue' || value.result === 'source_issue_not_agents')
        && value.issueId !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
    }
    const disposition = value.disposition;
    if (disposition?.outcome === 'commented' && disposition.woke) {
        if (value.result !== 'woken') {
            ctx.addIssue({ code: 'custom', message: 'A woken disposition requires result woken', path: ['result'] });
        }
        if (value.issueId !== disposition.issueId) {
            ctx.addIssue({ code: 'custom', message: 'Disposition issueId must match the response', path: ['disposition', 'issueId'] });
        }
        if (value.runId !== undefined && disposition.runId !== undefined && value.runId !== disposition.runId) {
            ctx.addIssue({ code: 'custom', message: 'Disposition runId must match the response', path: ['disposition', 'runId'] });
        }
    }
    if (disposition?.outcome === 'duplicate' && value.result !== 'duplicate') {
        ctx.addIssue({ code: 'custom', message: 'A duplicate disposition requires result duplicate', path: ['result'] });
    }
});
exports.internalPaperclipSeatNativeWakeContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatNativeWakeRequestSchema,
    responseSchema: exports.InternalPaperclipSeatNativeWakeResponseSchema,
    errorResponseSchema: exports.InternalPaperclipSeatWakeErrorResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH = '/internal/paperclip/seats/session-child';
// Paperclip takes up to 10 MB; the session block is larger than the 20000-character bridge creation body.
exports.DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX = 100000;
exports.InternalPaperclipSeatSessionChildRequestSchema = zod_1.z.strictObject({
    organizationId: exports.InternalPaperclipSeatsQuerySchema.shape.organizationId,
    // cap-dev supplies the chief's identity from the verified call, never from the model.
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    // cap-paperclip reads the parent from the chief's run, never from the description.
    sourceRunId: run_context_js_1.RunIdSchema,
    sessionKey: zod_1.z.string().min(1).max(255).regex(/^dev-session:[A-Za-z0-9._:-]+$/),
    title: session_assignment_js_1.DevSessionAssignmentSchema.shape.title,
    description: zod_1.z.string().min(1).max(exports.DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX)
        .refine(description => (0, session_assignment_js_1.parseDevSessionBlock)(description).ok, 'session_block_invalid'),
});
exports.PAPERCLIP_SEAT_SESSION_CHILD_RESULTS = [
    'opened', 'duplicate', 'executor_missing', 'executor_ambiguous', ...exports.PAPERCLIP_SOURCE_RUN_REFUSALS,
];
exports.PaperclipSeatSessionChildResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_SESSION_CHILD_RESULTS);
// duplicate means Paperclip answered 200 with the same child; nothing was created.
exports.InternalPaperclipSeatSessionChildResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatSessionChildResultSchema,
    issueId: zod_1.z.uuid().optional(),
    // This route returns a Paperclip child, so the legacy R<n> session form cannot identify it.
    identifier: asset_version_js_1.SessionIdSchema.refine(identifier => identifier.includes('-'), 'Paperclip identifier required').optional(),
    executorAgentId: zod_1.z.uuid().optional(),
}).superRefine((value, ctx) => {
    const hasChild = value.result === 'opened' || value.result === 'duplicate';
    for (const field of ['issueId', 'identifier', 'executorAgentId']) {
        if (hasChild && value[field] === undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.result} requires ${field}`, path: [field] });
        }
        if (!hasChild && value[field] !== undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.result} must not carry ${field}`, path: [field] });
        }
    }
});
/**
 * cap-paperclip writes POST /api/companies/:companyId/issues with
 * { title, description, parentId, assigneeAgentId, status: 'todo', idempotencyKey: sessionKey }.
 * Never use /issues/:id/children: that route silently ignores the idempotency key.
 * The key includes the chief's session number and attempt, and is company-wide for seven days.
 */
exports.internalPaperclipSeatSessionChildContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatSessionChildRequestSchema,
    responseSchema: exports.InternalPaperclipSeatSessionChildResponseSchema,
    errorResponseSchema: exports.InternalPaperclipSeatWakeErrorResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH = '/internal/paperclip/seats/session-contract';
exports.InternalPaperclipSeatSessionContractRequestSchema = zod_1.z.strictObject({
    organizationId: exports.InternalPaperclipSeatsQuerySchema.shape.organizationId,
    // The verified chief identity and run let cap-paperclip resolve the issue without trusting a model-supplied issue id.
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    sourceRunId: run_context_js_1.RunIdSchema,
    // Stop before deriving the document key: its shared helper throws for nonpositive numbers.
    issueNumber: zod_1.z.int().refine(value => value > 0, { message: 'Positive issue number required', abort: true }),
    document: zod_1.z.strictObject({
        key: wire_documenti_js_1.PaperclipDocumentoChiaveSchema,
        title: wire_documenti_js_1.PaperclipDocumentoScriviCorpoSchema.shape.title,
        body: wire_documenti_js_1.PaperclipDocumentoScriviCorpoSchema.shape.body,
        changeSummary: wire_documenti_js_1.PaperclipDocumentoScriviCorpoSchema.shape.changeSummary,
    }),
}).superRefine((value, ctx) => { if (value.document.key !== (0, session_acceptance_paperclip_js_1.devSessionContractDocumentKey)(value.issueNumber))
    ctx.addIssue({ code: 'custom', path: ['document', 'key'], message: 'document_key_not_session_contract' }); });
exports.PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS = [
    'written', 'unchanged', 'not_enabled', ...exports.PAPERCLIP_SOURCE_RUN_REFUSALS,
];
exports.PaperclipSeatSessionContractResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS);
exports.InternalPaperclipSeatSessionContractResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatSessionContractResultSchema,
    issueId: zod_1.z.uuid().optional(),
    revisionNumber: zod_1.z.int().min(1).optional(),
}).superRefine((value, ctx) => {
    // Both successful results identify the stored revision; refusals must not claim a document was found or written.
    const hasDocument = value.result === 'written' || value.result === 'unchanged';
    for (const field of ['issueId', 'revisionNumber']) {
        if (hasDocument && value[field] === undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.result} requires ${field}`, path: [field] });
        }
        if (!hasDocument && value[field] !== undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.result} must not carry ${field}`, path: [field] });
        }
    }
});
// cap-paperclip reads the latest revision before PUT and uses the chief's source run as the Paperclip write context.
exports.internalPaperclipSeatSessionContractContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatSessionContractRequestSchema,
    responseSchema: exports.InternalPaperclipSeatSessionContractResponseSchema,
    errorResponseSchema: exports.InternalPaperclipSeatWakeErrorResponseSchema,
};
exports.INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH = '/internal/paperclip/seats/session-mandate';
exports.InternalPaperclipSeatSessionMandateRequestSchema = zod_1.z.strictObject({
    organizationId: exports.InternalPaperclipSeatsQuerySchema.shape.organizationId,
    // The verified chief identity and run resolve the issue; the caller selects a piece from the whole mandate.
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    sourceRunId: run_context_js_1.RunIdSchema,
});
exports.PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS = [
    'read', 'not_enabled', 'mandate_missing', 'mandate_invalid', ...exports.PAPERCLIP_SOURCE_RUN_REFUSALS,
];
exports.PaperclipSeatSessionMandateResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS);
exports.PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS = ['verified', 'criteria_only'];
exports.PaperclipSeatSessionMandateBindingSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS);
exports.InternalPaperclipSeatSessionMandateResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatSessionMandateResultSchema,
    issueId: zod_1.z.uuid().optional(),
    mandate: business_unit_mandate_js_1.ReconciledMandateSchema.optional(),
    mandateBinding: exports.PaperclipSeatSessionMandateBindingSchema.optional(),
    reason: zod_1.z.enum(['not_json', 'not_a_mandate']).optional(),
}).superRefine((value, ctx) => {
    // Only a verified source issue can carry a document outcome; refusals must not expose its identity or mandate.
    const hasIssue = value.result === 'read' || value.result === 'mandate_missing' || value.result === 'mandate_invalid';
    if (hasIssue && value.issueId === undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
    }
    if (!hasIssue && value.issueId !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
    }
    if (value.result === 'read' && value.mandate === undefined) {
        ctx.addIssue({ code: 'custom', message: 'read requires mandate', path: ['mandate'] });
    }
    if (value.result !== 'read' && value.mandate !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry mandate`, path: ['mandate'] });
    }
    // An identity binding describes a read mandate, never a refusal or missing document.
    if (value.result !== 'read' && value.mandateBinding !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry mandateBinding`, path: ['mandateBinding'] });
    }
    if (value.result === 'mandate_invalid' && value.reason === undefined) {
        ctx.addIssue({ code: 'custom', message: 'mandate_invalid requires reason', path: ['reason'] });
    }
    if (value.result !== 'mandate_invalid' && value.reason !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry reason`, path: ['reason'] });
    }
});
exports.internalPaperclipSeatSessionMandateContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatSessionMandateRequestSchema,
    responseSchema: exports.InternalPaperclipSeatSessionMandateResponseSchema,
    errorResponseSchema: exports.InternalPaperclipSeatWakeErrorResponseSchema,
};
function sessionMandateBinding(response) {
    // Stefano 21/11, decision 1; Codex point 2: a legacy response does not prove the identity binding.
    return response.result === 'read' && response.mandateBinding === 'verified' ? 'verified' : 'criteria_only';
}
exports.INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH = '/internal/paperclip/seats/session-proofs';
exports.InternalPaperclipSeatSessionProofsRequestSchema = zod_1.z.strictObject({
    organizationId: exports.InternalPaperclipSeatsQuerySchema.shape.organizationId,
    // The verified chief identity and source run resolve the issue without trusting model input.
    identity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    sourceRunId: run_context_js_1.RunIdSchema,
    sessionId: zod_1.z.string().regex(/^R[1-9][0-9]{0,8}$/),
    call: tool_call_js_1.ToolCallRequestSchema,
}).superRefine((value, ctx) => {
    // The session reader needs the turn envelope, but provider credentials must stay in the calling service.
    if (value.call.credentials !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['call', 'credentials'], message: 'Provider credentials must not cross services' });
    }
});
exports.PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS = [
    'carried', 'incomplete', 'status_only', 'not_enabled', ...exports.PAPERCLIP_SOURCE_RUN_REFUSALS,
];
exports.PaperclipSeatSessionProofsResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS);
exports.InternalPaperclipSeatSessionProofsResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatSessionProofsResultSchema,
    issueId: zod_1.z.uuid().optional(),
    counts: zod_1.z.strictObject({
        new: zod_1.z.int().min(0),
        alreadyThere: zod_1.z.int().min(0),
        failed: zod_1.z.int().min(0),
        tooLarge: zod_1.z.int().min(0),
    }).optional(),
}).superRefine((value, ctx) => {
    // Only a verified source issue carries upload counts; refusals must not claim an upload or expose the issue.
    const hasIssue = value.result === 'carried' || value.result === 'incomplete' || value.result === 'status_only';
    for (const field of ['issueId', 'counts']) {
        if (hasIssue && value[field] === undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.result} requires ${field}`, path: [field] });
        }
        if (!hasIssue && value[field] !== undefined) {
            ctx.addIssue({ code: 'custom', message: `${value.result} must not carry ${field}`, path: [field] });
        }
    }
    // A completed carry cannot hide proofs that failed or exceeded the attachment limit.
    if (value.result === 'carried' && value.counts !== undefined && (value.counts.failed > 0 || value.counts.tooLarge > 0)) {
        ctx.addIssue({ code: 'custom', message: 'carried must not have missing proofs', path: ['counts'] });
    }
});
exports.internalPaperclipSeatSessionProofsContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatSessionProofsRequestSchema,
    responseSchema: exports.InternalPaperclipSeatSessionProofsResponseSchema,
    errorResponseSchema: exports.InternalPaperclipSeatWakeErrorResponseSchema,
};
//# sourceMappingURL=internal-paperclip-seats.js.map