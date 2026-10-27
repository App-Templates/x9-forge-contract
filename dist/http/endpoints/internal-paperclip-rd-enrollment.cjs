"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanyRdEnrollmentContract = exports.CompanyRdEnrollmentErrorResponseSchema = exports.CompanyRdEnrollmentErrorSchema = exports.COMPANY_RD_ENROLLMENT_ERRORS = exports.CompanyRdEnrollmentResponseSchema = exports.CompanyRdEnrollmentSeatSchema = exports.CompanyRdEnrollmentSeatStatusSchema = exports.CompanyRdEnrollmentStateSchema = exports.COMPANY_RD_ENROLLMENT_STATES = exports.CompanyRdEnrollmentRequestSchema = exports.CompanyRdEnrollmentAgentSchema = exports.INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
const internal_company_rd_js_1 = require("./internal-company-rd.cjs");
const internal_paperclip_seats_js_1 = require("./internal-paperclip-seats.cjs");
exports.INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH = '/internal/paperclip/rd-enrollment';
const birthShape = business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape;
/** Exactly one agent for every R&D part: the same two parts Forge creates at the company birth. */
function hasEveryRdPart(items) {
    return internal_company_rd_js_1.COMPANY_RD_PARTS.every((part) => items.some((item) => item.part === part));
}
/** One R&D part of the company with the identity Forge gave it at birth (complete, never legacy). */
exports.CompanyRdEnrollmentAgentSchema = zod_1.z.strictObject({
    part: internal_company_rd_js_1.CompanyRdPartSchema,
    agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema,
});
/**
 * Forge factory-svc -> cap-paperclip: create the Paperclip seats of the company Lab and Ricerca and enrol them in
 * the company organization. One request, exactly one `lab` and one `ricerca`.
 */
exports.CompanyRdEnrollmentRequestSchema = zod_1.z.strictObject({
    tenantId: birthShape.tenantId,
    ownerId: birthShape.ownerId,
    companyId: birthShape.company.shape.companyId,
    requestId: birthShape.requestId,
    agents: zod_1.z
        .array(exports.CompanyRdEnrollmentAgentSchema)
        .length(internal_company_rd_js_1.COMPANY_RD_PARTS.length)
        .refine(hasEveryRdPart, { message: 'Exactly one lab and one ricerca are required' }),
});
/** `enrolled` only when both seats are enrolled; `in_corso` while the enrolment is still going on. */
exports.COMPANY_RD_ENROLLMENT_STATES = ['enrolled', 'in_corso'];
exports.CompanyRdEnrollmentStateSchema = zod_1.z.enum(exports.COMPANY_RD_ENROLLMENT_STATES);
/** Same seat status the read contract of the seats publishes (`key_pending` | `enrolled`). */
exports.CompanyRdEnrollmentSeatStatusSchema = internal_paperclip_seats_js_1.InternalPaperclipSeatSchema.shape.enrollment.shape.state;
/** Status of the seat of one R&D part. No identity and no credential value crosses this boundary. */
exports.CompanyRdEnrollmentSeatSchema = zod_1.z.strictObject({
    part: internal_company_rd_js_1.CompanyRdPartSchema,
    paperclipAgentId: internal_paperclip_seats_js_1.InternalPaperclipSeatSchema.shape.paperclipAgentId,
    status: exports.CompanyRdEnrollmentSeatStatusSchema,
});
exports.CompanyRdEnrollmentResponseSchema = zod_1.z
    .strictObject({
    state: exports.CompanyRdEnrollmentStateSchema,
    seats: zod_1.z
        .array(exports.CompanyRdEnrollmentSeatSchema)
        .length(internal_company_rd_js_1.COMPANY_RD_PARTS.length)
        .refine(hasEveryRdPart, { message: 'Exactly one lab seat and one ricerca seat are required' })
        .refine((seats) => new Set(seats.map((seat) => seat.paperclipAgentId)).size === seats.length, {
        message: 'Lab and ricerca seats must have different Paperclip agents',
    }),
})
    .refine(({ state, seats }) => state !== 'enrolled' || seats.every((seat) => seat.status === 'enrolled'), {
    message: 'The enrolment is enrolled only when both seats are enrolled',
    path: ['state'],
});
exports.COMPANY_RD_ENROLLMENT_ERRORS = [
    'director_unknown',
    'person_unknown',
    'identity_mismatch',
    'request_conflict',
    'seat_failed',
    'binding_write',
];
exports.CompanyRdEnrollmentErrorSchema = zod_1.z.enum(exports.COMPANY_RD_ENROLLMENT_ERRORS);
exports.CompanyRdEnrollmentErrorResponseSchema = zod_1.z.strictObject({
    error: exports.CompanyRdEnrollmentErrorSchema,
});
exports.internalCompanyRdEnrollmentContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: exports.CompanyRdEnrollmentRequestSchema,
    responseSchema: exports.CompanyRdEnrollmentResponseSchema,
    errorResponseSchema: exports.CompanyRdEnrollmentErrorResponseSchema,
};
//# sourceMappingURL=internal-paperclip-rd-enrollment.js.map