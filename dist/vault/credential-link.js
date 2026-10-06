import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { AgentManagementOutcomeSchema, AgentManagementOverallOutcomeSchema, AgentManagementReasonSchema, AgentManagementRequestIdSchema, deriveAgentManagementOutcome, } from "../agent/agent-management.js";
import { VaultTierSchema } from "./vault-tier.js";
import { isPlatformInternalCredentialKey } from "./platform-internal-credentials.js";
/**
 * Keys linked to the Master Chief (R3, v1.31.0).
 *
 * Every key of an agent has a provenance: `linked` to the X9 Master Chief source (the default for new agents, a
 * reference, never a copy of the secret) or `unlinked` with the agent's own value at `owner` or `agent` tier.
 * Rotating the Master reaches all and only the linked agents; an unlinked value is untouched. `relink` makes ONE
 * agent's key follow the Master again without deleting an owner row other agents may use; `unlink` gives it its own
 * saved value. Rotation never carries a secret: it makes an already-saved version effective.
 *
 * These schemas carry metadata only — the strict entry schema rejects a `value` field.
 */
/** Vault key name; platform-internal keys are never listed or acted upon for an agent. */
export const CredentialKeySchema = z.string().max(128).regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/)
    .refine((key) => !isPlatformInternalCredentialKey(key), { message: 'Platform-internal credential keys are never exposed per agent' });
/** Saved version of one key's value; every save raises it. */
export const CredentialVersionSchema = z.number().int().positive();
export const CredentialOwnTierSchema = VaultTierSchema.exclude(['platform']);
export const CredentialLinkSchema = z.discriminatedUnion('link', [
    z.object({ link: z.literal('linked'), source: z.literal('master') }).strict(),
    z.object({ link: z.literal('unlinked'), tier: CredentialOwnTierSchema }).strict(),
]);
export const AgentCredentialLinkEntrySchema = z.object({
    key: CredentialKeySchema,
    provenance: CredentialLinkSchema,
    /** A value exists at the source the provenance points to. */
    present: z.boolean(),
    /** Latest saved version at that source; null when absent. */
    version: CredentialVersionSchema.nullable(),
    /** Version the agent's runtime/capabilities currently use; null when never applied. */
    appliedVersion: CredentialVersionSchema.nullable(),
    isSecret: z.boolean(),
}).strict().superRefine((entry, ctx) => {
    if (entry.present !== (entry.version !== null)) {
        ctx.addIssue({ code: 'custom', path: ['version'], message: 'A version exists exactly when the key is present' });
    }
    if (entry.appliedVersion !== null && (entry.version === null || entry.appliedVersion > entry.version)) {
        ctx.addIssue({ code: 'custom', path: ['appliedVersion'], message: 'The applied version cannot be ahead of the saved one' });
    }
});
export const AgentCredentialLinksSchema = z.object({
    /** Management (Forge) agent id. */
    agentId: AgentIdSchema,
    /** Management id of the Master Chief whose source `linked` keys follow (X9: `x9-staging`). */
    masterAgentId: AgentIdSchema,
    entries: z.array(AgentCredentialLinkEntrySchema),
}).superRefine((links, ctx) => {
    const seen = new Set();
    for (const [index, entry] of links.entries.entries()) {
        if (seen.has(entry.key))
            ctx.addIssue({ code: 'custom', path: ['entries', index, 'key'], message: `Duplicate key ${entry.key}` });
        seen.add(entry.key);
    }
});
export const CredentialActionSchema = z.enum(['rotate', 'relink', 'unlink']);
const RotateRequestSchema = z.object({
    action: z.literal('rotate'),
    requestId: AgentManagementRequestIdSchema,
    key: CredentialKeySchema,
    /** master: the Master source (reaches every linked agent) · own: one agent's unlinked value. */
    scope: z.enum(['master', 'own']),
    agentId: AgentIdSchema.optional(),
    /** Already-saved version to make effective. */
    version: CredentialVersionSchema,
}).strict().superRefine((request, ctx) => {
    if ((request.scope === 'own') !== (request.agentId !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['agentId'], message: 'agentId is required exactly for an own-value rotation' });
    }
});
const RelinkRequestSchema = z.object({
    action: z.literal('relink'),
    requestId: AgentManagementRequestIdSchema,
    key: CredentialKeySchema,
    agentId: AgentIdSchema,
}).strict();
const UnlinkRequestSchema = z.object({
    action: z.literal('unlink'),
    requestId: AgentManagementRequestIdSchema,
    key: CredentialKeySchema,
    agentId: AgentIdSchema,
    tier: CredentialOwnTierSchema,
    /** Already-saved own version. */
    version: CredentialVersionSchema,
}).strict();
export const CredentialActionRequestSchema = z.discriminatedUnion('action', [RotateRequestSchema, RelinkRequestSchema, UnlinkRequestSchema]);
export const CredentialAgentResultSchema = z.object({
    agentId: AgentIdSchema,
    outcome: AgentManagementOutcomeSchema,
    reason: AgentManagementReasonSchema.optional(),
    /** Version this agent uses after the action (the previous one when it failed). */
    appliedVersion: CredentialVersionSchema.nullable(),
}).superRefine((row, ctx) => {
    if ((row.outcome === 'ok') === (row.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required exactly when the agent is not ok' });
    }
});
/** Outcome over every agent the action reached (all linked agents for a Master rotation, else the one agent). */
export const CredentialActionResultSchema = z.object({
    ok: z.literal(true),
    requestId: AgentManagementRequestIdSchema,
    action: CredentialActionSchema,
    key: CredentialKeySchema,
    /** Version made effective by the action. */
    version: CredentialVersionSchema,
    replayed: z.boolean(),
    outcome: AgentManagementOverallOutcomeSchema,
    agents: z.array(CredentialAgentResultSchema).min(1),
    applied: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
}).superRefine((result, ctx) => {
    const seen = new Set();
    for (const [index, row] of result.agents.entries()) {
        if (seen.has(row.agentId))
            ctx.addIssue({ code: 'custom', path: ['agents', index, 'agentId'], message: 'Duplicate agent' });
        seen.add(row.agentId);
        if (row.outcome === 'ok' && row.appliedVersion !== result.version) {
            ctx.addIssue({ code: 'custom', path: ['agents', index, 'appliedVersion'], message: 'An ok agent uses the version made effective' });
        }
    }
    if (result.applied !== result.agents.filter((row) => row.outcome === 'ok').length) {
        ctx.addIssue({ code: 'custom', path: ['applied'], message: 'applied must count the ok agents' });
    }
    if (result.total !== result.agents.length) {
        ctx.addIssue({ code: 'custom', path: ['total'], message: 'total must count every reached agent' });
    }
    if (result.outcome !== deriveAgentManagementOutcome(result.agents)) {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Overall outcome is not supported by the per-agent results' });
    }
    if (result.action !== 'rotate' && result.agents.length !== 1) {
        ctx.addIssue({ code: 'custom', path: ['agents'], message: 'relink/unlink reach exactly one agent' });
    }
});
export const CredentialActionErrorCodeSchema = z.enum([
    'invalid_request',
    'agent_not_found',
    'key_not_found',
    'version_not_found',
    'idempotency_conflict',
    'source_unavailable',
]);
export const CredentialActionErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: CredentialActionErrorCodeSchema,
});
//# sourceMappingURL=credential-link.js.map