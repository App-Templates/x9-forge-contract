import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope, type CapabilityAgentScope } from './capability-call-context.js';
import { CapabilityAgentParametersSchema } from './parameters.js';
import { CapabilityOrdinaryConfigurationSchema, CapabilityOrdinaryConfigStateSchema, sameOrdinaryData, type CapabilityOrdinaryConfiguration } from './ordinary-configuration.js';
import { AgentRuntimeIdentitySchema, type AgentRuntimeIdentity } from '../agent/agent-runtime-identity.js';
import { AgentWorkspaceAttestationSchema } from '../agent/agent-workspace-attestation.js';
import { AgentManagementRequestIdSchema } from '../agent/agent-model-management-values.js';

export const CapabilityOrdinaryBundleReferenceSchema = AgentWorkspaceAttestationSchema.pick({ appliedVersion: true, sha256: true });
export type CapabilityOrdinaryBundleReference = z.infer<typeof CapabilityOrdinaryBundleReferenceSchema>;
export const CapabilityOrdinaryMembershipSchema = z.enum(['enabled', 'disabled', 'removed']);
export const CapabilityOrdinaryLifecycleRequestSchema = z.object({
  format: z.literal('ordinary-lifecycle-v1'),
  requestId: AgentManagementRequestIdSchema,
  scope: CapabilityAgentScopeSchema,
  identity: AgentRuntimeIdentitySchema,
  capability: CapabilityAgentParametersSchema.shape.capability,
  phase: z.enum(['prepare', 'suspend', 'activate', 'rollback']),
  transition: z.object({ from: CapabilityOrdinaryBundleReferenceSchema.nullable(), to: CapabilityOrdinaryBundleReferenceSchema }).strict(),
  targetMembership: CapabilityOrdinaryMembershipSchema,
  configuration: CapabilityOrdinaryConfigurationSchema.optional(),
}).strict().superRefine((request, ctx) => {
  if (request.scope.agentId !== request.identity.runtimeAgentId) ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Scope must use the runtime identity' });
  if (request.configuration && (!sameCapabilityScope(request.scope, request.configuration.scope) || request.capability !== request.configuration.capability)) ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Lifecycle configuration target mismatch' });
  if (request.targetMembership !== 'enabled' && request.configuration) ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Inactive membership cannot carry an active candidate configuration' });
});
export type CapabilityOrdinaryLifecycleRequest = z.infer<typeof CapabilityOrdinaryLifecycleRequestSchema>;
export const CapabilityOrdinaryLifecycleReceiptSchema = z.object({
  request: CapabilityOrdinaryLifecycleRequestSchema,
  operationId: AgentManagementRequestIdSchema,
  fence: z.number().int().positive(),
  status: z.enum(['pending', 'complete']),
  outcome: z.enum(['ok', 'error', 'in-progress']),
  replayed: z.boolean(),
  ordinaryState: CapabilityOrdinaryConfigStateSchema,
  membershipEffective: z.enum(['enabled', 'disabled', 'removed', 'unknown']),
  observedAt: z.iso.datetime({ offset: true }).nullable(),
}).strict().superRefine((receipt, ctx) => {
  if (!sameCapabilityScope(receipt.request.scope, receipt.ordinaryState.scope) || receipt.request.capability !== receipt.ordinaryState.capability) ctx.addIssue({ code: 'custom', path: ['ordinaryState'], message: 'Receipt target mismatch' });
  if (receipt.status === 'pending' && receipt.outcome !== 'in-progress') ctx.addIssue({ code: 'custom', message: 'Pending effects are ambiguous' });
  if (receipt.status === 'complete' && receipt.outcome === 'in-progress') ctx.addIssue({ code: 'custom', message: 'In-progress cannot be complete' });
  if (receipt.membershipEffective !== 'unknown' && receipt.observedAt === null) ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'Membership evidence requires consumer observation' });
  if (receipt.request.phase === 'prepare' || receipt.request.phase === 'suspend') {
    if (receipt.membershipEffective !== 'unknown' || receipt.observedAt !== null) ctx.addIssue({ code: 'custom', message: 'Preparation and suspension do not attest new effective membership' });
  }
  if (receipt.request.phase === 'activate' && receipt.outcome === 'ok' && receipt.status === 'complete' && (receipt.membershipEffective !== receipt.request.targetMembership || receipt.observedAt === null)) ctx.addIssue({ code: 'custom', message: 'Activation needs confirmed target membership' });
  if (receipt.membershipEffective === 'disabled' || receipt.membershipEffective === 'removed') {
    if (receipt.ordinaryState.runtimeState !== 'unloaded' || receipt.ordinaryState.applied !== null || receipt.ordinaryState.effectiveParameters.length !== 0) ctx.addIssue({ code: 'custom', message: 'Inactive consumer cannot attest loaded parameters' });
  }
});
export type CapabilityOrdinaryLifecycleReceipt = z.infer<typeof CapabilityOrdinaryLifecycleReceiptSchema>;
export const CapabilityOrdinaryLifecycleTransactionSchema = z.object({
  request: CapabilityOrdinaryLifecycleRequestSchema,
  state: z.enum(['prepared', 'suspended', 'activated', 'rolled_back', 'pending', 'ambiguous']),
  operationId: AgentManagementRequestIdSchema,
  fence: z.number().int().positive(),
  receipts: z.array(CapabilityOrdinaryLifecycleReceiptSchema).max(4),
  previousState: CapabilityOrdinaryConfigStateSchema,
  previousMembership: z.enum(['enabled', 'disabled', 'removed', 'unknown']),
}).strict();
export type CapabilityOrdinaryLifecycleTransaction = z.infer<typeof CapabilityOrdinaryLifecycleTransactionSchema>;
/** Obtained from authenticated CoreApply lookup of the verified candidate, never from the request body. */
export type CapabilityOrdinaryLifecycleAuthority = {
  scope: CapabilityAgentScope;
  identity: AgentRuntimeIdentity;
  capability: string;
  requestId: string;
  bundle: CapabilityOrdinaryBundleReference;
  current: CapabilityOrdinaryBundleReference | null;
  membership: z.infer<typeof CapabilityOrdinaryMembershipSchema>;
  configuration: CapabilityOrdinaryConfiguration | null;
  transaction: CapabilityOrdinaryLifecycleTransaction | null;
};

