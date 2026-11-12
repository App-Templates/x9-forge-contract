import { z } from 'zod';
export declare const INBOUND_EVENT_OUTCOMES: readonly ["commented", "duplicate", "refused"];
export declare const INBOUND_EVENT_NOT_WOKEN_REASONS: readonly ["issue_closed", "run_alive", "daily_run_limit", "daily_cost_limit", "unknown"];
/** Every inbound event leaves a comment, a deduplication key or a fixed refusal. */
export declare const InboundEventDispositionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "outcome">;
export type InboundEventDisposition = z.infer<typeof InboundEventDispositionSchema>;
/** Use the shared message code so bare and bracketed message IDs deduplicate alike. */
export declare function inboundEmailDedupeKey(messageId: string): string;
//# sourceMappingURL=inbound-event.d.ts.map