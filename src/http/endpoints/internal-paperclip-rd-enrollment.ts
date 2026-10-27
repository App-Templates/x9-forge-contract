import { z } from 'zod';
import { ParticipantAgentIdentitySchema } from '../../organization/participant-binding.js';
import { BusinessUnitLeadBirthRequestSchema } from '../../organization/business-unit-lead.js';
import { COMPANY_RD_PARTS, CompanyRdPartSchema } from './internal-company-rd.js';
import { InternalPaperclipSeatSchema } from './internal-paperclip-seats.js';

export const INTERNAL_COMPANY_RD_ENROLLMENT_PATH = '/internal/paperclip/rd-enrollment' as const;

const shape = BusinessUnitLeadBirthRequestSchema.shape;

/** Forge factory-svc -> Paperclip: enroll the Ricerca and Lab agents of a company as seats. */
export const CompanyRdEnrollmentRequestSchema = z.strictObject({
  tenantId: shape.tenantId,
  ownerId: shape.ownerId,
  companyId: shape.company.shape.companyId,
  requestId: shape.requestId,
  agents: z
    .array(z.strictObject({ part: CompanyRdPartSchema, agentIdentity: ParticipantAgentIdentitySchema }))
    .length(COMPANY_RD_PARTS.length)
    .refine((agents) => new Set(agents.map((agent) => agent.part)).size === agents.length, {
      message: 'R&D parts must be different',
    }),
});
export type CompanyRdEnrollmentRequest = z.infer<typeof CompanyRdEnrollmentRequestSchema>;

export const CompanyRdEnrollmentSeatStatusSchema = InternalPaperclipSeatSchema.shape.enrollment.shape.state;

export const CompanyRdEnrollmentSeatSchema = z.strictObject({
  part: CompanyRdPartSchema,
  paperclipAgentId: z.uuid(),
  status: CompanyRdEnrollmentSeatStatusSchema,
});
export type CompanyRdEnrollmentSeat = z.infer<typeof CompanyRdEnrollmentSeatSchema>;

export const CompanyRdEnrollmentResponseSchema = z
  .strictObject({
    state: z.enum(['enrolled', 'in_corso']),
    seats: z.array(CompanyRdEnrollmentSeatSchema).length(COMPANY_RD_PARTS.length),
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
export type CompanyRdEnrollmentResponse = z.infer<typeof CompanyRdEnrollmentResponseSchema>;

export const CompanyRdEnrollmentErrorCodeSchema = z.enum([
  'director_unknown',
  'person_unknown',
  'identity_mismatch',
  'request_conflict',
  'seat_failed',
  'binding_write',
]);
export type CompanyRdEnrollmentErrorCode = z.infer<typeof CompanyRdEnrollmentErrorCodeSchema>;

export const CompanyRdEnrollmentErrorResponseSchema = z.strictObject({
  error: CompanyRdEnrollmentErrorCodeSchema,
});
export type CompanyRdEnrollmentErrorResponse = z.infer<typeof CompanyRdEnrollmentErrorResponseSchema>;

export const internalCompanyRdEnrollmentContract = {
  method: 'POST' as const,
  path: INTERNAL_COMPANY_RD_ENROLLMENT_PATH,
  authType: 'secret' as const,
  bodySchema: CompanyRdEnrollmentRequestSchema,
  responseSchema: CompanyRdEnrollmentResponseSchema,
  errorSchema: CompanyRdEnrollmentErrorResponseSchema,
} as const;
