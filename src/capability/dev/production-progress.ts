import { z } from 'zod';
import { sameCapabilityScope } from '../capability-call-context.js';
import { DevProductionJobSchema } from './production-job.js';

const JobShape = DevProductionJobSchema.shape;

/** Informational snapshot; the service owns sequence monotonicity across snapshots.
 * Completing all tasks does not attest success: the production result still needs evidence.
 */
export const DevProductionProgressSchema = z.strictObject({
  scope: JobShape.scope,
  jobId: JobShape.jobId,
  requestId: JobShape.requestId,
  projectId: JobShape.projectId,
  reportVersion: JobShape.reportVersion,
  reportDigest: JobShape.reportDigest,
  sequence: z.number().int().min(1),
  updatedAt: z.iso.datetime(),
  phase: z.enum(['queued', 'running', 'blocked', 'stopping']),
  message: z.string().trim().min(1).max(1000),
  tasks: z.strictObject({
    completed: z.number().int().min(0),
    total: z.number().int().min(1),
  }).refine((tasks) => tasks.completed <= tasks.total, {
    message: 'Completed tasks must not exceed total', path: ['completed'],
  }),
});
export type DevProductionProgress = z.infer<typeof DevProductionProgressSchema>;

/** Correlation only; neither execution nor permission nor success is attested. */
export function isDevProductionProgressForJob(raw: unknown, expectedJob: unknown): boolean {
  const parsedProgress = DevProductionProgressSchema.safeParse(raw);
  const parsedJob = DevProductionJobSchema.safeParse(expectedJob);
  if (!parsedProgress.success || !parsedJob.success) return false;
  const progress = parsedProgress.data;
  const job = parsedJob.data;
  return sameCapabilityScope(progress.scope, job.scope)
    && progress.jobId === job.jobId
    && progress.requestId === job.requestId
    && progress.projectId === job.projectId
    && progress.reportVersion === job.reportVersion
    && progress.reportDigest === job.reportDigest;
}
