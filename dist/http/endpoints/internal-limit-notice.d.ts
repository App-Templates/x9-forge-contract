import { z } from 'zod';
export declare const INTERNAL_LIMIT_NOTICE_PATH: "/internal/limit-notice";
/**
 * Delivery of a daily limit notice to the owner. Spend notices have their own
 * path in agent-core and are refused here.
 */
export declare const InternalLimitNoticeRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    notice: z.ZodObject<{
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
}, z.core.$strict>;
export type InternalLimitNoticeRequest = z.infer<typeof InternalLimitNoticeRequestSchema>;
export declare const INTERNAL_LIMIT_NOTICE_OUTCOMES: readonly ["sent", "already_sent"];
export declare const InternalLimitNoticeOutcomeSchema: z.ZodEnum<{
    sent: "sent";
    already_sent: "already_sent";
}>;
export type InternalLimitNoticeOutcome = z.infer<typeof InternalLimitNoticeOutcomeSchema>;
export declare const INTERNAL_LIMIT_NOTICE_ERRORS: readonly ["invalid_request", "unauthorized", "organization_unknown", "email_unavailable", "not_sent"];
export declare const InternalLimitNoticeErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    unauthorized: "unauthorized";
    organization_unknown: "organization_unknown";
    email_unavailable: "email_unavailable";
    not_sent: "not_sent";
}>;
export type InternalLimitNoticeError = z.infer<typeof InternalLimitNoticeErrorSchema>;
export declare const InternalLimitNoticeResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    ok: z.ZodLiteral<true>;
    outcome: z.ZodEnum<{
        sent: "sent";
        already_sent: "already_sent";
    }>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        unauthorized: "unauthorized";
        organization_unknown: "organization_unknown";
        email_unavailable: "email_unavailable";
        not_sent: "not_sent";
    }>;
}, z.core.$strict>]>;
export type InternalLimitNoticeResponse = z.infer<typeof InternalLimitNoticeResponseSchema>;
export declare const internalLimitNoticeContract: {
    readonly method: "POST";
    readonly path: "/internal/limit-notice";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        notice: z.ZodObject<{
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        ok: z.ZodLiteral<true>;
        outcome: z.ZodEnum<{
            sent: "sent";
            already_sent: "already_sent";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            unauthorized: "unauthorized";
            organization_unknown: "organization_unknown";
            email_unavailable: "email_unavailable";
            not_sent: "not_sent";
        }>;
    }, z.core.$strict>]>;
};
//# sourceMappingURL=internal-limit-notice.d.ts.map