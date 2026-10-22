import { z } from 'zod';
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
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
//# sourceMappingURL=internal-paperclip-seats.js.map