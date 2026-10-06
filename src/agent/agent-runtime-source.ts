import { z } from 'zod';

export const AgentRuntimeAvailabilitySchema = z.enum(['available', 'unavailable', 'unknown']);
export type AgentRuntimeAvailability = z.infer<typeof AgentRuntimeAvailabilitySchema>;
export const AgentRuntimeCompletenessSchema = z.enum(['complete', 'partial', 'unknown']);
export type AgentRuntimeCompleteness = z.infer<typeof AgentRuntimeCompletenessSchema>;

/** Source observations describe inventory coverage, not an agent's readiness. */
export const AgentRuntimeSourceSchema = z.object({
  authority: z.literal('x9'),
  availability: AgentRuntimeAvailabilitySchema,
  completeness: AgentRuntimeCompletenessSchema,
  observedAt: z.iso.datetime().nullable(),
}).superRefine((source, ctx) => {
  if (source.completeness === 'complete' && source.availability !== 'available') {
    ctx.addIssue({ code: 'custom', path: ['completeness'], message: 'An unavailable or unknown source cannot prove a complete inventory' });
  }
  if (source.availability === 'available' && source.observedAt === null) {
    ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'An available source requires an observation timestamp' });
  }
});
export type AgentRuntimeSource = z.infer<typeof AgentRuntimeSourceSchema>;
