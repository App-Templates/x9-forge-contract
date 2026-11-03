"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevProductionRoleModelsSchema = exports.DevelopmentSessionModelSelectionSchema = exports.getDevelopmentSessionModelsContract = exports.DevelopmentSessionModelsSchema = exports.SessionModelSchema = void 0;
exports.selectableDevelopmentSessionModels = selectableDevelopmentSessionModels;
exports.isDevelopmentSessionModelSelectionUsable = isDevelopmentSessionModelSelectionUsable;
exports.isDevProductionRoleModelsUsable = isDevProductionRoleModelsUsable;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../../capability/capability-call-identity.cjs");
const development_session_js_1 = require("../../capability/connect/development-session.cjs");
const development_session_state_js_1 = require("../../capability/connect/development-session-state.cjs");
exports.SessionModelSchema = zod_1.z.object({
    engine: development_session_js_1.DevelopmentSessionEngineSchema,
    modelId: zod_1.z.string().trim().min(1).max(200),
    label: zod_1.z.string().trim().min(1).max(120),
    // Empty means no attested choice; there is no implicit reasoning level.
    reasoningEfforts: zod_1.z.array(zod_1.z.string().trim().min(1).max(40)).max(16)
        .refine((efforts) => new Set(efforts).size === efforts.length, {
        message: 'Reasoning efforts must be unique',
    }),
}).strict();
/** Trusted adapter metadata only, never discovery or proof of actual model availability. */
exports.DevelopmentSessionModelsSchema = zod_1.z.object({
    lease: development_session_state_js_1.DevelopmentSessionLeaseSchema,
    models: zod_1.z.array(exports.SessionModelSchema).max(128),
}).strict()
    .refine(({ models }) => new Set(models.map(({ engine, modelId }) => JSON.stringify([engine, modelId]))).size === models.length, {
    message: 'Session models must be unique by engine and modelId', path: ['models'],
})
    .refine(({ lease, models }) => models.every(({ engine }) => lease.availableEngines.includes(engine)), {
    message: 'Model engines must be attested by the lease', path: ['models'],
})
    .refine(({ lease, models }) => lease.status === 'connected' || models.length === 0, {
    message: 'Offline or revoked leases cannot advertise models', path: ['models'],
});
/** S2 authenticates the owner, correlates scope/path and queries a trusted adapter. */
exports.getDevelopmentSessionModelsContract = {
    method: 'GET',
    path: '/internal/connect/development-sessions/:sessionId/models',
    authType: 'secret',
    paramsSchema: zod_1.z.object({ sessionId: zod_1.z.string().min(1) }).strict(),
    querySchema: zod_1.z.object({ scope: capability_call_identity_js_1.CapabilityAgentScopeSchema }).strict(),
    responseSchema: exports.DevelopmentSessionModelsSchema,
};
/** Pure selection using trusted binding and an injected clock; no model discovery. */
function selectableDevelopmentSessionModels(raw, expectedBinding, nowMs) {
    const parsed = exports.DevelopmentSessionModelsSchema.safeParse(raw);
    if (!parsed.success)
        return [];
    return parsed.data.models
        .filter(({ engine }) => (0, development_session_state_js_1.isDevelopmentSessionUsable)(parsed.data.lease, expectedBinding, engine, nowMs))
        .map((model) => ({ ...model, reasoningEfforts: [...model.reasoningEfforts] }));
}
/** Canonical choice only; validity does not authorize execution. */
exports.DevelopmentSessionModelSelectionSchema = zod_1.z.object({
    engine: exports.SessionModelSchema.shape.engine,
    modelId: exports.SessionModelSchema.shape.modelId,
    reasoningEffort: exports.SessionModelSchema.shape.reasoningEfforts.element.optional(),
}).strict();
/** Match an explicit choice against usable, trusted adapter metadata. */
function isDevelopmentSessionModelSelectionUsable(rawSelection, rawCatalog, expectedBinding, nowMs) {
    const selection = exports.DevelopmentSessionModelSelectionSchema.safeParse(rawSelection);
    if (!selection.success)
        return false;
    const { engine, modelId, reasoningEffort } = selection.data;
    const model = selectableDevelopmentSessionModels(rawCatalog, expectedBinding, nowMs)
        .find((candidate) => candidate.engine === engine && candidate.modelId === modelId);
    if (!model)
        return false;
    if (model.reasoningEfforts.length === 0)
        return reasoningEffort === undefined;
    return reasoningEffort !== undefined && model.reasoningEfforts.includes(reasoningEffort);
}
/** Explicit owner choices for all production roles; no defaults or discovery. */
exports.DevProductionRoleModelsSchema = zod_1.z.object({
    coordination: exports.DevelopmentSessionModelSelectionSchema,
    planning: exports.DevelopmentSessionModelSelectionSchema,
    unblocking: exports.DevelopmentSessionModelSelectionSchema,
    code: exports.DevelopmentSessionModelSelectionSchema,
    design: exports.DevelopmentSessionModelSelectionSchema,
    presentation: exports.DevelopmentSessionModelSelectionSchema,
}).strict();
/** Pure metadata check; services must recheck trusted state before execution. */
function isDevProductionRoleModelsUsable(rawRoles, rawCatalog, expectedBinding, nowMs) {
    const roles = exports.DevProductionRoleModelsSchema.safeParse(rawRoles);
    if (!roles.success)
        return false;
    return Object.values(roles.data).every((selection) => isDevelopmentSessionModelSelectionUsable(selection, rawCatalog, expectedBinding, nowMs));
}
//# sourceMappingURL=development-session-models.js.map