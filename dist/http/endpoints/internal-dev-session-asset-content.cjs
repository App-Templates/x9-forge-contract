"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDevSessionAssetContract = exports.DevSessionAssetReadSchema = void 0;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const production_artifact_content_js_1 = require("../../capability/dev/production-artifact-content.cjs");
/** Transport request only; session authorization and file lookup belong to the service. */
exports.DevSessionAssetReadSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    asset: asset_js_1.AssetRefSchema,
    offset: zod_1.z.number().int().min(0),
    length: zod_1.z.number().int().min(1).max(262144),
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
exports.readDevSessionAssetContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/read',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({
        agentId: internal_capability_agent_js_1.CapabilityAgentParamsSchema.shape.agentId,
        sessionId: asset_js_1.AssetOriginSchema.options[2].shape.sessionId,
    }),
    bodySchema: exports.DevSessionAssetReadSchema,
    responseSchema: production_artifact_content_js_1.DevProductionArtifactChunkSchema,
};
//# sourceMappingURL=internal-dev-session-asset-content.js.map