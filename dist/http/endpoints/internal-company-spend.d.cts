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
/** Read-only: the cap of a business unit cannot be changed from here. */
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
/** Spend sources of the company guard; the same list agent-core meters. */
export declare const CompanySpendSourceSchema: z.ZodEnum<{
    tool: "tool";
    ricerca: "ricerca";
    lab: "lab";
    model: "model";
}>;
export type CompanySpendSource = z.infer<typeof CompanySpendSourceSchema>;
/**
 * The only sources X9 reads from a capability, and so the only ones it can
 * fail to read. `model` and `tool` are metered by X9 itself and are never unread.
 */
export declare const COMPANY_SPEND_CAPABILITY_SOURCES: readonly ["ricerca", "lab"];
export declare const CompanySpendCapabilitySourceSchema: z.ZodEnum<{
    ricerca: "ricerca";
    lab: "lab";
}>;
export type CompanySpendCapabilitySource = z.infer<typeof CompanySpendCapabilitySourceSchema>;
export declare const INTERNAL_COMPANY_SPEND_PATH: "/internal/companies/:company/spend";
/** `company` is the guard's company name, e.g. `good-choice`. */
export declare const InternalCompanySpendParamsSchema: z.ZodObject<{
    company: z.ZodString;
}, z.core.$strict>;
export type InternalCompanySpendParams = z.infer<typeof InternalCompanySpendParamsSchema>;
/**
 * Company spend report against its cap. `revision` is 0 for the value shipped
 * in the image and grows by 1 at every cap change. `unreadSources` lists the
 * sources X9 does not read today: their spend is unknown, never zero.
 */
export declare const InternalCompanySpendResponseSchema: z.ZodObject<{
    company: z.ZodString;
    label: z.ZodString;
    since: z.ZodISODateTime;
    capEurCents: z.ZodInt;
    usdPerEur: z.ZodNumber;
    capUsdMicros: z.ZodInt;
    spentUsdMicros: z.ZodInt;
    over: z.ZodBoolean;
    revision: z.ZodInt;
    changedAt: z.ZodNullable<z.ZodISODateTime>;
    changedBy: z.ZodNullable<z.ZodString>;
    perAgent: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        usdMicros: z.ZodInt;
        estimated: z.ZodBoolean;
        bySource: z.ZodRecord<z.ZodEnum<{
            tool: "tool";
            ricerca: "ricerca";
            lab: "lab";
            model: "model";
        }> & z.core.$partial, z.ZodInt>;
    }, z.core.$strict>>;
    unreadSources: z.ZodArray<z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
    }>>;
}, z.core.$strict>;
export type InternalCompanySpendResponse = z.infer<typeof InternalCompanySpendResponseSchema>;
/** `since` restarts the counter (reset); `revision` is the one the caller read. */
export declare const InternalCompanySpendCapUpdateBodySchema: z.ZodObject<{
    revision: z.ZodInt;
    capEurCents: z.ZodInt;
    since: z.ZodOptional<z.ZodISODateTime>;
    changedBy: z.ZodString;
}, z.core.$strict>;
export type InternalCompanySpendCapUpdateBody = z.infer<typeof InternalCompanySpendCapUpdateBodySchema>;
export declare const InternalCompanySpendErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        invalid_config: "invalid_config";
        unauthorized: "unauthorized";
        unknown_company: "unknown_company";
        guard_off: "guard_off";
        stale_revision: "stale_revision";
        below_business_units: "below_business_units";
    }>;
    currentRevision: z.ZodOptional<z.ZodInt>;
}, z.core.$strict>;
export type InternalCompanySpendError = z.infer<typeof InternalCompanySpendErrorSchema>;
export declare const internalCompanySpendReadContract: {
    readonly method: "GET";
    readonly path: "/internal/companies/:company/spend";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        company: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        company: z.ZodString;
        label: z.ZodString;
        since: z.ZodISODateTime;
        capEurCents: z.ZodInt;
        usdPerEur: z.ZodNumber;
        capUsdMicros: z.ZodInt;
        spentUsdMicros: z.ZodInt;
        over: z.ZodBoolean;
        revision: z.ZodInt;
        changedAt: z.ZodNullable<z.ZodISODateTime>;
        changedBy: z.ZodNullable<z.ZodString>;
        perAgent: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            usdMicros: z.ZodInt;
            estimated: z.ZodBoolean;
            bySource: z.ZodRecord<z.ZodEnum<{
                tool: "tool";
                ricerca: "ricerca";
                lab: "lab";
                model: "model";
            }> & z.core.$partial, z.ZodInt>;
        }, z.core.$strict>>;
        unreadSources: z.ZodArray<z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
        }>>;
    }, z.core.$strict>;
};
/** The response is the same report as the read, taken after the change. */
export declare const internalCompanySpendCapUpdateContract: {
    readonly method: "PUT";
    readonly path: "/internal/companies/:company/spend";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        company: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        revision: z.ZodInt;
        capEurCents: z.ZodInt;
        since: z.ZodOptional<z.ZodISODateTime>;
        changedBy: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        company: z.ZodString;
        label: z.ZodString;
        since: z.ZodISODateTime;
        capEurCents: z.ZodInt;
        usdPerEur: z.ZodNumber;
        capUsdMicros: z.ZodInt;
        spentUsdMicros: z.ZodInt;
        over: z.ZodBoolean;
        revision: z.ZodInt;
        changedAt: z.ZodNullable<z.ZodISODateTime>;
        changedBy: z.ZodNullable<z.ZodString>;
        perAgent: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            usdMicros: z.ZodInt;
            estimated: z.ZodBoolean;
            bySource: z.ZodRecord<z.ZodEnum<{
                tool: "tool";
                ricerca: "ricerca";
                lab: "lab";
                model: "model";
            }> & z.core.$partial, z.ZodInt>;
        }, z.core.$strict>>;
        unreadSources: z.ZodArray<z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
        }>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-company-spend.d.ts.map