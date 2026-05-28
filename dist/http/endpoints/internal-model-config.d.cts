/**
 * POST /internal/model-config — Forge -> X9 agent-core.
 * Auth: X-Internal-Secret. Direction: Forge control plane pushes model config.
 *
 * Endpoint declared but NOT implemented in Phase 6 — X9 Phase 35 runtime wires.
 *
 * Re-export of `pushModelConfigContract` from the model-router sub-path, so
 * consumers that import from `@x9-forge/contracts/http` (endpoints) can reach
 * it via the same barrel as reloadAgentContract / stopAgentContract.
 *
 * @see @x9-forge/contracts/model-router (canonical definition site)
 */
export { pushModelConfigContract, ModelPushRequestSchema, ModelPushResponseSchema, } from "../../model-router/model-push.cjs";
export type { ModelPushRequest, ModelPushResponse } from "../../model-router/model-push.cjs";
//# sourceMappingURL=internal-model-config.d.ts.map