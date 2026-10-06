import { z } from 'zod';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { CapabilityAgentParametersSchema } from '../capability/parameters.js';
import { CapabilityCallIdentitySchema } from '../capability/capability-call-context.js';
import { CapToolCallParamsSchema } from '../http/endpoints/cap-tool-call.js';
import { AgentManagementRequestIdSchema } from './agent-management.js';
import { AgentRuntimeChannelKindSchema } from './agent-runtime-state.js';

/**
 * Agent scope and action policy (R5 / D-A1 / D-A9 point 4, v1.31.0) — enforced by the runtime, not only by prompts.
 *
 * - Per capability and per tool: allow / ask / deny, read distinct from write. Precedence: tool rule > capability
 *   rule > defaults.
 * - `defaultWebSearch`: the model's native web search is on by default for a normal agent.
 * - `scopeLimited`: the agent only does its purpose; every default is deny, so only explicit rules open a capability.
 * - `ask` suspends the action until an authenticated human decides, bound to agent/person/operation/policy version
 *   with an expiry (`PolicyApprovalSchema`). Model text or tool output is never an approval.
 * - Every action leaves a log event without payloads or secrets (`AgentActionLogEventSchema`).
 */

export const PolicyDecisionSchema = z.enum(['allow', 'ask', 'deny']);
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const PolicyAccessSchema = z.enum(['read', 'write']);
export type PolicyAccess = z.infer<typeof PolicyAccessSchema>;

export const PolicyAccessDecisionsSchema = z.object({ read: PolicyDecisionSchema, write: PolicyDecisionSchema }).strict();
export type PolicyAccessDecisions = z.infer<typeof PolicyAccessDecisionsSchema>;

const CapabilityNameSchema = CapabilityAgentParametersSchema.shape.capability;
const ToolNameSchema = CapToolCallParamsSchema.shape.tool;

/** Without `tool`: the whole capability. With `tool`: that tool only (overrides the capability rule). */
export const AgentPolicyRuleSchema = z.object({
  capability: CapabilityNameSchema,
  tool: ToolNameSchema.optional(),
  read: PolicyDecisionSchema,
  write: PolicyDecisionSchema,
}).strict();
export type AgentPolicyRule = z.infer<typeof AgentPolicyRuleSchema>;

export const AgentScopePolicySchema = z.object({
  version: AgentConfigVersionSchema,
  defaultWebSearch: z.boolean(),
  scopeLimited: z.boolean(),
  /** The agent's purpose in plain words; required when limited to it. */
  purpose: z.string().trim().min(1).max(2000).optional(),
  defaults: PolicyAccessDecisionsSchema,
  rules: z.array(AgentPolicyRuleSchema).max(500),
}).strict().superRefine((policy, ctx) => {
  const seen = new Set<string>();
  for (const [index, rule] of policy.rules.entries()) {
    const key = `${rule.capability}/${rule.tool ?? '*'}`;
    if (seen.has(key)) ctx.addIssue({ code: 'custom', path: ['rules', index], message: `Duplicate rule ${key}` });
    seen.add(key);
  }
  if (policy.scopeLimited) {
    if (policy.defaults.read !== 'deny' || policy.defaults.write !== 'deny') {
      ctx.addIssue({ code: 'custom', path: ['defaults'], message: 'A purpose-limited agent denies everything not explicitly allowed' });
    }
    if (policy.purpose === undefined) {
      ctx.addIssue({ code: 'custom', path: ['purpose'], message: 'A purpose-limited agent states its purpose' });
    }
  }
});
export type AgentScopePolicy = z.infer<typeof AgentScopePolicySchema>;

export interface PolicyRequest {
  readonly capability: string;
  readonly tool?: string;
  readonly access: PolicyAccess;
}

/** Decision for one operation: tool rule > capability rule > defaults. */
export function resolvePolicyDecision(policy: AgentScopePolicy, request: PolicyRequest): PolicyDecision {
  const toolRule = request.tool === undefined ? undefined
    : policy.rules.find((rule) => rule.capability === request.capability && rule.tool === request.tool);
  const capabilityRule = policy.rules.find((rule) => rule.capability === request.capability && rule.tool === undefined);
  return (toolRule ?? capabilityRule ?? policy.defaults)[request.access];
}

