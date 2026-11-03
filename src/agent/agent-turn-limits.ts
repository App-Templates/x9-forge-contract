import { z } from 'zod';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';

/**
 * Per-agent turn limits (v1.49.2, 18/10): how many tool rounds one synchronous turn may run and how much it may
 * consume. Forge writes the optional `turnLimits` field of `context.json`; X9 agent-core reads it at every turn with
 * {@link readAgentTurnLimits}. Absent ⇒ today's behaviour ({@link AGENT_DEFAULT_MAX_TOOL_ROUNDS} rounds, no turn
 * budget). A planning agent (Director) can have `maxToolRounds: 'unlimited'`, but only under a turn budget.
 *
 * Budget unit: tokens (input + output, as the provider reports them) — the unit agent-core already meters for
 * organization runs. A spend budget in USD needs per-model rates and lands with them; it is not invented here.
 */
export const AGENT_DEFAULT_MAX_TOOL_ROUNDS = 5;
export const AGENT_MAX_TOOL_ROUNDS_CEILING = 200;

export const AgentMaxToolRoundsSchema = z.union([
  z.number().int().min(1).max(AGENT_MAX_TOOL_ROUNDS_CEILING),
  z.literal('unlimited'),
]);
export type AgentMaxToolRounds = z.infer<typeof AgentMaxToolRoundsSchema>;

export const AgentTurnBudgetSchema = z.object({
  /** Input + output tokens of every model call of ONE turn; past it the turn closes with what it has. */
  maxTokensPerTurn: z.number().int().min(1_000).max(100_000_000),
}).strict();
export type AgentTurnBudget = z.infer<typeof AgentTurnBudgetSchema>;

export const AgentTurnLimitsSchema = z.object({
  version: AgentConfigVersionSchema,
  maxToolRounds: AgentMaxToolRoundsSchema,
  budget: AgentTurnBudgetSchema.optional(),
}).strict().refine(limits => limits.maxToolRounds !== 'unlimited' || limits.budget !== undefined, {
  message: 'Unlimited tool rounds require a turn budget', path: ['budget'],
});
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
export function readAgentTurnLimits(context: unknown): ResolvedAgentTurnLimits {
  const raw = context !== null && typeof context === 'object' ? (context as { turnLimits?: unknown }).turnLimits : undefined;
  if (raw === undefined) return { maxToolRounds: AGENT_DEFAULT_MAX_TOOL_ROUNDS, maxTokensPerTurn: null, source: 'default' };
  const parsed = AgentTurnLimitsSchema.safeParse(raw);
  if (!parsed.success) return { maxToolRounds: AGENT_DEFAULT_MAX_TOOL_ROUNDS, maxTokensPerTurn: null, source: 'invalid' };
  return {
    maxToolRounds: parsed.data.maxToolRounds === 'unlimited' ? null : parsed.data.maxToolRounds,
    maxTokensPerTurn: parsed.data.budget?.maxTokensPerTurn ?? null,
    source: 'configured',
  };
}
