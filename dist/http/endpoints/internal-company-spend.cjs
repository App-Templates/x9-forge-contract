"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanySpendCapUpdateContract = exports.internalCompanySpendReadContract = exports.InternalCompanySpendErrorSchema = exports.InternalCompanySpendCapUpdateBodySchema = exports.InternalCompanySpendResponseSchema = exports.InternalCompanySpendParamsSchema = exports.INTERNAL_COMPANY_SPEND_PATH = exports.CompanySpendSourceSchema = exports.internalCompanySpendBusinessUnitReadContract = exports.InternalCompanySpendBusinessUnitResponseSchema = exports.InternalCompanySpendBusinessUnitQuerySchema = exports.InternalCompanySpendBusinessUnitParamsSchema = exports.INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH = void 0;
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
/** Read-only: the cap of a business unit cannot be changed from here. */
exports.internalCompanySpendBusinessUnitReadContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalCompanySpendBusinessUnitParamsSchema,
    querySchema: exports.InternalCompanySpendBusinessUnitQuerySchema,
    responseSchema: exports.InternalCompanySpendBusinessUnitResponseSchema,
};
/** Spend sources of the company guard; the same list agent-core meters. */
exports.CompanySpendSourceSchema = zod_1.z.enum(['model', 'tool', 'ricerca', 'lab']);
exports.INTERNAL_COMPANY_SPEND_PATH = '/internal/companies/:company/spend';
/** `company` is the guard's company name, e.g. `good-choice`. */
exports.InternalCompanySpendParamsSchema = zod_1.z.strictObject({
    company: zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(64),
});
const CompanySpendIsoSchema = zod_1.z.iso.datetime({ offset: true });
/**
 * Company spend report against its cap. `revision` is 0 for the value shipped
 * in the image and grows by 1 at every cap change. `unreadSources` lists the
 * sources X9 does not read today: their spend is unknown, never zero.
 */
exports.InternalCompanySpendResponseSchema = zod_1.z.strictObject({
    company: exports.InternalCompanySpendParamsSchema.shape.company,
    label: zod_1.z.string().min(1),
    since: CompanySpendIsoSchema,
    capEurCents: zod_1.z.int().min(1),
    usdPerEur: zod_1.z.number().positive().finite(),
    capUsdMicros: zod_1.z.int().min(0),
    spentUsdMicros: zod_1.z.int().min(0),
    over: zod_1.z.boolean(),
    revision: zod_1.z.int().min(0),
    changedAt: CompanySpendIsoSchema.nullable(),
    changedBy: zod_1.z.string().min(1).max(200).nullable(),
    perAgent: zod_1.z.array(zod_1.z.strictObject({
        agentId: zod_1.z.string().min(1),
        usdMicros: zod_1.z.int().min(0),
        estimated: zod_1.z.boolean(),
        bySource: zod_1.z.partialRecord(exports.CompanySpendSourceSchema, zod_1.z.int().min(0)),
    })),
    unreadSources: zod_1.z.array(exports.CompanySpendSourceSchema),
});
/** `since` restarts the counter (reset); `revision` is the one the caller read. */
exports.InternalCompanySpendCapUpdateBodySchema = zod_1.z.strictObject({
    revision: zod_1.z.int().min(0),
    capEurCents: zod_1.z.int().min(1).max(10_000_000),
    since: CompanySpendIsoSchema.optional(),
    changedBy: zod_1.z.string().min(1).max(200),
});
exports.InternalCompanySpendErrorSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: zod_1.z.enum(['unknown_company', 'guard_off', 'stale_revision', 'below_business_units', 'invalid_request']),
    currentRevision: zod_1.z.int().min(0).optional(),
});
exports.internalCompanySpendReadContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_SPEND_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalCompanySpendParamsSchema,
    responseSchema: exports.InternalCompanySpendResponseSchema,
};
/** The response is the same report as the read, taken after the change. */
exports.internalCompanySpendCapUpdateContract = {
    method: 'PUT',
    path: exports.INTERNAL_COMPANY_SPEND_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalCompanySpendParamsSchema,
    bodySchema: exports.InternalCompanySpendCapUpdateBodySchema,
    responseSchema: exports.InternalCompanySpendResponseSchema,
};
//# sourceMappingURL=internal-company-spend.js.map