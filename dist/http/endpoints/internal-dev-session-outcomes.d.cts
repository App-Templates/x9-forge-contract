import { z } from 'zod';
export declare const DEV_SESSION_OUTCOMES_PATH: "/internal/dev/session-outcomes";
/**
 * The caller names departments, never a session. Whether the agent may read the organization is decided by
 * the service (cap-dev), as for the bytes of a session asset.
 */
export declare const DevSessionOutcomesRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    organizationId: z.ZodString;
    departments: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
        buSlug: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionOutcomesRequest = z.infer<typeof DevSessionOutcomesRequestSchema>;
/**
 * An outcome carries no scope of its own, so each one arrives paired with the scope of its session's
 * assignment (the shape `deriveBusinessUnitStateSummary` consumes). `open` lists sessions on the board with
 * no readable outcome yet (queued or working); stopped sessions always have an outcome. `unreadable` counts
 * closed or discarded sessions whose last comment carries no valid block; `omitted` counts older sessions
 * the service did not read because of its cap. A list is never cut silently.
 */
export declare const DevSessionOutcomesResponseSchema: z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
        }, z.core.$strict>;
        outcome: z.ZodObject<{
            version: z.ZodLiteral<1>;
            sessionId: z.ZodString;
            attempt: z.ZodNumber;
            state: z.ZodEnum<{
                failed: "failed";
                delivered: "delivered";
                discarded: "discarded";
                waiting_materials: "waiting_materials";
                waiting_answer: "waiting_answer";
            }>;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    session_error: "session_error";
                    tests_green: "tests_green";
                    no_tests_declared: "no_tests_declared";
                    tests_red: "tests_red";
                    executor_error: "executor_error";
                    not_published: "not_published";
                    materials_not_obtained: "materials_not_obtained";
                    outcome_not_recorded: "outcome_not_recorded";
                    cancelled_by_answer: "cancelled_by_answer";
                    closed_on_board: "closed_on_board";
                    duplicate_assignment: "duplicate_assignment";
                    assignment_refused: "assignment_refused";
                    materials_requested: "materials_requested";
                    answer_requested: "answer_requested";
                    retry_or_cancel_requested: "retry_or_cancel_requested";
                }>;
                text: z.ZodString;
            }, z.core.$strict>;
            disposition: z.ZodOptional<z.ZodObject<{
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
            }, z.core.$strict>>;
            missingMaterials: z.ZodOptional<z.ZodArray<z.ZodObject<{
                ref: z.ZodString;
                error: z.ZodString;
            }, z.core.$strict>>>;
            commit: z.ZodOptional<z.ZodString>;
            executorVersion: z.ZodString;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    open: z.ZodArray<z.ZodObject<{
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
        }, z.core.$strict>;
        sessionId: z.ZodString;
        state: z.ZodEnum<{
            queued: "queued";
            working: "working";
        }>;
    }, z.core.$strict>>;
    unreadable: z.ZodNumber;
    omitted: z.ZodNumber;
}, z.core.$strict>;
export type DevSessionOutcomesResponse = z.infer<typeof DevSessionOutcomesResponseSchema>;
export declare const devSessionOutcomesContract: {
    readonly method: "POST";
    readonly path: "/internal/dev/session-outcomes";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        organizationId: z.ZodString;
        departments: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
            buSlug: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        sessions: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
            }, z.core.$strict>;
            outcome: z.ZodObject<{
                version: z.ZodLiteral<1>;
                sessionId: z.ZodString;
                attempt: z.ZodNumber;
                state: z.ZodEnum<{
                    failed: "failed";
                    delivered: "delivered";
                    discarded: "discarded";
                    waiting_materials: "waiting_materials";
                    waiting_answer: "waiting_answer";
                }>;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        session_error: "session_error";
                        tests_green: "tests_green";
                        no_tests_declared: "no_tests_declared";
                        tests_red: "tests_red";
                        executor_error: "executor_error";
                        not_published: "not_published";
                        materials_not_obtained: "materials_not_obtained";
                        outcome_not_recorded: "outcome_not_recorded";
                        cancelled_by_answer: "cancelled_by_answer";
                        closed_on_board: "closed_on_board";
                        duplicate_assignment: "duplicate_assignment";
                        assignment_refused: "assignment_refused";
                        materials_requested: "materials_requested";
                        answer_requested: "answer_requested";
                        retry_or_cancel_requested: "retry_or_cancel_requested";
                    }>;
                    text: z.ZodString;
                }, z.core.$strict>;
                disposition: z.ZodOptional<z.ZodObject<{
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
                }, z.core.$strict>>;
                missingMaterials: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    ref: z.ZodString;
                    error: z.ZodString;
                }, z.core.$strict>>>;
                commit: z.ZodOptional<z.ZodString>;
                executorVersion: z.ZodString;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        open: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            state: z.ZodEnum<{
                queued: "queued";
                working: "working";
            }>;
        }, z.core.$strict>>;
        unreadable: z.ZodNumber;
        omitted: z.ZodNumber;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-dev-session-outcomes.d.ts.map