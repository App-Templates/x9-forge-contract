"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanyRdEnrollmentContract = exports.CompanyRdEnrollmentErrorResponseSchema = exports.CompanyRdEnrollmentErrorCodeSchema = exports.CompanyRdEnrollmentResponseSchema = exports.CompanyRdEnrollmentSeatSchema = exports.CompanyRdEnrollmentSeatStatusSchema = exports.CompanyRdEnrollmentRequestSchema = exports.INTERNAL_COMPANY_RD_ENROLLMENT_PATH = void 0;
const zod_1 = require("zod");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
const internal_company_rd_js_1 = require("./internal-company-rd.cjs");
const internal_paperclip_seats_js_1 = require("./internal-paperclip-seats.cjs");
exports.INTERNAL_COMPANY_RD_ENROLLMENT_PATH = '/internal/paperclip/rd-enrollment';
const shape = business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape;
/** Forge factory-svc -> Paperclip: enroll the Ricerca and Lab agents of a company as seats. */
exports.CompanyRdEnrollmentRequestSchema = zod_1.z.strictObject({
    tenantId: shape.tenantId,
    ownerId: shape.ownerId,
    companyId: shape.company.shape.companyId,
    requestId: shape.requestId,
    agents: zod_1.z
        .array(zod_1.z.strictObject({ part: internal_company_rd_js_1.CompanyRdPartSchema, agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema }))
        .length(internal_company_rd_js_1.COMPANY_RD_PARTS.length)
        .refine((agents) => new Set(agents.map((agent) => agent.part)).size === agents.length, {
        message: 'R&D parts must be different',
    }),
});
exports.CompanyRdEnrollmentSeatStatusSchema = internal_paperclip_seats_js_1.InternalPaperclipSeatSchema.shape.enrollment.shape.state;
exports.CompanyRdEnrollmentSeatSchema = zod_1.z.strictObject({
    part: internal_company_rd_js_1.CompanyRdPartSchema,
    paperclipAgentId: zod_1.z.uuid(),
    status: exports.CompanyRdEnrollmentSeatStatusSchema,
});
exports.CompanyRdEnrollmentResponseSchema = zod_1.z
    .strictObject({
    state: zod_1.z.enum(['enrolled', 'in_corso']),
    seats: zod_1.z.array(exports.CompanyRdEnrollmentSeatSchema).length(internal_company_rd_js_1.COMPANY_RD_PARTS.length),
})
    .superRefine((response, ctx) => {
    if (new Set(response.seats.map((seat) => seat.part)).size !== response.seats.length) {
        ctx.addIssue({ code: 'custom', path: ['seats'], message: 'R&D parts must be different' });
    }
    if (new Set(response.seats.map((seat) => seat.paperclipAgentId)).size !== response.seats.length) {
        ctx.addIssue({ code: 'custom', path: ['seats'], message: 'Paperclip agent ids must be different' });
    }
    if (response.state === 'enrolled' && response.seats.some((seat) => seat.status !== 'enrolled')) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'Enrolled state requires every seat enrolled' });
    }
});
exports.CompanyRdEnrollmentErrorCodeSchema = zod_1.z.enum([
    'director_unknown',
    'person_unknown',
    'identity_mismatch',
    'request_conflict',
    'seat_failed',
    'binding_write',
]);
exports.CompanyRdEnrollmentErrorResponseSchema = zod_1.z.strictObject({
    error: exports.CompanyRdEnrollmentErrorCodeSchema,
});
exports.internalCompanyRdEnrollmentContract = {
    method: 'POST',
    path: exports.INTERNAL_COMPANY_RD_ENROLLMENT_PATH,
    authType: 'secret',
    bodySchema: exports.CompanyRdEnrollmentRequestSchema,
    responseSchema: exports.CompanyRdEnrollmentResponseSchema,
    errorSchema: exports.CompanyRdEnrollmentErrorResponseSchema,
};
//# sourceMappingURL=internal-paperclip-rd-enrollment.js.map