"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPaperclipSeatIssuesReadContract = exports.InternalPaperclipSeatIssuesResponseSchema = exports.InternalPaperclipSeatIssueSchema = exports.InternalPaperclipSeatIssuesParamsSchema = exports.INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = exports.internalPaperclipSeatsReadContract = exports.InternalPaperclipSeatsResponseSchema = exports.InternalPaperclipSeatSchema = exports.InternalPaperclipSeatsQuerySchema = exports.INTERNAL_PAPERCLIP_SEATS_PATH = void 0;
const zod_1 = require("zod");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
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
//# sourceMappingURL=internal-paperclip-seats.js.map