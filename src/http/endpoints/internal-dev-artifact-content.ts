import { z } from 'zod';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../capability/dev/production-job.js';
import { DevProductionArtifactSchema } from '../../capability/dev/production-result.js';
import { DevProductionArtifactChunkSchema } from '../../capability/dev/production-artifact-content.js';

/** Transport request only; authorization and persisted record lookup belong to the service. */
export const DevProductionArtifactReadSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  requestId: DevProductionJobSchema.shape.requestId,
  artifactRef: DevProductionArtifactSchema.shape.artifactRef,
  offset: DevProductionArtifactChunkSchema.shape.offset,
  length: z.number().int().min(1).max(262144),
});
export type DevProductionArtifactRead = z.infer<typeof DevProductionArtifactReadSchema>;

/**
 * Read-only POST keeps the opaque artifact reference out of the URL. The backend
 * authenticates the owner, correlates agent/job/request/scope with the persisted
 * record and resolves artifactRef only among artifacts of an authorized succeeded
 * result. Verify the source file, requested chunk and registered sha256; return
 * bytes without creating files or starting production retries. Missing or foreign
 * artifacts produce a service error, never an empty file. No public or signed URL
 * is returned. Signing, storage and assembly remain with services and consumers;
 * the backend delivers the authenticated download to the browser.
 */
export const readDevProductionArtifactContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/artifacts/read' as const,
  authType: 'secret' as const,
  paramsSchema: z.strictObject({
    agentId: CapabilityAgentParamsSchema.shape.agentId,
    jobId: DevProductionJobSchema.shape.jobId,
  }),
  bodySchema: DevProductionArtifactReadSchema,
  responseSchema: DevProductionArtifactChunkSchema,
} as const;
