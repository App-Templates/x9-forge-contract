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
    skipped: "skipped";
    ambiguous: "ambiguous";
    woken: "woken";
    not_waiting: "not_waiting";
    no_mandate: "no_mandate";
}>;
export declare const InternalPaperclipSeatReplyWakeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        skipped: "skipped";
        ambiguous: "ambiguous";
        woken: "woken";
        not_waiting: "not_waiting";
        no_mandate: "no_mandate";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    runId: z.ZodOptional<z.ZodUUID>;
    disposition: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"commented">;
        issueId: z.ZodUUID;
        commentId: z.ZodUUID;
        assigneeAgentId: z.ZodUUID;
        authorAgentId: z.ZodNullable<z.ZodUUID>;
        woke: z.ZodBoolean;
        runId: z.ZodOptional<z.ZodUUID>;
        notWokenReason: z.ZodOptional<z.ZodEnum<{
            unknown: "unknown";
            issue_closed: "issue_closed";
            run_alive: "run_alive";
            daily_run_limit: "daily_run_limit";
            daily_cost_limit: "daily_cost_limit";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"duplicate">;
        dedupeKey: z.ZodString;
        issueId: z.ZodOptional<z.ZodUUID>;
        commentId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"refused">;
        disposition: z.ZodObject<{
            nature: z.ZodEnum<{
                cancelled: "cancelled";
                invalid_request: "invalid_request";
                technical_failure: "technical_failure";
                permission_refused: "permission_refused";
                limit_reached: "limit_reached";
                missing_data: "missing_data";
            }>;
            retry: z.ZodEnum<{
                never: "never";
                next_turn: "next_turn";
                after_delay: "after_delay";
            }>;
            retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
            nextMove: z.ZodEnum<{
                stop: "stop";
                retry_same: "retry_same";
                fix_input: "fix_input";
                ask_director: "ask_director";
                ask_referent: "ask_referent";
                ask_owner: "ask_owner";
                wait_event: "wait_event";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>], "outcome">>;
}, z.core.$strict>;
/**
 * Error codes of a failed seat wake. They name whose fault the failure is.
 * - `paperclip_unavailable`: Paperclip answered with an error or could not be reached.
 * - `wake_timeout`: OUR time limit ran out while Paperclip was answering; Paperclip is not in error.
 */
export declare const PAPERCLIP_SEAT_WAKE_ERROR_CODES: readonly ["paperclip_unavailable", "wake_timeout"];
export declare const PaperclipSeatWakeErrorCodeSchema: z.ZodEnum<{
    paperclip_unavailable: "paperclip_unavailable";
    wake_timeout: "wake_timeout";
}>;
export type PaperclipSeatWakeErrorCode = z.infer<typeof PaperclipSeatWakeErrorCodeSchema>;
export declare const InternalPaperclipSeatWakeErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        paperclip_unavailable: "paperclip_unavailable";
        wake_timeout: "wake_timeout";
    }>;
}, z.core.$strict>;
export type InternalPaperclipSeatWakeErrorResponse = z.infer<typeof InternalPaperclipSeatWakeErrorResponseSchema>;
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
            skipped: "skipped";
            ambiguous: "ambiguous";
            woken: "woken";
            not_waiting: "not_waiting";
            no_mandate: "no_mandate";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        runId: z.ZodOptional<z.ZodUUID>;
        disposition: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"commented">;
            issueId: z.ZodUUID;
            commentId: z.ZodUUID;
            assigneeAgentId: z.ZodUUID;
            authorAgentId: z.ZodNullable<z.ZodUUID>;
            woke: z.ZodBoolean;
            runId: z.ZodOptional<z.ZodUUID>;
            notWokenReason: z.ZodOptional<z.ZodEnum<{
                unknown: "unknown";
                issue_closed: "issue_closed";
                run_alive: "run_alive";
                daily_run_limit: "daily_run_limit";
                daily_cost_limit: "daily_cost_limit";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"duplicate">;
            dedupeKey: z.ZodString;
            issueId: z.ZodOptional<z.ZodUUID>;
            commentId: z.ZodOptional<z.ZodUUID>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"refused">;
            disposition: z.ZodObject<{
                nature: z.ZodEnum<{
                    cancelled: "cancelled";
                    invalid_request: "invalid_request";
                    technical_failure: "technical_failure";
                    permission_refused: "permission_refused";
                    limit_reached: "limit_reached";
                    missing_data: "missing_data";
                }>;
                retry: z.ZodEnum<{
                    never: "never";
                    next_turn: "next_turn";
                    after_delay: "after_delay";
                }>;
                retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
                nextMove: z.ZodEnum<{
                    stop: "stop";
                    retry_same: "retry_same";
                    fix_input: "fix_input";
                    ask_director: "ask_director";
                    ask_referent: "ask_referent";
                    ask_owner: "ask_owner";
                    wait_event: "wait_event";
                }>;
            }, z.core.$strict>;
        }, z.core.$strict>], "outcome">>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            paperclip_unavailable: "paperclip_unavailable";
            wake_timeout: "wake_timeout";
        }>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatReplyWakeRequest = z.infer<typeof InternalPaperclipSeatReplyWakeRequestSchema>;
