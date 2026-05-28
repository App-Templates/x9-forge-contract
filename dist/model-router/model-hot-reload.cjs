"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelHotReloadNotificationSchema = void 0;
const zod_1 = require("zod");
const model_provider_js_1 = require("./model-provider.cjs");
/**
 * Hot-reload notification payload — transport-agnostic.
 *
 * Emitted (or polled) when Forge pushes a new model config and X9 must
 * refresh its in-memory routing table. The shape is stable regardless of
 * transport (polling vs SSE) so consumers pattern-match one payload.
 *
 * Mechanism decision lives in 06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism
 * Decision" (plan 06-01 output). Selected: **polling** via
 * `GET /internal/model-config/version` returning this shape.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-17, D-18, D-19
 * @see agent-x9/.planning/ROADMAP.md §Phase 35 ROUTER-06
 */
exports.ModelHotReloadNotificationSchema = zod_1.z.object({
    version: zod_1.z.string().min(1),
    appliedAt: zod_1.z.iso.datetime(),
    providersChanged: zod_1.z.array(model_provider_js_1.ModelProviderSchema).optional(),
    capsChanged: zod_1.z.array(zod_1.z.string().min(1)).optional(),
});
//# sourceMappingURL=model-hot-reload.js.map