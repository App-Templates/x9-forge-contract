import { z } from 'zod';

export const DayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

/** Existing rule-engine conditions; transport rejects rather than strips unknown fields. */
export const PrimitiveConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('always') }).strict(),
  z.object({ type: z.literal('day_of_week'), days: z.array(DayOfWeekSchema).min(1) }).strict(),
  z.object({ type: z.literal('time_range'), from: z.string().regex(/^\d{2}:\d{2}$/), to: z.string().regex(/^\d{2}:\d{2}$/) }).strict(),
  z.object({ type: z.literal('date_range'), from: z.string().datetime({ offset: true }).or(z.string().date()), to: z.string().datetime({ offset: true }).or(z.string().date()) }).strict(),
  z.object({ type: z.literal('calendar_count'), operator: z.enum(['>', '<', '=', '>=']), value: z.number().int().min(0) }).strict(),
  z.object({ type: z.literal('weather'), condition: z.enum(['rain', 'clear', 'cold', 'hot']), source: z.literal('open-meteo') }).strict(),
  z.object({ type: z.literal('is_dark'), value: z.boolean() }).strict(),
]);
export type Condition = z.infer<typeof PrimitiveConditionSchema>
  | { type: 'and'; conditions: Condition[] }
  | { type: 'or'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };
export const ConditionSchema: z.ZodType<Condition> = z.lazy(() => z.union([
  PrimitiveConditionSchema,
  z.object({ type: z.literal('and'), conditions: z.array(ConditionSchema).min(1) }).strict(),
  z.object({ type: z.literal('or'), conditions: z.array(ConditionSchema).min(1) }).strict(),
  z.object({ type: z.literal('not'), condition: ConditionSchema }).strict(),
]));