export type InternalPaperclipSeatReplyWakeResponse = z.infer<typeof InternalPaperclipSeatReplyWakeResponseSchema>;
export type PaperclipSeatReplyWakeResult = z.infer<typeof PaperclipSeatReplyWakeResultSchema>;
export declare const INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH: "/internal/paperclip/seats/native-wake";
export declare const PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES: readonly ["request", "reply", "decision"];
export declare const PaperclipSeatResearchDoneDossierEntrySchema: z.ZodObject<{
    researchId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        budget_exhausted: "budget_exhausted";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
}, z.core.$strict>;
export type PaperclipSeatResearchDoneDossierEntry = z.infer<typeof PaperclipSeatResearchDoneDossierEntrySchema>;
export declare const PaperclipSeatNativeWakeEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"email">;
    messageId: z.ZodString;
    threadKey: z.ZodString;
    mode: z.ZodEnum<{
        reply: "reply";
        decision: "decision";
        request: "request";
    }>;
    projectRef: z.ZodOptional<z.ZodString>;
    from: z.ZodString;
    subject: z.ZodString;
    receivedAt: z.ZodISODateTime;
    excerpt: z.ZodString;
    attachments: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        contentType: z.ZodString;
        size: z.ZodInt;
    }, z.core.$strict>>;
    decision: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        outcome: z.ZodUnion<[z.ZodLiteral<"approved">, z.ZodLiteral<"rejected">]>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"research_done">;
    researchId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        budget_exhausted: "budget_exhausted";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
    question: z.ZodString;
    dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        researchId: z.ZodString;
        state: z.ZodEnum<{
            failed: "failed";
            budget_exhausted: "budget_exhausted";
            completed: "completed";
            queued: "queued";
            running: "running";
        }>;
    }, z.core.$strict>>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"dev_delivered">;
    sessionIssue: z.ZodNumber;
    commit: z.ZodString;
    projectId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"work_stalled">;
    issueId: z.ZodUUID;
    identifier: z.ZodString;
    title: z.ZodString;
    unitId: z.ZodString;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    stalledSince: z.ZodISODateTime;
    reason: z.ZodEnum<{
        no_activity: "no_activity";
        waiting_too_long: "waiting_too_long";
        queue_not_continued: "queue_not_continued";
    }>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"approved_units_failed">;
    requestId: z.ZodString;
    directorIssueId: z.ZodUUID;
    units: z.ZodArray<z.ZodObject<{
        unitId: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
    attempt: z.ZodInt;
    maxAttempts: z.ZodInt;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"agent_request">;
    request: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        requestId: z.ZodString;
        from: z.ZodObject<{
            unitId: z.ZodString;
            paperclipAgentId: z.ZodUUID;
        }, z.core.$strict>;
        to: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"director">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"lab">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"business_unit">;
            unitId: z.ZodString;
        }, z.core.$strict>], "kind">;
        need: z.ZodString;
        why: z.ZodString;
        mandate: z.ZodObject<{
            issueId: z.ZodUUID;
            identifier: z.ZodString;
        }, z.core.$strict>;
        plan: z.ZodOptional<z.ZodObject<{
            planId: z.ZodString;
            version: z.ZodInt;
        }, z.core.$strict>>;
        requestedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>], "kind">;
