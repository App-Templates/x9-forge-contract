import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-identity.js";
import { DevelopmentSessionEngineSchema } from "../../capability/connect/development-session.js";
import { DevelopmentSessionLeaseSchema, isDevelopmentSessionUsable, } from "../../capability/connect/development-session-state.js";
export const SessionModelSchema = z.object({
    engine: DevelopmentSessionEngineSchema,
    modelId: z.string().trim().min(1).max(200),
    label: z.string().trim().min(1).max(120),
    // Empty means no attested choice; there is no implicit reasoning level.
    reasoningEfforts: z.array(z.string().trim().min(1).max(40)).max(16)
        .refine((efforts) => new Set(efforts).size === efforts.length, {
        message: 'Reasoning efforts must be unique',
    }),
}).strict();
/** Trusted adapter metadata only, never discovery or proof of actual model availability. */
export const DevelopmentSessionModelsSchema = z.object({
    lease: DevelopmentSessionLeaseSchema,
    models: z.array(SessionModelSchema).max(128),
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
export const getDevelopmentSessionModelsContract = {
    method: 'GET',
    path: '/internal/connect/development-sessions/:sessionId/models',
    authType: 'secret',
    paramsSchema: z.object({ sessionId: z.string().min(1) }).strict(),
    querySchema: z.object({ scope: CapabilityAgentScopeSchema }).strict(),
    responseSchema: DevelopmentSessionModelsSchema,
};
/** Pure selection using trusted binding and an injected clock; no model discovery. */
export function selectableDevelopmentSessionModels(raw, expectedBinding, nowMs) {
    const parsed = DevelopmentSessionModelsSchema.safeParse(raw);
    if (!parsed.success)
        return [];
    return parsed.data.models
        .filter(({ engine }) => isDevelopmentSessionUsable(parsed.data.lease, expectedBinding, engine, nowMs))
        .map((model) => ({ ...model, reasoningEfforts: [...model.reasoningEfforts] }));
}
/** Canonical choice only; validity does not authorize execution. */
export const DevelopmentSessionModelSelectionSchema = z.object({
    engine: SessionModelSchema.shape.engine,
    modelId: SessionModelSchema.shape.modelId,
    reasoningEffort: SessionModelSchema.shape.reasoningEfforts.element.optional(),
}).strict();
/** Match an explicit choice against usable, trusted adapter metadata. */
export function isDevelopmentSessionModelSelectionUsable(rawSelection, rawCatalog, expectedBinding, nowMs) {
    const selection = DevelopmentSessionModelSelectionSchema.safeParse(rawSelection);
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
export const DevProductionRoleModelsSchema = z.object({
    coordination: DevelopmentSessionModelSelectionSchema,
    planning: DevelopmentSessionModelSelectionSchema,
    unblocking: DevelopmentSessionModelSelectionSchema,
    code: DevelopmentSessionModelSelectionSchema,
    design: DevelopmentSessionModelSelectionSchema,
    presentation: DevelopmentSessionModelSelectionSchema,
}).strict();
/** Pure metadata check; services must recheck trusted state before execution. */
export function isDevProductionRoleModelsUsable(rawRoles, rawCatalog, expectedBinding, nowMs) {
    const roles = DevProductionRoleModelsSchema.safeParse(rawRoles);
    if (!roles.success)
        return false;
    return Object.values(roles.data).every((selection) => isDevelopmentSessionModelSelectionUsable(selection, rawCatalog, expectedBinding, nowMs));
}
//# sourceMappingURL=development-session-models.js.map