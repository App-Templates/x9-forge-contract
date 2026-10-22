import { z } from 'zod';
import { sameCapabilityScope } from "../capability-call-context.js";
import { ElevenLabsAgentMappingSchema, sameElevenLabsMapping } from "./index.js";
import { CoachSessionOpeningRefSchema, CoachSessionExecutionSnapshotSchema, isCoachExecutionSnapshotForOpening } from "../coach/execution.js";
import { RefId, Text128, Instant, agentScope, sameValue } from "../coach/shared.js";
export const ElevenLabsCoachSessionBindingSchema = z.object({
    bindingId: RefId, opening: CoachSessionOpeningRefSchema, mapping: ElevenLabsAgentMappingSchema, admittedAt: Instant,
}).strict().refine(x => sameCapabilityScope(x.mapping.scope, agentScope(x.opening.scope)) && Date.parse(x.admittedAt) >= Date.parse(x.opening.openedAt), 'Admission keeps original scoped opening and mapping');
export const ElevenLabsCoachConversationBindingSchema = z.object({
    conversationBindingId: RefId, sessionBinding: ElevenLabsCoachSessionBindingSchema, conversationId: Text128, boundAt: Instant,
}).strict().refine(x => Date.parse(x.boundAt) >= Date.parse(x.sessionBinding.admittedAt), 'Conversation follows admission');
export const ElevenLabsCoachExecutionAttachmentSchema = z.object({
    attachmentId: RefId, sessionBinding: ElevenLabsCoachSessionBindingSchema, executionSnapshot: CoachSessionExecutionSnapshotSchema, attachedAt: Instant,
}).strict().refine(x => isCoachExecutionSnapshotForOpening(x.executionSnapshot, x.sessionBinding.opening) && Date.parse(x.attachedAt) >= Date.parse(x.executionSnapshot.startedAt), 'Execution belongs to original opening');
function sameBinding(a, b) {
    return a.bindingId === b.bindingId && sameValue(a.opening, b.opening) && sameElevenLabsMapping(a.mapping, b.mapping) && Date.parse(a.admittedAt) === Date.parse(b.admittedAt);
}
export function isElevenLabsCoachConversationForSession(raw, expected) {
    const value = ElevenLabsCoachConversationBindingSchema.safeParse(raw), binding = ElevenLabsCoachSessionBindingSchema.safeParse(expected);
    return value.success && binding.success && sameBinding(value.data.sessionBinding, binding.data);
}
export function isElevenLabsCoachExecutionForSession(raw, expectedBinding, expectedSnapshot) {
    const attachment = ElevenLabsCoachExecutionAttachmentSchema.safeParse(raw), binding = ElevenLabsCoachSessionBindingSchema.safeParse(expectedBinding), snapshot = CoachSessionExecutionSnapshotSchema.safeParse(expectedSnapshot);
    return attachment.success && binding.success && snapshot.success && sameBinding(attachment.data.sessionBinding, binding.data)
        && isCoachExecutionSnapshotForOpening(snapshot.data, binding.data.opening) && sameValue(attachment.data.executionSnapshot, snapshot.data);
}
//# sourceMappingURL=coach-binding.js.map