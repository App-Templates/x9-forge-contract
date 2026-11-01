"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanySpendBusinessUnitReadContract = exports.InternalCompanySpendBusinessUnitResponseSchema = exports.InternalCompanySpendBusinessUnitQuerySchema = exports.InternalCompanySpendBusinessUnitParamsSchema = exports.INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH = void 0;
const zod_1 = require("zod");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
exports.INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH = '/internal/companies/:companyId/business-units/:buSlug/spend';
exports.InternalCompanySpendBusinessUnitParamsSchema = zod_1.z.strictObject({
    companyId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    buSlug: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug,
});
exports.InternalCompanySpendBusinessUnitQuerySchema = zod_1.z.strictObject({
    tenantId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.tenantId,
});
/**
 * Spend of one business unit against its cap, in integer USD micros.
 * `percent` is null if and only if the cap is 0; otherwise it is
 * round(spent * 10000 / cap) / 100. The alert flags are not derived from the
 * spend: if the cap is raised after an alert they stay true.
 */
exports.InternalCompanySpendBusinessUnitResponseSchema = zod_1.z
    .strictObject({
    companyId: exports.InternalCompanySpendBusinessUnitParamsSchema.shape.companyId,
    buSlug: exports.InternalCompanySpendBusinessUnitParamsSchema.shape.buSlug,
    spentUsdMicros: zod_1.z.int().min(0),
    capUsdMicros: zod_1.z.int().min(0),
    percent: zod_1.z.number().min(0).finite().nullable(),
    warn80Alerted: zod_1.z.boolean(),
    capAlerted: zod_1.z.boolean(),
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
exports.internalCompanySpendBusinessUnitReadContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalCompanySpendBusinessUnitParamsSchema,
    querySchema: exports.InternalCompanySpendBusinessUnitQuerySchema,
    responseSchema: exports.InternalCompanySpendBusinessUnitResponseSchema,
};
//# sourceMappingURL=internal-company-spend.js.map