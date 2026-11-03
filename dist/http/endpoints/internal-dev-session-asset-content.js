import { z } from 'zod';
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-context.js";
import { AssetOriginSchema, AssetRefSchema } from "../../organization/asset.js";
import { DevProductionArtifactChunkSchema } from "../../capability/dev/production-artifact-content.js";
/** Transport request only; session authorization and file lookup belong to the service. */
export const DevSessionAssetReadSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema,
    asset: AssetRefSchema,
    offset: z.number().int().min(0),
    length: z.number().int().min(1).max(262144),
}).refine((request) => request.asset.origin.kind === 'session', {
    path: ['asset', 'origin'],
    message: 'Asset must originate from a session',
});
/**
 * Read-only POST for bytes of a delivered session asset. The service verifies
 * that params.sessionId equals asset.origin.sessionId and that the scope tenant
 * and agent belong to that session, authorizing its owner as well. Verify sha256
 * and sizeBytes against the complete file, not just the requested chunk. Missing
 * or foreign assets produce a service error, never an empty file.
 */
export const readDevSessionAssetContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/read',
    authType: 'secret',
    paramsSchema: z.strictObject({
        agentId: CapabilityAgentParamsSchema.shape.agentId,
        sessionId: AssetOriginSchema.options[2].shape.sessionId,
    }),
    bodySchema: DevSessionAssetReadSchema,
    responseSchema: DevProductionArtifactChunkSchema,
};
//# sourceMappingURL=internal-dev-session-asset-content.js.map