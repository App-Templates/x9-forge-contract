import { z } from 'zod';
export declare const INTERNAL_PAPERCLIP_SEATS_PATH: "/internal/paperclip/seats";
export declare const InternalPaperclipSeatsQuerySchema: z.ZodObject<{
    organizationId: z.ZodString;
}, z.core.$strict>;
/** Read-only seat status. Credential values must never cross this boundary. */
export declare const InternalPaperclipSeatSchema: z.ZodObject<{
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    paperclipAgentId: z.ZodUUID;
    companyId: z.ZodUUID;
    reportsToPaperclipAgentId: z.ZodUUID;
    enrollment: z.ZodObject<{
        state: z.ZodEnum<{
            key_pending: "key_pending";
            enrolled: "enrolled";
        }>;
        attempts: z.ZodInt;
        lastReason: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const InternalPaperclipSeatsResponseSchema: z.ZodObject<{
    seats: z.ZodArray<z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        paperclipAgentId: z.ZodUUID;
        companyId: z.ZodUUID;
        reportsToPaperclipAgentId: z.ZodUUID;
        enrollment: z.ZodObject<{
            state: z.ZodEnum<{
                key_pending: "key_pending";
                enrolled: "enrolled";
            }>;
            attempts: z.ZodInt;
            lastReason: z.ZodOptional<z.ZodString>;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const internalPaperclipSeatsReadContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/seats";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        organizationId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        seats: z.ZodArray<z.ZodObject<{
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            paperclipAgentId: z.ZodUUID;
            companyId: z.ZodUUID;
            reportsToPaperclipAgentId: z.ZodUUID;
            enrollment: z.ZodObject<{
                state: z.ZodEnum<{
                    key_pending: "key_pending";
                    enrolled: "enrolled";
                }>;
                attempts: z.ZodInt;
                lastReason: z.ZodOptional<z.ZodString>;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH: "/internal/paperclip/seats/:paperclipAgentId/issues";
export declare const InternalPaperclipSeatIssuesParamsSchema: z.ZodObject<{
    paperclipAgentId: z.ZodUUID;
}, z.core.$strict>;
export declare const InternalPaperclipSeatIssueSchema: z.ZodObject<{
    issueId: z.ZodString;
    title: z.ZodString;
    status: z.ZodString;
    projectId: z.ZodNullable<z.ZodUUID>;
    goalId: z.ZodNullable<z.ZodUUID>;
    assigneeComments: z.ZodInt;
}, z.core.$strict>;
export declare const InternalPaperclipSeatIssuesResponseSchema: z.ZodObject<{
    paperclipAgentId: z.ZodUUID;
    issues: z.ZodArray<z.ZodObject<{
        issueId: z.ZodString;
        title: z.ZodString;
        status: z.ZodString;
        projectId: z.ZodNullable<z.ZodUUID>;
        goalId: z.ZodNullable<z.ZodUUID>;
        assigneeComments: z.ZodInt;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const internalPaperclipSeatIssuesReadContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/seats/:paperclipAgentId/issues";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        paperclipAgentId: z.ZodUUID;
        issues: z.ZodArray<z.ZodObject<{
            issueId: z.ZodString;
            title: z.ZodString;
            status: z.ZodString;
            projectId: z.ZodNullable<z.ZodUUID>;
            goalId: z.ZodNullable<z.ZodUUID>;
            assigneeComments: z.ZodInt;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH: "/internal/paperclip/seats/:paperclipAgentId/search";
export declare const InternalPaperclipSeatSearchQuerySchema: z.ZodObject<{
    q: z.ZodString;
    kinds: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export declare const InternalPaperclipSeatSearchResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            artifact: "artifact";
            document: "document";
            agent: "agent";
            project: "project";
            comment: "comment";
            issue: "issue";
        }>;
        id: z.ZodString;
        title: z.ZodString;
        snippet: z.ZodString;
        issueId: z.ZodOptional<z.ZodUUID>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    paperclipAgentId: z.ZodUUID;
}, z.core.$strict>;
export declare const internalPaperclipSeatSearchReadContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/seats/:paperclipAgentId/search";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        q: z.ZodString;
        kinds: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        results: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                artifact: "artifact";
                document: "document";
                agent: "agent";
                project: "project";
                comment: "comment";
                issue: "issue";
            }>;
            id: z.ZodString;
            title: z.ZodString;
            snippet: z.ZodString;
            issueId: z.ZodOptional<z.ZodUUID>;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatSearchQuery = z.infer<typeof InternalPaperclipSeatSearchQuerySchema>;
export type InternalPaperclipSeatSearchResponse = z.infer<typeof InternalPaperclipSeatSearchResponseSchema>;
export declare const INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH: "/internal/paperclip/seats/:paperclipAgentId/activity";
export declare const InternalPaperclipSeatActivityQuerySchema: z.ZodObject<{
    since: z.ZodOptional<z.ZodISODateTime>;
    issueId: z.ZodOptional<z.ZodUUID>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export declare const InternalPaperclipSeatActivityResponseSchema: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        actorAgentId: z.ZodNullable<z.ZodUUID>;
        issueId: z.ZodNullable<z.ZodUUID>;
        summary: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    paperclipAgentId: z.ZodUUID;
}, z.core.$strict>;
export declare const internalPaperclipSeatActivityReadContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/seats/:paperclipAgentId/activity";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        since: z.ZodOptional<z.ZodISODateTime>;
        issueId: z.ZodOptional<z.ZodUUID>;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        events: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            actorAgentId: z.ZodNullable<z.ZodUUID>;
            issueId: z.ZodNullable<z.ZodUUID>;
            summary: z.ZodString;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatActivityQuery = z.infer<typeof InternalPaperclipSeatActivityQuerySchema>;
export type InternalPaperclipSeatActivityResponse = z.infer<typeof InternalPaperclipSeatActivityResponseSchema>;
export declare const INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH: "/internal/paperclip/seats/reply-wake";
export declare const InternalPaperclipSeatReplyWakeRequestSchema: z.ZodObject<{
    organizationId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    messageId: z.ZodString;
}, z.core.$strict>;
export declare const PAPERCLIP_SEAT_REPLY_WAKE_RESULTS: readonly ["woken", "skipped", "duplicate", "not_waiting", "no_mandate", "ambiguous"];
export declare const PaperclipSeatReplyWakeResultSchema: z.ZodEnum<{
    duplicate: "duplicate";
    ambiguous: "ambiguous";
    skipped: "skipped";
    woken: "woken";
    not_waiting: "not_waiting";
    no_mandate: "no_mandate";
}>;
export declare const InternalPaperclipSeatReplyWakeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        ambiguous: "ambiguous";
        skipped: "skipped";
        woken: "woken";
        not_waiting: "not_waiting";
        no_mandate: "no_mandate";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    runId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export declare const internalPaperclipSeatReplyWakeContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/seats/reply-wake";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        organizationId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        messageId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            ambiguous: "ambiguous";
            skipped: "skipped";
            woken: "woken";
            not_waiting: "not_waiting";
            no_mandate: "no_mandate";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        runId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatReplyWakeRequest = z.infer<typeof InternalPaperclipSeatReplyWakeRequestSchema>;
export type InternalPaperclipSeatReplyWakeResponse = z.infer<typeof InternalPaperclipSeatReplyWakeResponseSchema>;
export type PaperclipSeatReplyWakeResult = z.infer<typeof PaperclipSeatReplyWakeResultSchema>;
//# sourceMappingURL=internal-paperclip-seats.d.ts.map