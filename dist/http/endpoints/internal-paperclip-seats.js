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
//# sourceMappingURL=internal-paperclip-seats.js.map