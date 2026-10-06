"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentActionLogEventSchema = exports.AgentActionProvenanceSchema = exports.AgentActionOutcomeSchema = exports.PolicyApprovalSchema = exports.PolicyApprovalStatusSchema = exports.AgentScopePolicySchema = exports.AgentPolicyRuleSchema = exports.PolicyAccessDecisionsSchema = exports.PolicyAccessSchema = exports.PolicyDecisionSchema = void 0;
exports.resolvePolicyDecision = resolvePolicyDecision;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const cap_tool_call_js_1 = require("../http/endpoints/cap-tool-call.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_runtime_state_js_1 = require("./agent-runtime-state.cjs");
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
exports.PolicyDecisionSchema = zod_1.z.enum(['allow', 'ask', 'deny']);
exports.PolicyAccessSchema = zod_1.z.enum(['read', 'write']);
exports.PolicyAccessDecisionsSchema = zod_1.z.object({ read: exports.PolicyDecisionSchema, write: exports.PolicyDecisionSchema }).strict();
const CapabilityNameSchema = parameters_js_1.CapabilityAgentParametersSchema.shape.capability;
const ToolNameSchema = cap_tool_call_js_1.CapToolCallParamsSchema.shape.tool;
/** Without `tool`: the whole capability. With `tool`: that tool only (overrides the capability rule). */
exports.AgentPolicyRuleSchema = zod_1.z.object({
    capability: CapabilityNameSchema,
    tool: ToolNameSchema.optional(),
    read: exports.PolicyDecisionSchema,
    write: exports.PolicyDecisionSchema,
}).strict();
exports.AgentScopePolicySchema = zod_1.z.object({
    version: agent_config_js_1.AgentConfigVersionSchema,
    defaultWebSearch: zod_1.z.boolean(),
    scopeLimited: zod_1.z.boolean(),
    /** The agent's purpose in plain words; required when limited to it. */
    purpose: zod_1.z.string().trim().min(1).max(2000).optional(),
    defaults: exports.PolicyAccessDecisionsSchema,
    rules: zod_1.z.array(exports.AgentPolicyRuleSchema).max(500),
}).strict().superRefine((policy, ctx) => {
    const seen = new Set();
    for (const [index, rule] of policy.rules.entries()) {
        const key = `${rule.capability}/${rule.tool ?? '*'}`;
        if (seen.has(key))
            ctx.addIssue({ code: 'custom', path: ['rules', index], message: `Duplicate rule ${key}` });
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
/** Decision for one operation: tool rule > capability rule > defaults. */
function resolvePolicyDecision(policy, request) {
    const toolRule = request.tool === undefined ? undefined
        : policy.rules.find((rule) => rule.capability === request.capability && rule.tool === request.tool);
    const capabilityRule = policy.rules.find((rule) => rule.capability === request.capability && rule.tool === undefined);
    return (toolRule ?? capabilityRule ?? policy.defaults)[request.access];
}
exports.PolicyApprovalStatusSchema = zod_1.z.enum(['pending', 'approved', 'rejected', 'expired', 'revoked']);
const InstantSchema = zod_1.z.iso.datetime({ offset: true });
exports.PolicyApprovalSchema = zod_1.z.object({
    approvalId: agent_management_js_1.AgentManagementRequestIdSchema,
    identity: capability_call_context_js_1.CapabilityCallIdentitySchema,
    capability: CapabilityNameSchema,
    tool: ToolNameSchema,
    access: exports.PolicyAccessSchema,
    /** A policy change invalidates pending approvals of older versions (status revoked). */
    policyVersion: agent_config_js_1.AgentConfigVersionSchema,
    requestedAt: InstantSchema,
    expiresAt: InstantSchema,
    status: exports.PolicyApprovalStatusSchema,
    /** Authenticated human principal (e.g. Clerk user id); never the model or a tool. */
    decidedBy: zod_1.z.string().min(1).max(256).optional(),
    decidedAt: InstantSchema.optional(),
}).strict().superRefine((approval, ctx) => {
    const requested = Date.parse(approval.requestedAt);
    const expires = Date.parse(approval.expiresAt);
    if (expires <= requested)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expiry must follow the request' });
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
exports.AgentActionOutcomeSchema = zod_1.z.enum(['executed', 'denied', 'pending-approval', 'failed', 'expired']);
/** Who originated the action; `external-content` marks untrusted data (web, documents, provider output). */
exports.AgentActionProvenanceSchema = zod_1.z.enum(['user', 'model', 'system', 'callback', 'external-content']);
/** Registry of every action: decision, outcome, provenance — never input/output payloads or secrets. */
exports.AgentActionLogEventSchema = zod_1.z.object({
    eventId: agent_management_js_1.AgentManagementRequestIdSchema,
    occurredAt: InstantSchema,
    identity: capability_call_context_js_1.CapabilityCallIdentitySchema,
    capability: CapabilityNameSchema,
    tool: ToolNameSchema,
    access: exports.PolicyAccessSchema,
    decision: exports.PolicyDecisionSchema,
    outcome: exports.AgentActionOutcomeSchema,
    policyVersion: agent_config_js_1.AgentConfigVersionSchema,
    provenance: exports.AgentActionProvenanceSchema,
    channel: agent_runtime_state_js_1.AgentRuntimeChannelKindSchema.optional(),
    approvalId: agent_management_js_1.AgentManagementRequestIdSchema.optional(),
}).strict().superRefine((event, ctx) => {
    const issue = (message) => ctx.addIssue({ code: 'custom', path: ['outcome'], message });
    // A deny decision can only end as denied: every other outcome requires allow or an approved ask.
    const approved = event.decision === 'ask' && event.approvalId !== undefined;
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
//# sourceMappingURL=agent-scope-policy.js.map