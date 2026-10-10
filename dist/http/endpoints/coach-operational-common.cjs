"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachOperationalErrorSchema = exports.COACH_OPERATIONAL_ERROR_STATUS = exports.CoachOperationalProgramParamsSchema = exports.CoachOperationalSessionParamsSchema = exports.CoachOperationalAgentParamsSchema = exports.COACH_OPERATIONAL_AUTH_HEADER = exports.COACH_OPERATIONAL_PREFIX = void 0;
exports.isCoachOpeningForSessionRoute = isCoachOpeningForSessionRoute;
exports.isCoachProgramForRevisionRoute = isCoachProgramForRevisionRoute;
exports.operationalAgentPath = operationalAgentPath;
exports.operationalSessionPath = operationalSessionPath;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const index_js_1 = require("../../capability/coach/index.cjs");
const program_version_js_1 = require("../../capability/coach/program-version.cjs");
const execution_js_1 = require("../../capability/coach/execution.cjs");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const index_js_2 = require("../../auth/index.cjs");
exports.COACH_OPERATIONAL_PREFIX = '/internal/capability/agents/:agentId/coach/v2';
exports.COACH_OPERATIONAL_AUTH_HEADER = index_js_2.INTERNAL_SECRET_HEADER;
exports.CoachOperationalAgentParamsSchema = internal_capability_agent_js_1.CapabilityAgentParamsSchema.strict();
exports.CoachOperationalSessionParamsSchema = exports.CoachOperationalAgentParamsSchema.extend({ sessionId: index_js_1.CoachSessionSchema.shape.sessionId }).strict();
exports.CoachOperationalProgramParamsSchema = exports.CoachOperationalAgentParamsSchema.extend({
    programId: index_js_1.CoachProgramIdSchema, programVersion: zod_1.z.string().regex(/^[1-9][0-9]*$/).transform(Number).pipe(agent_config_js_1.AgentConfigVersionSchema),
}).strict();
exports.COACH_OPERATIONAL_ERROR_STATUS = {
    invalid_request: 400, unauthorized: 401, scope_mismatch: 403, not_found: 404, program_not_found: 404,
    strategy_unavailable: 422, stale_revision: 409, stale_program_version: 409, idempotency_conflict: 409,
    budget_exhausted: 429, budget_unavailable: 503, authority_unavailable: 503, source_unavailable: 503,
};
exports.CoachOperationalErrorSchema = zod_1.z.object({
    ok: zod_1.z.literal(false), error: zod_1.z.enum(Object.keys(exports.COACH_OPERATIONAL_ERROR_STATUS)),
    currentRevision: zod_1.z.number().int().nonnegative().optional(), currentProgramVersion: agent_config_js_1.AgentConfigVersionSchema.optional(),
}).strict().refine(x => (x.error === 'stale_revision') === (x.currentRevision !== undefined)
    && (x.error === 'stale_program_version') === (x.currentProgramVersion !== undefined), 'Only stale errors carry current versions');
function isCoachOpeningForSessionRoute(raw, rawParams) {
    const opening = execution_js_1.CoachSessionOpeningRefSchema.safeParse(raw), params = exports.CoachOperationalSessionParamsSchema.safeParse(rawParams);
    return opening.success && params.success && opening.data.scope.agentId === params.data.agentId && opening.data.sessionId === params.data.sessionId;
}
function isCoachProgramForRevisionRoute(raw, rawParams) {
    const program = program_version_js_1.CoachProgramVersionRefSchema.safeParse(raw), params = exports.CoachOperationalProgramParamsSchema.safeParse(rawParams);
    return program.success && params.success && program.data.scope.agentId === params.data.agentId && program.data.programId === params.data.programId && program.data.programVersion === params.data.programVersion;
}
function operationalAgentPath(agentId) {
    return '/internal/capability/agents/' + encodeURIComponent(exports.CoachOperationalAgentParamsSchema.parse({ agentId }).agentId) + '/coach/v2';
}
function operationalSessionPath(agentId, sessionId) {
    const params = exports.CoachOperationalSessionParamsSchema.parse({ agentId, sessionId });
    return operationalAgentPath(params.agentId) + '/sessions/' + encodeURIComponent(params.sessionId);
}
//# sourceMappingURL=coach-operational-common.js.map