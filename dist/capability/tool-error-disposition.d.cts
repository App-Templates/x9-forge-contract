import { z } from 'zod';
export declare const TOOL_ERROR_NATURES: readonly ["technical_failure", "permission_refused", "limit_reached", "cancelled", "missing_data", "invalid_request"];
export declare const TOOL_ERROR_RETRIES: readonly ["never", "next_turn", "after_delay"];
export declare const TOOL_ERROR_NEXT_MOVES: readonly ["retry_same", "fix_input", "ask_director", "ask_referent", "ask_owner", "wait_event", "stop"];
export declare const ToolErrorNatureSchema: z.ZodEnum<{
    cancelled: "cancelled";
    invalid_request: "invalid_request";
    technical_failure: "technical_failure";
    permission_refused: "permission_refused";
    limit_reached: "limit_reached";
    missing_data: "missing_data";
}>;
export declare const ToolErrorRetrySchema: z.ZodEnum<{
    never: "never";
    next_turn: "next_turn";
    after_delay: "after_delay";
}>;
export declare const ToolErrorNextMoveSchema: z.ZodEnum<{
    stop: "stop";
    retry_same: "retry_same";
    fix_input: "fix_input";
    ask_director: "ask_director";
    ask_referent: "ask_referent";
    ask_owner: "ask_owner";
    wait_event: "wait_event";
}>;
export type ToolErrorNature = z.infer<typeof ToolErrorNatureSchema>;
export type ToolErrorRetry = z.infer<typeof ToolErrorRetrySchema>;
export type ToolErrorNextMove = z.infer<typeof ToolErrorNextMoveSchema>;
export declare const ToolErrorDispositionSchema: z.ZodObject<{
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
export type ToolErrorDisposition = z.infer<typeof ToolErrorDispositionSchema>;
/** One fixed line (nature, repeatability, next move) for a valid disposition; throws on an invalid one. */
export declare function renderToolErrorDisposition(disposition: ToolErrorDisposition): string;
export declare function toolErrorDispositionOf(body: unknown): ToolErrorDisposition | undefined;
//# sourceMappingURL=tool-error-disposition.d.ts.map