"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalBusinessUnitMembershipReadContract = exports.BusinessUnitMembershipResponseSchema = exports.BusinessUnitMembershipEvidenceSchema = exports.BusinessUnitMembershipQuerySchema = exports.INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH = void 0;
exports.parseBusinessUnitMembershipResponse = parseBusinessUnitMembershipResponse;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
exports.INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH = '/api/internal/factory/business-unit-membership';
const shape = business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape;
/** Read scope: tenant, owner, company and business unit of the lead being checked. */
exports.BusinessUnitMembershipQuerySchema = zod_1.z.strictObject({
    tenantId: shape.tenantId,
    ownerId: shape.ownerId,
    companyId: shape.company.shape.companyId,
    businessUnitSlug: shape.businessUnit.shape.slug,
    managementAgentId: participant_binding_js_1.ParticipantAgentIdentitySchema.shape.managementAgentId,
});
/** Evidence of whether the lead sits in the group of its business unit. */
exports.BusinessUnitMembershipEvidenceSchema = zod_1.z.discriminatedUnion('state', [
    zod_1.z.strictObject({
        state: zod_1.z.literal('member'),
        groupId: zod_1.z.string().min(1).max(128),
        observedAt: zod_1.z.iso.datetime({ offset: true }),
    }),
    zod_1.z.strictObject({
        state: zod_1.z.literal('absent'),
        observedAt: zod_1.z.iso.datetime({ offset: true }),
    }),
]);
exports.BusinessUnitMembershipResponseSchema = zod_1.z.strictObject({
    tenantId: exports.BusinessUnitMembershipQuerySchema.shape.tenantId,
    ownerId: exports.BusinessUnitMembershipQuerySchema.shape.ownerId,
    companyId: exports.BusinessUnitMembershipQuerySchema.shape.companyId,
    businessUnitSlug: exports.BusinessUnitMembershipQuerySchema.shape.businessUnitSlug,
    agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    membership: exports.BusinessUnitMembershipEvidenceSchema,
});
/** Parses a response and rejects any answer that does not belong to the asked scope. */
function parseBusinessUnitMembershipResponse(response, query) {
    const parsedQuery = exports.BusinessUnitMembershipQuerySchema.parse(query);
    const parsed = exports.BusinessUnitMembershipResponseSchema.parse(response);
    if (parsed.tenantId !== parsedQuery.tenantId ||
        parsed.ownerId !== parsedQuery.ownerId ||
        parsed.companyId !== parsedQuery.companyId ||
        parsed.businessUnitSlug !== parsedQuery.businessUnitSlug ||
        parsed.agentIdentity.managementAgentId !== parsedQuery.managementAgentId) {
        throw new Error('business_unit_membership_mismatch');
    }
    return parsed;
}
/** Forge factory-svc: read whether a business unit lead belongs to its business unit group. */
exports.internalBusinessUnitMembershipReadContract = {
    method: 'GET',
    path: exports.INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH,
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    querySchema: exports.BusinessUnitMembershipQuerySchema,
    responseSchema: exports.BusinessUnitMembershipResponseSchema,
};
//# sourceMappingURL=internal-business-unit-membership.js.map