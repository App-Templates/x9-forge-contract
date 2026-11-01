"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanyRdBirthContract = exports.CompanyRdBirthResultSchema = exports.CompanyRdBirthRequestSchema = exports.CompanyRdPartSchema = exports.COMPANY_RD_PARTS = exports.INTERNAL_COMPANY_RD_BIRTH_PATH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
exports.INTERNAL_COMPANY_RD_BIRTH_PATH = '/api/internal/factory/company-rd';
/** The two permanent R&D agents every company is born with. */
exports.COMPANY_RD_PARTS = ['ricerca', 'lab'];
exports.CompanyRdPartSchema = zod_1.z.enum(exports.COMPANY_RD_PARTS);
const requestShape = business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape;
/** Director -> Forge factory-svc: provision the Ricerca and Lab agents of a company. */
exports.CompanyRdBirthRequestSchema = zod_1.z.strictObject({
    requestId: requestShape.requestId,
    tenantId: requestShape.tenantId,
    ownerId: requestShape.ownerId,
    company: requestShape.company,
});
exports.CompanyRdBirthResultSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    replayed: zod_1.z.boolean(),
    tenantId: requestShape.tenantId,
    companyId: requestShape.company.shape.companyId,
    agents: zod_1.z
        .array(zod_1.z.strictObject({ part: exports.CompanyRdPartSchema, agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema }))
        .length(exports.COMPANY_RD_PARTS.length)
        .refine((agents) => new Set(agents.map((agent) => agent.part)).size === agents.length, {
        message: 'R&D parts must be different',
    }),
});
exports.internalCompanyRdBirthContract = {
    method: 'POST',
    path: exports.INTERNAL_COMPANY_RD_BIRTH_PATH,
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    bodySchema: exports.CompanyRdBirthRequestSchema,
    responseSchema: exports.CompanyRdBirthResultSchema,
};
//# sourceMappingURL=internal-company-rd.js.map