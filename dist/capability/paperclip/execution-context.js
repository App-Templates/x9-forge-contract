import { z } from 'zod';
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { PaperclipAgentReadbackSchema } from "./agent-config.js";
import { InternalTurnRequestSchema } from "../../http/endpoints/internal-turn.js";
import { PaperclipAdmissionMetadataSchema } from "./native-admission.js";
/** Key NAMES only. Both values come from the existing per-agent writer/load pipeline. */
export const PAPERCLIP_API_KEY = 'PAPERCLIP_API_KEY';
export const PAPERCLIP_X9_ADAPTER_SECRET = 'PAPERCLIP_X9_ADAPTER_SECRET';
/**
 * Server-produced dispatch metadata after single-use native admission. The cap must still
 * authenticate the host, compare its current binding and revalidate native state before mutation.
 * Host timestamps bound host work only; they never attest effective native adapter timeout.
 */
export const PaperclipExecutionContextSchema = PaperclipAdmissionMetadataSchema.safeExtend({
    capability: z.literal('paperclip'),
    source: z.literal('x9_native_admission'),
    scope: CapabilityAgentScopeSchema,
    configVersion: AgentConfigVersionSchema,
    provisioningRevision: AgentConfigVersionSchema,
    sessionId: InternalTurnRequestSchema.shape.sessionId,
});
/** Pure correspondence with an actual readback, not admission, CAS, native state or freshness. */
export function matchesPaperclipExecution(rawReadback, rawExecution) {
    const readback = PaperclipAgentReadbackSchema.safeParse(rawReadback);
    const execution = PaperclipExecutionContextSchema.safeParse(rawExecution);
    if (!readback.success || !execution.success)
        return false;
    const actual = readback.data;
    const admitted = execution.data;
    return actual.enabled
        && sameCapabilityScope(actual.scope, admitted.scope)
        && actual.appliedVersion === admitted.configVersion
        && actual.provisioningRevision === admitted.provisioningRevision
        && actual.companyId === admitted.companyId
        && actual.paperclipAgentId === admitted.paperclipAgentId;
}
/** Host-clock budget check only. A true result says nothing about native run activity/lease. */
export function isPaperclipHostWindowOpen(rawExecution, nowMs) {
    const execution = PaperclipExecutionContextSchema.safeParse(rawExecution);
    if (!execution.success || !Number.isFinite(nowMs))
        return false;
    return nowMs >= Date.parse(execution.data.hostIssuedAt)
        && nowMs < Date.parse(execution.data.hostDeadlineAt);
}
//# sourceMappingURL=execution-context.js.map