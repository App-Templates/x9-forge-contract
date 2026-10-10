"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachUsageObserveContract = exports.coachSessionCloseContract = exports.coachGuideEndContract = exports.coachExecutionEventContract = exports.coachExecutionStartContract = exports.coachConversationInputContract = exports.coachOpeningContract = exports.coachProgramApplyContract = void 0;
exports.capCoachOperationalProgramRevisionPath = capCoachOperationalProgramRevisionPath;
exports.capCoachOpeningPath = capCoachOpeningPath;
exports.capCoachSessionInputPath = capCoachSessionInputPath;
exports.capCoachExecutionStartPath = capCoachExecutionStartPath;
exports.capCoachExecutionEventPath = capCoachExecutionEventPath;
exports.capCoachGuideEndPath = capCoachGuideEndPath;
exports.capCoachSessionClosePath = capCoachSessionClosePath;
exports.capCoachUsageObservePath = capCoachUsageObservePath;
const program_js_1 = require("../../capability/coach/operational/program.cjs");
const opening_js_1 = require("../../capability/coach/operational/opening.cjs");
const conversation_js_1 = require("../../capability/coach/operational/conversation.cjs");
const execution_js_1 = require("../../capability/coach/operational/execution.cjs");
const closing_js_1 = require("../../capability/coach/operational/closing.cjs");
const observations_js_1 = require("../../capability/coach/operational/observations.cjs");
const coach_operational_common_js_1 = require("./coach-operational-common.cjs");
const auth = { authType: 'secret', errorSchema: coach_operational_common_js_1.CoachOperationalErrorSchema, errorStatus: coach_operational_common_js_1.COACH_OPERATIONAL_ERROR_STATUS };
exports.coachProgramApplyContract = { ...auth, method: 'PUT', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/programs/:programId/revisions/:programVersion`, paramsSchema: coach_operational_common_js_1.CoachOperationalProgramParamsSchema, bodySchema: program_js_1.CoachProgramApplyRequestSchema, responseSchema: program_js_1.CoachProgramApplyResultSchema };
exports.coachOpeningContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/openings`, paramsSchema: coach_operational_common_js_1.CoachOperationalAgentParamsSchema, bodySchema: opening_js_1.CoachOpeningRequestSchema, responseSchema: opening_js_1.CoachOpeningResultSchema };
exports.coachConversationInputContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/:sessionId/inputs`, paramsSchema: coach_operational_common_js_1.CoachOperationalSessionParamsSchema, bodySchema: conversation_js_1.CoachConversationInputRequestSchema, responseSchema: conversation_js_1.CoachConversationResultSchema };
exports.coachExecutionStartContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/:sessionId/start`, paramsSchema: coach_operational_common_js_1.CoachOperationalSessionParamsSchema, bodySchema: execution_js_1.CoachExecutionStartRequestSchema, responseSchema: execution_js_1.CoachExecutionStartResultSchema };
exports.coachExecutionEventContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/:sessionId/events`, paramsSchema: coach_operational_common_js_1.CoachOperationalSessionParamsSchema, bodySchema: execution_js_1.CoachExecutionEventRequestSchema, responseSchema: execution_js_1.CoachExecutionEventResultSchema };
exports.coachGuideEndContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/:sessionId/end-guide`, paramsSchema: coach_operational_common_js_1.CoachOperationalSessionParamsSchema, bodySchema: closing_js_1.CoachGuideEndRequestSchema, responseSchema: closing_js_1.CoachGuideEndResultSchema };
exports.coachSessionCloseContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/:sessionId/close`, paramsSchema: coach_operational_common_js_1.CoachOperationalSessionParamsSchema, bodySchema: closing_js_1.CoachSessionCloseRequestSchema, responseSchema: closing_js_1.CoachSessionCloseResultSchema };
exports.coachUsageObserveContract = { ...auth, method: 'POST', path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/:sessionId/usage`, paramsSchema: coach_operational_common_js_1.CoachOperationalSessionParamsSchema, bodySchema: observations_js_1.CoachUsageObserveRequestSchema, responseSchema: observations_js_1.CoachUsageObserveResultSchema };
function capCoachOperationalProgramRevisionPath(agentId, programId, programVersion) {
    const p = coach_operational_common_js_1.CoachOperationalProgramParamsSchema.parse({ agentId, programId, programVersion: String(programVersion) });
    return (0, coach_operational_common_js_1.operationalAgentPath)(p.agentId) + '/programs/' + encodeURIComponent(p.programId) + '/revisions/' + p.programVersion;
}
function capCoachOpeningPath(agentId) { return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/openings'; }
function capCoachSessionInputPath(agentId, sessionId) { return (0, coach_operational_common_js_1.operationalSessionPath)(agentId, sessionId) + '/inputs'; }
function capCoachExecutionStartPath(agentId, sessionId) { return (0, coach_operational_common_js_1.operationalSessionPath)(agentId, sessionId) + '/start'; }
function capCoachExecutionEventPath(agentId, sessionId) { return (0, coach_operational_common_js_1.operationalSessionPath)(agentId, sessionId) + '/events'; }
function capCoachGuideEndPath(agentId, sessionId) { return (0, coach_operational_common_js_1.operationalSessionPath)(agentId, sessionId) + '/end-guide'; }
function capCoachSessionClosePath(agentId, sessionId) { return (0, coach_operational_common_js_1.operationalSessionPath)(agentId, sessionId) + '/close'; }
function capCoachUsageObservePath(agentId, sessionId) { return (0, coach_operational_common_js_1.operationalSessionPath)(agentId, sessionId) + '/usage'; }
//# sourceMappingURL=coach-operational-write.js.map