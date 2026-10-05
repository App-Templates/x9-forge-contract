import { z } from 'zod';
import { CapabilityAgentIdSchema } from './agent-config.js';

/**
 * One day of spend of one agent on one capability (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the agent's time zone; `reservedUsd` is what running calls have reserved and not yet settled
 * (an unknown cost is never free: it stays reserved).
 */
export const AgentDaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => {
  const t = new Date(d + 'T00:00:00Z');
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
}, 'not a calendar date');

/** The capabilities that report spend this way. */
export const SpendingCapabilitySchema = z.enum(['ricerca']);
export type SpendingCapability = z.infer<typeof SpendingCapabilitySchema>;

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
}).strict();
export type AgentSpendDay = z.infer<typeof AgentSpendDaySchema>;
