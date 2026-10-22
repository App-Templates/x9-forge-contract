import { z } from 'zod';
import { AgentRoleSchema, BUSINESS_UNIT_LEAD_ROLE } from "../../organization/agent-role.js";
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { PaperclipAgentBindingSchema } from "./tools.js";
export const PAPERCLIP_AGENT_KEY_NAME = 'PAPERCLIP_API_KEY';
/** One record per enrolled agent: seat, applied binding and Vault key state. It never carries a key value. */
export const PaperclipEnrollmentSchema = z.strictObject({
    seat: PaperclipAgentBindingSchema,
    organizationId: z.string().min(1).max(64),
    role: AgentRoleSchema,
    reportsToPaperclipAgentId: z.uuid().optional(),
    participantBinding: z.enum(['applied', 'pending']),
    agentKey: z.strictObject({
        key: z.literal(PAPERCLIP_AGENT_KEY_NAME),
        store: z.literal('vault'),
        status: z.enum(['stored', 'pending']),
    }),
    enrolledAt: z.iso.datetime({ offset: true }),
}).superRefine((e, ctx) => {
    if (e.role === BUSINESS_UNIT_LEAD_ROLE
        && (!e.reportsToPaperclipAgentId || e.reportsToPaperclipAgentId === e.seat.paperclipAgentId)) {
        ctx.addIssue({
            code: 'custom', path: ['reportsToPaperclipAgentId'],
            message: 'A business unit lead reports to a different Paperclip agent',
        });
    }
});
/** Complete only when the participant binding is applied and the agent key is stored in the Vault. */
export function paperclipEnrollmentComplete(e) {
    return e.participantBinding === 'applied' && e.agentKey.status === 'stored';
}
export const INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH = '/internal/paperclip/enrollments/resolve';
export const InternalPaperclipEnrollmentResolveRequestSchema = z.union([
    z.strictObject({ paperclipAgentId: z.uuid() }),
    z.strictObject({ scope: CapabilityAgentScopeSchema }),
]);
export const InternalPaperclipEnrollmentResolveResponseSchema = z.discriminatedUnion('outcome', [
    z.strictObject({ outcome: z.literal('found'), enrollment: PaperclipEnrollmentSchema }),
    z.strictObject({ outcome: z.literal('not_found') }),
]);
export const internalPaperclipEnrollmentResolveContract = {
    method: 'POST',
    path: INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH,
    authType: 'secret',
    bodySchema: InternalPaperclipEnrollmentResolveRequestSchema,
    responseSchema: InternalPaperclipEnrollmentResolveResponseSchema,
};
//# sourceMappingURL=enrollment.js.map