"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDeletionResultSchema = exports.AgentDeletionPieceSchema = exports.AgentDeletionFailureCodeSchema = exports.AGENT_DELETION_STEPS = exports.AgentDeletionStepSchema = exports.AgentDeletionCommandSchema = void 0;
exports.isAgentDeletionResultCurrent = isAgentDeletionResultCurrent;
const zod_1 = require("zod");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const internal_agents_reload_js_1 = require("../http/endpoints/internal-agents-reload.cjs");
const deletionId = internal_agents_reload_js_1.ReloadAgentParamsSchema.shape.agentId.max(128);
const deletionIdentity = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict().superRefine((identity, ctx) => {
    for (const key of ['managementAgentId', 'runtimeAgentId']) {
        if (!deletionId.safeParse(identity[key]).success) {
            ctx.addIssue({ code: 'custom', path: [key], message: 'Invalid deletion identity' });
        }
    }
});
/** The name is exact, never trimmed. Forge compares it to its authoritative saved name. */
exports.AgentDeletionCommandSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    identity: deletionIdentity,
    confirmedName: zod_1.z.string().min(1).max(200).refine(name => name.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(name)),
}).strict();
/**
 * Every report includes exactly these runtime scopes; none denotes a shared process or owner resource.
 * context/workspace detach in-memory references only. Factory retains all filesystem/data writers.
 * Channel cleanup closes runtime handlers; Factory owns provider resource deletion.
 */
exports.AgentDeletionStepSchema = zod_1.z.enum([
    'tombstone', 'admission', 'channels', 'runtime', 'caches', 'context', 'workspace', 'private-state',
]);
exports.AGENT_DELETION_STEPS = exports.AgentDeletionStepSchema.options;
/** Machine codes only: no provider messages, file paths, tokens or free text diagnostics. */
exports.AgentDeletionFailureCodeSchema = zod_1.z.enum([
    'timeout', 'source-unavailable', 'scope-unavailable', 'shared-resource', 'drain-failed',
    'channel-close-failed', 'storage-failed', 'cleanup-failed',
]);
exports.AgentDeletionPieceSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.object({ step: exports.AgentDeletionStepSchema, outcome: zod_1.z.literal('completed') }).strict(),
    zod_1.z.object({ step: exports.AgentDeletionStepSchema, outcome: zod_1.z.literal('absent') }).strict(),
    zod_1.z.object({ step: exports.AgentDeletionStepSchema, outcome: zod_1.z.literal('failed'), reason: exports.AgentDeletionFailureCodeSchema }).strict(),
    zod_1.z.object({ step: exports.AgentDeletionStepSchema, outcome: zod_1.z.literal('blocked'), reason: zod_1.z.literal('dependency-failed') }).strict(),
]).superRefine((piece, ctx) => {
    if (piece.step === 'tombstone' && piece.outcome !== 'completed' && piece.outcome !== 'failed') {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Tombstone must be persisted or explicitly failed' });
    }
});
const isFinished = (piece) => piece?.outcome === 'completed' || piece?.outcome === 'absent';
/**
 * Durable single-agent removal, separate from lifecycle stop and Forge archival.
 *
 * Producers persist the tombstone before effects, share the lifecycle/apply mutex, drain admission,
 * and retain per-piece progress across crashes. The tombstone prevents resurrection by load/start/
 * reload/apply after process restart. It is NEVER deleted by private-state cleanup.
 * Same requestId and exact command resumes unfinished pieces only; different intention conflicts.
 * 200 partial is an honest processed report, not an HTTP-level success for all resources.
 */
exports.AgentDeletionResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    agentId: deletionId,
    identity: deletionIdentity,
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    replayed: zod_1.z.boolean(),
    outcome: zod_1.z.enum(['complete', 'partial']),
    tombstoned: zod_1.z.boolean(),
    results: zod_1.z.array(exports.AgentDeletionPieceSchema).length(8),
    completedAt: zod_1.z.string().datetime(),
}).strict().superRefine((result, ctx) => {
    if (result.agentId !== result.identity.managementAgentId) {
        ctx.addIssue({ code: 'custom', path: ['agentId'], message: 'Deletion addresses the management identity only' });
    }
    const pieces = new Map();
    for (const [index, piece] of result.results.entries()) {
        if (pieces.has(piece.step))
            ctx.addIssue({ code: 'custom', path: ['results', index], message: 'Duplicate deletion piece' });
        pieces.set(piece.step, piece);
    }
    for (const step of exports.AGENT_DELETION_STEPS) {
        if (!pieces.has(step))
            ctx.addIssue({ code: 'custom', path: ['results'], message: 'Missing deletion piece' });
    }
    const complete = result.results.every(isFinished);
    if ((result.outcome === 'complete') !== complete) {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Overall deletion outcome must match every piece' });
    }
    const tombstone = pieces.get('tombstone');
    if (result.tombstoned !== (tombstone?.outcome === 'completed')) {
        ctx.addIssue({ code: 'custom', path: ['tombstoned'], message: 'Durability flag must match the tombstone piece' });
    }
    const blockedWithoutFailure = result.results.some(piece => piece.outcome === 'blocked') && !result.results.some(piece => piece.outcome === 'failed');
    if (blockedWithoutFailure)
        ctx.addIssue({ code: 'custom', path: ['results'], message: 'Blocked pieces require a failed dependency' });
    for (const piece of result.results) {
        if (piece.step === 'tombstone')
            continue;
        const tombstoneFailed = tombstone?.outcome !== 'completed';
        const admissionFailed = piece.step !== 'admission' && !isFinished(pieces.get('admission'));
        const runtimeOrChannelFailed = ['caches', 'context', 'workspace', 'private-state'].includes(piece.step) &&
            (!isFinished(pieces.get('runtime')) || !isFinished(pieces.get('channels')));
        if ((tombstoneFailed || admissionFailed || runtimeOrChannelFailed) && piece.outcome !== 'blocked') {
            ctx.addIssue({ code: 'custom', path: ['results'], message: 'Effects require completed isolation dependencies' });
        }
    }
});
/** Consumers must correlate a validated report before advancing their durable deletion job. */
function isAgentDeletionResultCurrent(agentId, command, result) {
    const addressed = deletionId.safeParse(agentId);
    const request = exports.AgentDeletionCommandSchema.safeParse(command);
    const response = exports.AgentDeletionResultSchema.safeParse(result);
    if (!addressed.success || !request.success || !response.success)
        return false;
    const expected = request.data.identity;
    const actual = response.data.identity;
    return addressed.data === expected.managementAgentId && response.data.agentId === addressed.data &&
        response.data.requestId === request.data.requestId &&
        actual.runtimeAgentId === expected.runtimeAgentId && actual.vaultAgentId === expected.vaultAgentId;
}
//# sourceMappingURL=agent-deletion.js.map