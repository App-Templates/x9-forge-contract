import { z } from 'zod';
/**
 * The one message that says a cap stopped (or is about to stop) an agent. Paperclip skips a wake over its daily run
 * cap without telling anyone, and the spend cap refuses a turn without a notice: this is the fixed shape and the fixed
 * sentence both are told with. Cap VALUES are never written here; whoever writes the notice supplies them.
 */
export declare const LIMIT_NOTICE_LIMITS: readonly ["daily_runs", "daily_cost", "company_spend", "business_unit_spend"];
export declare const LimitNoticeLimitSchema: z.ZodEnum<{
    company_spend: "company_spend";
    daily_runs: "daily_runs";
    daily_cost: "daily_cost";
    business_unit_spend: "business_unit_spend";
}>;
export type LimitNoticeLimit = z.infer<typeof LimitNoticeLimitSchema>;
/** Paperclip's units for the two daily caps; spend uses the unit of InternalCompanySpendResponseSchema. */
export declare const LIMIT_NOTICE_UNITS: {
    readonly daily_runs: "runs";
    readonly daily_cost: "usd_cents";
    readonly company_spend: "usd_micros";
    readonly business_unit_spend: "usd_micros";
};
export declare const LIMIT_NOTICE_THRESHOLDS: readonly ["warning_80", "reached"];
export declare const LimitNoticeThresholdSchema: z.ZodEnum<{
    warning_80: "warning_80";
    reached: "reached";
}>;
export type LimitNoticeThreshold = z.infer<typeof LimitNoticeThresholdSchema>;
export declare const LIMIT_NOTICE_EVENTS: readonly ["wake_skipped", "turn_refused", "warning"];
export declare const LimitNoticeEventSchema: z.ZodEnum<{
    wake_skipped: "wake_skipped";
    turn_refused: "turn_refused";
    warning: "warning";
}>;
export type LimitNoticeEvent = z.infer<typeof LimitNoticeEventSchema>;
export declare const LIMIT_NOTICE_RECIPIENTS: readonly ["director", "owner"];
export declare const LimitNoticeRecipientSchema: z.ZodEnum<{
    owner: "owner";
    director: "director";
}>;
/** The next UTC midnight after `iso`, as `…T00:00:00.000Z`. Pure: the time comes only from the argument. */
export declare function nextUtcMidnight(iso: string): string;
export declare const LimitNoticeSchema: z.ZodObject<{
    limit: z.ZodEnum<{
        company_spend: "company_spend";
        daily_runs: "daily_runs";
        daily_cost: "daily_cost";
        business_unit_spend: "business_unit_spend";
    }>;
    limitValue: z.ZodNumber;
    observedValue: z.ZodNumber;
    threshold: z.ZodEnum<{
        warning_80: "warning_80";
        reached: "reached";
    }>;
    event: z.ZodEnum<{
        wake_skipped: "wake_skipped";
        turn_refused: "turn_refused";
        warning: "warning";
    }>;
    organizationId: z.ZodString;
    agent: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>>;
    wakeupRequestId: z.ZodOptional<z.ZodUUID>;
    issueId: z.ZodOptional<z.ZodUUID>;
    observedAt: z.ZodISODateTime;
    resetsAt: z.ZodOptional<z.ZodISODateTime>;
    spend: z.ZodOptional<z.ZodObject<{
        scopeName: z.ZodString;
        windowStart: z.ZodISODateTime;
        usdPerEur: z.ZodNumber;
    }, z.core.$strict>>;
    recipients: z.ZodArray<z.ZodEnum<{
        owner: "owner";
        director: "director";
    }>>;
}, z.core.$strict>;
export type LimitNotice = z.infer<typeof LimitNoticeSchema>;
/** One fixed Italian line for a notice. Pure: same notice, same string; throws if the notice is not valid. */
export declare function renderLimitNotice(notice: LimitNotice): string;
//# sourceMappingURL=limit-notice.d.ts.map