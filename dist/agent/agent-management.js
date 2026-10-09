import { AgentManagementRequestIdSchema, AgentManagementOutcomeSchema, AgentManagementOverallOutcomeSchema, AgentManagementReasonSchema, AgentConfigVersionStateSchema, deriveAgentManagementOutcome } from "./agent-model-management-values.js";
export { AgentManagementRequestIdSchema, AgentManagementOutcomeSchema, AgentManagementOverallOutcomeSchema, AgentManagementReasonCodeSchema, AgentManagementReasonSchema, AgentConfigVersionStateSchema, deriveAgentManagementOutcome } from "./agent-model-management-values.js";
import { z } from 'zod';
import { AgentModelBootstrapPreconditionSchema, AgentModelBootstrapSourceVersionSchema } from "../model-router/model-slot.js";
import { AgentModelsConfigurationWithProvenanceSchema } from "../model-router/agent-model-configuration-values.js";
import { findModelConsumerDefinition } from "../model-router/model-consumers.js";
import { sameModelFeatures } from "../model-router/capability-model-settings.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentWorkspaceAttestationSchema } from "./agent-workspace-attestation.js";
import { AgentRuntimeIdentitySchema } from "./agent-runtime-identity.js";
/**
 * Logical agent management (R1b, v1.31.0) — Forge asks X9 to act on ONE agent, never on the shared process.
 *
 * - Lifecycle actions stop/start/restart/reload a single agent's admission to turns and the channels it owns;
 *   they never stop the shared agent-core process nor touch other agents.
 * - `apply-config` makes a saved (desired) configuration version effective. If it fails, the previously applied
 *   version stays in force (`applied` does not move) and the failure is reported with its reason.
 * - Every command carries a `requestId`: the same key with the same command is a replay (no second execution,
 *   `replayed: true`); the same key with a different command is an `idempotency_conflict` (see endpoint contract).
 * - Results are per target (runtime, channel, capability) and the overall outcome is DERIVED from them: a failed
 *   target can never be hidden behind a global success.
 */
