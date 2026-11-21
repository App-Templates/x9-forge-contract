import type { z } from 'zod';
import { DevSessionCriterionSchema } from '../capability/dev/session-acceptance.js';

// Keep the session grammar and its checks: mandate origin already excludes session/executor attestors.
// Export only through the existing organization/* subpath to avoid a plan/mandate barrel cycle.
export const MandateRequirementSchema = DevSessionCriterionSchema.refine(
  (criterion) => criterion.origin === 'mandato',
  { message: 'Mandate requirements must originate from the mandate', path: ['origin'] },
);
export type MandateRequirement = z.infer<typeof MandateRequirementSchema>;
