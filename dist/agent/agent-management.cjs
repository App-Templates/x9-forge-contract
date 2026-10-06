"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManagementStateSchema = exports.AgentManagementTargetCapabilitySchema = exports.AgentManagementCommandResultSchema = exports.AgentManagementTargetResultSchema = exports.AgentManagementCommandSchema = exports.AgentConfigVersionStateSchema = exports.AgentManagementReasonSchema = exports.AgentManagementReasonCodeSchema = exports.AgentManagementOverallOutcomeSchema = exports.AgentManagementOutcomeSchema = exports.AgentManagementTargetSchema = exports.AgentManagementTargetKindSchema = exports.AgentManagementRequestIdSchema = exports.AgentManagementActionSchema = exports.AgentLifecycleActionSchema = void 0;
exports.sameAgentCommand = sameAgentCommand;
exports.deriveAgentManagementOutcome = deriveAgentManagementOutcome;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
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
exports.AgentLifecycleActionSchema = zod_1.z.enum(['start', 'stop', 'restart', 'reload']);
exports.AgentManagementActionSchema = zod_1.z.enum([...exports.AgentLifecycleActionSchema.options, 'apply-config']);
/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
exports.AgentManagementRequestIdSchema = zod_1.z.string().min(8).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
exports.AgentManagementTargetKindSchema = zod_1.z.enum(['runtime', 'channel', 'capability']);
/** `targetId`: runtime agent id, channel id (as in `AgentRuntimeChannel.channelId`) or capability name. */
exports.AgentManagementTargetSchema = zod_1.z.object({
    kind: exports.AgentManagementTargetKindSchema,
    targetId: zod_1.z.string().min(1).max(128),
}).strict();
exports.AgentManagementOutcomeSchema = zod_1.z.enum(['ok', 'error', 'unmanageable']);
exports.AgentManagementOverallOutcomeSchema = zod_1.z.enum(['ok', 'partial', 'error', 'unmanageable']);
exports.AgentManagementReasonCodeSchema = zod_1.z.enum([
    'not-loaded',
    'load-failed',
    'validation-failed',
    'timeout',
    'source-unavailable',
    /** The action would affect the runtime shared with other agents. */
    'shared-runtime',
    /** The channel is owned by an external provider/capability and is not driven by this command. */
    'externally-owned',
    'not-supported',
    'in-progress',
    'unknown',
]);
/** `detail` is sanitized operator text: never secrets, tokens or personal data. */
exports.AgentManagementReasonSchema = zod_1.z.object({
    code: exports.AgentManagementReasonCodeSchema,
    detail: zod_1.z.string().min(1).max(500).optional(),
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
/** Desired (saved) vs applied (effective) configuration version of one agent. */
exports.AgentConfigVersionStateSchema = zod_1.z.object({
    desired: agent_config_js_1.AgentConfigVersionSchema,
    /** null: no configuration version was ever applied. */
    applied: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    /** Last failed apply, newer than the applied version; null when none is pending. */
    failed: zod_1.z.object({ version: agent_config_js_1.AgentConfigVersionSchema, reason: exports.AgentManagementReasonSchema }).strict().nullable(),
}).superRefine((versions, ctx) => {
    if (versions.applied !== null && versions.applied > versions.desired) {
        ctx.addIssue({ code: 'custom', path: ['applied'], message: 'Applied version cannot be ahead of the desired one' });
    }
    if (versions.failed !== null) {
        if (versions.failed.version <= (versions.applied ?? 0)) {
            ctx.addIssue({ code: 'custom', path: ['failed', 'version'], message: 'A failed version must be newer than the applied one' });
        }
        if (versions.failed.version > versions.desired) {
            ctx.addIssue({ code: 'custom', path: ['failed', 'version'], message: 'A failed version cannot be ahead of the desired one' });
        }
    }
});
const LifecycleCommandSchema = zod_1.z.object({
    action: exports.AgentLifecycleActionSchema,
    requestId: exports.AgentManagementRequestIdSchema,
    /** Absent: every manageable target of the agent. */
    targets: zod_1.z.array(exports.AgentManagementTargetSchema).min(1).max(32).optional(),
}).strict().superRefine((command, ctx) => {
    if (command.targets)
        addDuplicateTargetIssues(command.targets, ctx, 'targets');
});
const ApplyConfigCommandSchema = zod_1.z.object({
    action: zod_1.z.literal('apply-config'),
    requestId: exports.AgentManagementRequestIdSchema,
    desiredVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
exports.AgentManagementCommandSchema = zod_1.z.union([LifecycleCommandSchema, ApplyConfigCommandSchema]);
/** Same command (action, version, target set) — the replay test for one `requestId`. Target order is irrelevant. */
function sameAgentCommand(a, b) {
    if (a.action !== b.action)
        return false;
    if (a.action === 'apply-config' || b.action === 'apply-config') {
        return a.action === 'apply-config' && b.action === 'apply-config' && a.desiredVersion === b.desiredVersion;
    }
    const keys = (command) => ('targets' in command && command.targets ? command.targets.map(targetKey).sort() : null);
    const left = keys(a);
    const right = keys(b);
    if (left === null || right === null)
        return left === right;
    return left.length === right.length && left.every((key, index) => key === right[index]);
}
exports.AgentManagementTargetResultSchema = zod_1.z.object({
    target: exports.AgentManagementTargetSchema,
    outcome: exports.AgentManagementOutcomeSchema,
    /** Required exactly when the outcome is not ok. */
    reason: exports.AgentManagementReasonSchema.optional(),
}).superRefine((result, ctx) => {
    if ((result.outcome === 'ok') === (result.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required exactly when the target is not ok' });
    }
});
/** ok: all ok · unmanageable: none manageable · error: none ok · partial: some ok, some not. */
function deriveAgentManagementOutcome(results) {
    const okCount = results.filter((result) => result.outcome === 'ok').length;
    if (results.length > 0 && okCount === results.length)
        return 'ok';
    if (results.length > 0 && results.every((result) => result.outcome === 'unmanageable'))
        return 'unmanageable';
    if (okCount === 0)
        return 'error';
    return 'partial';
}
/** Response to a processed command (`ok: true` = processed; read `outcome` for what happened). */
exports.AgentManagementCommandResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    /** The agent id the command was addressed to. */
    agentId: zod_1.z.string().min(1),
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional(),
    requestId: exports.AgentManagementRequestIdSchema,
    action: exports.AgentManagementActionSchema,
    /** true: an earlier identical command with this key already ran; nothing was executed again. */
    replayed: zod_1.z.boolean(),
    outcome: exports.AgentManagementOverallOutcomeSchema,
    results: zod_1.z.array(exports.AgentManagementTargetResultSchema).min(1),
    /** apply-config only: the version that was asked to become effective. */
    requestedVersion: agent_config_js_1.AgentConfigVersionSchema.optional(),
    /** apply-config only: versions after the attempt. */
    versions: exports.AgentConfigVersionStateSchema.optional(),
    completedAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((result, ctx) => {
    addDuplicateTargetIssues(result.results.map((entry) => entry.target), ctx, 'results');
    addIdentityIssues(result.agentId, result.identity, ctx);
    if (result.outcome !== deriveAgentManagementOutcome(result.results)) {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Overall outcome is not supported by the per-target results' });
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
exports.AgentManagementTargetCapabilitySchema = zod_1.z.object({
    target: exports.AgentManagementTargetSchema,
    actions: zod_1.z.array(exports.AgentManagementActionSchema),
    reason: exports.AgentManagementReasonSchema.optional(),
}).superRefine((entry, ctx) => {
    if ((entry.actions.length === 0) !== (entry.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required exactly when no action is supported' });
    }
    if (new Set(entry.actions).size !== entry.actions.length) {
        ctx.addIssue({ code: 'custom', path: ['actions'], message: 'Duplicate action' });
    }
});
exports.AgentManagementStateSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional(),
    /** null: the runtime does not (yet) track configuration versions for this agent. */
    versions: exports.AgentConfigVersionStateSchema.nullable(),
    targets: zod_1.z.array(exports.AgentManagementTargetCapabilitySchema),
}).superRefine((state, ctx) => {
    addDuplicateTargetIssues(state.targets.map((entry) => entry.target), ctx, 'targets');
    addIdentityIssues(state.agentId, state.identity, ctx);
});
//# sourceMappingURL=agent-management.js.map