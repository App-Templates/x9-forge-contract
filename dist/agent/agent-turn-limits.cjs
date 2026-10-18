"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTurnLimitsSchema = exports.AgentTurnBudgetSchema = exports.AgentMaxToolRoundsSchema = exports.AGENT_MAX_TOOL_ROUNDS_CEILING = exports.AGENT_DEFAULT_MAX_TOOL_ROUNDS = void 0;
exports.readAgentTurnLimits = readAgentTurnLimits;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
/**
 * Per-agent turn limits (v1.49.2, 18/10): how many tool rounds one synchronous turn may run and how much it may
 * consume. Forge writes the optional `turnLimits` field of `context.json`; X9 agent-core reads it at every turn with
 * {@link readAgentTurnLimits}. Absent ⇒ today's behaviour ({@link AGENT_DEFAULT_MAX_TOOL_ROUNDS} rounds, no turn
 * budget). A planning agent (Director) can have `maxToolRounds: 'unlimited'`, but only under a turn budget.
 *
 * Budget unit: tokens (input + output, as the provider reports them) — the unit agent-core already meters for
 * organization runs. A spend budget in USD needs per-model rates and lands with them; it is not invented here.
 */
exports.AGENT_DEFAULT_MAX_TOOL_ROUNDS = 5;
exports.AGENT_MAX_TOOL_ROUNDS_CEILING = 200;
exports.AgentMaxToolRoundsSchema = zod_1.z.union([
    zod_1.z.number().int().min(1).max(exports.AGENT_MAX_TOOL_ROUNDS_CEILING),
    zod_1.z.literal('unlimited'),
]);
exports.AgentTurnBudgetSchema = zod_1.z.object({
    /** Input + output tokens of every model call of ONE turn; past it the turn closes with what it has. */
    maxTokensPerTurn: zod_1.z.number().int().min(1_000).max(100_000_000),
}).strict();
exports.AgentTurnLimitsSchema = zod_1.z.object({
    version: agent_config_js_1.AgentConfigVersionSchema,
    maxToolRounds: exports.AgentMaxToolRoundsSchema,
    budget: exports.AgentTurnBudgetSchema.optional(),
}).strict().refine(limits => limits.maxToolRounds !== 'unlimited' || limits.budget !== undefined, {
    message: 'Unlimited tool rounds require a turn budget', path: ['budget'],
});
/**
 * Lenient reader for a context: a missing or invalid `turnLimits` never blocks the agent; it falls back to the
 * default limits and reports `invalid` so the consumer can log it. Never widens an invalid value to unlimited.
 */
function readAgentTurnLimits(context) {
    const raw = context !== null && typeof context === 'object' ? context.turnLimits : undefined;
    if (raw === undefined)
        return { maxToolRounds: exports.AGENT_DEFAULT_MAX_TOOL_ROUNDS, maxTokensPerTurn: null, source: 'default' };
    const parsed = exports.AgentTurnLimitsSchema.safeParse(raw);
    if (!parsed.success)
        return { maxToolRounds: exports.AGENT_DEFAULT_MAX_TOOL_ROUNDS, maxTokensPerTurn: null, source: 'invalid' };
    return {
        maxToolRounds: parsed.data.maxToolRounds === 'unlimited' ? null : parsed.data.maxToolRounds,
        maxTokensPerTurn: parsed.data.budget?.maxTokensPerTurn ?? null,
        source: 'configured',
    };
}
//# sourceMappingURL=agent-turn-limits.js.map