import { z } from 'zod';
export declare const INTERNAL_WORK_STALLED_NOTICE_PATH: "/internal/work-stalled-notice";
/** The third request on the same work without progress stops the loop (decision of 19/11). */
export declare const WORK_STALLED_MIN_OCCURRENCE = 3;
export declare const WORK_STALLED_REASONS: readonly ["repeated_request"];
export declare const WorkStalledReasonSchema: z.ZodEnum<{
    repeated_request: "repeated_request";
}>;
/** Stable reference to the work: the Paperclip issue of the asker and, when the mandate names one, the piece key. Never read from a title. */
export declare const WorkStalledWorkSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    pieceKey: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const WorkStalledNoticeSchema: z.ZodObject<{
    organizationId: z.ZodString;
    agent: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    work: z.ZodObject<{
        issueId: z.ZodUUID;
        pieceKey: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    reason: z.ZodEnum<{
        repeated_request: "repeated_request";
    }>;
    occurrence: z.ZodNumber;
    since: z.ZodISODateTime;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type WorkStalledNotice = z.infer<typeof WorkStalledNoticeSchema>;
export declare const InternalWorkStalledNoticeRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    notice: z.ZodObject<{
        organizationId: z.ZodString;
        agent: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        work: z.ZodObject<{
            issueId: z.ZodUUID;
            pieceKey: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        reason: z.ZodEnum<{
            repeated_request: "repeated_request";
        }>;
        occurrence: z.ZodNumber;
        since: z.ZodISODateTime;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export type InternalWorkStalledNoticeRequest = z.infer<typeof InternalWorkStalledNoticeRequestSchema>;
export declare const INTERNAL_WORK_STALLED_NOTICE_OUTCOMES: readonly ["sent", "already_sent"];
export declare const InternalWorkStalledNoticeOutcomeSchema: z.ZodEnum<{
    sent: "sent";
    already_sent: "already_sent";
}>;
/** Opaque receipt: same work and same `since` give the same id, so a repeat returns it again. */
export declare const WorkStalledReceiptSchema: z.ZodObject<{
    id: z.ZodString;
    recordedAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const INTERNAL_WORK_STALLED_NOTICE_ERRORS: readonly ["invalid_request", "unauthorized", "organization_unknown", "email_unavailable", "not_sent"];
export declare const InternalWorkStalledNoticeErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    unauthorized: "unauthorized";
    organization_unknown: "organization_unknown";
    email_unavailable: "email_unavailable";
    not_sent: "not_sent";
}>;
export declare const InternalWorkStalledNoticeResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    ok: z.ZodLiteral<true>;
    outcome: z.ZodEnum<{
        sent: "sent";
        already_sent: "already_sent";
    }>;
    receipt: z.ZodObject<{
        id: z.ZodString;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>;
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
export type InternalWorkStalledNoticeResponse = z.infer<typeof InternalWorkStalledNoticeResponseSchema>;
export declare const internalWorkStalledNoticeContract: {
    readonly method: "POST";
    readonly path: "/internal/work-stalled-notice";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        notice: z.ZodObject<{
            organizationId: z.ZodString;
            agent: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            work: z.ZodObject<{
                issueId: z.ZodUUID;
                pieceKey: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            reason: z.ZodEnum<{
                repeated_request: "repeated_request";
            }>;
            occurrence: z.ZodNumber;
            since: z.ZodISODateTime;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        ok: z.ZodLiteral<true>;
        outcome: z.ZodEnum<{
            sent: "sent";
            already_sent: "already_sent";
        }>;
        receipt: z.ZodObject<{
            id: z.ZodString;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>;
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
//# sourceMappingURL=internal-work-stalled-notice.d.ts.map