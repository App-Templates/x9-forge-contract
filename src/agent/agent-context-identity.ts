import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from './agent-identity.js';
import { AgentRuntimeIdentitySchema } from './agent-runtime-identity.js';
import { AgentContextWithChannelsSchema, AgentContextWithChannelsWriteSchema } from './agent-channel-configuration.js';

const NonblankAgentId = AgentIdSchema.refine(value => value.trim().length > 0, 'Agent identity must not be blank');
const ContextRuntimeIdentity = AgentRuntimeIdentitySchema.extend({
  managementAgentId: NonblankAgentId,
  runtimeAgentId: NonblankAgentId,
  vaultAgentId: z.number().int().positive(),
}).strict();
const CommonIdentityFields = z.object({
  agentId: NonblankAgentId,
  ownerId: OwnerIdSchema.refine(value => value.trim().length > 0, 'Owner identity must not be blank'),
  tenantId: z.string().min(1).refine(value => value.trim().length > 0, 'Tenant identity must not be blank'),
  identity: ContextRuntimeIdentity,
});
const MasterIdentity = CommonIdentityFields.extend({ role: z.literal('master'), masterAgentId: z.never().optional() }).strict();
const HeirIdentity = CommonIdentityFields.extend({ role: z.literal('erede'), masterAgentId: NonblankAgentId }).strict();
type DeclaredContextIdentity = z.infer<typeof CommonIdentityFields> & { role: 'master' | 'erede'; masterAgentId?: string | undefined };

/** Validate declared authority only; the consumer must resolve the Master's matching owner/tenant. */
function checkContextIdentity(value: DeclaredContextIdentity, ctx: z.RefinementCtx): void {
  if (value.agentId !== value.identity.runtimeAgentId) {
    ctx.addIssue({ code: 'custom', path: ['identity', 'runtimeAgentId'], message: 'Runtime identity must match the context agent' });
  }
  if (value.role === 'erede' && value.masterAgentId === value.identity.runtimeAgentId) {
    ctx.addIssue({ code: 'custom', path: ['masterAgentId'], message: 'An heir cannot be its own runtime Master' });
  }
  if (value.role === 'erede' && value.masterAgentId === value.identity.managementAgentId) {
    ctx.addIssue({ code: 'custom', path: ['masterAgentId'], message: 'An heir cannot name its own management alias as Master' });
  }
}

/** Forge-declared, complete context authority. masterAgentId is a runtime ID, never a Vault number. */
export const AgentContextIdentitySchema = z.discriminatedUnion('role', [MasterIdentity, HeirIdentity]).superRefine(checkContextIdentity);
export type AgentContextIdentity = z.infer<typeof AgentContextIdentitySchema>;
export type AgentContextIdentityInput = z.input<typeof AgentContextIdentitySchema>;

/** Mandatory typed writer boundary; parsing returns detached values and never supplies defaults. */
export function createAgentContextIdentity(input: AgentContextIdentityInput): AgentContextIdentity {
  return AgentContextIdentitySchema.parse(input);
}

/** Modern reader: existing channel guards and runtime extras plus complete declared authority. */
export const AgentContextWithIdentitySchema = z.discriminatedUnion('role', [
  AgentContextWithChannelsSchema.safeExtend(MasterIdentity.shape).superRefine(checkContextIdentity),
  AgentContextWithChannelsSchema.safeExtend(HeirIdentity.shape).superRefine(checkContextIdentity),
]);
export type AgentContextWithIdentity = z.infer<typeof AgentContextWithIdentitySchema>;

/** Modern writer: the same authority boundary and the existing prohibition on platform credentials. */
export const AgentContextWithIdentityWriteSchema = z.discriminatedUnion('role', [
  AgentContextWithChannelsWriteSchema.safeExtend(MasterIdentity.shape).superRefine(checkContextIdentity),
  AgentContextWithChannelsWriteSchema.safeExtend(HeirIdentity.shape).superRefine(checkContextIdentity),
]);
export type AgentContextWithIdentityWrite = z.infer<typeof AgentContextWithIdentityWriteSchema>;
