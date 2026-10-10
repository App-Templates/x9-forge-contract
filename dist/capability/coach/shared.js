import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { CoachSessionSchema } from "./index.js";
export const RefId = AgentManagementRequestIdSchema;
export const Text128 = z.string().trim().min(1).max(128);
export const Instant = z.iso.datetime({ offset: true });
export const Seconds = z.number().int().nonnegative().max(86400);
export const SessionId = CoachSessionSchema.shape.sessionId;
export const DecisionCodes = z.array(Text128).max(50);
export function agentScope(scope) {
    return CapabilityAgentScopeSchema.parse({ tenantId: scope.tenantId, ownerId: scope.ownerId, agentId: scope.agentId });
}
/** Semantic equality for already parsed contract values; object key order is irrelevant. */
export function sameValue(a, b) {
    if (a === b)
        return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object')
        return false;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    const left = a, right = b;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key) && sameValue(left[key], right[key]));
}
//# sourceMappingURL=shared.js.map