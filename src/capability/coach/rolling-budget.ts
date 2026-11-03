import { z } from 'zod';
import { CapabilityPersonScopeSchema } from '../capability-call-context.js';
import { Instant } from './shared.js';
export const CoachRollingBudgetSchema = z.object({
  scope: CapabilityPersonScopeSchema, windowSeconds: z.number().int().positive().max(366 * 86400),
  asOf: Instant, windowStart: Instant, limitSeconds: z.number().int().positive(), usedSeconds: z.number().int().nonnegative(),
}).strict().refine(x => Date.parse(x.asOf) % 1000 === 0 && Date.parse(x.windowStart) % 1000 === 0 && Date.parse(x.asOf) - Date.parse(x.windowStart) === x.windowSeconds * 1000, 'Exact second-precision rolling window');
export type CoachRollingBudget = z.infer<typeof CoachRollingBudgetSchema>;
export const CoachSessionQuotaSchema = z.object({
  scope: CapabilityPersonScopeSchema, budgetAsOf: Instant, remainingSeconds: z.number().int().nonnegative(),
  shareLimitSeconds: z.number().int().nonnegative(), limitSeconds: z.number().int().nonnegative(),
}).strict().refine(x => x.limitSeconds <= Math.min(x.remainingSeconds, x.shareLimitSeconds), 'Quota respects remaining and share');
export type CoachSessionQuota = z.infer<typeof CoachSessionQuotaSchema>;
export function coachRollingRemainingSeconds(raw: unknown): number | null {
  const budget = CoachRollingBudgetSchema.safeParse(raw);
  return budget.success ? Math.max(0, budget.data.limitSeconds - budget.data.usedSeconds) : null;
}
