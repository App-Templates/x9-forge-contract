import { z } from 'zod';
/**
 * Per-agent turn limits (v1.49.2, 18/10): how many tool rounds one synchronous turn may run and how much it may
 * consume. Forge writes the optional `turnLimits` field of `context.json`; X9 agent-core reads it at every turn with
 * {@link readAgentTurnLimits}. Absent ⇒ today's behaviour ({@link AGENT_DEFAULT_MAX_TOOL_ROUNDS} rounds, no turn
 * budget). A planning agent (Director) can have `maxToolRounds: 'unlimited'`, but only under a turn budget.
 *
 * Budget unit: tokens (input + output, as the provider reports them) — the unit agent-core already meters for
 * organization runs. A spend budget in USD needs per-model rates and lands with them; it is not invented here.
 */
export declare const AGENT_DEFAULT_MAX_TOOL_ROUNDS = 5;
export declare const AGENT_MAX_TOOL_ROUNDS_CEILING = 200;
export declare const AgentMaxToolRoundsSchema: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"unlimited">]>;
export type AgentMaxToolRounds = z.infer<typeof AgentMaxToolRoundsSchema>;
export declare const AgentTurnBudgetSchema: z.ZodObject<{
    maxTokensPerTurn: z.ZodNumber;
}, z.core.$strict>;
export type AgentTurnBudget = z.infer<typeof AgentTurnBudgetSchema>;
export declare const AgentTurnLimitsSchema: z.ZodObject<{
    version: z.ZodNumber;
    maxToolRounds: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"unlimited">]>;
    budget: z.ZodOptional<z.ZodObject<{
        maxTokensPerTurn: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentTurnLimits = z.infer<typeof AgentTurnLimitsSchema>;
/** What the runtime applies: `maxToolRounds: null` means unlimited (then `maxTokensPerTurn` is always set). */
export interface ResolvedAgentTurnLimits {
    maxToolRounds: number | null;
    maxTokensPerTurn: number | null;
    /** `default` when absent, `configured` when valid, `invalid` when present but rejected (defaults applied). */
    source: 'default' | 'configured' | 'invalid';
}
/**
 * Lenient reader for a context: a missing or invalid `turnLimits` never blocks the agent; it falls back to the
 * default limits and reports `invalid` so the consumer can log it. Never widens an invalid value to unlimited.
 */
export declare function readAgentTurnLimits(context: unknown): ResolvedAgentTurnLimits;
//# sourceMappingURL=agent-turn-limits.d.ts.map