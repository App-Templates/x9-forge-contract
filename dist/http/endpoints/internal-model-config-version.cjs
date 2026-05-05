"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelConfigVersionContract = exports.ModelConfigVersionResponseSchema = void 0;
const model_hot_reload_js_1 = require("../../model-router/model-hot-reload.cjs");
/**
 * GET /internal/model-config/version — X9 polls Forge for the current model
 * config version. Response shape = ModelHotReloadNotification (D-17).
 * Auth: X-Internal-Secret.
 *
 * Decision rationale: per 06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism
 * Decision" — ROUTER-06 describes a pull model; polling fits best. If Phase 35
 * later needs push, the same payload shape drops into an SSE frame without
 * a breaking contract change.
 *
 * @see @x9-forge/contracts/model-router (ModelHotReloadNotificationSchema)
 */
exports.ModelConfigVersionResponseSchema = model_hot_reload_js_1.ModelHotReloadNotificationSchema;
exports.modelConfigVersionContract = {
    method: 'GET',
    path: '/internal/model-config/version',
    authType: 'secret',
    responseSchema: exports.ModelConfigVersionResponseSchema,
};
//# sourceMappingURL=internal-model-config-version.js.map