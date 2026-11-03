"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCreationByEmailErrorSchema = exports.AgentCreationByEmailErrorCodeSchema = exports.AgentCreationByEmailResultSchema = exports.AgentCreationByEmailOwnerResolutionSchema = exports.AgentCreationByEmailStatusSchema = exports.AgentCreationByEmailRequestSchema = exports.AgentCreationByEmailDraftSchema = void 0;
const zod_1 = require("zod");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const agent_creation_authority_js_1 = require("./agent-creation-authority.cjs");
/** Editable part of the creation draft; the owner is never part of it. */
exports.AgentCreationByEmailDraftSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
    objective: zod_1.z.string().trim().min(1),
    allowedCapabilities: zod_1.z.array(zod_1.z.string().min(1)),
}).strict().refine((draft) => new Set(draft.allowedCapabilities).size === draft.allowedCapabilities.length, {
    path: ['allowedCapabilities'], message: 'Duplicate capability',
});
/** The recipient is named only by email; the owner is resolved by the producer, never imposed by the caller. */
exports.AgentCreationByEmailRequestSchema = zod_1.z.object({
    idempotencyKey: agent_management_js_1.AgentManagementRequestIdSchema,
    recipientEmail: zod_1.z.email(),
    draft: exports.AgentCreationByEmailDraftSchema,
    authorization: agent_creation_authority_js_1.PlatformOwnerAuthorizationSchema.refine((auth) => auth.decision === 'granted', {
        path: ['decision'], message: 'Creation requires a granted authorization',
    }),
}).strict();
exports.AgentCreationByEmailStatusSchema = zod_1.z.enum(['created', 'invited', 'pending', 'failed']);
exports.AgentCreationByEmailOwnerResolutionSchema = zod_1.z.enum(['existing_user', 'invited_identity']);
exports.AgentCreationByEmailResultSchema = zod_1.z.object({
    status: exports.AgentCreationByEmailStatusSchema,
    agentIdentity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional(),
    ownerResolution: exports.AgentCreationByEmailOwnerResolutionSchema.optional(),
    replayed: zod_1.z.boolean(),
}).strict().superRefine((result, ctx) => {
    const settled = result.status === 'created' || result.status === 'invited';
    if (settled && result.agentIdentity === undefined) {
        ctx.addIssue({ code: 'custom', path: ['agentIdentity'], message: 'A created or invited agent states its identity' });
    }
    if (settled && result.ownerResolution === undefined) {
        ctx.addIssue({ code: 'custom', path: ['ownerResolution'], message: 'A created or invited agent states how the owner was resolved' });
    }
    if (!settled && result.agentIdentity !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['agentIdentity'], message: 'Only a created or invited agent has an identity' });
    }
    if (result.status === 'invited' && result.ownerResolution !== 'invited_identity') {
        ctx.addIssue({ code: 'custom', path: ['ownerResolution'], message: 'An invitation resolves to an invited identity' });
    }
});
exports.AgentCreationByEmailErrorCodeSchema = zod_1.z.enum([
    'not_platform_owner', 'email_ambiguous', 'tenant_mismatch', 'intent_conflict', 'authorization_expired', 'resolution_failed',
]);
exports.AgentCreationByEmailErrorSchema = zod_1.z.object({
    code: exports.AgentCreationByEmailErrorCodeSchema,
    message: zod_1.z.string().min(1),
}).strict();
//# sourceMappingURL=agent-creation-by-email.js.map