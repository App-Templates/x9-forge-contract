import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { BusinessUnitLeadBirthRequestSchema } from "../../organization/business-unit-lead.js";
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
import { COMPANY_RD_PARTS, CompanyRdPartSchema } from "./internal-company-rd.js";
import { InternalPaperclipSeatSchema } from "./internal-paperclip-seats.js";
export const INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH = '/internal/paperclip/rd-enrollment';
const birthShape = BusinessUnitLeadBirthRequestSchema.shape;
/** Exactly one agent for every R&D part: the same two parts Forge creates at the company birth. */
function hasEveryRdPart(items) {
    return COMPANY_RD_PARTS.every((part) => items.some((item) => item.part === part));
}
/** One R&D part of the company with the identity Forge gave it at birth (complete, never legacy). */
export const CompanyRdEnrollmentAgentSchema = z.strictObject({
    part: CompanyRdPartSchema,
    agentIdentity: ParticipantAgentIdentitySchema,
});
/**
 * Forge factory-svc -> cap-paperclip: create the Paperclip seats of the company Lab and Ricerca and enrol them in
 * the company organization. One request, exactly one `lab` and one `ricerca`.
 */
export const CompanyRdEnrollmentRequestSchema = z.strictObject({
    tenantId: birthShape.tenantId,
    ownerId: birthShape.ownerId,
    companyId: birthShape.company.shape.companyId,
    requestId: birthShape.requestId,
    agents: z
        .array(CompanyRdEnrollmentAgentSchema)
        .length(COMPANY_RD_PARTS.length)
        .refine(hasEveryRdPart, { message: 'Exactly one lab and one ricerca are required' }),
});
/** `enrolled` only when both seats are enrolled; `in_corso` while the enrolment is still going on. */
export const COMPANY_RD_ENROLLMENT_STATES = ['enrolled', 'in_corso'];
export const CompanyRdEnrollmentStateSchema = z.enum(COMPANY_RD_ENROLLMENT_STATES);
/** Same seat status the read contract of the seats publishes (`key_pending` | `enrolled`). */
export const CompanyRdEnrollmentSeatStatusSchema = InternalPaperclipSeatSchema.shape.enrollment.shape.state;
/** Status of the seat of one R&D part. No identity and no credential value crosses this boundary. */
export const CompanyRdEnrollmentSeatSchema = z.strictObject({
    part: CompanyRdPartSchema,
    paperclipAgentId: InternalPaperclipSeatSchema.shape.paperclipAgentId,
    status: CompanyRdEnrollmentSeatStatusSchema,
});
export const CompanyRdEnrollmentResponseSchema = z
    .strictObject({
    state: CompanyRdEnrollmentStateSchema,
    seats: z
        .array(CompanyRdEnrollmentSeatSchema)
        .length(COMPANY_RD_PARTS.length)
        .refine(hasEveryRdPart, { message: 'Exactly one lab seat and one ricerca seat are required' })
        .refine((seats) => new Set(seats.map((seat) => seat.paperclipAgentId)).size === seats.length, {
        message: 'Lab and ricerca seats must have different Paperclip agents',
    }),
})
    .refine(({ state, seats }) => state !== 'enrolled' || seats.every((seat) => seat.status === 'enrolled'), {
    message: 'The enrolment is enrolled only when both seats are enrolled',
    path: ['state'],
});
export const COMPANY_RD_ENROLLMENT_ERRORS = [
    'director_unknown',
    'person_unknown',
    'identity_mismatch',
    'request_conflict',
    'seat_failed',
    'binding_write',
];
export const CompanyRdEnrollmentErrorSchema = z.enum(COMPANY_RD_ENROLLMENT_ERRORS);
export const CompanyRdEnrollmentErrorResponseSchema = z.strictObject({
    error: CompanyRdEnrollmentErrorSchema,
});
export const internalCompanyRdEnrollmentContract = {
    method: 'POST',
    path: INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: CompanyRdEnrollmentRequestSchema,
    responseSchema: CompanyRdEnrollmentResponseSchema,
    errorResponseSchema: CompanyRdEnrollmentErrorResponseSchema,
};
//# sourceMappingURL=internal-paperclip-rd-enrollment.js.map