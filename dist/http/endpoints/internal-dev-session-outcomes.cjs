"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devSessionOutcomesContract = exports.DevSessionOutcomesResponseSchema = exports.DevSessionOutcomesRequestSchema = exports.DEV_SESSION_OUTCOMES_PATH = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const session_outcome_js_1 = require("../../capability/dev/session-outcome.cjs");
const business_unit_state_js_1 = require("../../organization/business-unit-state.cjs");
exports.DEV_SESSION_OUTCOMES_PATH = '/internal/dev/session-outcomes';
/**
 * The caller names departments, never a session. Whether the agent may read the organization is decided by
 * the service (cap-dev), as for the bytes of a session asset.
 */
exports.DevSessionOutcomesRequestSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    organizationId: business_unit_state_js_1.BusinessUnitStateScopeSchema.shape.organizationId,
    departments: zod_1.z.array(zod_1.z.strictObject({
        projectId: business_unit_state_js_1.BusinessUnitStateScopeSchema.shape.projectId,
        buSlug: business_unit_state_js_1.BusinessUnitStateScopeSchema.shape.buSlug,
    })).min(1).max(20),
});
/**
 * An outcome carries no scope of its own, so each one arrives paired with the scope of its session's
 * assignment (the shape `deriveBusinessUnitStateSummary` consumes). `open` lists sessions on the board with
 * no readable outcome yet (queued or working); stopped sessions always have an outcome. `unreadable` counts
 * closed or discarded sessions whose last comment carries no valid block; `omitted` counts older sessions
 * the service did not read because of its cap. A list is never cut silently.
 */
exports.DevSessionOutcomesResponseSchema = zod_1.z.strictObject({
    sessions: zod_1.z.array(zod_1.z.strictObject({
        scope: business_unit_state_js_1.BusinessUnitStateScopeSchema,
        outcome: session_outcome_js_1.DevSessionOutcomeSchema,
    })).max(200),
    open: zod_1.z.array(zod_1.z.strictObject({
        scope: business_unit_state_js_1.BusinessUnitStateScopeSchema,
        sessionId: session_outcome_js_1.DevSessionOutcomeSchema.shape.sessionId,
        state: zod_1.z.enum(['queued', 'working']),
    })).max(200),
    unreadable: zod_1.z.number().int().min(0),
    omitted: zod_1.z.number().int().min(0),
});
exports.devSessionOutcomesContract = {
    method: 'POST',
    path: exports.DEV_SESSION_OUTCOMES_PATH,
    authType: 'secret',
    bodySchema: exports.DevSessionOutcomesRequestSchema,
    responseSchema: exports.DevSessionOutcomesResponseSchema,
};
//# sourceMappingURL=internal-dev-session-outcomes.js.map