export const PolicyApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'expired', 'revoked']);
export type PolicyApprovalStatus = z.infer<typeof PolicyApprovalStatusSchema>;

const InstantSchema = z.iso.datetime({ offset: true });

export const PolicyApprovalSchema = z.object({
  approvalId: AgentManagementRequestIdSchema,
  identity: CapabilityCallIdentitySchema,
  capability: CapabilityNameSchema,
  tool: ToolNameSchema,
  access: PolicyAccessSchema,
  /** A policy change invalidates pending approvals of older versions (status revoked). */
  policyVersion: AgentConfigVersionSchema,
  requestedAt: InstantSchema,
  expiresAt: InstantSchema,
  status: PolicyApprovalStatusSchema,
  /** Authenticated human principal (e.g. Clerk user id); never the model or a tool. */
  decidedBy: z.string().min(1).max(256).optional(),
  decidedAt: InstantSchema.optional(),
}).strict().superRefine((approval, ctx) => {
  const requested = Date.parse(approval.requestedAt);
  const expires = Date.parse(approval.expiresAt);
  if (expires <= requested) ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expiry must follow the request' });
  const decided = approval.status === 'approved' || approval.status === 'rejected';
  const complete = approval.decidedBy !== undefined && approval.decidedAt !== undefined;
  const partial = approval.decidedBy !== undefined || approval.decidedAt !== undefined;
  if (decided ? !complete : partial) {
    ctx.addIssue({ code: 'custom', path: ['decidedBy'], message: 'A human decider and time exist exactly for approved/rejected' });
  }
  if (approval.decidedAt !== undefined) {
    const at = Date.parse(approval.decidedAt);
    if (at < requested || at > expires) {
      ctx.addIssue({ code: 'custom', path: ['decidedAt'], message: 'A decision must fall between request and expiry' });
    }
  }
});
export type PolicyApproval = z.infer<typeof PolicyApprovalSchema>;

export const AgentActionOutcomeSchema = z.enum(['executed', 'denied', 'pending-approval', 'failed', 'expired']);
export type AgentActionOutcome = z.infer<typeof AgentActionOutcomeSchema>;

/** Who originated the action; `external-content` marks untrusted data (web, documents, provider output). */
export const AgentActionProvenanceSchema = z.enum(['user', 'model', 'system', 'callback', 'external-content']);
export type AgentActionProvenance = z.infer<typeof AgentActionProvenanceSchema>;

/** Registry of every action: decision, outcome, provenance — never input/output payloads or secrets. */
export const AgentActionLogEventSchema = z.object({
  eventId: AgentManagementRequestIdSchema,
  occurredAt: InstantSchema,
  identity: CapabilityCallIdentitySchema,
  capability: CapabilityNameSchema,
  tool: ToolNameSchema,
  access: PolicyAccessSchema,
  decision: PolicyDecisionSchema,
  outcome: AgentActionOutcomeSchema,
  policyVersion: AgentConfigVersionSchema,
  provenance: AgentActionProvenanceSchema,
  channel: AgentRuntimeChannelKindSchema.optional(),
  approvalId: AgentManagementRequestIdSchema.optional(),
}).strict().superRefine((event, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: 'custom', path: ['outcome'], message });
  const approved = event.decision === 'ask' && event.approvalId !== undefined;
  if (event.decision === 'deny' && event.outcome !== 'denied') issue('A denied operation can only be logged as denied');
  if ((event.outcome === 'executed' || event.outcome === 'failed') && event.decision !== 'allow' && !approved) {
    issue('Executed operations need allow or an approval');
  }
  if ((event.outcome === 'pending-approval' || event.outcome === 'expired') && !approved) {
    issue('Pending or expired operations belong to an ask with an approval');
  }
  if (event.outcome === 'denied' && event.decision !== 'deny' && !approved) {
    issue('A denied ask references its rejected approval');
  }
});
export type AgentActionLogEvent = z.infer<typeof AgentActionLogEventSchema>;
