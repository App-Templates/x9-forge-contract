import { z } from 'zod';
import { OrganizationRunContextSchema } from './run-context.js';
import { EvidenceRefSchema } from './run-outcome.js';

export const ExperimentStatusSchema = z.enum(['proposed', 'running', 'concluded', 'abandoned']);
export type ExperimentStatus = z.infer<typeof ExperimentStatusSchema>;

/**
 * An experiment: hypothesis, proof/domain version, baseline and success
 * criterion. `conclusion` is required if and only if the experiment is
 * concluded; an abandoned experiment must say why (`reason`).
 */
export const ExperimentSchema = z
  .strictObject({
    context: OrganizationRunContextSchema,
    experimentId: z.string().min(1),
    hypothesisRef: z.string().min(1),
    domainVersionRef: EvidenceRefSchema,
    baselineRef: EvidenceRefSchema,
    criterionRef: z.string().min(1),
    status: ExperimentStatusSchema,
    conclusion: z.string().min(1).optional(),
    reason: z.string().min(1).max(300).optional(),
  })
  .superRefine((e, ctx) => {
    if (e.status === 'concluded' && e.conclusion === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['conclusion'],
        message: "status 'concluded' requires conclusion",
      });
    }
    if (e.status !== 'concluded' && e.conclusion !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['conclusion'],
        message: "conclusion is only allowed when status is 'concluded'",
      });
    }
    if (e.status === 'abandoned' && e.reason === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['reason'],
        message: "status 'abandoned' requires reason",
      });
    }
    if (e.status !== 'abandoned' && e.reason !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['reason'],
        message: "reason is only allowed when status is 'abandoned'",
      });
    }
  });
export type Experiment = z.infer<typeof ExperimentSchema>;
