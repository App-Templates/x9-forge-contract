import { z } from 'zod';
import { CapabilityAgentIdSchema } from "./agent-config.js";
/**
 * One day of spend of one agent on one capability (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the agent's time zone. `spentUsd` is settled cost; `reservedUsd` is cost reserved and not settled:
 * calls still running, and calls that ended without a reported usage (an unknown cost is never free: it stays reserved).
 * `capUsd` is the daily budget in force that day (the highest, if it changed during the day).
 */
export const AgentDaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => {
    const t = new Date(d + 'T00:00:00Z');
    return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
}, 'not a calendar date');
/** The capabilities that report spend this way. */
export const SpendingCapabilitySchema = z.enum(['ricerca']);
export const AgentSpendDaySchema = z.object({
    agentId: CapabilityAgentIdSchema,
    capability: SpendingCapabilitySchema,
    day: AgentDaySchema,
    spentUsd: z.number().nonnegative().finite(),
    reservedUsd: z.number().nonnegative().finite(),
    capUsd: z.number().positive().finite(),
    calls: z.number().int().nonnegative(),
    webCalls: z.number().int().nonnegative(),
    /** Researches that day ended because the budget was spent. */
    budgetStops: z.number().int().nonnegative(),
    /** When the first research of that day was stopped by the budget («finito alle 15:52»); null if it never was. */
    budgetReachedAt: z.iso.datetime().nullable(),
}).strict();
//# sourceMappingURL=spend.js.map