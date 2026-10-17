import { z } from 'zod';
import { OrganizationRunContextSchema } from './run-context.js';
import { EvidenceRefSchema } from './run-outcome.js';

/** Experiment outcome intake; references carry no private research content. */
export const OutcomeIntakeSchema = z
  .strictObject({
    context: OrganizationRunContextSchema,
    experimentId: z.string().min(1).brand<'ExperimentId'>(),
    /** Reference to the hypothesis, never its private text. */
    hypothesisRef: z.string().min(1),
    baselineRef: EvidenceRefSchema,
    resultRef: EvidenceRefSchema,
    sameDenominator: z.boolean(),
    /** Reference to the criterion fixed before observing the result. */
    criterionRef: z.string().min(1),
    verdict: z.enum(['confirmed', 'refuted', 'inconclusive']),
  })
  .refine((outcome) => outcome.verdict === 'inconclusive' || outcome.sameDenominator, {
    message: 'Confirmed or refuted outcomes require the same denominator',
    path: ['sameDenominator'],
  });

export type OutcomeIntake = z.infer<typeof OutcomeIntakeSchema>;
