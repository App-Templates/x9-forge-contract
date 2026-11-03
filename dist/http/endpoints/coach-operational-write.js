import { CoachProgramApplyRequestSchema, CoachProgramApplyResultSchema } from "../../capability/coach/operational/program.js";
import { CoachOpeningRequestSchema, CoachOpeningResultSchema } from "../../capability/coach/operational/opening.js";
import { CoachConversationInputRequestSchema, CoachConversationResultSchema } from "../../capability/coach/operational/conversation.js";
import { CoachExecutionStartRequestSchema, CoachExecutionStartResultSchema, CoachExecutionEventRequestSchema, CoachExecutionEventResultSchema } from "../../capability/coach/operational/execution.js";
import { CoachGuideEndRequestSchema, CoachGuideEndResultSchema, CoachSessionCloseRequestSchema, CoachSessionCloseResultSchema } from "../../capability/coach/operational/closing.js";
import { CoachUsageObserveRequestSchema, CoachUsageObserveResultSchema } from "../../capability/coach/operational/observations.js";
import { COACH_OPERATIONAL_PREFIX as prefix, COACH_OPERATIONAL_ERROR_STATUS as errorStatus, CoachOperationalErrorSchema as errorSchema, CoachOperationalAgentParamsSchema as Agent, CoachOperationalSessionParamsSchema as Session, CoachOperationalProgramParamsSchema as Program, operationalAgentPath, operationalSessionPath } from "./coach-operational-common.js";
const auth = { authType: 'secret', errorSchema, errorStatus };
export const coachProgramApplyContract = { ...auth, method: 'PUT', path: `${prefix}/programs/:programId/revisions/:programVersion`, paramsSchema: Program, bodySchema: CoachProgramApplyRequestSchema, responseSchema: CoachProgramApplyResultSchema };
export const coachOpeningContract = { ...auth, method: 'POST', path: `${prefix}/openings`, paramsSchema: Agent, bodySchema: CoachOpeningRequestSchema, responseSchema: CoachOpeningResultSchema };
export const coachConversationInputContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/inputs`, paramsSchema: Session, bodySchema: CoachConversationInputRequestSchema, responseSchema: CoachConversationResultSchema };
export const coachExecutionStartContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/start`, paramsSchema: Session, bodySchema: CoachExecutionStartRequestSchema, responseSchema: CoachExecutionStartResultSchema };
export const coachExecutionEventContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/events`, paramsSchema: Session, bodySchema: CoachExecutionEventRequestSchema, responseSchema: CoachExecutionEventResultSchema };
export const coachGuideEndContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/end-guide`, paramsSchema: Session, bodySchema: CoachGuideEndRequestSchema, responseSchema: CoachGuideEndResultSchema };
export const coachSessionCloseContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/close`, paramsSchema: Session, bodySchema: CoachSessionCloseRequestSchema, responseSchema: CoachSessionCloseResultSchema };
export const coachUsageObserveContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/usage`, paramsSchema: Session, bodySchema: CoachUsageObserveRequestSchema, responseSchema: CoachUsageObserveResultSchema };
export function capCoachOperationalProgramRevisionPath(agentId, programId, programVersion) {
    const p = Program.parse({ agentId, programId, programVersion: String(programVersion) });
    return operationalAgentPath(p.agentId) + '/programs/' + encodeURIComponent(p.programId) + '/revisions/' + p.programVersion;
}
export function capCoachOpeningPath(agentId) { return operationalAgentPath(agentId) + '/openings'; }
export function capCoachSessionInputPath(agentId, sessionId) { return operationalSessionPath(agentId, sessionId) + '/inputs'; }
export function capCoachExecutionStartPath(agentId, sessionId) { return operationalSessionPath(agentId, sessionId) + '/start'; }
export function capCoachExecutionEventPath(agentId, sessionId) { return operationalSessionPath(agentId, sessionId) + '/events'; }
export function capCoachGuideEndPath(agentId, sessionId) { return operationalSessionPath(agentId, sessionId) + '/end-guide'; }
export function capCoachSessionClosePath(agentId, sessionId) { return operationalSessionPath(agentId, sessionId) + '/close'; }
export function capCoachUsageObservePath(agentId, sessionId) { return operationalSessionPath(agentId, sessionId) + '/usage'; }
//# sourceMappingURL=coach-operational-write.js.map