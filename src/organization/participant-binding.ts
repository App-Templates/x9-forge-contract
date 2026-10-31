import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from '../agent/agent-identity.js';
import { AgentRoleSchema } from './agent-role.js';
import { PublicationRecipientSchema } from './publication-ref.js';

/** Roles an organization participant may be authorized to hold. */
export const ParticipantRoleSchema = z.enum(['lead', 'member', 'reviewer', 'observer']);
export type ParticipantRole = z.infer<typeof ParticipantRoleSchema>;

/** Complete agent identity: every namespace is required (no legacy absence). */
export const ParticipantAgentIdentitySchema = z.strictObject({
  managementAgentId: AgentIdSchema,
  runtimeAgentId: AgentIdSchema,
  vaultAgentId: z.number().int().positive(),
});
export type ParticipantAgentIdentity = z.infer<typeof ParticipantAgentIdentitySchema>;

/**
 * Authoritative binding between a Forge/X9 agent and one external organization
 * participant. Persisted in the agent profile: carries no run or session field.
 */
export const ParticipantBindingSchema = z.strictObject({
  tenantId: z.string().min(1),
  ownerId: OwnerIdSchema,
  agentIdentity: ParticipantAgentIdentitySchema,
  participantId: z.string().min(1),
  /** Attested person (never model-provided); required by the apply operation. */
  personRef: z.string().min(1).optional(),
  roles: z.array(ParticipantRoleSchema).min(1),
  /**
   * Role of the agent in the company (1.65.0), written by the server when the seat is created, never by a model:
   * rd-seats for lab and ricerca, the birth for capo-bu, the configuration for director. Absent on bindings saved
   * before: a reader that needs the role refuses them with a message (R-37).
   */
  agentRole: AgentRoleSchema.optional(),
  recipients: z.array(PublicationRecipientSchema),
  appliedVersion: z.number().int().min(1),
  appliedAt: z.iso.datetime(),
});
export type ParticipantBinding = z.infer<typeof ParticipantBindingSchema>;

export const ParticipantBindingOutcomeSchema = z.enum([
  'bound',
  'unknown_participant',
  'ambiguous',
  'foreign_scope',
]);
export type ParticipantBindingOutcome = z.infer<typeof ParticipantBindingOutcomeSchema>;

/** Result of resolving an external participant ID to a bound agent. */
export const ParticipantBindingResolutionSchema = z.strictObject({
  outcome: ParticipantBindingOutcomeSchema,
  participantId: z.string().min(1),
  reason: z.string().min(1),
});
export type ParticipantBindingResolution = z.infer<typeof ParticipantBindingResolutionSchema>;

/** Binding key: one binding per (organization, person, agent). Person is mandatory. */
export const ParticipantBindingKeySchema = z.strictObject({
  tenantId: ParticipantBindingSchema.shape.tenantId,
  ownerId: ParticipantBindingSchema.shape.ownerId,
  agentIdentity: ParticipantAgentIdentitySchema,
  organizationId: z.string().min(1),
  personRef: z.string().min(1),
});
export type ParticipantBindingKey = z.infer<typeof ParticipantBindingKeySchema>;

/** Receipt of an applied (or withdrawn) binding, issued by the owning service. */
export const ParticipantBindingReceiptSchema = z.strictObject({
  key: ParticipantBindingKeySchema,
  appliedVersion: z.number().int().positive(),
  digest: z.string().min(1),
  appliedAt: z.iso.datetime(),
  withdrawnAt: z.iso.datetime().optional(),
});
export type ParticipantBindingReceipt = z.infer<typeof ParticipantBindingReceiptSchema>;

/** Selector to resolve the binding of a person for an agent in an organization. */
export const ParticipantBindingSelectorSchema = z.strictObject({
  tenantId: ParticipantBindingSchema.shape.tenantId,
  ownerId: ParticipantBindingSchema.shape.ownerId,
  agentIdentity: ParticipantAgentIdentitySchema,
  organizationId: z.string().min(1),
  personRef: z.string().min(1),
});
export type ParticipantBindingSelector = z.infer<typeof ParticipantBindingSelectorSchema>;
