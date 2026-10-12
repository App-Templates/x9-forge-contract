"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionCodes = exports.SessionId = exports.Seconds = exports.Instant = exports.RefId = exports.Text128 = void 0;
exports.agentScope = agentScope;
exports.sameValue = sameValue;
const text_js_1 = require("./text.cjs");
var text_js_2 = require("./text.cjs");
Object.defineProperty(exports, "Text128", { enumerable: true, get: function () { return text_js_2.Text128; } });
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_management_request_id_js_1 = require("../../agent/agent-management-request-id.cjs");
const index_js_1 = require("./index.cjs");
exports.RefId = agent_management_request_id_js_1.AgentManagementRequestIdSchema;
exports.Instant = zod_1.z.iso.datetime({ offset: true });
exports.Seconds = zod_1.z.number().int().nonnegative().max(86400);
exports.SessionId = index_js_1.CoachSessionSchema.shape.sessionId;
exports.DecisionCodes = zod_1.z.array(text_js_1.Text128).max(50);
function agentScope(scope) {
    return capability_call_context_js_1.CapabilityAgentScopeSchema.parse({ tenantId: scope.tenantId, ownerId: scope.ownerId, agentId: scope.agentId });
}
/** Semantic equality for already parsed contract values; object key order is irrelevant. */
function sameValue(a, b) {
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