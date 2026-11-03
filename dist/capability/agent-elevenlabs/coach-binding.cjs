"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsCoachExecutionAttachmentSchema = exports.ElevenLabsCoachConversationBindingSchema = exports.ElevenLabsCoachSessionBindingSchema = void 0;
exports.isElevenLabsCoachConversationForSession = isElevenLabsCoachConversationForSession;
exports.isElevenLabsCoachExecutionForSession = isElevenLabsCoachExecutionForSession;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const index_js_1 = require("./index.cjs");
const execution_js_1 = require("../coach/execution.cjs");
const shared_js_1 = require("../coach/shared.cjs");
exports.ElevenLabsCoachSessionBindingSchema = zod_1.z.object({
    bindingId: shared_js_1.RefId, opening: execution_js_1.CoachSessionOpeningRefSchema, mapping: index_js_1.ElevenLabsAgentMappingSchema, admittedAt: shared_js_1.Instant,
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)(x.mapping.scope, (0, shared_js_1.agentScope)(x.opening.scope)) && Date.parse(x.admittedAt) >= Date.parse(x.opening.openedAt), 'Admission keeps original scoped opening and mapping');
exports.ElevenLabsCoachConversationBindingSchema = zod_1.z.object({
    conversationBindingId: shared_js_1.RefId, sessionBinding: exports.ElevenLabsCoachSessionBindingSchema, conversationId: shared_js_1.Text128, boundAt: shared_js_1.Instant,
}).strict().refine(x => Date.parse(x.boundAt) >= Date.parse(x.sessionBinding.admittedAt), 'Conversation follows admission');
exports.ElevenLabsCoachExecutionAttachmentSchema = zod_1.z.object({
    attachmentId: shared_js_1.RefId, sessionBinding: exports.ElevenLabsCoachSessionBindingSchema, executionSnapshot: execution_js_1.CoachSessionExecutionSnapshotSchema, attachedAt: shared_js_1.Instant,
}).strict().refine(x => (0, execution_js_1.isCoachExecutionSnapshotForOpening)(x.executionSnapshot, x.sessionBinding.opening) && Date.parse(x.attachedAt) >= Date.parse(x.executionSnapshot.startedAt), 'Execution belongs to original opening');
function sameBinding(a, b) {
    return a.bindingId === b.bindingId && (0, shared_js_1.sameValue)(a.opening, b.opening) && (0, index_js_1.sameElevenLabsMapping)(a.mapping, b.mapping) && Date.parse(a.admittedAt) === Date.parse(b.admittedAt);
}
function isElevenLabsCoachConversationForSession(raw, expected) {
    const value = exports.ElevenLabsCoachConversationBindingSchema.safeParse(raw), binding = exports.ElevenLabsCoachSessionBindingSchema.safeParse(expected);
    return value.success && binding.success && sameBinding(value.data.sessionBinding, binding.data);
}
function isElevenLabsCoachExecutionForSession(raw, expectedBinding, expectedSnapshot) {
    const attachment = exports.ElevenLabsCoachExecutionAttachmentSchema.safeParse(raw), binding = exports.ElevenLabsCoachSessionBindingSchema.safeParse(expectedBinding), snapshot = execution_js_1.CoachSessionExecutionSnapshotSchema.safeParse(expectedSnapshot);
    return attachment.success && binding.success && snapshot.success && sameBinding(attachment.data.sessionBinding, binding.data)
        && (0, execution_js_1.isCoachExecutionSnapshotForOpening)(snapshot.data, binding.data.opening) && (0, shared_js_1.sameValue)(attachment.data.executionSnapshot, snapshot.data);
}
//# sourceMappingURL=coach-binding.js.map