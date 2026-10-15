import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from "../agent/agent-identity.js";
import { PublicationRecipientSchema } from "./publication-ref.js";
/** Roles an organization participant may be authorized to hold. */
export const ParticipantRoleSchema = z.enum(['lead', 'member', 'reviewer', 'observer']);
/** Complete agent identity: every namespace is required (no legacy absence). */
export const ParticipantAgentIdentitySchema = z.strictObject({
    managementAgentId: AgentIdSchema,
    runtimeAgentId: AgentIdSchema,
    vaultAgentId: z.number().int().positive(),
});
/**
 * Authoritative binding between a Forge/X9 agent and one external organization
 * participant. Persisted in the agent profile: carries no run or session field.
 */
export const ParticipantBindingSchema = z.strictObject({
    tenantId: z.string().min(1),
    ownerId: OwnerIdSchema,
    agentIdentity: ParticipantAgentIdentitySchema,
    participantId: z.string().min(1),
    roles: z.array(ParticipantRoleSchema).min(1),
    recipients: z.array(PublicationRecipientSchema),
    appliedVersion: z.number().int().min(1),
    appliedAt: z.iso.datetime(),
});
export const ParticipantBindingOutcomeSchema = z.enum([
    'bound',
    'unknown_participant',
    'ambiguous',
    'foreign_scope',
]);
/** Result of resolving an external participant ID to a bound agent. */
export const ParticipantBindingResolutionSchema = z.strictObject({
    outcome: ParticipantBindingOutcomeSchema,
    participantId: z.string().min(1),
    reason: z.string().min(1),
});
//# sourceMappingURL=participant-binding.js.map