"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityOrdinaryLifecycleTransactionSchema = exports.CapabilityOrdinaryLifecycleReceiptSchema = exports.CapabilityOrdinaryLifecycleRequestSchema = exports.CapabilityOrdinaryOperationSchema = exports.CapabilityOrdinaryExecutionSchema = exports.CapabilityOrdinaryMembershipSchema = exports.CapabilityOrdinaryBundleReferenceSchema = void 0;
exports.parseCapabilityOrdinaryLifecycle = parseCapabilityOrdinaryLifecycle;
exports.parseCapabilityOrdinaryLifecycleReceipt = parseCapabilityOrdinaryLifecycleReceipt;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("./capability-call-context.cjs");
const parameters_js_1 = require("./parameters.cjs");
const ordinary_configuration_js_1 = require("./ordinary-configuration.cjs");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const agent_workspace_attestation_js_1 = require("../agent/agent-workspace-attestation.cjs");
const agent_model_management_values_js_1 = require("../agent/agent-model-management-values.cjs");
exports.CapabilityOrdinaryBundleReferenceSchema = agent_workspace_attestation_js_1.AgentWorkspaceAttestationSchema.pick({ appliedVersion: true, sha256: true });
exports.CapabilityOrdinaryMembershipSchema = zod_1.z.enum(['enabled', 'disabled', 'removed']);
/** Operational admission is separate from loaded configuration and membership. */
exports.CapabilityOrdinaryExecutionSchema = zod_1.z.enum(['running', 'stopped']);
exports.CapabilityOrdinaryOperationSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({ action: zod_1.z.literal('apply-config'), execution: exports.CapabilityOrdinaryExecutionSchema }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('reload'), execution: exports.CapabilityOrdinaryExecutionSchema }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('start'), execution: zod_1.z.literal('running') }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('stop'), execution: zod_1.z.literal('stopped') }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('restart'), execution: zod_1.z.literal('running') }).strict(),
]);
exports.CapabilityOrdinaryLifecycleRequestSchema = zod_1.z.object({
    format: zod_1.z.literal('ordinary-lifecycle-v1'),
    requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    phase: zod_1.z.enum(['prepare', 'suspend', 'activate', 'rollback']),
    transition: zod_1.z.object({ from: exports.CapabilityOrdinaryBundleReferenceSchema.nullable(), to: exports.CapabilityOrdinaryBundleReferenceSchema }).strict(),
    targetMembership: exports.CapabilityOrdinaryMembershipSchema,
    operation: exports.CapabilityOrdinaryOperationSchema.optional(),
    configuration: ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema.optional(),
}).strict().superRefine((request, ctx) => {
    if (request.scope.agentId !== request.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Scope must use the runtime identity' });
    if (request.configuration && (!(0, capability_call_context_js_1.sameCapabilityScope)(request.scope, request.configuration.scope) || request.capability !== request.configuration.capability))
        ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Lifecycle configuration target mismatch' });
    if (request.targetMembership !== 'enabled' && request.configuration)
        ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Inactive membership cannot carry an active candidate configuration' });
});
exports.CapabilityOrdinaryLifecycleReceiptSchema = zod_1.z.object({
    request: exports.CapabilityOrdinaryLifecycleRequestSchema,
    operationId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    fence: zod_1.z.number().int().positive(),
    status: zod_1.z.enum(['pending', 'complete']),
    outcome: zod_1.z.enum(['ok', 'error', 'in-progress']),
    replayed: zod_1.z.boolean(),
    ordinaryState: ordinary_configuration_js_1.CapabilityOrdinaryConfigStateSchema,
    membershipEffective: zod_1.z.enum(['enabled', 'disabled', 'removed', 'unknown']),
    executionEffective: zod_1.z.enum(['running', 'stopped', 'unknown']).optional(),
    observedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
}).strict().superRefine((receipt, ctx) => {
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(receipt.request.scope, receipt.ordinaryState.scope) || receipt.request.capability !== receipt.ordinaryState.capability)
        ctx.addIssue({ code: 'custom', path: ['ordinaryState'], message: 'Receipt target mismatch' });
    if (receipt.status === 'pending' && receipt.outcome !== 'in-progress')
        ctx.addIssue({ code: 'custom', message: 'Pending effects are ambiguous' });
    if (receipt.status === 'complete' && receipt.outcome === 'in-progress')
        ctx.addIssue({ code: 'custom', message: 'In-progress cannot be complete' });
    if (receipt.membershipEffective !== 'unknown' && receipt.observedAt === null)
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'Membership evidence requires consumer observation' });
    if (receipt.request.phase === 'prepare' || receipt.request.phase === 'suspend') {
        if (receipt.membershipEffective !== 'unknown' || receipt.observedAt !== null)
            ctx.addIssue({ code: 'custom', message: 'Preparation and suspension do not attest new effective membership' });
    }
    if (receipt.request.phase === 'activate' && receipt.outcome === 'ok' && receipt.status === 'complete' && (receipt.membershipEffective !== receipt.request.targetMembership || receipt.observedAt === null))
        ctx.addIssue({ code: 'custom', message: 'Activation needs confirmed target membership' });
    if (receipt.request.operation) {
        const expected = receipt.request.targetMembership === 'enabled' ? receipt.request.operation.execution : 'stopped';
        if (receipt.request.phase === 'prepare' || receipt.request.phase === 'suspend') {
            if (receipt.executionEffective !== 'unknown')
                ctx.addIssue({ code: 'custom', message: 'Preparation cannot attest execution' });
        }
        else if (receipt.status === 'complete' && receipt.outcome === 'ok' && receipt.request.phase === 'activate'
            && (receipt.executionEffective !== expected || receipt.observedAt === null)) {
            ctx.addIssue({ code: 'custom', message: 'Activation needs actual target execution evidence' });
        }
    }
    if (receipt.membershipEffective === 'disabled' || receipt.membershipEffective === 'removed') {
        if (receipt.ordinaryState.runtimeState !== 'unloaded' || receipt.ordinaryState.applied !== null || receipt.ordinaryState.effectiveParameters.length !== 0)
            ctx.addIssue({ code: 'custom', message: 'Inactive consumer cannot attest loaded parameters' });
    }
});
exports.CapabilityOrdinaryLifecycleTransactionSchema = zod_1.z.object({
    request: exports.CapabilityOrdinaryLifecycleRequestSchema,
    state: zod_1.z.enum(['prepared', 'suspended', 'activated', 'rolled_back', 'pending', 'ambiguous']),
    operationId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    fence: zod_1.z.number().int().positive(),
    receipts: zod_1.z.array(exports.CapabilityOrdinaryLifecycleReceiptSchema).max(4),
    previousState: ordinary_configuration_js_1.CapabilityOrdinaryConfigStateSchema,
    previousMembership: zod_1.z.enum(['enabled', 'disabled', 'removed', 'unknown']),
    previousExecution: zod_1.z.enum(['running', 'stopped', 'unknown']).optional(),
}).strict();
/** Validation is pure. The producer owns durable slot/receipt/fence storage and consumer reconciliation. */
function parseCapabilityOrdinaryLifecycle(request, authority) {
    const parsed = exports.CapabilityOrdinaryLifecycleRequestSchema.parse(request);
    capability_call_context_js_1.CapabilityAgentScopeSchema.parse(authority.scope);
    agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.parse(authority.identity);
    exports.CapabilityOrdinaryBundleReferenceSchema.parse(authority.bundle);
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(parsed.scope, authority.scope) || !(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.identity, authority.identity) || parsed.capability !== authority.capability || parsed.requestId !== authority.requestId)
        throw new Error('Lifecycle authority scope or identity mismatch');
    if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.transition.to, authority.bundle) || parsed.targetMembership !== authority.membership || !(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.configuration ?? null, authority.configuration))
        throw new Error('Lifecycle candidate mismatch');
    const operation = authority.operation === undefined ? undefined : exports.CapabilityOrdinaryOperationSchema.parse(authority.operation);
    if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.operation ?? null, operation ?? null))
        throw new Error('Lifecycle operational authority mismatch');
    if (operation && ['start', 'stop', 'restart'].includes(operation.action)) {
        if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.transition.from, parsed.transition.to))
            throw new Error('Runtime command cannot change the loaded bundle');
    }
    else if (!(operation?.action === 'reload' && (0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.transition.from, parsed.transition.to))
        && parsed.transition.from && parsed.transition.to.appliedVersion <= parsed.transition.from.appliedVersion) {
        throw new Error('Lifecycle candidate must advance bundle');
    }
    const transaction = authority.transaction ? exports.CapabilityOrdinaryLifecycleTransactionSchema.parse(authority.transaction) : null;
    if (transaction) {
        const { phase: _phase, ...retained } = transaction.request;
        const { phase: _requestedPhase, ...incoming } = parsed;
        if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(retained, incoming) || !(0, capability_call_context_js_1.sameCapabilityScope)(transaction.previousState.scope, parsed.scope) || transaction.previousState.capability !== parsed.capability)
            throw new Error('Lifecycle transaction lost or changed');
        const phases = new Set();
        for (const receipt of transaction.receipts) {
            const { phase, ...receiptBinding } = receipt.request;
            if (phases.has(phase) || !(0, ordinary_configuration_js_1.sameOrdinaryData)(receiptBinding, retained) || receipt.operationId !== transaction.operationId || receipt.fence !== transaction.fence)
                throw new Error('Lifecycle receipt fence or binding mismatch');
            phases.add(phase);
        }
        if (transaction.state === 'pending' || transaction.state === 'ambiguous' || transaction.receipts.some(receipt => receipt.status === 'pending'))
            throw new Error('Lifecycle in-progress: reconcile consumer before retry');
        const replay = transaction.receipts.find(receipt => receipt.request.phase === parsed.phase);
        if (replay)
            return { request: parsed, replay: { ...replay, replayed: true } };
    }
    if (parsed.phase === 'prepare') {
        if (transaction)
            throw new Error('Lifecycle slot is already retained');
        if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(authority.current, parsed.transition.from))
            throw new Error('Lifecycle from bundle changed');
    }
    else {
        if (!transaction)
            throw new Error('Lifecycle transaction required');
        const allowed = parsed.phase === 'suspend' ? ['prepared'] : parsed.phase === 'activate' ? ['suspended'] : ['prepared', 'suspended', 'activated'];
        if (!allowed.includes(transaction.state))
            throw new Error('Lifecycle phase order conflict');
        const expected = transaction.state === 'activated' ? parsed.transition.to : parsed.transition.from;
        if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(authority.current, expected))
            throw new Error('Lifecycle effective bundle changed');
    }
    return { request: parsed, replay: null };
}
/** Validate server-produced evidence. This does not execute effects or manufacture consumer timestamps. */
function parseCapabilityOrdinaryLifecycleReceipt(receipt, request, transaction) {
    const parsed = exports.CapabilityOrdinaryLifecycleReceiptSchema.parse(receipt);
    if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.request, request) || parsed.operationId !== transaction.operationId || parsed.fence !== transaction.fence)
        throw new Error('Lifecycle response binding or fence mismatch');
    if (parsed.outcome !== 'ok' || parsed.status !== 'complete')
        return parsed;
    if (request.phase === 'prepare' || request.phase === 'suspend') {
        if (!(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.ordinaryState, transaction.previousState))
            throw new Error('Preparation cannot attest candidate configuration');
    }
    if (request.phase === 'activate' && request.targetMembership === 'enabled' && request.configuration) {
        if (parsed.ordinaryState.runtimeState !== 'loaded')
            throw new Error('Enabled consumer not confirmed loaded');
        const expected = request.configuration.parameters.filter(entry => entry.parameter.appliesWhen === 'next_apply');
        const effective = parsed.ordinaryState.effectiveParameters.filter(entry => entry.mode === 'next_apply');
        if (expected.length !== effective.length || expected.some(entry => entry.origin.kind === 'needs_choice' || !effective.some(value => value.key === entry.parameter.key && value.sourceConfigVersion === request.configuration?.version && (0, ordinary_configuration_js_1.sameOrdinaryData)(value.value, entry.value))))
            throw new Error('Candidate next_apply not confirmed by consumer');
    }
    if (request.phase === 'rollback') {
        if (request.operation && (parsed.executionEffective !== (transaction.previousExecution ?? 'unknown') || parsed.observedAt === null))
            throw new Error('Rollback execution not confirmed');
        if (parsed.membershipEffective !== transaction.previousMembership || parsed.observedAt === null)
            throw new Error('Rollback membership not confirmed');
        if (request.transition.from === null && (parsed.ordinaryState.runtimeState !== 'unloaded' || parsed.ordinaryState.applied !== null || parsed.ordinaryState.effectiveParameters.length > 0))
            throw new Error('First activation rollback must restore absence');
        if (request.transition.from !== null && !(0, ordinary_configuration_js_1.sameOrdinaryData)(parsed.ordinaryState.applied, transaction.previousState.applied))
            throw new Error('Rollback previous applied configuration not confirmed');
    }
    return parsed;
}
//# sourceMappingURL=ordinary-lifecycle.js.map