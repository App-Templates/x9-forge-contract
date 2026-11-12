import { z } from 'zod';
import { AgentRoleSchema, DIRECTOR_ROLE, type AgentRole } from './agent-role.js';
import {
  ParticipantAgentIdentitySchema,
  type ParticipantAgentIdentity,
  type ParticipantBinding,
  type ParticipantBindingReceipt,
} from './participant-binding.js';

/**
 * One access rule for the organization, shared by every service (R-14), in two levels as in Paperclip:
 * - level 1 `read`: every active member of the organization reads (Paperclip `allow_company_agent`);
 * - level 2 `manage`: only the Director manages (Paperclip: CEO over other agents' work).
 *
 * The organization is always the one of the resource being read, taken by the caller from the resource itself,
 * never declared by the agent or the model. The actor's three ids come from the verified run context. The
 * function is pure: no clock, no I/O, no agent names.
 */

export const ORGANIZATION_ACCESS_NEEDS = ['read', 'manage'] as const;
export const OrganizationAccessNeedSchema = z.enum(ORGANIZATION_ACCESS_NEEDS);
export type OrganizationAccessNeed = z.infer<typeof OrganizationAccessNeedSchema>;

export const ORGANIZATION_ACCESS_REFUSALS = [
  'foreign_tenant',
  'foreign_owner',
  'foreign_organization',
  'not_member',
  'role_unknown',
  'role_ambiguous',
  'director_only',
] as const;
export const OrganizationAccessRefusalSchema = z.enum(ORGANIZATION_ACCESS_REFUSALS);
export type OrganizationAccessRefusal = z.infer<typeof OrganizationAccessRefusalSchema>;

export const OrganizationAccessDecisionSchema = z.discriminatedUnion('allowed', [
  z.strictObject({
    allowed: z.literal(true),
    level: OrganizationAccessNeedSchema,
    grant: z.enum(['allow_organization_member', 'allow_organization_director']),
    role: AgentRoleSchema.nullable(),
  }),
  z.strictObject({
    allowed: z.literal(false),
    refusal: OrganizationAccessRefusalSchema,
    reason: z.string().min(1),
  }),
]);
export type OrganizationAccessDecision = z.infer<typeof OrganizationAccessDecisionSchema>;

export interface OrganizationAccessInput {
  actor: { tenantId: string; ownerId: string; agentIdentity: ParticipantAgentIdentity };
  resource: { tenantId: string; ownerId: string; organizationId: string };
  need: OrganizationAccessNeed;
  /** Items of the participant binding list: `{ binding, receipt }`. */
  bindings: ReadonlyArray<{ binding: ParticipantBinding; receipt: ParticipantBindingReceipt }>;
}

function refuse(refusal: OrganizationAccessRefusal, reason: string): OrganizationAccessDecision {
  return { allowed: false, refusal, reason };
}

function sameIdentity(a: ParticipantAgentIdentity, b: ParticipantAgentIdentity): boolean {
  return (
    a.managementAgentId === b.managementAgentId &&
    a.runtimeAgentId === b.runtimeAgentId &&
    a.vaultAgentId === b.vaultAgentId
  );
}

/** Decides whether the actor may read or manage the organization of the resource. */
export function organizationAccess(input: OrganizationAccessInput): OrganizationAccessDecision {
  const { resource, need } = input;
  const actor = {
    tenantId: input.actor.tenantId,
    ownerId: input.actor.ownerId,
    agentIdentity: ParticipantAgentIdentitySchema.parse(input.actor.agentIdentity),
  };

  if (actor.tenantId !== resource.tenantId) {
    return refuse('foreign_tenant', 'The resource belongs to another tenant.');
  }
  if (actor.ownerId !== resource.ownerId) {
    return refuse('foreign_owner', 'The resource belongs to another owner.');
  }

  const live = input.bindings.filter(({ receipt }) => receipt.withdrawnAt === undefined);
  for (const { binding, receipt } of live) {
    const coherent =
      binding.tenantId === actor.tenantId &&
      binding.ownerId === actor.ownerId &&
      sameIdentity(binding.agentIdentity, actor.agentIdentity) &&
      receipt.key.tenantId === actor.tenantId &&
      receipt.key.ownerId === actor.ownerId &&
      sameIdentity(receipt.key.agentIdentity, actor.agentIdentity) &&
      receipt.appliedVersion === binding.appliedVersion;
    if (!coherent) {
      return refuse('not_member', 'The binding list is inconsistent with the acting agent.');
    }
  }

  const active = live.filter(
    ({ binding, receipt }) =>
      receipt.key.organizationId === resource.organizationId &&
      binding.recipients.some((r) => r.kind === 'organization' && r.id === resource.organizationId),
  );
  if (active.length === 0) {
    const elsewhere = live.some(({ receipt }) => receipt.key.organizationId !== resource.organizationId);
    return elsewhere
      ? refuse('foreign_organization', 'The agent belongs only to other organizations.')
      : refuse('not_member', 'The agent is not an active member of the organization.');
  }

  const roles = [...new Set(active.map(({ binding }) => binding.agentRole ?? null))];
  const commonRole: AgentRole | null = roles.length === 1 ? roles[0]! : null;

  if (need === 'read') {
    return { allowed: true, level: 'read', grant: 'allow_organization_member', role: commonRole };
  }

  if (roles.includes(null)) {
    return refuse('role_unknown', 'A binding of the agent carries no role: the role cannot be established.');
  }
  if (roles.length > 1) {
    return refuse('role_ambiguous', 'The bindings of the agent carry different roles.');
  }
  if (commonRole !== DIRECTOR_ROLE) {
    return refuse('director_only', 'Only the Director manages the organization.');
  }
  return { allowed: true, level: 'manage', grant: 'allow_organization_director', role: DIRECTOR_ROLE };
}
