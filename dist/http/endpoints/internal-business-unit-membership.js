import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from "../../auth/index.js";
import { BusinessUnitLeadBirthRequestSchema } from "../../organization/business-unit-lead.js";
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
export const INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH = '/api/internal/factory/business-unit-membership';
const shape = BusinessUnitLeadBirthRequestSchema.shape;
/** Read scope: tenant, owner, company and business unit of the lead being checked. */
export const BusinessUnitMembershipQuerySchema = z.strictObject({
    tenantId: shape.tenantId,
    ownerId: shape.ownerId,
    companyId: shape.company.shape.companyId,
    businessUnitSlug: shape.businessUnit.shape.slug,
    managementAgentId: ParticipantAgentIdentitySchema.shape.managementAgentId,
});
/** Evidence of whether the lead sits in the group of its business unit. */
export const BusinessUnitMembershipEvidenceSchema = z.discriminatedUnion('state', [
    z.strictObject({
        state: z.literal('member'),
        groupId: z.string().min(1).max(128),
        observedAt: z.iso.datetime({ offset: true }),
    }),
    z.strictObject({
        state: z.literal('absent'),
        observedAt: z.iso.datetime({ offset: true }),
    }),
]);
export const BusinessUnitMembershipResponseSchema = z.strictObject({
    tenantId: BusinessUnitMembershipQuerySchema.shape.tenantId,
    ownerId: BusinessUnitMembershipQuerySchema.shape.ownerId,
    companyId: BusinessUnitMembershipQuerySchema.shape.companyId,
    businessUnitSlug: BusinessUnitMembershipQuerySchema.shape.businessUnitSlug,
    agentIdentity: ParticipantAgentIdentitySchema,
    membership: BusinessUnitMembershipEvidenceSchema,
});
/** Parses a response and rejects any answer that does not belong to the asked scope. */
export function parseBusinessUnitMembershipResponse(response, query) {
    const parsedQuery = BusinessUnitMembershipQuerySchema.parse(query);
    const parsed = BusinessUnitMembershipResponseSchema.parse(response);
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
export const internalBusinessUnitMembershipReadContract = {
    method: 'GET',
    path: INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH,
    authType: 'token',
    authHeader: INTERNAL_TOKEN_HEADER,
    querySchema: BusinessUnitMembershipQuerySchema,
    responseSchema: BusinessUnitMembershipResponseSchema,
};
//# sourceMappingURL=internal-business-unit-membership.js.map