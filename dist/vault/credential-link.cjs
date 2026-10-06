"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialActionErrorResponseSchema = exports.CredentialActionErrorCodeSchema = exports.CredentialActionResultSchema = exports.CredentialAgentResultSchema = exports.CredentialActionRequestSchema = exports.CredentialActionSchema = exports.AgentCredentialLinksSchema = exports.AgentCredentialLinkEntrySchema = exports.CredentialLinkSchema = exports.CredentialOwnTierSchema = exports.CredentialVersionSchema = exports.CredentialKeySchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const vault_tier_js_1 = require("./vault-tier.cjs");
const platform_internal_credentials_js_1 = require("./platform-internal-credentials.cjs");
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
exports.CredentialKeySchema = zod_1.z.string().max(128).regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/)
    .refine((key) => !(0, platform_internal_credentials_js_1.isPlatformInternalCredentialKey)(key), { message: 'Platform-internal credential keys are never exposed per agent' });
/** Saved version of one key's value; every save raises it. */
exports.CredentialVersionSchema = zod_1.z.number().int().positive();
exports.CredentialOwnTierSchema = vault_tier_js_1.VaultTierSchema.exclude(['platform']);
exports.CredentialLinkSchema = zod_1.z.discriminatedUnion('link', [
    zod_1.z.object({ link: zod_1.z.literal('linked'), source: zod_1.z.literal('master') }).strict(),
    zod_1.z.object({ link: zod_1.z.literal('unlinked'), tier: exports.CredentialOwnTierSchema }).strict(),
]);
exports.AgentCredentialLinkEntrySchema = zod_1.z.object({
    key: exports.CredentialKeySchema,
    provenance: exports.CredentialLinkSchema,
    /** A value exists at the source the provenance points to. */
    present: zod_1.z.boolean(),
    /** Latest saved version at that source; null when absent. */
    version: exports.CredentialVersionSchema.nullable(),
    /** Version the agent's runtime/capabilities currently use; null when never applied. */
    appliedVersion: exports.CredentialVersionSchema.nullable(),
    isSecret: zod_1.z.boolean(),
}).strict().superRefine((entry, ctx) => {
    if (entry.present !== (entry.version !== null)) {
        ctx.addIssue({ code: 'custom', path: ['version'], message: 'A version exists exactly when the key is present' });
    }
    if (entry.appliedVersion !== null && (entry.version === null || entry.appliedVersion > entry.version)) {
        ctx.addIssue({ code: 'custom', path: ['appliedVersion'], message: 'The applied version cannot be ahead of the saved one' });
    }
});
exports.AgentCredentialLinksSchema = zod_1.z.object({
    /** Management (Forge) agent id. */
    agentId: agent_identity_js_1.AgentIdSchema,
    /** Management id of the Master Chief whose source `linked` keys follow (X9: `x9-staging`). */
    masterAgentId: agent_identity_js_1.AgentIdSchema,
    entries: zod_1.z.array(exports.AgentCredentialLinkEntrySchema),
}).superRefine((links, ctx) => {
    const seen = new Set();
    for (const [index, entry] of links.entries.entries()) {
        if (seen.has(entry.key))
            ctx.addIssue({ code: 'custom', path: ['entries', index, 'key'], message: `Duplicate key ${entry.key}` });
        seen.add(entry.key);
    }
});
exports.CredentialActionSchema = zod_1.z.enum(['rotate', 'relink', 'unlink']);
const RotateRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('rotate'),
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    key: exports.CredentialKeySchema,
    /** master: the Master source (reaches every linked agent) · own: one agent's unlinked value. */
    scope: zod_1.z.enum(['master', 'own']),
    agentId: agent_identity_js_1.AgentIdSchema.optional(),
    /** Already-saved version to make effective. */
    version: exports.CredentialVersionSchema,
}).strict().superRefine((request, ctx) => {
    if ((request.scope === 'own') !== (request.agentId !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['agentId'], message: 'agentId is required exactly for an own-value rotation' });
    }
});
const RelinkRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('relink'),
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    key: exports.CredentialKeySchema,
    agentId: agent_identity_js_1.AgentIdSchema,
}).strict();
const UnlinkRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('unlink'),
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    key: exports.CredentialKeySchema,
    agentId: agent_identity_js_1.AgentIdSchema,
    tier: exports.CredentialOwnTierSchema,
    /** Already-saved own version. */
    version: exports.CredentialVersionSchema,
}).strict();
exports.CredentialActionRequestSchema = zod_1.z.discriminatedUnion('action', [RotateRequestSchema, RelinkRequestSchema, UnlinkRequestSchema]);
exports.CredentialAgentResultSchema = zod_1.z.object({
    agentId: agent_identity_js_1.AgentIdSchema,
    outcome: agent_management_js_1.AgentManagementOutcomeSchema,
    reason: agent_management_js_1.AgentManagementReasonSchema.optional(),
    /** Version this agent uses after the action (the previous one when it failed). */
    appliedVersion: exports.CredentialVersionSchema.nullable(),
}).superRefine((row, ctx) => {
    if ((row.outcome === 'ok') === (row.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required exactly when the agent is not ok' });
    }
});
/** Outcome over every agent the action reached (all linked agents for a Master rotation, else the one agent). */
exports.CredentialActionResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    action: exports.CredentialActionSchema,
    key: exports.CredentialKeySchema,
    /** Version made effective by the action. */
    version: exports.CredentialVersionSchema,
    replayed: zod_1.z.boolean(),
    outcome: agent_management_js_1.AgentManagementOverallOutcomeSchema,
    agents: zod_1.z.array(exports.CredentialAgentResultSchema).min(1),
    applied: zod_1.z.number().int().nonnegative(),
    total: zod_1.z.number().int().nonnegative(),
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
    if (result.outcome !== (0, agent_management_js_1.deriveAgentManagementOutcome)(result.agents)) {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Overall outcome is not supported by the per-agent results' });
    }
    if (result.action !== 'rotate' && result.agents.length !== 1) {
        ctx.addIssue({ code: 'custom', path: ['agents'], message: 'relink/unlink reach exactly one agent' });
    }
});
exports.CredentialActionErrorCodeSchema = zod_1.z.enum([
    'invalid_request',
    'agent_not_found',
    'key_not_found',
    'version_not_found',
    'idempotency_conflict',
    'source_unavailable',
]);
exports.CredentialActionErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: exports.CredentialActionErrorCodeSchema,
});
//# sourceMappingURL=credential-link.js.map