"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachPersonSnapshotContract = exports.coachSessionRecordContract = exports.coachProgramGetContract = exports.coachProgramPutContract = exports.CoachPersonParamsSchema = exports.CoachProgramParamsSchema = void 0;
exports.capCoachProgramPath = capCoachProgramPath;
exports.capCoachSessionsPath = capCoachSessionsPath;
exports.capCoachPersonPath = capCoachPersonPath;
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const index_js_1 = require("../../capability/coach/index.cjs");
/**
 * cap-coach per-agent routes (R6, v1.31.0). Direction: Forge / project apps via X9 -> cap-coach.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 *
 * - `PUT  .../coach/programs/:programId` — save a program (project content); 200 `AgentConfigSavedSchema`,
 *   409 stale_version when the version does not move forward.
 * - `POST .../coach/sessions` — record a session, idempotent by `idempotencyKey`.
 * - `GET  .../coach/people/:userId` — one person's profile, progress, budget and recent sessions.
 *
 * Errors: `CoachRouteErrorSchema` (400 invalid_request / agent_mismatch / person_mismatch, 404 not_found /
 * program_not_found, 409 idempotency_conflict / stale_version, 429 budget_exhausted).
 */
exports.CoachProgramParamsSchema = internal_capability_agent_js_1.CapabilityAgentParamsSchema.extend({ programId: index_js_1.CoachProgramIdSchema });
exports.CoachPersonParamsSchema = internal_capability_agent_js_1.CapabilityAgentParamsSchema.extend({ userId: capability_call_context_js_1.CapabilityPersonScopeSchema.shape.userId });
exports.coachProgramPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/coach/programs/:programId',
    authType: 'secret',
    paramsSchema: exports.CoachProgramParamsSchema,
    bodySchema: index_js_1.CoachProgramSchema,
    responseSchema: internal_capability_agent_js_1.AgentConfigSavedSchema,
};
exports.coachProgramGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/coach/programs/:programId',
    authType: 'secret',
    paramsSchema: exports.CoachProgramParamsSchema,
    responseSchema: index_js_1.CoachProgramSchema,
};
exports.coachSessionRecordContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/coach/sessions',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: index_js_1.CoachSessionSchema,
    responseSchema: index_js_1.CoachSessionRecordResultSchema,
};
exports.coachPersonSnapshotContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/coach/people/:userId',
    authType: 'secret',
    paramsSchema: exports.CoachPersonParamsSchema,
    responseSchema: index_js_1.CoachPersonSnapshotSchema,
};
function capCoachProgramPath(agentId, programId) {
    const params = exports.CoachProgramParamsSchema.parse({ agentId, programId });
    return `/internal/capability/agents/${params.agentId}/coach/programs/${params.programId}`;
}
function capCoachSessionsPath(agentId) {
    return `/internal/capability/agents/${internal_capability_agent_js_1.CapabilityAgentParamsSchema.parse({ agentId }).agentId}/coach/sessions`;
}
function capCoachPersonPath(agentId, userId) {
    const params = exports.CoachPersonParamsSchema.parse({ agentId, userId });
    return `/internal/capability/agents/${params.agentId}/coach/people/${encodeURIComponent(params.userId)}`;
}
//# sourceMappingURL=internal-capability-coach.js.map