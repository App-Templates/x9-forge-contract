import { z } from 'zod';
import { BusinessUnitLeadBirthRequestSchema } from "../../organization/business-unit-lead.js";
export const INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH = '/internal/companies/:companyId/business-units/:buSlug/spend';
export const InternalCompanySpendBusinessUnitParamsSchema = z.strictObject({
    companyId: BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    buSlug: BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug,
});
export const InternalCompanySpendBusinessUnitQuerySchema = z.strictObject({
    tenantId: BusinessUnitLeadBirthRequestSchema.shape.tenantId,
});
/**
 * Spend of one business unit against its cap, in integer USD micros.
 * `percent` is null if and only if the cap is 0; otherwise it is
 * round(spent * 10000 / cap) / 100. The alert flags are not derived from the
 * spend: if the cap is raised after an alert they stay true.
 */
export const InternalCompanySpendBusinessUnitResponseSchema = z
    .strictObject({
    companyId: InternalCompanySpendBusinessUnitParamsSchema.shape.companyId,
    buSlug: InternalCompanySpendBusinessUnitParamsSchema.shape.buSlug,
    spentUsdMicros: z.int().min(0),
    capUsdMicros: z.int().min(0),
    percent: z.number().min(0).finite().nullable(),
    warn80Alerted: z.boolean(),
    capAlerted: z.boolean(),
})
    .superRefine((value, ctx) => {
    if (value.capUsdMicros === 0) {
        if (value.percent !== null) {
            ctx.addIssue({ code: 'custom', path: ['percent'], message: 'percent must be null when the cap is 0' });
        }
        return;
    }
    if (value.percent === null) {
        ctx.addIssue({ code: 'custom', path: ['percent'], message: 'percent must not be null when the cap is above 0' });
        return;
    }
    const expected = Math.round((value.spentUsdMicros * 10000) / value.capUsdMicros) / 100;
    if (value.percent !== expected) {
        ctx.addIssue({ code: 'custom', path: ['percent'], message: `percent must be ${expected}` });
    }
});
/** Read-only: the cap cannot be changed from here. */
export const internalCompanySpendBusinessUnitReadContract = {
    method: 'GET',
    path: INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH,
    authType: 'secret',
    paramsSchema: InternalCompanySpendBusinessUnitParamsSchema,
    querySchema: InternalCompanySpendBusinessUnitQuerySchema,
    responseSchema: InternalCompanySpendBusinessUnitResponseSchema,
};
//# sourceMappingURL=internal-company-spend.js.map