export declare const InternalPaperclipSeatNativeWakeRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    eventId: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    identity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>>;
    event: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"email">;
        messageId: z.ZodString;
        threadKey: z.ZodString;
        mode: z.ZodEnum<{
            reply: "reply";
            decision: "decision";
            request: "request";
        }>;
        projectRef: z.ZodOptional<z.ZodString>;
        from: z.ZodString;
        subject: z.ZodString;
        receivedAt: z.ZodISODateTime;
        excerpt: z.ZodString;
        attachments: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            contentType: z.ZodString;
            size: z.ZodInt;
        }, z.core.$strict>>;
        decision: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            outcome: z.ZodUnion<[z.ZodLiteral<"approved">, z.ZodLiteral<"rejected">]>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"research_done">;
        researchId: z.ZodString;
        state: z.ZodEnum<{
            failed: "failed";
            budget_exhausted: "budget_exhausted";
            completed: "completed";
            queued: "queued";
            running: "running";
        }>;
        question: z.ZodString;
        dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
            researchId: z.ZodString;
            state: z.ZodEnum<{
                failed: "failed";
                budget_exhausted: "budget_exhausted";
                completed: "completed";
                queued: "queued";
                running: "running";
            }>;
        }, z.core.$strict>>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"dev_delivered">;
        sessionIssue: z.ZodNumber;
        commit: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"work_stalled">;
        issueId: z.ZodUUID;
        identifier: z.ZodString;
        title: z.ZodString;
        unitId: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        stalledSince: z.ZodISODateTime;
        reason: z.ZodEnum<{
            no_activity: "no_activity";
            waiting_too_long: "waiting_too_long";
            queue_not_continued: "queue_not_continued";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"approved_units_failed">;
        requestId: z.ZodString;
        directorIssueId: z.ZodUUID;
        units: z.ZodArray<z.ZodObject<{
            unitId: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>>;
        attempt: z.ZodInt;
        maxAttempts: z.ZodInt;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"agent_request">;
        request: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            requestId: z.ZodString;
            from: z.ZodObject<{
                unitId: z.ZodString;
                paperclipAgentId: z.ZodUUID;
            }, z.core.$strict>;
            to: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"director">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"lab">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"business_unit">;
                unitId: z.ZodString;
            }, z.core.$strict>], "kind">;
            need: z.ZodString;
            why: z.ZodString;
            mandate: z.ZodObject<{
                issueId: z.ZodUUID;
                identifier: z.ZodString;
            }, z.core.$strict>;
            plan: z.ZodOptional<z.ZodObject<{
                planId: z.ZodString;
                version: z.ZodInt;
            }, z.core.$strict>>;
            requestedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export declare const PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS: readonly ["opened", "woken", "deferred", "duplicate", "already_open", "not_waiting", "no_task", "ambiguous", "not_enabled", "rate_limited"];
