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
    sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
}, z.core.$strict>;
export declare const PAPERCLIP_SOURCE_RUN_REFUSALS: readonly ["source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PAPERCLIP_SEAT_REPLY_WAKE_RESULTS: readonly ["woken", "skipped", "duplicate", "not_waiting", "no_mandate", "ambiguous", "source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PaperclipSeatReplyWakeResultSchema: z.ZodEnum<{
    duplicate: "duplicate";
    skipped: "skipped";
    ambiguous: "ambiguous";
    source_run_unknown: "source_run_unknown";
    source_run_without_issue: "source_run_without_issue";
    source_issue_not_agents: "source_issue_not_agents";
    source_issue_closed: "source_issue_closed";
    woken: "woken";
    not_waiting: "not_waiting";
    no_mandate: "no_mandate";
}>;
/**
 * How a `woken` answer reached the agent when no run id is known: `monitor_check` = cap-paperclip asked Paperclip to run the
 * issue's scheduled monitor now (POST /api/issues/:id/monitor/check-now) and Paperclip wakes the assignee with `issue_monitor_due`.
 */
export declare const PAPERCLIP_SEAT_REPLY_WAKE_VIA: readonly ["monitor_check"];
export declare const PaperclipSeatReplyWakeViaSchema: z.ZodEnum<{
    monitor_check: "monitor_check";
}>;
export type PaperclipSeatReplyWakeVia = z.infer<typeof PaperclipSeatReplyWakeViaSchema>;
export declare const InternalPaperclipSeatReplyWakeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        skipped: "skipped";
        ambiguous: "ambiguous";
        source_run_unknown: "source_run_unknown";
        source_run_without_issue: "source_run_without_issue";
        source_issue_not_agents: "source_issue_not_agents";
        source_issue_closed: "source_issue_closed";
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
    via: z.ZodOptional<z.ZodEnum<{
        monitor_check: "monitor_check";
    }>>;
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
        sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            skipped: "skipped";
            ambiguous: "ambiguous";
            source_run_unknown: "source_run_unknown";
            source_run_without_issue: "source_run_without_issue";
            source_issue_not_agents: "source_issue_not_agents";
            source_issue_closed: "source_issue_closed";
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
        via: z.ZodOptional<z.ZodEnum<{
            monitor_check: "monitor_check";
        }>>;
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
export declare const PAPERCLIP_APPROVED_UNITS_RETRY_HARD_CAP = 15;
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
    sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
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
    sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"dev_material_needed">;
    sessionIssue: z.ZodNumber;
    projectId: z.ZodString;
    requestKey: z.ZodString;
    sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
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
        details: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                technical_fault: "technical_fault";
                clearance: "clearance";
                clarification: "clarification";
                scope_decision: "scope_decision";
            }>;
            cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"question">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"refusal">;
                code: z.ZodString;
                tried: z.ZodArray<z.ZodString>;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        requestedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"project_delivered">;
    projectId: z.ZodString;
    messageId: z.ZodString;
    sentAt: z.ZodISODateTime;
    digest: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"limit_lifted">;
    limit: z.ZodLiteral<"company_spend">;
    revision: z.ZodInt;
    liftedAt: z.ZodISODateTime;
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
        sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
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
        sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"dev_material_needed">;
        sessionIssue: z.ZodNumber;
        projectId: z.ZodString;
        requestKey: z.ZodString;
        sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
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
            details: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    technical_fault: "technical_fault";
                    clearance: "clearance";
                    clarification: "clarification";
                    scope_decision: "scope_decision";
                }>;
                cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"question">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"refusal">;
                    code: z.ZodString;
                    tried: z.ZodArray<z.ZodString>;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            requestedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project_delivered">;
        projectId: z.ZodString;
        messageId: z.ZodString;
        sentAt: z.ZodISODateTime;
        digest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"limit_lifted">;
        limit: z.ZodLiteral<"company_spend">;
        revision: z.ZodInt;
        liftedAt: z.ZodISODateTime;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
