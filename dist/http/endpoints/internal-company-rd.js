import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from "../../auth/index.js";
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
import { BusinessUnitLeadBirthRequestSchema } from "../../organization/business-unit-lead.js";
export const INTERNAL_COMPANY_RD_BIRTH_PATH = '/api/internal/factory/company-rd';
/** The two permanent R&D agents every company is born with. */
export const COMPANY_RD_PARTS = ['ricerca', 'lab'];
export const CompanyRdPartSchema = z.enum(COMPANY_RD_PARTS);
const requestShape = BusinessUnitLeadBirthRequestSchema.shape;
/** Director -> Forge factory-svc: provision the Ricerca and Lab agents of a company. */
export const CompanyRdBirthRequestSchema = z.strictObject({
    requestId: requestShape.requestId,
    tenantId: requestShape.tenantId,
    ownerId: requestShape.ownerId,
    company: requestShape.company,
});
export const CompanyRdBirthResultSchema = z.strictObject({
    ok: z.literal(true),
    replayed: z.boolean(),
    tenantId: requestShape.tenantId,
    companyId: requestShape.company.shape.companyId,
    agents: z
        .array(z.strictObject({ part: CompanyRdPartSchema, agentIdentity: ParticipantAgentIdentitySchema }))
        .length(COMPANY_RD_PARTS.length)
        .refine((agents) => new Set(agents.map((agent) => agent.part)).size === agents.length, {
        message: 'R&D parts must be different',
    }),
});
export const internalCompanyRdBirthContract = {
    method: 'POST',
    path: INTERNAL_COMPANY_RD_BIRTH_PATH,
    authType: 'token',
    authHeader: INTERNAL_TOKEN_HEADER,
    bodySchema: CompanyRdBirthRequestSchema,
    responseSchema: CompanyRdBirthResultSchema,
};
//# sourceMappingURL=internal-company-rd.js.map