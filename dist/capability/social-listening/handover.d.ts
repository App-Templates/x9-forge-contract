export declare const SOCIAL_HANDOVER_REASONS: readonly ["not_mac", "no_fallback", "already_done", "already_on_server", "before_fallback_time", "fallback_time_reached", "day_passed"];
/** D9: decide from the caller's instant; the service owns the actual handover. */
export declare function socialRoundHandover(input: unknown): {
    action: 'none';
    reason: 'not_mac' | 'no_fallback' | 'already_done' | 'already_on_server' | 'invalid_input';
} | {
    action: 'wait';
    reason: 'before_fallback_time';
} | {
    action: 'hand_to_server';
    reason: 'fallback_time_reached' | 'day_passed';
};
//# sourceMappingURL=handover.d.ts.map