export declare const PaperclipSeatNativeWakeResultSchema: z.ZodEnum<{
    duplicate: "duplicate";
    ambiguous: "ambiguous";
    opened: "opened";
    deferred: "deferred";
    woken: "woken";
    not_waiting: "not_waiting";
    already_open: "already_open";
    no_task: "no_task";
    not_enabled: "not_enabled";
    rate_limited: "rate_limited";
}>;
export declare const InternalPaperclipSeatNativeWakeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        ambiguous: "ambiguous";
        opened: "opened";
        deferred: "deferred";
        woken: "woken";
        not_waiting: "not_waiting";
        already_open: "already_open";
        no_task: "no_task";
        not_enabled: "not_enabled";
        rate_limited: "rate_limited";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    commentId: z.ZodOptional<z.ZodUUID>;
    runId: z.ZodOptional<z.ZodUUID>;
    disposition: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"commented">;
        issueId: z.ZodUUID;
        commentId: z.ZodUUID;
        assigneeAgentId: z.ZodUUID;
        authorAgentId: z.ZodNullable<z.ZodUUID>;
        woke: z.ZodBoolean;
        runId: z.ZodOptional<z.ZodUUID>;
        notWokenReason: z.ZodOptional<z.ZodEnum<{
            unknown: "unknown";
            issue_closed: "issue_closed";
            run_alive: "run_alive";
            daily_run_limit: "daily_run_limit";
            daily_cost_limit: "daily_cost_limit";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"duplicate">;
        dedupeKey: z.ZodString;
        issueId: z.ZodOptional<z.ZodUUID>;
        commentId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"refused">;
        disposition: z.ZodObject<{
            nature: z.ZodEnum<{
                cancelled: "cancelled";
                invalid_request: "invalid_request";
                technical_failure: "technical_failure";
                permission_refused: "permission_refused";
                limit_reached: "limit_reached";
                missing_data: "missing_data";
            }>;
            retry: z.ZodEnum<{
                never: "never";
                next_turn: "next_turn";
                after_delay: "after_delay";
            }>;
            retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
            nextMove: z.ZodEnum<{
                stop: "stop";
                retry_same: "retry_same";
                fix_input: "fix_input";
                ask_director: "ask_director";
                ask_referent: "ask_referent";
                ask_owner: "ask_owner";
                wait_event: "wait_event";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>], "outcome">>;
}, z.core.$strict>;
export declare const internalPaperclipSeatNativeWakeContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/seats/native-wake";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        eventId: z.ZodString;
        organizationId: z.ZodOptional<z.ZodString>;
        identity: z.ZodOptional<z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>>;
        event: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"email">;
            messageId: z.ZodString;
            threadKey: z.ZodString;
            mode: z.ZodEnum<{
                reply: "reply";
                decision: "decision";
                request: "request";
            }>;
            projectRef: z.ZodOptional<z.ZodString>;
            from: z.ZodString;
            subject: z.ZodString;
            receivedAt: z.ZodISODateTime;
            excerpt: z.ZodString;
            attachments: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                contentType: z.ZodString;
                size: z.ZodInt;
            }, z.core.$strict>>;
            decision: z.ZodOptional<z.ZodObject<{
                requestId: z.ZodString;
                outcome: z.ZodUnion<[z.ZodLiteral<"approved">, z.ZodLiteral<"rejected">]>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"research_done">;
            researchId: z.ZodString;
            state: z.ZodEnum<{
                failed: "failed";
                budget_exhausted: "budget_exhausted";
                completed: "completed";
                queued: "queued";
                running: "running";
            }>;
            question: z.ZodString;
            dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
                researchId: z.ZodString;
                state: z.ZodEnum<{
                    failed: "failed";
                    budget_exhausted: "budget_exhausted";
                    completed: "completed";
                    queued: "queued";
                    running: "running";
                }>;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"dev_delivered">;
            sessionIssue: z.ZodNumber;
            commit: z.ZodString;
            projectId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"work_stalled">;
            issueId: z.ZodUUID;
            identifier: z.ZodString;
            title: z.ZodString;
            unitId: z.ZodString;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            stalledSince: z.ZodISODateTime;
            reason: z.ZodEnum<{
                no_activity: "no_activity";
                waiting_too_long: "waiting_too_long";
                queue_not_continued: "queue_not_continued";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"approved_units_failed">;
            requestId: z.ZodString;
            directorIssueId: z.ZodUUID;
            units: z.ZodArray<z.ZodObject<{
                unitId: z.ZodString;
                reason: z.ZodString;
            }, z.core.$strict>>;
            attempt: z.ZodInt;
            maxAttempts: z.ZodInt;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"agent_request">;
            request: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                requestId: z.ZodString;
                from: z.ZodObject<{
                    unitId: z.ZodString;
                    paperclipAgentId: z.ZodUUID;
                }, z.core.$strict>;
                to: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"director">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"lab">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"business_unit">;
                    unitId: z.ZodString;
                }, z.core.$strict>], "kind">;
                need: z.ZodString;
                why: z.ZodString;
                mandate: z.ZodObject<{
                    issueId: z.ZodUUID;
                    identifier: z.ZodString;
                }, z.core.$strict>;
                plan: z.ZodOptional<z.ZodObject<{
                    planId: z.ZodString;
                    version: z.ZodInt;
                }, z.core.$strict>>;
                requestedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            ambiguous: "ambiguous";
            opened: "opened";
            deferred: "deferred";
            woken: "woken";
            not_waiting: "not_waiting";
            already_open: "already_open";
            no_task: "no_task";
            not_enabled: "not_enabled";
            rate_limited: "rate_limited";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        commentId: z.ZodOptional<z.ZodUUID>;
        runId: z.ZodOptional<z.ZodUUID>;
        disposition: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"commented">;
            issueId: z.ZodUUID;
            commentId: z.ZodUUID;
            assigneeAgentId: z.ZodUUID;
            authorAgentId: z.ZodNullable<z.ZodUUID>;
            woke: z.ZodBoolean;
            runId: z.ZodOptional<z.ZodUUID>;
            notWokenReason: z.ZodOptional<z.ZodEnum<{
                unknown: "unknown";
                issue_closed: "issue_closed";
                run_alive: "run_alive";
                daily_run_limit: "daily_run_limit";
                daily_cost_limit: "daily_cost_limit";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"duplicate">;
            dedupeKey: z.ZodString;
            issueId: z.ZodOptional<z.ZodUUID>;
            commentId: z.ZodOptional<z.ZodUUID>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"refused">;
            disposition: z.ZodObject<{
                nature: z.ZodEnum<{
                    cancelled: "cancelled";
                    invalid_request: "invalid_request";
                    technical_failure: "technical_failure";
                    permission_refused: "permission_refused";
                    limit_reached: "limit_reached";
                    missing_data: "missing_data";
                }>;
                retry: z.ZodEnum<{
                    never: "never";
                    next_turn: "next_turn";
                    after_delay: "after_delay";
                }>;
                retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
                nextMove: z.ZodEnum<{
                    stop: "stop";
                    retry_same: "retry_same";
                    fix_input: "fix_input";
                    ask_director: "ask_director";
                    ask_referent: "ask_referent";
                    ask_owner: "ask_owner";
                    wait_event: "wait_event";
                }>;
            }, z.core.$strict>;
        }, z.core.$strict>], "outcome">>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            paperclip_unavailable: "paperclip_unavailable";
            wake_timeout: "wake_timeout";
        }>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatNativeWakeRequest = z.infer<typeof InternalPaperclipSeatNativeWakeRequestSchema>;
export type InternalPaperclipSeatNativeWakeResponse = z.infer<typeof InternalPaperclipSeatNativeWakeResponseSchema>;
export type PaperclipSeatNativeWakeEvent = z.infer<typeof PaperclipSeatNativeWakeEventSchema>;
export type PaperclipSeatNativeWakeResult = z.infer<typeof PaperclipSeatNativeWakeResultSchema>;
//# sourceMappingURL=internal-paperclip-seats.d.ts.map