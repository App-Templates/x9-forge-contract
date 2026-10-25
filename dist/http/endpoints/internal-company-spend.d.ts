import { z } from 'zod';
export declare const INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH: "/internal/companies/:companyId/business-units/:buSlug/spend";
export declare const InternalCompanySpendBusinessUnitParamsSchema: z.ZodObject<{
    companyId: z.ZodString;
    buSlug: z.ZodString;
}, z.core.$strict>;
export type InternalCompanySpendBusinessUnitParams = z.infer<typeof InternalCompanySpendBusinessUnitParamsSchema>;
export declare const InternalCompanySpendBusinessUnitQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
}, z.core.$strict>;
export type InternalCompanySpendBusinessUnitQuery = z.infer<typeof InternalCompanySpendBusinessUnitQuerySchema>;
/**
 * Spend of one business unit against its cap, in integer USD micros.
 * `percent` is null if and only if the cap is 0; otherwise it is
 * round(spent * 10000 / cap) / 100. The alert flags are not derived from the
 * spend: if the cap is raised after an alert they stay true.
 */
export declare const InternalCompanySpendBusinessUnitResponseSchema: z.ZodObject<{
    companyId: z.ZodString;
    buSlug: z.ZodString;
    spentUsdMicros: z.ZodInt;
    capUsdMicros: z.ZodInt;
    percent: z.ZodNullable<z.ZodNumber>;
    warn80Alerted: z.ZodBoolean;
    capAlerted: z.ZodBoolean;
}, z.core.$strict>;
export type InternalCompanySpendBusinessUnitResponse = z.infer<typeof InternalCompanySpendBusinessUnitResponseSchema>;
/** Read-only: the cap cannot be changed from here. */
export declare const internalCompanySpendBusinessUnitReadContract: {
    readonly method: "GET";
    readonly path: "/internal/companies/:companyId/business-units/:buSlug/spend";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        companyId: z.ZodString;
        buSlug: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        companyId: z.ZodString;
        buSlug: z.ZodString;
        spentUsdMicros: z.ZodInt;
        capUsdMicros: z.ZodInt;
        percent: z.ZodNullable<z.ZodNumber>;
        warn80Alerted: z.ZodBoolean;
        capAlerted: z.ZodBoolean;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-company-spend.d.ts.map