/** Validation is pure. The producer owns durable slot/receipt/fence storage and consumer reconciliation. */
export function parseCapabilityOrdinaryLifecycle(request: unknown, authority: CapabilityOrdinaryLifecycleAuthority): { request: CapabilityOrdinaryLifecycleRequest; replay: CapabilityOrdinaryLifecycleReceipt | null } {
  const parsed = CapabilityOrdinaryLifecycleRequestSchema.parse(request);
  CapabilityAgentScopeSchema.parse(authority.scope);
  AgentRuntimeIdentitySchema.parse(authority.identity);
  CapabilityOrdinaryBundleReferenceSchema.parse(authority.bundle);
  if (!sameCapabilityScope(parsed.scope, authority.scope) || !sameOrdinaryData(parsed.identity, authority.identity) || parsed.capability !== authority.capability || parsed.requestId !== authority.requestId) throw new Error('Lifecycle authority scope or identity mismatch');
  if (!sameOrdinaryData(parsed.transition.to, authority.bundle) || parsed.targetMembership !== authority.membership || !sameOrdinaryData(parsed.configuration ?? null, authority.configuration)) throw new Error('Lifecycle candidate mismatch');
  if (parsed.transition.from && parsed.transition.to.appliedVersion <= parsed.transition.from.appliedVersion) throw new Error('Lifecycle candidate must advance bundle');
  const transaction = authority.transaction ? CapabilityOrdinaryLifecycleTransactionSchema.parse(authority.transaction) : null;
  if (transaction) {
    const { phase: _phase, ...retained } = transaction.request;
    const { phase: _requestedPhase, ...incoming } = parsed;
    if (!sameOrdinaryData(retained, incoming) || !sameCapabilityScope(transaction.previousState.scope, parsed.scope) || transaction.previousState.capability !== parsed.capability) throw new Error('Lifecycle transaction lost or changed');
    const phases = new Set<string>();
    for (const receipt of transaction.receipts) {
      const { phase, ...receiptBinding } = receipt.request;
      if (phases.has(phase) || !sameOrdinaryData(receiptBinding, retained) || receipt.operationId !== transaction.operationId || receipt.fence !== transaction.fence) throw new Error('Lifecycle receipt fence or binding mismatch');
      phases.add(phase);
    }
    if (transaction.state === 'pending' || transaction.state === 'ambiguous' || transaction.receipts.some(receipt => receipt.status === 'pending')) throw new Error('Lifecycle in-progress: reconcile consumer before retry');
    const replay = transaction.receipts.find(receipt => receipt.request.phase === parsed.phase);
    if (replay) return { request: parsed, replay: { ...replay, replayed: true } };
  }
  if (parsed.phase === 'prepare') {
    if (transaction) throw new Error('Lifecycle slot is already retained');
    if (!sameOrdinaryData(authority.current, parsed.transition.from)) throw new Error('Lifecycle from bundle changed');
  } else {
    if (!transaction) throw new Error('Lifecycle transaction required');
    const allowed = parsed.phase === 'suspend' ? ['prepared'] : parsed.phase === 'activate' ? ['suspended'] : ['prepared', 'suspended', 'activated'];
    if (!allowed.includes(transaction.state)) throw new Error('Lifecycle phase order conflict');
    const expected = transaction.state === 'activated' ? parsed.transition.to : parsed.transition.from;
    if (!sameOrdinaryData(authority.current, expected)) throw new Error('Lifecycle effective bundle changed');
  }
  return { request: parsed, replay: null };
}

