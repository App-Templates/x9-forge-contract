import { z } from 'zod';
import { ApprovalRequestIdSchema, ApprovalTextSha256Schema, SignedApprovalPermitSchema, checkApprovalPermit } from '../../capability/approvals/index.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { DevProductionJobSchema, devProductionApprovalBindings } from '../../capability/dev/production-job.js';
import { DevProductionResultSchema } from '../../capability/dev/production-result.js';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';

export const DevProductionSubmissionSchema = z.strictObject({
  job: DevProductionJobSchema,
  approval: SignedApprovalPermitSchema,
});
export type DevProductionSubmission = z.infer<typeof DevProductionSubmissionSchema>;

/** Queued acknowledges submission only; it does not attest execution or artifacts. */
export const submitDevProductionContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/dev/jobs' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: DevProductionSubmissionSchema,
  responseSchema: z.strictObject({
    jobId: z.string().min(1),
    requestId: ApprovalRequestIdSchema,
    status: z.literal('queued'),
  }),
} as const;

/** The service must authorize the scope and correlate the path with its persisted job. */
export const getDevProductionResultContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId' as const,
  authType: 'secret' as const,
  paramsSchema: z.strictObject({
    agentId: CapabilityAgentParamsSchema.shape.agentId,
    jobId: z.string().min(1),
  }),
  querySchema: z.strictObject({ scope: CapabilityAgentScopeSchema }),
  responseSchema: z.discriminatedUnion('status', [
    z.strictObject({
      status: z.literal('pending'),
      jobId: z.string().min(1),
      requestId: ApprovalRequestIdSchema,
    }),
    z.strictObject({ status: z.literal('finished'), result: DevProductionResultSchema }),
  ]),
} as const;

/**
 * Correlation only, using the job and text digest from the service's persisted expectation.
 * This does not verify cryptographic signatures, one-time nonces, owner/passkey identity,
 * cap-dev installation/APPLIED state or a fresh lease. Before effects, S3 must use the
 * existing A11 signature verifier, consume the nonce and re-read those preconditions.
 * A boolean approved flag cannot replace that verification.
 */
export function isDevProductionApprovalForJob(
  rawSignedPermit: unknown, expectedJob: unknown, expectedTextSha256: unknown, nowMs: number,
): boolean {
  const signed = SignedApprovalPermitSchema.safeParse(rawSignedPermit);
  const parsedJob = DevProductionJobSchema.safeParse(expectedJob);
  const text = ApprovalTextSha256Schema.safeParse(expectedTextSha256);
  if (!signed.success || !parsedJob.success || !text.success || !Number.isFinite(nowMs)) return false;
  const job = parsedJob.data;
  const check = checkApprovalPermit(signed.data.permit, {
    client: 'dev',
    type: 'dev.produce',
    scope: job.scope,
    requestId: job.requestId,
    textSha256: text.data,
    bindings: devProductionApprovalBindings(job),
  }, nowMs);
  return check.ok;
}