/** Name of the monitor the chief leaves while it waits on a session; sibling of `LIMIT_WAIT_SERVICE_NAME`. */
export declare const DEV_SESSION_WAIT_SERVICE_NAME = "dev-session";
/** Read the stored monitor tolerantly: Paperclip adds fields and nullable values to its policy. */
export declare function waitsOnDevSession(policy: unknown): boolean;
export declare const PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS: readonly ["opened", "woken", "deferred", "duplicate", "already_open", "not_waiting", "no_task", "ambiguous", "not_enabled", "rate_limited", "waiting_on_blockers", "source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PaperclipSeatNativeWakeResultSchema: z.ZodEnum<{
    duplicate: "duplicate";
    ambiguous: "ambiguous";
    opened: "opened";
    deferred: "deferred";
    source_run_unknown: "source_run_unknown";
    source_run_without_issue: "source_run_without_issue";
    source_issue_not_agents: "source_issue_not_agents";
    source_issue_closed: "source_issue_closed";
    woken: "woken";
    not_waiting: "not_waiting";
    already_open: "already_open";
    no_task: "no_task";
    not_enabled: "not_enabled";
    rate_limited: "rate_limited";
    waiting_on_blockers: "waiting_on_blockers";
}>;
export declare const InternalPaperclipSeatNativeWakeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        ambiguous: "ambiguous";
        opened: "opened";
        deferred: "deferred";
        source_run_unknown: "source_run_unknown";
        source_run_without_issue: "source_run_without_issue";
        source_issue_not_agents: "source_issue_not_agents";
        source_issue_closed: "source_issue_closed";
        woken: "woken";
        not_waiting: "not_waiting";
        already_open: "already_open";
        no_task: "no_task";
        not_enabled: "not_enabled";
        rate_limited: "rate_limited";
        waiting_on_blockers: "waiting_on_blockers";
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
            sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
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
            sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"dev_material_needed">;
            sessionIssue: z.ZodNumber;
            projectId: z.ZodString;
            requestKey: z.ZodString;
            sourceRunId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "RunId", "out">>;
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
                details: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<{
                        technical_fault: "technical_fault";
                        clearance: "clearance";
                        clarification: "clarification";
                        scope_decision: "scope_decision";
                    }>;
                    cause: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"question">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"refusal">;
                        code: z.ZodString;
                        tried: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>], "kind">;
                }, z.core.$strict>>;
                requestedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"project_delivered">;
            projectId: z.ZodString;
            messageId: z.ZodString;
            sentAt: z.ZodISODateTime;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"limit_lifted">;
            limit: z.ZodLiteral<"company_spend">;
            revision: z.ZodInt;
            liftedAt: z.ZodISODateTime;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            ambiguous: "ambiguous";
            opened: "opened";
            deferred: "deferred";
            source_run_unknown: "source_run_unknown";
            source_run_without_issue: "source_run_without_issue";
            source_issue_not_agents: "source_issue_not_agents";
            source_issue_closed: "source_issue_closed";
            woken: "woken";
            not_waiting: "not_waiting";
            already_open: "already_open";
            no_task: "no_task";
            not_enabled: "not_enabled";
            rate_limited: "rate_limited";
            waiting_on_blockers: "waiting_on_blockers";
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
export declare const INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH: "/internal/paperclip/seats/session-child";
export declare const DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX = 100000;
export declare const InternalPaperclipSeatSessionChildRequestSchema: z.ZodObject<{
    organizationId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    sessionKey: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>;
export declare const PAPERCLIP_SEAT_SESSION_CHILD_RESULTS: readonly ["opened", "duplicate", "executor_missing", "executor_ambiguous", "source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PaperclipSeatSessionChildResultSchema: z.ZodEnum<{
    duplicate: "duplicate";
    opened: "opened";
    source_run_unknown: "source_run_unknown";
    source_run_without_issue: "source_run_without_issue";
    source_issue_not_agents: "source_issue_not_agents";
    source_issue_closed: "source_issue_closed";
    executor_missing: "executor_missing";
    executor_ambiguous: "executor_ambiguous";
}>;
export declare const InternalPaperclipSeatSessionChildResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        opened: "opened";
        source_run_unknown: "source_run_unknown";
        source_run_without_issue: "source_run_without_issue";
        source_issue_not_agents: "source_issue_not_agents";
        source_issue_closed: "source_issue_closed";
        executor_missing: "executor_missing";
        executor_ambiguous: "executor_ambiguous";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    identifier: z.ZodOptional<z.ZodString>;
    executorAgentId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
/**
 * cap-paperclip writes POST /api/companies/:companyId/issues with
 * { title, description, parentId, assigneeAgentId, status: 'todo', idempotencyKey: sessionKey }.
 * Never use /issues/:id/children: that route silently ignores the idempotency key.
 * The key includes the chief's session number and attempt, and is company-wide for seven days.
 */
export declare const internalPaperclipSeatSessionChildContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/seats/session-child";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        organizationId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        sessionKey: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            opened: "opened";
            source_run_unknown: "source_run_unknown";
            source_run_without_issue: "source_run_without_issue";
            source_issue_not_agents: "source_issue_not_agents";
            source_issue_closed: "source_issue_closed";
            executor_missing: "executor_missing";
            executor_ambiguous: "executor_ambiguous";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        identifier: z.ZodOptional<z.ZodString>;
        executorAgentId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            paperclip_unavailable: "paperclip_unavailable";
            wake_timeout: "wake_timeout";
        }>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatSessionChildRequest = z.infer<typeof InternalPaperclipSeatSessionChildRequestSchema>;
