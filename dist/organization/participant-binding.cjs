"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantBindingResolutionSchema = exports.ParticipantBindingOutcomeSchema = exports.ParticipantBindingSchema = exports.ParticipantAgentIdentitySchema = exports.ParticipantRoleSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const publication_ref_js_1 = require("./publication-ref.cjs");
/** Roles an organization participant may be authorized to hold. */
exports.ParticipantRoleSchema = zod_1.z.enum(['lead', 'member', 'reviewer', 'observer']);
/** Complete agent identity: every namespace is required (no legacy absence). */
exports.ParticipantAgentIdentitySchema = zod_1.z.strictObject({
    managementAgentId: agent_identity_js_1.AgentIdSchema,
    runtimeAgentId: agent_identity_js_1.AgentIdSchema,
    vaultAgentId: zod_1.z.number().int().positive(),
});
/**
 * Authoritative binding between a Forge/X9 agent and one external organization
 * participant. Persisted in the agent profile: carries no run or session field.
 */
exports.ParticipantBindingSchema = zod_1.z.strictObject({
    tenantId: zod_1.z.string().min(1),
    ownerId: agent_identity_js_1.OwnerIdSchema,
    agentIdentity: exports.ParticipantAgentIdentitySchema,
    participantId: zod_1.z.string().min(1),
    roles: zod_1.z.array(exports.ParticipantRoleSchema).min(1),
    recipients: zod_1.z.array(publication_ref_js_1.PublicationRecipientSchema),
    appliedVersion: zod_1.z.number().int().min(1),
    appliedAt: zod_1.z.iso.datetime(),
});
exports.ParticipantBindingOutcomeSchema = zod_1.z.enum([
    'bound',
    'unknown_participant',
    'ambiguous',
    'foreign_scope',
]);
/** Result of resolving an external participant ID to a bound agent. */
exports.ParticipantBindingResolutionSchema = zod_1.z.strictObject({
    outcome: exports.ParticipantBindingOutcomeSchema,
    participantId: zod_1.z.string().min(1),
    reason: zod_1.z.string().min(1),
});
//# sourceMappingURL=participant-binding.js.map