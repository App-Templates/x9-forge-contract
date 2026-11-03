import { z } from 'zod';
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-identity.js";
import { DecisionOutcomeSchema, DecisionRequestIdSchema } from "../../organization/decision-request.js";
import { ResearchIdSchema, ResearchStateSchema } from "../../capability/ricerca/research.js";
import { DevSessionAssignmentSchema, DevSessionCommitSchema, DevSessionResultSchema, } from "../../capability/dev/session-assignment.js";
import { PaperclipActivityInputSchema, PaperclipActivityOutputSchema, PaperclipSearchInputSchema, PaperclipSearchKindSchema, PaperclipSearchOutputSchema, } from "../../capability/paperclip/tools.js";
export const INTERNAL_PAPERCLIP_SEATS_PATH = '/internal/paperclip/seats';
export const InternalPaperclipSeatsQuerySchema = z.strictObject({
    organizationId: z.string().min(1).max(64),
});
/** Read-only seat status. Credential values must never cross this boundary. */
export const InternalPaperclipSeatSchema = z.strictObject({
    identity: ParticipantAgentIdentitySchema,
    paperclipAgentId: z.uuid(),
    companyId: z.uuid(),
    reportsToPaperclipAgentId: z.uuid(),
    enrollment: z.strictObject({
        state: z.enum(['key_pending', 'enrolled']),
        attempts: z.int().min(0),
        lastReason: z.string().min(1).max(64).optional(),
        updatedAt: z.iso.datetime(),
    }),
});
export const InternalPaperclipSeatsResponseSchema = z.strictObject({
    seats: z.array(InternalPaperclipSeatSchema).max(200),
});
export const internalPaperclipSeatsReadContract = {
    method: 'GET',
    path: INTERNAL_PAPERCLIP_SEATS_PATH,
    authType: 'secret',
    querySchema: InternalPaperclipSeatsQuerySchema,
    responseSchema: InternalPaperclipSeatsResponseSchema,
};
export const INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = '/internal/paperclip/seats/:paperclipAgentId/issues';
export const InternalPaperclipSeatIssuesParamsSchema = z.strictObject({
    paperclipAgentId: z.uuid(),
});
export const InternalPaperclipSeatIssueSchema = z.strictObject({
    issueId: z.string().min(1).max(64),
    title: z.string().min(1).max(300),
    status: z.string().min(1).max(32),
    projectId: z.uuid().nullable(),
    goalId: z.uuid().nullable(),
    assigneeComments: z.int().min(0),
});
export const InternalPaperclipSeatIssuesResponseSchema = z.strictObject({
    paperclipAgentId: z.uuid(),
    issues: z.array(InternalPaperclipSeatIssueSchema).max(100),
});
export const internalPaperclipSeatIssuesReadContract = {
    method: 'GET',
    path: INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH,
    authType: 'secret',
    paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
    responseSchema: InternalPaperclipSeatIssuesResponseSchema,
};
export const INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH = '/internal/paperclip/seats/:paperclipAgentId/search';
const SEARCH_KIND_ALTERNATION = PaperclipSearchKindSchema.options.join('|');
const SEARCH_KINDS_PATTERN = new RegExp(`^(?:${SEARCH_KIND_ALTERNATION})(?:,(?:${SEARCH_KIND_ALTERNATION}))*$`);
export const InternalPaperclipSeatSearchQuerySchema = z.strictObject({
    q: PaperclipSearchInputSchema.shape.query,
    kinds: z.string().regex(SEARCH_KINDS_PATTERN)
        .refine(value => new Set(value.split(',')).size === value.split(',').length, 'Search kinds must be unique')
        .optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
});
export const InternalPaperclipSeatSearchResponseSchema = z.strictObject({
    paperclipAgentId: z.uuid(),
    ...PaperclipSearchOutputSchema.shape,
});
export const internalPaperclipSeatSearchReadContract = {
    method: 'GET',
    path: INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH,
    authType: 'secret',
    paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
    querySchema: InternalPaperclipSeatSearchQuerySchema,
    responseSchema: InternalPaperclipSeatSearchResponseSchema,
};
export const INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH = '/internal/paperclip/seats/:paperclipAgentId/activity';
export const InternalPaperclipSeatActivityQuerySchema = z.strictObject({
    since: PaperclipActivityInputSchema.shape.since,
    issueId: PaperclipActivityInputSchema.shape.issueId,
    limit: z.coerce.number().int().min(1).max(100).optional(),
});
export const InternalPaperclipSeatActivityResponseSchema = z.strictObject({
    paperclipAgentId: z.uuid(),
    ...PaperclipActivityOutputSchema.shape,
});
export const internalPaperclipSeatActivityReadContract = {
    method: 'GET',
    path: INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH,
    authType: 'secret',
    paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
    querySchema: InternalPaperclipSeatActivityQuerySchema,
    responseSchema: InternalPaperclipSeatActivityResponseSchema,
};
export const INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH = '/internal/paperclip/seats/reply-wake';
// Una risposta email esterna è arrivata a un agente dell'organizzazione: cap-paperclip lo sveglia sul Mandato
// che ha messo `blocked` con la propria attesa, e su nient'altro. `messageId` è la chiave di idempotenza.
export const InternalPaperclipSeatReplyWakeRequestSchema = z.strictObject({
    organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId,
    identity: ParticipantAgentIdentitySchema,
    messageId: z.string().min(1).max(998).refine(v => v.trim().length > 0, 'Non-blank message id required'),
});
export const PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = ['woken', 'skipped', 'duplicate', 'not_waiting', 'no_mandate', 'ambiguous'];
export const PaperclipSeatReplyWakeResultSchema = z.enum(PAPERCLIP_SEAT_REPLY_WAKE_RESULTS);
export const InternalPaperclipSeatReplyWakeResponseSchema = z.strictObject({
    result: PaperclipSeatReplyWakeResultSchema,
    issueId: z.uuid().optional(),
    runId: z.uuid().optional(),
}).superRefine((value, ctx) => {
    if (value.result === 'woken' && (value.issueId === undefined || value.runId === undefined)) {
        ctx.addIssue({ code: 'custom', message: 'woken requires issueId and runId', path: ['runId'] });
    }
    if (value.result !== 'woken' && value.runId !== undefined) {
        ctx.addIssue({ code: 'custom', message: 'runId is only allowed with woken', path: ['runId'] });
    }
    if ((value.result === 'skipped' || value.result === 'not_waiting') && value.issueId === undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
    }
    if ((value.result === 'no_mandate' || value.result === 'ambiguous') && value.issueId !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
    }
});
export const internalPaperclipSeatReplyWakeContract = {
    method: 'POST',
    path: INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH,
    authType: 'secret',
    bodySchema: InternalPaperclipSeatReplyWakeRequestSchema,
    responseSchema: InternalPaperclipSeatReplyWakeResponseSchema,
};
export const INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH = '/internal/paperclip/seats/native-wake';
export const PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES = ['request', 'reply', 'decision'];
export const PaperclipSeatNativeWakeEventSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal('email'),
        messageId: InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
        threadKey: InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
        mode: z.enum(PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES),
        from: z.string().min(1).max(320),
        subject: z.string().min(1).max(300),
        receivedAt: z.iso.datetime(),
        excerpt: z.string().max(8000),
        attachments: z.array(z.strictObject({
            name: z.string().min(1).max(255),
            contentType: z.string().min(1).max(255),
            size: z.int().min(0),
        })).max(20),
        decision: z.strictObject({
            requestId: DecisionRequestIdSchema,
            outcome: z.union(DecisionOutcomeSchema.options.map(o => o.shape.outcome)),
        }).optional(),
    }),
    z.strictObject({
        kind: z.literal('research_done'),
        researchId: ResearchIdSchema,
        state: ResearchStateSchema,
        question: z.string().min(1).max(1000),
    }),
    z.strictObject({
        kind: z.literal('dev_delivered'),
        sessionIssue: DevSessionResultSchema.shape.issue,
        commit: DevSessionCommitSchema,
        projectId: DevSessionAssignmentSchema.shape.projectId,
    }),
]);
// Un evento del prodotto (email ammessa, ricerca finita, consegna verificata) apre o risveglia l'incarico Paperclip
// dell'agente, come il canale email di Paperclip: incarico assegnato a sé (sveglia d'assegnazione) oppure commento
// più `wakeup` `automation`/`callback`. `eventId` è la chiave di idempotenza.
export const InternalPaperclipSeatNativeWakeRequestSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema,
    eventId: z.string().min(1).max(200).refine(v => v.trim().length > 0, 'Non-blank event id required'),
    organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId.optional(),
    identity: ParticipantAgentIdentitySchema.optional(),
    event: PaperclipSeatNativeWakeEventSchema,
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
    if (value.event.kind === 'email') {
        const isDecision = value.event.mode === 'decision';
        if (isDecision && value.event.decision === undefined) {
            ctx.addIssue({ code: 'custom', message: 'decision mode requires decision', path: ['event', 'decision'] });
        }
        if (!isDecision && value.event.decision !== undefined) {
            ctx.addIssue({ code: 'custom', message: 'decision is only allowed with decision mode', path: ['event', 'decision'] });
        }
    }
});
export const PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS = [
    'opened', 'woken', 'deferred', 'duplicate', 'already_open', 'not_waiting', 'no_task', 'ambiguous', 'not_enabled', 'rate_limited',
];
export const PaperclipSeatNativeWakeResultSchema = z.enum(PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS);
export const InternalPaperclipSeatNativeWakeResponseSchema = z.strictObject({
    result: PaperclipSeatNativeWakeResultSchema,
    issueId: z.uuid().optional(),
    commentId: z.uuid().optional(),
    runId: z.uuid().optional(),
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
    if ((value.result === 'opened' || value.result === 'deferred' || value.result === 'already_open' || value.result === 'not_waiting')
        && value.issueId === undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
    }
    if ((value.result === 'no_task' || value.result === 'ambiguous' || value.result === 'not_enabled' || value.result === 'rate_limited')
        && value.issueId !== undefined) {
        ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
    }
});
export const internalPaperclipSeatNativeWakeContract = {
    method: 'POST',
    path: INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH,
    authType: 'secret',
    bodySchema: InternalPaperclipSeatNativeWakeRequestSchema,
    responseSchema: InternalPaperclipSeatNativeWakeResponseSchema,
};
//# sourceMappingURL=internal-paperclip-seats.js.map