export type InternalPaperclipSeatSessionChildResponse = z.infer<typeof InternalPaperclipSeatSessionChildResponseSchema>;
export type PaperclipSeatSessionChildResult = z.infer<typeof PaperclipSeatSessionChildResultSchema>;
export declare const INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH: "/internal/paperclip/seats/session-contract";
export declare const InternalPaperclipSeatSessionContractRequestSchema: z.ZodObject<{
    organizationId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    issueNumber: z.ZodInt;
    document: z.ZodObject<{
        key: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        body: z.ZodString;
        changeSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS: readonly ["written", "unchanged", "not_enabled", "source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PaperclipSeatSessionContractResultSchema: z.ZodEnum<{
    unchanged: "unchanged";
    source_run_unknown: "source_run_unknown";
    source_run_without_issue: "source_run_without_issue";
    source_issue_not_agents: "source_issue_not_agents";
    source_issue_closed: "source_issue_closed";
    not_enabled: "not_enabled";
    written: "written";
}>;
export declare const InternalPaperclipSeatSessionContractResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        unchanged: "unchanged";
        source_run_unknown: "source_run_unknown";
        source_run_without_issue: "source_run_without_issue";
        source_issue_not_agents: "source_issue_not_agents";
        source_issue_closed: "source_issue_closed";
        not_enabled: "not_enabled";
        written: "written";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    revisionNumber: z.ZodOptional<z.ZodInt>;
}, z.core.$strict>;
export declare const internalPaperclipSeatSessionContractContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/seats/session-contract";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        organizationId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        issueNumber: z.ZodInt;
        document: z.ZodObject<{
            key: z.ZodString;
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            body: z.ZodString;
            changeSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            unchanged: "unchanged";
            source_run_unknown: "source_run_unknown";
            source_run_without_issue: "source_run_without_issue";
            source_issue_not_agents: "source_issue_not_agents";
            source_issue_closed: "source_issue_closed";
            not_enabled: "not_enabled";
            written: "written";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        revisionNumber: z.ZodOptional<z.ZodInt>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            paperclip_unavailable: "paperclip_unavailable";
            wake_timeout: "wake_timeout";
        }>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatSessionContractRequest = z.infer<typeof InternalPaperclipSeatSessionContractRequestSchema>;
export type InternalPaperclipSeatSessionContractResponse = z.infer<typeof InternalPaperclipSeatSessionContractResponseSchema>;
export type PaperclipSeatSessionContractResult = z.infer<typeof PaperclipSeatSessionContractResultSchema>;
export declare const INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH: "/internal/paperclip/seats/session-mandate";
export declare const InternalPaperclipSeatSessionMandateRequestSchema: z.ZodObject<{
    organizationId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
}, z.core.$strict>;
export declare const PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS: readonly ["read", "not_enabled", "mandate_missing", "mandate_invalid", "source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PaperclipSeatSessionMandateResultSchema: z.ZodEnum<{
    read: "read";
    source_run_unknown: "source_run_unknown";
    source_run_without_issue: "source_run_without_issue";
    source_issue_not_agents: "source_issue_not_agents";
    source_issue_closed: "source_issue_closed";
    not_enabled: "not_enabled";
    mandate_missing: "mandate_missing";
    mandate_invalid: "mandate_invalid";
}>;
export declare const PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS: readonly ["verified", "criteria_only"];
export declare const PaperclipSeatSessionMandateBindingSchema: z.ZodEnum<{
    verified: "verified";
    criteria_only: "criteria_only";
}>;
export type PaperclipSeatSessionMandateBinding = z.infer<typeof PaperclipSeatSessionMandateBindingSchema>;
export declare const InternalPaperclipSeatSessionMandateResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        read: "read";
        source_run_unknown: "source_run_unknown";
        source_run_without_issue: "source_run_without_issue";
        source_issue_not_agents: "source_issue_not_agents";
        source_issue_closed: "source_issue_closed";
        not_enabled: "not_enabled";
        mandate_missing: "mandate_missing";
        mandate_invalid: "mandate_invalid";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    mandate: z.ZodOptional<z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        planSection: z.ZodObject<{
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            planDigest: z.ZodString;
            businessUnit: z.ZodObject<{
                buSlug: z.ZodString;
                typeId: z.ZodEnum<{
                    dati: "dati";
                    design: "design";
                    sviluppo: "sviluppo";
                    finanza: "finanza";
                    marketing: "marketing";
                }>;
                mandate: z.ZodString;
                competencies: z.ZodArray<z.ZodString>;
                lead: z.ZodObject<{
                    role: z.ZodLiteral<"capo-bu">;
                }, z.core.$strict>;
                reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                    buSlug: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    role: z.ZodLiteral<"director">;
                }, z.core.$strict>]>>;
                executor: z.ZodEnum<{
                    agent: "agent";
                    dev_session: "dev_session";
                    night: "night";
                }>;
                referent: z.ZodObject<{
                    personRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                }, z.core.$strict>;
                firstActivities: z.ZodArray<z.ZodString>;
                sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    expectedGoal: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    requirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        text: z.ZodString;
                        attestor: z.ZodEnum<{
                            sessione: "sessione";
                            esecutore: "esecutore";
                            revisore: "revisore";
                            referente: "referente";
                        }>;
                        proof: z.ZodString;
                        origin: z.ZodEnum<{
                            capo: "capo";
                            mandato: "mandato";
                            ritorno: "ritorno";
                        }>;
                        reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"requirement">;
                            id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"decision">;
                            requestId: z.ZodString;
                        }, z.core.$strict>], "kind">]>>;
                        unit: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>>;
                    specifications: z.ZodOptional<z.ZodObject<{
                        inputData: z.ZodArray<z.ZodString>;
                        technicalConstraints: z.ZodArray<z.ZodString>;
                        outOfScope: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                    outputForm: z.ZodOptional<z.ZodString>;
                    milestone: z.ZodNumber;
                    needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        buSlug: z.ZodString;
                        what: z.ZodString;
                    }, z.core.$strict>>>;
                    documentFormat: z.ZodOptional<z.ZodObject<{
                        mediaType: z.ZodString;
                        parts: z.ZodArray<z.ZodString>;
                        length: z.ZodObject<{
                            unit: z.ZodEnum<{
                                pages: "pages";
                                words: "words";
                            }>;
                            min: z.ZodNumber;
                            max: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>>;
                    documentSources: z.ZodOptional<z.ZodObject<{
                        pages: z.ZodArray<z.ZodObject<{
                            slug: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>>;
                        materials: z.ZodArray<z.ZodObject<{
                            assetId: z.ZodString;
                            sha256: z.ZodString;
                            name: z.ZodString;
                            mediaType: z.ZodString;
                            sizeBytes: z.ZodNumber;
                            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                kind: z.ZodLiteral<"email">;
                                messageId: z.ZodString;
                                attachmentName: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"archive">;
                                archiveSha256: z.ZodString;
                                entryPath: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"session">;
                                sessionId: z.ZodString;
                                repo: z.ZodOptional<z.ZodString>;
                                commit: z.ZodOptional<z.ZodString>;
                                path: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"link">;
                                url: z.ZodURL;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"generated">;
                                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                                sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            }, z.core.$strict>], "kind">;
                            tenantId: z.ZodString;
                            companyId: z.ZodString;
                            projectId: z.ZodString;
                            assetType: z.ZodOptional<z.ZodString>;
                            buSlug: z.ZodOptional<z.ZodString>;
                            providedBy: z.ZodOptional<z.ZodObject<{
                                personRef: z.ZodString;
                            }, z.core.$strict>>;
                            createdAt: z.ZodISODateTime;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    role: z.ZodString;
                    competencies: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>>;
                start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"now">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"planned">;
                    unlockedBy: z.ZodObject<{
                        milestone: z.ZodNumber;
                        delivery: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                gapRule: z.ZodOptional<z.ZodEnum<{
                    mark_and_proceed: "mark_and_proceed";
                    stop_and_ask: "stop_and_ask";
                }>>;
                signOffs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    signer: z.ZodEnum<{
                        owner: "owner";
                        director: "director";
                        referent: "referent";
                    }>;
                    form: z.ZodLiteral<"decision_request">;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            project: z.ZodOptional<z.ZodObject<{
                objective: z.ZodObject<{
                    request: z.ZodString;
                    expectedResult: z.ZodString;
                    measure: z.ZodString;
                }, z.core.$strict>;
                objectiveTree: z.ZodObject<{
                    project: z.ZodObject<{
                        expectedResult: z.ZodString;
                        deliveryCriteria: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            unitObjective: z.ZodOptional<z.ZodObject<{
                buSlug: z.ZodString;
                expectedResult: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                indicators: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    source: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            deliveryShape: z.ZodOptional<z.ZodEnum<{
                product: "product";
                study: "study";
            }>>;
            workBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                parentId: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                expectedGoal: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                requirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    text: z.ZodString;
                    attestor: z.ZodEnum<{
                        sessione: "sessione";
                        esecutore: "esecutore";
                        revisore: "revisore";
                        referente: "referente";
                    }>;
                    proof: z.ZodString;
                    origin: z.ZodEnum<{
                        capo: "capo";
                        mandato: "mandato";
                        ritorno: "ritorno";
                    }>;
                    reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"requirement">;
                        id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"decision">;
                        requestId: z.ZodString;
                    }, z.core.$strict>], "kind">]>>;
                    unit: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                specifications: z.ZodOptional<z.ZodObject<{
                    inputData: z.ZodArray<z.ZodString>;
                    technicalConstraints: z.ZodArray<z.ZodString>;
                    outOfScope: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
                outputForm: z.ZodOptional<z.ZodString>;
                milestone: z.ZodNumber;
                owners: z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    does: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            exchanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
                fromBu: z.ZodString;
                toBu: z.ZodString;
                what: z.ZodString;
                format: z.ZodString;
                key: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                question: z.ZodString;
                unlocks: z.ZodString;
                askTo: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    personRef: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"director">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"business_unit">;
                    buSlug: z.ZodString;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>>>;
            sourceCoverage: z.ZodOptional<z.ZodArray<z.ZodObject<{
                topic: z.ZodString;
                status: z.ZodEnum<{
                    partial: "partial";
                    covered: "covered";
                    missing: "missing";
                }>;
                pages: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        decision: z.ZodObject<{
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>;
        referent: z.ZodObject<{
            personRef: z.ZodString;
            entryVersion: z.ZodNumber;
        }, z.core.$strict>;
        notebookPages: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
        reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"agrees">;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"conflict">;
            conflicts: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    decision: "decision";
                    referent: "referent";
                    plan_section: "plan_section";
                    notebook_page: "notebook_page";
                }>;
                ref: z.ZodString;
                reason: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"missing">;
            missing: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    decision: "decision";
                    referent: "referent";
                    plan_section: "plan_section";
                    notebook_page: "notebook_page";
                }>;
                ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>], "outcome">;
        reconciledAt: z.ZodISODateTime;
        workplace: z.ZodOptional<z.ZodObject<{
            repository: z.ZodObject<{
                host: z.ZodEnum<{
                    bitbucket: "bitbucket";
                    github: "github";
                }>;
                repo: z.ZodString;
            }, z.core.$strict>;
            folder: z.ZodOptional<z.ZodString>;
            sessionBoard: z.ZodOptional<z.ZodObject<{
                repo: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        workMode: z.ZodOptional<z.ZodObject<{
            executor: z.ZodEnum<{
                agent: "agent";
                dev_session: "dev_session";
                night: "night";
            }>;
            allowedTools: z.ZodArray<z.ZodString>;
            excludedTools: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    mandateBinding: z.ZodOptional<z.ZodEnum<{
        verified: "verified";
        criteria_only: "criteria_only";
    }>>;
    reason: z.ZodOptional<z.ZodEnum<{
        not_json: "not_json";
        not_a_mandate: "not_a_mandate";
    }>>;
}, z.core.$strict>;
export declare const internalPaperclipSeatSessionMandateContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/seats/session-mandate";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        organizationId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            read: "read";
            source_run_unknown: "source_run_unknown";
            source_run_without_issue: "source_run_without_issue";
            source_issue_not_agents: "source_issue_not_agents";
            source_issue_closed: "source_issue_closed";
            not_enabled: "not_enabled";
            mandate_missing: "mandate_missing";
            mandate_invalid: "mandate_invalid";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        mandate: z.ZodOptional<z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodString;
            planSection: z.ZodObject<{
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                planDigest: z.ZodString;
                businessUnit: z.ZodObject<{
                    buSlug: z.ZodString;
                    typeId: z.ZodEnum<{
                        dati: "dati";
                        design: "design";
                        sviluppo: "sviluppo";
                        finanza: "finanza";
                        marketing: "marketing";
                    }>;
                    mandate: z.ZodString;
                    competencies: z.ZodArray<z.ZodString>;
                    lead: z.ZodObject<{
                        role: z.ZodLiteral<"capo-bu">;
                    }, z.core.$strict>;
                    reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                        buSlug: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        role: z.ZodLiteral<"director">;
                    }, z.core.$strict>]>>;
                    executor: z.ZodEnum<{
                        agent: "agent";
                        dev_session: "dev_session";
                        night: "night";
                    }>;
                    referent: z.ZodObject<{
                        personRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                    }, z.core.$strict>;
                    firstActivities: z.ZodArray<z.ZodString>;
                    sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        expectedGoal: z.ZodString;
                        deliveryCriteria: z.ZodArray<z.ZodString>;
                        requirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            text: z.ZodString;
                            attestor: z.ZodEnum<{
                                sessione: "sessione";
                                esecutore: "esecutore";
                                revisore: "revisore";
                                referente: "referente";
                            }>;
                            proof: z.ZodString;
                            origin: z.ZodEnum<{
                                capo: "capo";
                                mandato: "mandato";
                                ritorno: "ritorno";
                            }>;
                            reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                                kind: z.ZodLiteral<"requirement">;
                                id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"decision">;
                                requestId: z.ZodString;
                            }, z.core.$strict>], "kind">]>>;
                            unit: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>>;
                        specifications: z.ZodOptional<z.ZodObject<{
                            inputData: z.ZodArray<z.ZodString>;
                            technicalConstraints: z.ZodArray<z.ZodString>;
                            outOfScope: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>>;
                        outputForm: z.ZodOptional<z.ZodString>;
                        milestone: z.ZodNumber;
                        needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            buSlug: z.ZodString;
                            what: z.ZodString;
                        }, z.core.$strict>>>;
                        documentFormat: z.ZodOptional<z.ZodObject<{
                            mediaType: z.ZodString;
                            parts: z.ZodArray<z.ZodString>;
                            length: z.ZodObject<{
                                unit: z.ZodEnum<{
                                    pages: "pages";
                                    words: "words";
                                }>;
                                min: z.ZodNumber;
                                max: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>>;
                        documentSources: z.ZodOptional<z.ZodObject<{
                            pages: z.ZodArray<z.ZodObject<{
                                slug: z.ZodString;
                                version: z.ZodNumber;
                            }, z.core.$strict>>;
                            materials: z.ZodArray<z.ZodObject<{
                                assetId: z.ZodString;
                                sha256: z.ZodString;
                                name: z.ZodString;
                                mediaType: z.ZodString;
                                sizeBytes: z.ZodNumber;
                                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"email">;
                                    messageId: z.ZodString;
                                    attachmentName: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"archive">;
                                    archiveSha256: z.ZodString;
                                    entryPath: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"session">;
                                    sessionId: z.ZodString;
                                    repo: z.ZodOptional<z.ZodString>;
                                    commit: z.ZodOptional<z.ZodString>;
                                    path: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"link">;
                                    url: z.ZodURL;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"generated">;
                                    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                                    sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                }, z.core.$strict>], "kind">;
                                tenantId: z.ZodString;
                                companyId: z.ZodString;
                                projectId: z.ZodString;
                                assetType: z.ZodOptional<z.ZodString>;
                                buSlug: z.ZodOptional<z.ZodString>;
                                providedBy: z.ZodOptional<z.ZodObject<{
                                    personRef: z.ZodString;
                                }, z.core.$strict>>;
                                createdAt: z.ZodISODateTime;
                            }, z.core.$strict>>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>>;
                    roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        role: z.ZodString;
                        competencies: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>>;
                    start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"now">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"planned">;
                        unlockedBy: z.ZodObject<{
                            milestone: z.ZodNumber;
                            delivery: z.ZodString;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    gapRule: z.ZodOptional<z.ZodEnum<{
                        mark_and_proceed: "mark_and_proceed";
                        stop_and_ask: "stop_and_ask";
                    }>>;
                    signOffs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        signer: z.ZodEnum<{
                            owner: "owner";
                            director: "director";
                            referent: "referent";
                        }>;
                        form: z.ZodLiteral<"decision_request">;
                    }, z.core.$strict>>>;
                }, z.core.$strict>;
                project: z.ZodOptional<z.ZodObject<{
                    objective: z.ZodObject<{
                        request: z.ZodString;
                        expectedResult: z.ZodString;
                        measure: z.ZodString;
                    }, z.core.$strict>;
                    objectiveTree: z.ZodObject<{
                        project: z.ZodObject<{
                            expectedResult: z.ZodString;
                            deliveryCriteria: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                unitObjective: z.ZodOptional<z.ZodObject<{
                    buSlug: z.ZodString;
                    expectedResult: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    indicators: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        source: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                deliveryShape: z.ZodOptional<z.ZodEnum<{
                    product: "product";
                    study: "study";
                }>>;
                workBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    parentId: z.ZodOptional<z.ZodString>;
                    title: z.ZodString;
                    expectedGoal: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    requirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        text: z.ZodString;
                        attestor: z.ZodEnum<{
                            sessione: "sessione";
                            esecutore: "esecutore";
                            revisore: "revisore";
                            referente: "referente";
                        }>;
                        proof: z.ZodString;
                        origin: z.ZodEnum<{
                            capo: "capo";
                            mandato: "mandato";
                            ritorno: "ritorno";
                        }>;
                        reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"requirement">;
                            id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"decision">;
                            requestId: z.ZodString;
                        }, z.core.$strict>], "kind">]>>;
                        unit: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>>;
                    specifications: z.ZodOptional<z.ZodObject<{
                        inputData: z.ZodArray<z.ZodString>;
                        technicalConstraints: z.ZodArray<z.ZodString>;
                        outOfScope: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                    outputForm: z.ZodOptional<z.ZodString>;
                    milestone: z.ZodNumber;
                    owners: z.ZodArray<z.ZodObject<{
                        buSlug: z.ZodString;
                        does: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                exchanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    fromBu: z.ZodString;
                    toBu: z.ZodString;
                    what: z.ZodString;
                    format: z.ZodString;
                    key: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    question: z.ZodString;
                    unlocks: z.ZodString;
                    askTo: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"referent">;
                        personRef: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"owner">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"director">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"business_unit">;
                        buSlug: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                }, z.core.$strict>>>;
                sourceCoverage: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    topic: z.ZodString;
                    status: z.ZodEnum<{
                        partial: "partial";
                        covered: "covered";
                        missing: "missing";
                    }>;
                    pages: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            decision: z.ZodObject<{
                requestId: z.ZodString;
                planVersion: z.ZodNumber;
            }, z.core.$strict>;
            referent: z.ZodObject<{
                personRef: z.ZodString;
                entryVersion: z.ZodNumber;
            }, z.core.$strict>;
            notebookPages: z.ZodArray<z.ZodObject<{
                slug: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                outcome: z.ZodLiteral<"agrees">;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"conflict">;
                conflicts: z.ZodArray<z.ZodObject<{
                    source: z.ZodEnum<{
                        decision: "decision";
                        referent: "referent";
                        plan_section: "plan_section";
                        notebook_page: "notebook_page";
                    }>;
                    ref: z.ZodString;
                    reason: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"missing">;
                missing: z.ZodArray<z.ZodObject<{
                    source: z.ZodEnum<{
                        decision: "decision";
                        referent: "referent";
                        plan_section: "plan_section";
                        notebook_page: "notebook_page";
                    }>;
                    ref: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>], "outcome">;
            reconciledAt: z.ZodISODateTime;
            workplace: z.ZodOptional<z.ZodObject<{
                repository: z.ZodObject<{
                    host: z.ZodEnum<{
                        bitbucket: "bitbucket";
                        github: "github";
                    }>;
                    repo: z.ZodString;
                }, z.core.$strict>;
                folder: z.ZodOptional<z.ZodString>;
                sessionBoard: z.ZodOptional<z.ZodObject<{
                    repo: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            workMode: z.ZodOptional<z.ZodObject<{
                executor: z.ZodEnum<{
                    agent: "agent";
                    dev_session: "dev_session";
                    night: "night";
                }>;
                allowedTools: z.ZodArray<z.ZodString>;
                excludedTools: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        mandateBinding: z.ZodOptional<z.ZodEnum<{
            verified: "verified";
            criteria_only: "criteria_only";
        }>>;
        reason: z.ZodOptional<z.ZodEnum<{
            not_json: "not_json";
            not_a_mandate: "not_a_mandate";
        }>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            paperclip_unavailable: "paperclip_unavailable";
            wake_timeout: "wake_timeout";
        }>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatSessionMandateRequest = z.infer<typeof InternalPaperclipSeatSessionMandateRequestSchema>;
export type InternalPaperclipSeatSessionMandateResponse = z.infer<typeof InternalPaperclipSeatSessionMandateResponseSchema>;
export type PaperclipSeatSessionMandateResult = z.infer<typeof PaperclipSeatSessionMandateResultSchema>;
export declare function sessionMandateBinding(response: InternalPaperclipSeatSessionMandateResponse): PaperclipSeatSessionMandateBinding;
export declare const INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH: "/internal/paperclip/seats/session-proofs";
export declare const InternalPaperclipSeatSessionProofsRequestSchema: z.ZodObject<{
    organizationId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    sessionId: z.ZodString;
    call: z.ZodObject<{
        callId: z.ZodString;
        tool: z.ZodString;
        input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        agentId: z.ZodString;
        sessionId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        organization: z.ZodOptional<z.ZodObject<{
            organizationRun: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                organizationId: z.ZodString;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                personRef: z.ZodOptional<z.ZodString>;
                issuer: z.ZodEnum<{
                    x9: "x9";
                    forge: "forge";
                    paperclip: "paperclip";
                }>;
                issuedAt: z.ZodISODateTime;
                expiresAt: z.ZodISODateTime;
            }, z.core.$strict>;
            attempt: z.ZodObject<{
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                attemptNumber: z.ZodNumber;
                startedAt: z.ZodISODateTime;
                idempotencyKey: z.ZodString;
            }, z.core.$strict>;
            tenantId: z.ZodString;
        }, z.core.$strict>>;
        tenantId: z.ZodOptional<z.ZodString>;
        ownerId: z.ZodOptional<z.ZodString>;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
        personRef: z.ZodOptional<z.ZodString>;
        ordinaryConfiguration: z.ZodOptional<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            values: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                maxPerCategory: z.ZodOptional<z.ZodNumber>;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                weight: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"briefing">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"skip_section">;
                    section: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_section">;
                    section: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_tone">;
                    tone: z.ZodEnum<{
                        formal: "formal";
                        terse: "terse";
                        friendly: "friendly";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_maxWords">;
                    maxWords: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_greeting">;
                    greeting: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_feed_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"skip_feed_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_closing">;
                    text: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_cronSchedule">;
                    cron: z.ZodString;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"news">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"skip_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_hours_back">;
                    hours: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_max_per_category">;
                    category: z.ZodString;
                    max: z.ZodNumber;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"netatmo">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"auto_light_on">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"auto_light_off">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"suppress_automation">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_is_dark_offset">;
                    offset_minutes: z.ZodNumber;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"security">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"set_pir">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_sleep">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_ir">;
                    mode: z.ZodEnum<{
                        on: "on";
                        off: "off";
                        auto: "auto";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_floodlight">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"auto_patrol">;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                uid: z.ZodString;
                name: z.ZodString;
                role: z.ZodEnum<{
                    primary: "primary";
                    secondary: "secondary";
                }>;
                enabled: z.ZodBoolean;
                ptz_presets: z.ZodObject<{
                    left: z.ZodNumber;
                    center: z.ZodNumber;
                    right: z.ZodNumber;
                }, z.core.$strict>;
                siren: z.ZodBoolean;
                battery: z.ZodBoolean;
            }, z.core.$strict>>, z.ZodObject<{
                agent: z.ZodObject<{
                    first_message: z.ZodString;
                    language: z.ZodString;
                    prompt: z.ZodObject<{
                        llm: z.ZodString;
                        reasoning_effort: z.ZodString;
                        temperature: z.ZodNumber;
                        backup_llm_config: z.ZodObject<{
                            preference: z.ZodLiteral<"override">;
                            order: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                        cascade_timeout_seconds: z.ZodNumber;
                        tools: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"client">;
                            expects_response: z.ZodBoolean;
                            response_timeout_secs: z.ZodNumber;
                            execution_mode: z.ZodOptional<z.ZodEnum<{
                                immediate: "immediate";
                                post_tool_speech: "post_tool_speech";
                            }>>;
                            interruption_mode: z.ZodOptional<z.ZodEnum<{
                                allow: "allow";
                                block: "block";
                            }>>;
                            parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"webhook">;
                            response_timeout_secs: z.ZodNumber;
                            api_schema: z.ZodObject<{
                                method: z.ZodLiteral<"POST">;
                                path: z.ZodString;
                                request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                request_headers: z.ZodArray<z.ZodObject<{
                                    name: z.ZodString;
                                    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                        kind: z.ZodLiteral<"credential">;
                                        key: z.ZodString;
                                    }, z.core.$strict>, z.ZodObject<{
                                        kind: z.ZodLiteral<"session">;
                                        bindingId: z.ZodString;
                                    }, z.core.$strict>], "kind">;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"system">;
                            params: z.ZodObject<{
                                system_tool_type: z.ZodEnum<{
                                    end_call: "end_call";
                                    skip_turn: "skip_turn";
                                }>;
                            }, z.core.$strict>;
                            name: z.ZodString;
                            description: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                tts: z.ZodObject<{
                    model_id: z.ZodString;
                    optimize_streaming_latency: z.ZodNumber;
                    agent_output_audio_format: z.ZodString;
                    supported_voices: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        description: z.ZodString;
                        voice_id: z.ZodString;
                        stability: z.ZodNumber;
                        speed: z.ZodNumber;
                        similarity_boost: z.ZodNumber;
                    }, z.core.$strict>>;
                    voice_id: z.ZodString;
                    stability: z.ZodNumber;
                    speed: z.ZodNumber;
                    similarity_boost: z.ZodNumber;
                }, z.core.$strict>;
                turn: z.ZodObject<{
                    turn_timeout: z.ZodNumber;
                    interruption_ignore_terms: z.ZodArray<z.ZodString>;
                    merge_with_default_ignore_terms: z.ZodBoolean;
                    silence_end_call_timeout: z.ZodNumber;
                }, z.core.$strict>;
                conversation: z.ZodObject<{
                    max_duration_seconds: z.ZodNumber;
                    client_events: z.ZodArray<z.ZodEnum<{
                        audio: "audio";
                        interruption: "interruption";
                        agent_response: "agent_response";
                        user_transcript: "user_transcript";
                        agent_response_correction: "agent_response_correction";
                        agent_tool_response: "agent_tool_response";
                    }>>;
                }, z.core.$strict>;
                platform_settings: z.ZodObject<{
                    auth: z.ZodObject<{
                        enable_auth: z.ZodLiteral<true>;
                        allowlist: z.ZodArray<z.ZodURL>;
                        require_origin_header: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>]>>;
        }, z.core.$strict>>;
    }, z.core.$strip>;
}, z.core.$strict>;
export declare const PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS: readonly ["carried", "incomplete", "status_only", "not_enabled", "source_run_unknown", "source_run_without_issue", "source_issue_not_agents", "source_issue_closed"];
export declare const PaperclipSeatSessionProofsResultSchema: z.ZodEnum<{
    incomplete: "incomplete";
    status_only: "status_only";
    source_run_unknown: "source_run_unknown";
    source_run_without_issue: "source_run_without_issue";
    source_issue_not_agents: "source_issue_not_agents";
    source_issue_closed: "source_issue_closed";
    not_enabled: "not_enabled";
    carried: "carried";
}>;
export declare const InternalPaperclipSeatSessionProofsResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        incomplete: "incomplete";
        status_only: "status_only";
        source_run_unknown: "source_run_unknown";
        source_run_without_issue: "source_run_without_issue";
        source_issue_not_agents: "source_issue_not_agents";
        source_issue_closed: "source_issue_closed";
        not_enabled: "not_enabled";
        carried: "carried";
    }>;
    issueId: z.ZodOptional<z.ZodUUID>;
    counts: z.ZodOptional<z.ZodObject<{
        new: z.ZodInt;
        alreadyThere: z.ZodInt;
        failed: z.ZodInt;
        tooLarge: z.ZodInt;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const internalPaperclipSeatSessionProofsContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/seats/session-proofs";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        organizationId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        sourceRunId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        sessionId: z.ZodString;
        call: z.ZodObject<{
            callId: z.ZodString;
            tool: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            agentId: z.ZodString;
            sessionId: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
            credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            organization: z.ZodOptional<z.ZodObject<{
                organizationRun: z.ZodObject<{
                    schemaVersion: z.ZodLiteral<1>;
                    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                    organizationId: z.ZodString;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>;
                    personRef: z.ZodOptional<z.ZodString>;
                    issuer: z.ZodEnum<{
                        x9: "x9";
                        forge: "forge";
                        paperclip: "paperclip";
                    }>;
                    issuedAt: z.ZodISODateTime;
                    expiresAt: z.ZodISODateTime;
                }, z.core.$strict>;
                attempt: z.ZodObject<{
                    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                    attemptId: z.ZodString;
                    attemptNumber: z.ZodNumber;
                    startedAt: z.ZodISODateTime;
                    idempotencyKey: z.ZodString;
                }, z.core.$strict>;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
            tenantId: z.ZodOptional<z.ZodString>;
            ownerId: z.ZodOptional<z.ZodString>;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
            personRef: z.ZodOptional<z.ZodString>;
            ordinaryConfiguration: z.ZodOptional<z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                values: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>, z.ZodObject<{
                    agent: z.ZodObject<{
                        first_message: z.ZodString;
                        language: z.ZodString;
                        prompt: z.ZodObject<{
                            llm: z.ZodString;
                            reasoning_effort: z.ZodString;
                            temperature: z.ZodNumber;
                            backup_llm_config: z.ZodObject<{
                                preference: z.ZodLiteral<"override">;
                                order: z.ZodArray<z.ZodString>;
                            }, z.core.$strict>;
                            cascade_timeout_seconds: z.ZodNumber;
                            tools: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"client">;
                                expects_response: z.ZodBoolean;
                                response_timeout_secs: z.ZodNumber;
                                execution_mode: z.ZodOptional<z.ZodEnum<{
                                    immediate: "immediate";
                                    post_tool_speech: "post_tool_speech";
                                }>>;
                                interruption_mode: z.ZodOptional<z.ZodEnum<{
                                    allow: "allow";
                                    block: "block";
                                }>>;
                                parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                name: z.ZodString;
                                description: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"webhook">;
                                response_timeout_secs: z.ZodNumber;
                                api_schema: z.ZodObject<{
                                    method: z.ZodLiteral<"POST">;
                                    path: z.ZodString;
                                    request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                    request_headers: z.ZodArray<z.ZodObject<{
                                        name: z.ZodString;
                                        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                            kind: z.ZodLiteral<"credential">;
                                            key: z.ZodString;
                                        }, z.core.$strict>, z.ZodObject<{
                                            kind: z.ZodLiteral<"session">;
                                            bindingId: z.ZodString;
                                        }, z.core.$strict>], "kind">;
                                    }, z.core.$strict>>;
                                }, z.core.$strict>;
                                name: z.ZodString;
                                description: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"system">;
                                params: z.ZodObject<{
                                    system_tool_type: z.ZodEnum<{
                                        end_call: "end_call";
                                        skip_turn: "skip_turn";
                                    }>;
                                }, z.core.$strict>;
                                name: z.ZodString;
                                description: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                    tts: z.ZodObject<{
                        model_id: z.ZodString;
                        optimize_streaming_latency: z.ZodNumber;
                        agent_output_audio_format: z.ZodString;
                        supported_voices: z.ZodArray<z.ZodObject<{
                            label: z.ZodString;
                            description: z.ZodString;
                            voice_id: z.ZodString;
                            stability: z.ZodNumber;
                            speed: z.ZodNumber;
                            similarity_boost: z.ZodNumber;
                        }, z.core.$strict>>;
                        voice_id: z.ZodString;
                        stability: z.ZodNumber;
                        speed: z.ZodNumber;
                        similarity_boost: z.ZodNumber;
                    }, z.core.$strict>;
                    turn: z.ZodObject<{
                        turn_timeout: z.ZodNumber;
                        interruption_ignore_terms: z.ZodArray<z.ZodString>;
                        merge_with_default_ignore_terms: z.ZodBoolean;
                        silence_end_call_timeout: z.ZodNumber;
                    }, z.core.$strict>;
                    conversation: z.ZodObject<{
                        max_duration_seconds: z.ZodNumber;
                        client_events: z.ZodArray<z.ZodEnum<{
                            audio: "audio";
                            interruption: "interruption";
                            agent_response: "agent_response";
                            user_transcript: "user_transcript";
                            agent_response_correction: "agent_response_correction";
                            agent_tool_response: "agent_tool_response";
                        }>>;
                    }, z.core.$strict>;
                    platform_settings: z.ZodObject<{
                        auth: z.ZodObject<{
                            enable_auth: z.ZodLiteral<true>;
                            allowlist: z.ZodArray<z.ZodURL>;
                            require_origin_header: z.ZodLiteral<true>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>]>>;
            }, z.core.$strict>>;
        }, z.core.$strip>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            incomplete: "incomplete";
            status_only: "status_only";
            source_run_unknown: "source_run_unknown";
            source_run_without_issue: "source_run_without_issue";
            source_issue_not_agents: "source_issue_not_agents";
            source_issue_closed: "source_issue_closed";
            not_enabled: "not_enabled";
            carried: "carried";
        }>;
        issueId: z.ZodOptional<z.ZodUUID>;
        counts: z.ZodOptional<z.ZodObject<{
            new: z.ZodInt;
            alreadyThere: z.ZodInt;
            failed: z.ZodInt;
            tooLarge: z.ZodInt;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            paperclip_unavailable: "paperclip_unavailable";
            wake_timeout: "wake_timeout";
        }>;
    }, z.core.$strict>;
};
export type InternalPaperclipSeatSessionProofsRequest = z.infer<typeof InternalPaperclipSeatSessionProofsRequestSchema>;
export type InternalPaperclipSeatSessionProofsResponse = z.infer<typeof InternalPaperclipSeatSessionProofsResponseSchema>;
export type PaperclipSeatSessionProofsResult = z.infer<typeof PaperclipSeatSessionProofsResultSchema>;
//# sourceMappingURL=internal-paperclip-seats.d.ts.map