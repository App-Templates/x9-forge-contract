import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-context.js";
import { DevSessionOutcomeSchema } from "../../capability/dev/session-outcome.js";
import { BusinessUnitStateScopeSchema } from "../../organization/business-unit-state.js";
export const DEV_SESSION_OUTCOMES_PATH = '/internal/dev/session-outcomes';
/**
 * The caller names departments, never a session. Whether the agent may read the organization is decided by
 * the service (cap-dev), as for the bytes of a session asset.
 */
export const DevSessionOutcomesRequestSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema,
    organizationId: BusinessUnitStateScopeSchema.shape.organizationId,
    departments: z.array(z.strictObject({
        projectId: BusinessUnitStateScopeSchema.shape.projectId,
        buSlug: BusinessUnitStateScopeSchema.shape.buSlug,
    })).min(1).max(20),
});
/**
 * An outcome carries no scope of its own, so each one arrives paired with the scope of its session's
 * assignment (the shape `deriveBusinessUnitStateSummary` consumes). `open` lists sessions on the board with
 * no readable outcome yet (queued or working); stopped sessions always have an outcome. `unreadable` counts
 * closed or discarded sessions whose last comment carries no valid block; `omitted` counts older sessions
 * the service did not read because of its cap. A list is never cut silently.
 */
export const DevSessionOutcomesResponseSchema = z.strictObject({
    sessions: z.array(z.strictObject({
        scope: BusinessUnitStateScopeSchema,
        outcome: DevSessionOutcomeSchema,
    })).max(200),
    open: z.array(z.strictObject({
        scope: BusinessUnitStateScopeSchema,
        sessionId: DevSessionOutcomeSchema.shape.sessionId,
        state: z.enum(['queued', 'working']),
    })).max(200),
    unreadable: z.number().int().min(0),
    omitted: z.number().int().min(0),
});
export const devSessionOutcomesContract = {
    method: 'POST',
    path: DEV_SESSION_OUTCOMES_PATH,
    authType: 'secret',
    bodySchema: DevSessionOutcomesRequestSchema,
    responseSchema: DevSessionOutcomesResponseSchema,
};
//# sourceMappingURL=internal-dev-session-outcomes.js.map