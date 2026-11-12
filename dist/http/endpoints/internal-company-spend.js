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
/** Read-only: the cap of a business unit cannot be changed from here. */
export const internalCompanySpendBusinessUnitReadContract = {
    method: 'GET',
    path: INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH,
    authType: 'secret',
    paramsSchema: InternalCompanySpendBusinessUnitParamsSchema,
    querySchema: InternalCompanySpendBusinessUnitQuerySchema,
    responseSchema: InternalCompanySpendBusinessUnitResponseSchema,
};
/** Spend sources of the company guard; the same list agent-core meters. */
export const CompanySpendSourceSchema = z.enum(['model', 'tool', 'ricerca', 'lab']);
/**
 * The only sources X9 reads from a capability, and so the only ones it can
 * fail to read. `model` and `tool` are metered by X9 itself and are never unread.
 */
export const COMPANY_SPEND_CAPABILITY_SOURCES = ['ricerca', 'lab'];
export const CompanySpendCapabilitySourceSchema = CompanySpendSourceSchema.extract(COMPANY_SPEND_CAPABILITY_SOURCES);
export const INTERNAL_COMPANY_SPEND_PATH = '/internal/companies/:company/spend';
/** `company` is the guard's company name, e.g. `good-choice`. */
export const InternalCompanySpendParamsSchema = z.strictObject({
    company: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(64),
});
const CompanySpendIsoSchema = z.iso.datetime({ offset: true });
/**
 * Company spend report against its cap. `revision` is 0 for the value shipped
 * in the image and grows by 1 at every cap change. `unreadSources` lists the
 * sources X9 does not read today: their spend is unknown, never zero.
 */
export const InternalCompanySpendResponseSchema = z.strictObject({
    company: InternalCompanySpendParamsSchema.shape.company,
    label: z.string().min(1),
    since: CompanySpendIsoSchema,
    capEurCents: z.int().min(1),
    usdPerEur: z.number().positive().finite(),
    capUsdMicros: z.int().min(0),
    spentUsdMicros: z.int().min(0),
    over: z.boolean(),
    revision: z.int().min(0),
    changedAt: CompanySpendIsoSchema.nullable(),
    changedBy: z.string().min(1).max(200).nullable(),
    perAgent: z.array(z.strictObject({
        agentId: z.string().min(1),
        usdMicros: z.int().min(0),
        estimated: z.boolean(),
        bySource: z.partialRecord(CompanySpendSourceSchema, z.int().min(0)),
    })),
    unreadSources: z.array(CompanySpendCapabilitySourceSchema),
});
/** `since` restarts the counter (reset); `revision` is the one the caller read. */
export const InternalCompanySpendCapUpdateBodySchema = z.strictObject({
    revision: z.int().min(0),
    capEurCents: z.int().min(1).max(10_000_000),
    since: CompanySpendIsoSchema.optional(),
    changedBy: z.string().min(1).max(200),
});
export const InternalCompanySpendErrorSchema = z.strictObject({
    ok: z.literal(false),
    error: z.enum([
        'unknown_company',
        'guard_off',
        'stale_revision',
        'below_business_units',
        'invalid_request',
        // The internal-secret guard did not let the call through (401).
        'unauthorized',
        // The requested cap leads to a configuration the guard refuses for a rule
        // other than the business unit caps, which have `below_business_units`.
        'invalid_config',
    ]),
    currentRevision: z.int().min(0).optional(),
});
export const internalCompanySpendReadContract = {
    method: 'GET',
    path: INTERNAL_COMPANY_SPEND_PATH,
    authType: 'secret',
    paramsSchema: InternalCompanySpendParamsSchema,
    responseSchema: InternalCompanySpendResponseSchema,
};
/** The response is the same report as the read, taken after the change. */
export const internalCompanySpendCapUpdateContract = {
    method: 'PUT',
    path: INTERNAL_COMPANY_SPEND_PATH,
    authType: 'secret',
    paramsSchema: InternalCompanySpendParamsSchema,
    bodySchema: InternalCompanySpendCapUpdateBodySchema,
    responseSchema: InternalCompanySpendResponseSchema,
};
//# sourceMappingURL=internal-company-spend.js.map