export const AgentLifecycleActionSchema = z.enum(['start', 'stop', 'restart', 'reload']);
export const AgentManagementActionSchema = z.enum([...AgentLifecycleActionSchema.options, 'apply-config']);
export const AgentManagementTargetKindSchema = z.enum(['runtime', 'channel', 'capability']);
/** `targetId`: runtime agent id, channel id (as in `AgentRuntimeChannel.channelId`) or capability name. */
export const AgentManagementTargetSchema = z.object({
    kind: AgentManagementTargetKindSchema,
    targetId: z.string().min(1).max(128),
}).strict();
const targetKey = (target) => `${target.kind}:${target.targetId}`;
/** The addressed id must be one of the two declared identities (never an unrelated agent). */
function addIdentityIssues(agentId, identity, ctx) {
    if (identity && agentId !== identity.managementAgentId && agentId !== identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'agentId must be the management or runtime id of identity' });
    }
}
function addDuplicateTargetIssues(targets, ctx, path) {
    const seen = new Set();
    for (const [index, target] of targets.entries()) {
        const key = targetKey(target);
        if (seen.has(key))
            ctx.addIssue({ code: 'custom', path: [path, index], message: `Duplicate target ${key}` });
        seen.add(key);
    }
}
/** A loaded D-A9 bundle is the applied configuration snapshot, never the desired version. */
function addWorkspaceVersionIssues(workspace, versions, ctx) {
    if (workspace != null && versions?.applied != null && workspace?.appliedVersion !== versions?.applied) {
        ctx.addIssue({ code: 'custom', path: ['workspace', 'appliedVersion'], message: 'Workspace attestation must match the applied configuration snapshot' });
    }
}
const LifecycleCommandSchema = z.object({
    action: AgentLifecycleActionSchema,
    requestId: AgentManagementRequestIdSchema,
    /** Absent: every manageable target of the agent. */
    targets: z.array(AgentManagementTargetSchema).min(1).max(32).optional(),
}).strict().superRefine((command, ctx) => {
    if (command.targets)
        addDuplicateTargetIssues(command.targets, ctx, 'targets');
});
const ApplyConfigCommandSchema = z.object({
    action: z.literal('apply-config'),
    requestId: AgentManagementRequestIdSchema,
    desiredVersion: AgentConfigVersionSchema,
    /** Initial model-only priming: loaded generation and absent persisted authority are rechecked in X9. */
    modelBootstrap: AgentModelBootstrapPreconditionSchema.optional(),
    /** Explicit scoped model authority for a private Master; lazy evaluation preserves the existing module cycle. */
    modelConfiguration: z.lazy(() => AgentModelsConfigurationWithProvenanceSchema).optional(),
    /** CAS against the current runtime generation, independent from desiredVersion. */
    modelExpectedSourceVersion: AgentModelBootstrapSourceVersionSchema.optional(),
}).strict().superRefine((command, ctx) => {
    if ((command.modelConfiguration !== undefined) !== (command.modelExpectedSourceVersion !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['modelExpectedSourceVersion'], message: 'An explicit model configuration requires its observed source generation' });
    }
    if (command.modelConfiguration?.configVersion !== undefined && command.modelConfiguration.configVersion !== command.desiredVersion) {
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'configVersion'], message: 'Model configuration version must equal desiredVersion' });
    }
    if (command.modelConfiguration !== undefined && command.modelBootstrap !== undefined && command.modelExpectedSourceVersion !== command.modelBootstrap.expectedSourceVersion) {
        ctx.addIssue({ code: 'custom', path: ['modelExpectedSourceVersion'], message: 'Explicit configuration and bootstrap require the same observed source generation' });
    }
    for (const [index, selection] of (command.modelConfiguration?.selections ?? []).entries()) {
        const consumer = findModelConsumerDefinition(selection.slotId);
        if (consumer === undefined || selection.settings.capability !== consumer.capability || selection.settings.function !== consumer.function || !sameModelFeatures(selection.settings.requirements, consumer.requirements) || (consumer.routing === 'tiered' ? !['automatic', 'pin'].includes(selection.settings.mode) : selection.settings.mode !== consumer.routing)) {
            ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'selections', index], message: 'Explicit model authority must match the registered consumer' });
        }
    }
});
export const AgentManagementCommandSchema = z.union([LifecycleCommandSchema, ApplyConfigCommandSchema]);
/** Same command (action, version, target set) — the replay test for one `requestId`. Target order is irrelevant. */
/** Deterministic JSON comparison; selection/binding sets are independent of field and slot order. */
function canonicalCommandValue(value, key = '') {
    if (Array.isArray(value)) {
        const values = value.map(entry => canonicalCommandValue(entry));
        return key === 'selections' || key === 'bindings' ? values.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))) : values;
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).sort(([left], [right]) => left.localeCompare(right)).map(([name, item]) => [name, canonicalCommandValue(item, name)]));
    }
    return value;
}
export function sameAgentCommand(a, b) {
    if (a.action !== b.action)
        return false;
    if (a.action === 'apply-config' || b.action === 'apply-config') {
        return a.action === 'apply-config' && b.action === 'apply-config' && a.desiredVersion === b.desiredVersion && a.modelBootstrap?.expectedSourceVersion === b.modelBootstrap?.expectedSourceVersion && a.modelBootstrap?.expectedAbsent === b.modelBootstrap?.expectedAbsent && a.modelExpectedSourceVersion === b.modelExpectedSourceVersion && JSON.stringify(canonicalCommandValue(a.modelConfiguration)) === JSON.stringify(canonicalCommandValue(b.modelConfiguration));
    }
    const keys = (command) => ('targets' in command && command.targets ? command.targets.map(targetKey).sort() : null);
    const left = keys(a);
    const right = keys(b);
    if (left === null || right === null)
        return left === right;
    return left.length === right.length && left.every((key, index) => key === right[index]);
}
export const AgentManagementTargetResultSchema = z.object({
    target: AgentManagementTargetSchema,
    outcome: AgentManagementOutcomeSchema,
    /** Required exactly when the outcome is not ok. */
    reason: AgentManagementReasonSchema.optional(),
}).superRefine((result, ctx) => {
    if ((result.outcome === 'ok') === (result.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required exactly when the target is not ok' });
    }
});
/** Response to a processed command (`ok: true` = processed; read `outcome` for what happened). */
export const AgentManagementCommandResultSchema = z.object({
    ok: z.literal(true),
    /** The agent id the command was addressed to. */
    agentId: z.string().min(1),
    identity: AgentRuntimeIdentitySchema.optional(),
    requestId: AgentManagementRequestIdSchema,
    action: AgentManagementActionSchema,
    /** true: an earlier identical command with this key already ran; nothing was executed again. */
    replayed: z.boolean(),
    outcome: AgentManagementOverallOutcomeSchema,
    results: z.array(AgentManagementTargetResultSchema).min(1),
    /** apply-config only: the version that was asked to become effective. */
    requestedVersion: AgentConfigVersionSchema.optional(),
    /** apply-config only: versions after the attempt. */
    versions: AgentConfigVersionStateSchema.optional(),
    /** Verified effective bundle; null requires an explicit unsuccessful runtime result. */
    workspace: AgentWorkspaceAttestationSchema.nullable().optional(),
    completedAt: z.iso.datetime({ offset: true }),
}).superRefine((result, ctx) => {
    addDuplicateTargetIssues(result.results.map((entry) => entry.target), ctx, 'results');
    addIdentityIssues(result.agentId, result.identity, ctx);
    if (result.outcome !== deriveAgentManagementOutcome(result.results)) {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Overall outcome is not supported by the per-target results' });
    }
    addWorkspaceVersionIssues(result.workspace, result.versions, ctx);
    // The existing target schema requires a reason for every non-ok runtime result.
    if (result.workspace === null && !result.results.some(entry => entry.target.kind === 'runtime' && entry.outcome !== 'ok')) {
        ctx.addIssue({ code: 'custom', path: ['workspace'], message: 'An unattested workspace requires an explicit non-ok runtime outcome' });
    }
    const isApply = result.action === 'apply-config';
    if (isApply !== (result.requestedVersion !== undefined) || isApply !== (result.versions !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['versions'], message: 'Versions are present exactly for apply-config results' });
        return;
    }
    if (isApply && result.versions && result.requestedVersion !== undefined) {
        const converged = result.versions.applied === result.requestedVersion;
        if (converged !== (result.outcome === 'ok')) {
            ctx.addIssue({ code: 'custom', path: ['versions', 'applied'], message: 'The requested version is applied exactly when every target converged' });
        }
    }
});
/** What a target supports; an empty action list is unmanageable and must say why. */
export const AgentManagementTargetCapabilitySchema = z.object({
    target: AgentManagementTargetSchema,
    actions: z.array(AgentManagementActionSchema),
    reason: AgentManagementReasonSchema.optional(),
}).superRefine((entry, ctx) => {
    if ((entry.actions.length === 0) !== (entry.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required exactly when no action is supported' });
    }
    if (new Set(entry.actions).size !== entry.actions.length) {
        ctx.addIssue({ code: 'custom', path: ['actions'], message: 'Duplicate action' });
    }
});
export const AgentManagementStateSchema = z.object({
    agentId: z.string().min(1),
    identity: AgentRuntimeIdentitySchema.optional(),
    /** null: the runtime does not (yet) track configuration versions for this agent. */
    versions: AgentConfigVersionStateSchema.nullable(),
    /** null: no effective workspace is attested; consumers must not infer a version. */
    workspace: AgentWorkspaceAttestationSchema.nullable().optional(),
    targets: z.array(AgentManagementTargetCapabilitySchema),
}).superRefine((state, ctx) => {
    addDuplicateTargetIssues(state.targets.map((entry) => entry.target), ctx, 'targets');
    addIdentityIssues(state.agentId, state.identity, ctx);
    addWorkspaceVersionIssues(state.workspace, state.versions, ctx);
});
//# sourceMappingURL=agent-management.js.map