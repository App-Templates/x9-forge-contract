import { z } from 'zod';
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
/** Shared management values initialize before model authority, preserving public module cycles. */
/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
export const AgentManagementRequestIdSchema = z.string().min(8).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
export const AgentManagementOutcomeSchema = z.enum(['ok', 'error', 'unmanageable']);
export const AgentManagementOverallOutcomeSchema = z.enum(['ok', 'partial', 'error', 'unmanageable']);
export const AgentManagementReasonCodeSchema = z.enum([
    'not-loaded',
    'load-failed',
    'validation-failed',
    'timeout',
    'source-unavailable',
    /** The action would affect the runtime shared with other agents. */
    'shared-runtime',
    /** The channel is owned by an external provider/capability and is not driven by this command. */
    'externally-owned',
    'not-supported',
    'in-progress',
    'unknown',
]);
/** `detail` is sanitized operator text: never secrets, tokens or personal data. */
export const AgentManagementReasonSchema = z.object({
    code: AgentManagementReasonCodeSchema,
    detail: z.string().min(1).max(500).optional(),
}).strict();
/** Desired (saved) vs applied (effective) configuration version of one agent. */
export const AgentConfigVersionStateSchema = z.object({
    desired: AgentConfigVersionSchema,
    /** null: no configuration version was ever applied. */
    applied: AgentConfigVersionSchema.nullable(),
    /** Last failed apply, newer than the applied version; null when none is pending. */
    failed: z.object({ version: AgentConfigVersionSchema, reason: AgentManagementReasonSchema }).strict().nullable(),
}).superRefine((versions, ctx) => {
    if (versions.applied !== null && versions.applied > versions.desired) {
        ctx.addIssue({ code: 'custom', path: ['applied'], message: 'Applied version cannot be ahead of the desired one' });
    }
    if (versions.failed !== null) {
        if (versions.failed.version <= (versions.applied ?? 0)) {
            ctx.addIssue({ code: 'custom', path: ['failed', 'version'], message: 'A failed version must be newer than the applied one' });
        }
        if (versions.failed.version > versions.desired) {
            ctx.addIssue({ code: 'custom', path: ['failed', 'version'], message: 'A failed version cannot be ahead of the desired one' });
        }
    }
});
/** ok: all ok · unmanageable: none manageable · error: none ok · partial: some ok, some not. */
export function deriveAgentManagementOutcome(results) {
    const okCount = results.filter((result) => result.outcome === 'ok').length;
    if (results.length > 0 && okCount === results.length)
        return 'ok';
    if (results.length > 0 && results.every((result) => result.outcome === 'unmanageable'))
        return 'unmanageable';
    if (okCount === 0)
        return 'error';
    return 'partial';
}
//# sourceMappingURL=agent-model-management-values.js.map