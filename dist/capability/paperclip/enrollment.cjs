"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPaperclipEnrollmentResolveContract = exports.InternalPaperclipEnrollmentResolveResponseSchema = exports.InternalPaperclipEnrollmentResolveRequestSchema = exports.INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH = exports.PaperclipEnrollmentSchema = exports.PAPERCLIP_AGENT_KEY_NAME = void 0;
exports.paperclipEnrollmentComplete = paperclipEnrollmentComplete;
const zod_1 = require("zod");
const agent_role_js_1 = require("../../organization/agent-role.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const tools_js_1 = require("./tools.cjs");
exports.PAPERCLIP_AGENT_KEY_NAME = 'PAPERCLIP_API_KEY';
/** One record per enrolled agent: seat, applied binding and Vault key state. It never carries a key value. */
exports.PaperclipEnrollmentSchema = zod_1.z.strictObject({
    seat: tools_js_1.PaperclipAgentBindingSchema,
    organizationId: zod_1.z.string().min(1).max(64),
    role: agent_role_js_1.AgentRoleSchema,
    reportsToPaperclipAgentId: zod_1.z.uuid().optional(),
    participantBinding: zod_1.z.enum(['applied', 'pending']),
    agentKey: zod_1.z.strictObject({
        key: zod_1.z.literal(exports.PAPERCLIP_AGENT_KEY_NAME),
        store: zod_1.z.literal('vault'),
        status: zod_1.z.enum(['stored', 'pending']),
    }),
    enrolledAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((e, ctx) => {
    if (e.role === agent_role_js_1.BUSINESS_UNIT_LEAD_ROLE
        && (!e.reportsToPaperclipAgentId || e.reportsToPaperclipAgentId === e.seat.paperclipAgentId)) {
        ctx.addIssue({
            code: 'custom', path: ['reportsToPaperclipAgentId'],
            message: 'A business unit lead reports to a different Paperclip agent',
        });
    }
});
/** Complete only when the participant binding is applied and the agent key is stored in the Vault. */
function paperclipEnrollmentComplete(e) {
    return e.participantBinding === 'applied' && e.agentKey.status === 'stored';
}
exports.INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH = '/internal/paperclip/enrollments/resolve';
exports.InternalPaperclipEnrollmentResolveRequestSchema = zod_1.z.union([
    zod_1.z.strictObject({ paperclipAgentId: zod_1.z.uuid() }),
    zod_1.z.strictObject({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema }),
]);
exports.InternalPaperclipEnrollmentResolveResponseSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ outcome: zod_1.z.literal('found'), enrollment: exports.PaperclipEnrollmentSchema }),
    zod_1.z.strictObject({ outcome: zod_1.z.literal('not_found') }),
]);
exports.internalPaperclipEnrollmentResolveContract = {
    method: 'POST',
    path: exports.INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalPaperclipEnrollmentResolveRequestSchema,
    responseSchema: exports.InternalPaperclipEnrollmentResolveResponseSchema,
};
//# sourceMappingURL=enrollment.js.map