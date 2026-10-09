"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipExecutionContextSchema = exports.PAPERCLIP_X9_ADAPTER_SECRET = exports.PAPERCLIP_API_KEY = void 0;
exports.matchesPaperclipExecution = matchesPaperclipExecution;
exports.isPaperclipHostWindowOpen = isPaperclipHostWindowOpen;
const zod_1 = require("zod");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_2 = require("./agent-config.cjs");
const internal_turn_js_1 = require("../../http/endpoints/internal-turn.cjs");
const native_admission_js_1 = require("./native-admission.cjs");
/** Key NAMES only. Both values come from the existing per-agent writer/load pipeline. */
exports.PAPERCLIP_API_KEY = 'PAPERCLIP_API_KEY';
exports.PAPERCLIP_X9_ADAPTER_SECRET = 'PAPERCLIP_X9_ADAPTER_SECRET';
/**
 * Server-produced dispatch metadata after single-use native admission. The cap must still
 * authenticate the host, compare its current binding and revalidate native state before mutation.
 * Host timestamps bound host work only; they never attest effective native adapter timeout.
 */
exports.PaperclipExecutionContextSchema = native_admission_js_1.PaperclipAdmissionMetadataSchema.safeExtend({
    capability: zod_1.z.literal('paperclip'),
    source: zod_1.z.literal('x9_native_admission'),
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
    provisioningRevision: agent_config_js_1.AgentConfigVersionSchema,
    sessionId: internal_turn_js_1.InternalTurnRequestSchema.shape.sessionId,
});
/** Pure correspondence with an actual readback, not admission, CAS, native state or freshness. */
function matchesPaperclipExecution(rawReadback, rawExecution) {
    const readback = agent_config_js_2.PaperclipAgentReadbackSchema.safeParse(rawReadback);
    const execution = exports.PaperclipExecutionContextSchema.safeParse(rawExecution);
    if (!readback.success || !execution.success)
        return false;
    const actual = readback.data;
    const admitted = execution.data;
    return actual.enabled
        && (0, capability_call_context_js_1.sameCapabilityScope)(actual.scope, admitted.scope)
        && actual.appliedVersion === admitted.configVersion
        && actual.provisioningRevision === admitted.provisioningRevision
        && actual.companyId === admitted.companyId
        && actual.paperclipAgentId === admitted.paperclipAgentId;
}
/** Host-clock budget check only. A true result says nothing about native run activity/lease. */
function isPaperclipHostWindowOpen(rawExecution, nowMs) {
    const execution = exports.PaperclipExecutionContextSchema.safeParse(rawExecution);
    if (!execution.success || !Number.isFinite(nowMs))
        return false;
    return nowMs >= Date.parse(execution.data.hostIssuedAt)
        && nowMs < Date.parse(execution.data.hostDeadlineAt);
}
//# sourceMappingURL=execution-context.js.map