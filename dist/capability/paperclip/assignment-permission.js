import { z } from 'zod';
/**
 * Native Paperclip assignment scopes, independent of the caller's position.
 * Deliberately stricter: reject cycles, unknown-only scope keys, project scopes,
 * and missing parents in the recipient's ancestry instead of treating them as
 * outside the branch. Active-agent and company checks remain with the caller.
 */
const AgentIdSchema = z.string().min(1).max(128);
const AgentIdsSchema = z.array(AgentIdSchema).min(1).max(256);
// Besides the three grant forms, none represents absent grants; list_and_branch
// is the only combined scope and requires both constraints (Paperclip §9.8).
export const PaperclipAssignmentPermissionSchema = z.discriminatedUnion('form', [
    z.strictObject({ form: z.literal('none') }),
    z.strictObject({ form: z.literal('broad') }),
    z.strictObject({ form: z.literal('list'), agentIds: AgentIdsSchema }),
    z.strictObject({ form: z.literal('branch'), rootAgentIds: AgentIdsSchema }),
    z.strictObject({ form: z.literal('list_and_branch'), agentIds: AgentIdsSchema, rootAgentIds: AgentIdsSchema }),
]);
export const PaperclipAssignmentOrganizationSchema = z.record(AgentIdSchema, z.strictObject({ reportsTo: AgentIdSchema.nullable() }));
// Open: no limiting policy. Protected: protected policy or private agent.
// Blocked: protectedAgent.blockAssignment, including callers with broad grants.
export const PAPERCLIP_RECIPIENT_PROTECTIONS = ['open', 'protected', 'blocked'];
export const PaperclipAssignmentFactsSchema = z.strictObject({
    permission: PaperclipAssignmentPermissionSchema,
    assigner: AgentIdSchema,
    recipient: AgentIdSchema,
    organization: PaperclipAssignmentOrganizationSchema,
    recipientProtection: z.enum(PAPERCLIP_RECIPIENT_PROTECTIONS),
});
export const PAPERCLIP_ASSIGNMENT_BASES = [
    'recipient_open', 'broad_permission', 'listed', 'in_branch', 'listed_and_in_branch',
];
export const PAPERCLIP_ASSIGNMENT_PERMISSION_REFUSALS = [
    'facts_malformed', 'permission_malformed', 'organization_malformed', 'protection_malformed',
    'organization_cycle', 'unknown_agent', 'recipient_blocked', 'no_permission',
    'recipient_not_in_list', 'recipient_not_in_branch',
];
/** Pure decision over validated facts; no settings, I/O or implicit identities. */
export function decideAssignmentByPermission(facts) {
    const parsed = PaperclipAssignmentFactsSchema.safeParse(facts);
    if (!parsed.success) {
        const fields = parsed.error.issues.map((issue) => issue.path[0]);
        if (fields.some((field) => field !== 'permission' && field !== 'organization' && field !== 'recipientProtection')) {
            return { ok: false, refusal: 'facts_malformed' };
        }
        if (fields.includes('permission'))
            return { ok: false, refusal: 'permission_malformed' };
        if (fields.includes('organization'))
            return { ok: false, refusal: 'organization_malformed' };
        return { ok: false, refusal: 'protection_malformed' };
    }
    const { permission, assigner, recipient, organization, recipientProtection } = parsed.data;
    // Visit every component, including those disconnected from the recipient.
    const completed = new Set();
    for (const id of Object.keys(organization)) {
        const path = new Set();
        let current = id;
        while (current !== null && Object.hasOwn(organization, current) && !completed.has(current)) {
            if (path.has(current))
                return { ok: false, refusal: 'organization_cycle' };
            path.add(current);
            current = organization[current].reportsTo;
        }
        for (const visited of path)
            completed.add(visited);
    }
    if (!Object.hasOwn(organization, assigner) || !Object.hasOwn(organization, recipient)) {
        return { ok: false, refusal: 'unknown_agent' };
    }
    // Validate the entire ancestry even when a grant or open policy would suffice.
    const ancestry = [];
    let current = recipient;
    while (current !== null) {
        if (!Object.hasOwn(organization, current))
            return { ok: false, refusal: 'unknown_agent' };
        ancestry.push(current);
        current = organization[current].reportsTo;
    }
    if (recipientProtection === 'blocked')
        return { ok: false, refusal: 'recipient_blocked' };
    if (recipientProtection === 'open')
        return { ok: true, basis: 'recipient_open' };
    if (permission.form === 'broad')
        return { ok: true, basis: 'broad_permission' };
    if (permission.form === 'none')
        return { ok: false, refusal: 'no_permission' };
    if (permission.form === 'list' || permission.form === 'list_and_branch') {
        if (!permission.agentIds.includes(recipient))
            return { ok: false, refusal: 'recipient_not_in_list' };
        if (permission.form === 'list')
            return { ok: true, basis: 'listed' };
    }
    // Index zero is the recipient itself; index 50 is fifty parent edges away.
    const inBranch = ancestry.slice(0, 51).some((id) => permission.rootAgentIds.includes(id));
    if (!inBranch)
        return { ok: false, refusal: 'recipient_not_in_branch' };
    return { ok: true, basis: permission.form === 'branch' ? 'in_branch' : 'listed_and_in_branch' };
}
//# sourceMappingURL=assignment-permission.js.map