/** Validate server-produced evidence. This does not execute effects or manufacture consumer timestamps. */
export function parseCapabilityOrdinaryLifecycleReceipt(receipt: unknown, request: CapabilityOrdinaryLifecycleRequest, transaction: CapabilityOrdinaryLifecycleTransaction): CapabilityOrdinaryLifecycleReceipt {
  const parsed = CapabilityOrdinaryLifecycleReceiptSchema.parse(receipt);
  if (!sameOrdinaryData(parsed.request, request) || parsed.operationId !== transaction.operationId || parsed.fence !== transaction.fence) throw new Error('Lifecycle response binding or fence mismatch');
  if (parsed.outcome !== 'ok' || parsed.status !== 'complete') return parsed;
  if (request.phase === 'prepare' || request.phase === 'suspend') {
    if (!sameOrdinaryData(parsed.ordinaryState, transaction.previousState)) throw new Error('Preparation cannot attest candidate configuration');
  }
  if (request.phase === 'activate' && request.targetMembership === 'enabled' && request.configuration) {
    if (parsed.ordinaryState.runtimeState !== 'loaded') throw new Error('Enabled consumer not confirmed loaded');
    const expected = request.configuration.parameters.filter(entry => entry.parameter.appliesWhen === 'next_apply');
    const effective = parsed.ordinaryState.effectiveParameters.filter(entry => entry.mode === 'next_apply');
    if (expected.length !== effective.length || expected.some(entry => entry.origin.kind === 'needs_choice' || !effective.some(value => value.key === entry.parameter.key && value.sourceConfigVersion === request.configuration?.version && sameOrdinaryData(value.value, entry.value)))) throw new Error('Candidate next_apply not confirmed by consumer');
  }
  if (request.phase === 'rollback') {
    if (parsed.membershipEffective !== transaction.previousMembership || parsed.observedAt === null) throw new Error('Rollback membership not confirmed');
    if (request.transition.from === null && (parsed.ordinaryState.runtimeState !== 'unloaded' || parsed.ordinaryState.applied !== null || parsed.ordinaryState.effectiveParameters.length > 0)) throw new Error('First activation rollback must restore absence');
    if (request.transition.from !== null && !sameOrdinaryData(parsed.ordinaryState.applied, transaction.previousState.applied)) throw new Error('Rollback previous applied configuration not confirmed');
  }
  return parsed;
}
