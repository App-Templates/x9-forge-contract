"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPushResponseSchema = exports.ModelPushRequestSchema = exports.pushModelConfigContract = void 0;
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
var model_push_js_1 = require("../../model-router/model-push.cjs");
Object.defineProperty(exports, "pushModelConfigContract", { enumerable: true, get: function () { return model_push_js_1.pushModelConfigContract; } });
Object.defineProperty(exports, "ModelPushRequestSchema", { enumerable: true, get: function () { return model_push_js_1.ModelPushRequestSchema; } });
Object.defineProperty(exports, "ModelPushResponseSchema", { enumerable: true, get: function () { return model_push_js_1.ModelPushResponseSchema; } });
//# sourceMappingURL=internal-model-config.js.map