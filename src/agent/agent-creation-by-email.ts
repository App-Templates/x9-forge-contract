import { z } from 'zod';
import { AgentManagementRequestIdSchema } from './agent-management.js';
import { AgentRuntimeIdentitySchema } from './agent-runtime-identity.js';
import { PlatformOwnerAuthorizationSchema } from './agent-creation-authority.js';

/** Editable part of the creation draft; the owner is never part of it. */
export const AgentCreationByEmailDraftSchema = z.object({
  name: z.string().trim().min(1),
  objective: z.string().trim().min(1),
  allowedCapabilities: z.array(z.string().min(1)),
}).strict().refine((draft) => new Set(draft.allowedCapabilities).size === draft.allowedCapabilities.length, {
  path: ['allowedCapabilities'], message: 'Duplicate capability',
});
export type AgentCreationByEmailDraft = z.infer<typeof AgentCreationByEmailDraftSchema>;

/** The recipient is named only by email; the owner is resolved by the producer, never imposed by the caller. */
export const AgentCreationByEmailRequestSchema = z.object({
  idempotencyKey: AgentManagementRequestIdSchema,
  recipientEmail: z.email(),
  draft: AgentCreationByEmailDraftSchema,
  authorization: PlatformOwnerAuthorizationSchema.refine((auth) => auth.decision === 'granted', {
    path: ['decision'], message: 'Creation requires a granted authorization',
  }),
}).strict();
export type AgentCreationByEmailRequest = z.infer<typeof AgentCreationByEmailRequestSchema>;

export const AgentCreationByEmailStatusSchema = z.enum(['created', 'invited', 'pending', 'failed']);
export const AgentCreationByEmailOwnerResolutionSchema = z.enum(['existing_user', 'invited_identity']);

export const AgentCreationByEmailResultSchema = z.object({
  status: AgentCreationByEmailStatusSchema,
  agentIdentity: AgentRuntimeIdentitySchema.optional(),
  ownerResolution: AgentCreationByEmailOwnerResolutionSchema.optional(),
  replayed: z.boolean(),
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
export type AgentCreationByEmailResult = z.infer<typeof AgentCreationByEmailResultSchema>;

export const AgentCreationByEmailErrorCodeSchema = z.enum([
  'not_platform_owner', 'email_ambiguous', 'tenant_mismatch', 'intent_conflict', 'authorization_expired', 'resolution_failed',
]);
export const AgentCreationByEmailErrorSchema = z.object({
  code: AgentCreationByEmailErrorCodeSchema,
  message: z.string().min(1),
}).strict();
export type AgentCreationByEmailError = z.infer<typeof AgentCreationByEmailErrorSchema>;
