"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPaperclipSeatReplyWakeContract = exports.InternalPaperclipSeatReplyWakeResponseSchema = exports.PaperclipSeatReplyWakeResultSchema = exports.PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = exports.InternalPaperclipSeatReplyWakeRequestSchema = exports.INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH = exports.internalPaperclipSeatActivityReadContract = exports.InternalPaperclipSeatActivityResponseSchema = exports.InternalPaperclipSeatActivityQuerySchema = exports.INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH = exports.internalPaperclipSeatSearchReadContract = exports.InternalPaperclipSeatSearchResponseSchema = exports.InternalPaperclipSeatSearchQuerySchema = exports.INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH = exports.internalPaperclipSeatIssuesReadContract = exports.InternalPaperclipSeatIssuesResponseSchema = exports.InternalPaperclipSeatIssueSchema = exports.InternalPaperclipSeatIssuesParamsSchema = exports.INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = exports.internalPaperclipSeatsReadContract = exports.InternalPaperclipSeatsResponseSchema = exports.InternalPaperclipSeatSchema = exports.InternalPaperclipSeatsQuerySchema = exports.INTERNAL_PAPERCLIP_SEATS_PATH = void 0;
const zod_1 = require("zod");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
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
});
exports.PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = ['woken', 'skipped', 'duplicate', 'not_waiting', 'no_mandate', 'ambiguous'];
exports.PaperclipSeatReplyWakeResultSchema = zod_1.z.enum(exports.PAPERCLIP_SEAT_REPLY_WAKE_RESULTS);
exports.InternalPaperclipSeatReplyWakeResponseSchema = zod_1.z.strictObject({
    result: exports.PaperclipSeatReplyWakeResultSchema,
    issueId: zod_1.z.uuid().optional(),
    runId: zod_1.z.uuid().optional(),
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
exports.internalPaperclipSeatReplyWakeContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipSeatReplyWakeRequestSchema,
    responseSchema: exports.InternalPaperclipSeatReplyWakeResponseSchema,
};
//# sourceMappingURL=internal-paperclip-seats.js.map