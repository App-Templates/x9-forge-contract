"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachSessionPlanRevisionSchema = exports.CoachSessionExecutionSnapshotSchema = exports.CoachExecutionSegmentSchema = exports.CoachSessionOpeningRefSchema = void 0;
exports.isCoachExecutionSnapshotForOpening = isCoachExecutionSnapshotForOpening;
exports.isCoachSessionPlanRevisionForSnapshot = isCoachSessionPlanRevisionForSnapshot;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const index_js_1 = require("./index.cjs");
const program_version_js_1 = require("./program-version.cjs");
const shared_js_1 = require("./shared.cjs");
exports.CoachSessionOpeningRefSchema = zod_1.z.object({
    openingId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, sessionId: shared_js_1.SessionId,
    program: program_version_js_1.CoachProgramVersionRefSchema, appliedConfigVersion: agent_config_js_1.AgentConfigVersionSchema, openedAt: shared_js_1.Instant,
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.scope), x.program.scope), 'Program belongs to opening agent');
exports.CoachExecutionSegmentSchema = zod_1.z.object({
    segmentId: index_js_1.CoachStepIdSchema, stepId: index_js_1.CoachStepIdSchema.optional(), offsetSeconds: shared_js_1.Seconds,
    durationSeconds: shared_js_1.Seconds.positive(),
}).strict();
const timeline = { segments: zod_1.z.array(exports.CoachExecutionSegmentSchema).min(1).max(500), totalSeconds: shared_js_1.Seconds.positive(), decisionCodes: shared_js_1.DecisionCodes };
function validTimeline(x) {
    let end = 0;
    const ids = new Set();
    return x.segments.every(segment => {
        const valid = !ids.has(segment.segmentId) && segment.offsetSeconds >= end && segment.offsetSeconds + segment.durationSeconds <= x.totalSeconds;
        ids.add(segment.segmentId);
        end = segment.offsetSeconds + segment.durationSeconds;
        return valid;
    });
}
exports.CoachSessionExecutionSnapshotSchema = zod_1.z.object({
    snapshotId: shared_js_1.RefId, opening: exports.CoachSessionOpeningRefSchema, ...timeline, startedAt: shared_js_1.Instant,
}).strict().refine(validTimeline, 'Ordered nonoverlapping bounded timeline')
    .refine(x => Date.parse(x.startedAt) >= Date.parse(x.opening.openedAt), 'Start follows opening');
exports.CoachSessionPlanRevisionSchema = zod_1.z.object({
    revisionId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, sessionId: shared_js_1.SessionId, snapshotId: shared_js_1.RefId,
    sequence: zod_1.z.number().int().positive(), appliedAt: shared_js_1.Instant, effectiveFromSeconds: shared_js_1.Seconds, ...timeline,
}).strict().refine(validTimeline, 'Ordered nonoverlapping bounded timeline');
function isCoachExecutionSnapshotForOpening(raw, expected) {
    const snapshot = exports.CoachSessionExecutionSnapshotSchema.safeParse(raw), opening = exports.CoachSessionOpeningRefSchema.safeParse(expected);
    return snapshot.success && opening.success && (0, shared_js_1.sameValue)(snapshot.data.opening, opening.data);
}
function isCoachSessionPlanRevisionForSnapshot(raw, expected) {
    const revision = exports.CoachSessionPlanRevisionSchema.safeParse(raw), snapshot = exports.CoachSessionExecutionSnapshotSchema.safeParse(expected);
    if (!revision.success || !snapshot.success)
        return false;
    const r = revision.data, s = snapshot.data;
    return (0, capability_call_context_js_1.sameCapabilityScope)(r.scope, s.opening.scope) && r.sessionId === s.opening.sessionId && r.snapshotId === s.snapshotId
        && Date.parse(r.appliedAt) >= Date.parse(s.startedAt) && r.effectiveFromSeconds <= s.totalSeconds;
}
//# sourceMappingURL=execution.js.map