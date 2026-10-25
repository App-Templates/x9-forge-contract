"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPaperclipSeatActivityReadContract = exports.InternalPaperclipSeatActivityResponseSchema = exports.InternalPaperclipSeatActivityQuerySchema = exports.INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH = exports.internalPaperclipSeatSearchReadContract = exports.InternalPaperclipSeatSearchResponseSchema = exports.InternalPaperclipSeatSearchQuerySchema = exports.INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH = exports.internalPaperclipSeatIssuesReadContract = exports.InternalPaperclipSeatIssuesResponseSchema = exports.InternalPaperclipSeatIssueSchema = exports.InternalPaperclipSeatIssuesParamsSchema = exports.INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = exports.internalPaperclipSeatsReadContract = exports.InternalPaperclipSeatsResponseSchema = exports.InternalPaperclipSeatSchema = exports.InternalPaperclipSeatsQuerySchema = exports.INTERNAL_PAPERCLIP_SEATS_PATH = void 0;
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
//# sourceMappingURL=internal-paperclip-seats.js.map