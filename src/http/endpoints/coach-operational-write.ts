// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable generated declarations.
import { z } from 'zod';
import { CoachProgramApplyRequestSchema, CoachProgramApplyResultSchema } from '../../capability/coach/operational/program.js';
import { CoachOpeningRequestSchema, CoachOpeningResultSchema } from '../../capability/coach/operational/opening.js';
import { CoachConversationInputRequestSchema, CoachConversationResultSchema } from '../../capability/coach/operational/conversation.js';
import { CoachExecutionStartRequestSchema, CoachExecutionStartResultSchema, CoachExecutionEventRequestSchema, CoachExecutionEventResultSchema } from '../../capability/coach/operational/execution.js';
import { CoachGuideEndRequestSchema, CoachGuideEndResultSchema, CoachSessionCloseRequestSchema, CoachSessionCloseResultSchema } from '../../capability/coach/operational/closing.js';
import { CoachUsageObserveRequestSchema, CoachUsageObserveResultSchema } from '../../capability/coach/operational/observations.js';
import { COACH_OPERATIONAL_PREFIX as prefix, COACH_OPERATIONAL_ERROR_STATUS as errorStatus, CoachOperationalErrorSchema as errorSchema, CoachOperationalAgentParamsSchema as Agent, CoachOperationalSessionParamsSchema as Session, CoachOperationalProgramParamsSchema as Program, operationalAgentPath, operationalSessionPath } from './coach-operational-common.js';
const auth = { authType: 'secret' as const, errorSchema, errorStatus };
export const coachProgramApplyContract = { ...auth, method: 'PUT', path: `${prefix}/programs/:programId/revisions/:programVersion`, paramsSchema: Program, bodySchema: CoachProgramApplyRequestSchema, responseSchema: CoachProgramApplyResultSchema } as const;
export const coachOpeningContract = { ...auth, method: 'POST', path: `${prefix}/openings`, paramsSchema: Agent, bodySchema: CoachOpeningRequestSchema, responseSchema: CoachOpeningResultSchema } as const;
export const coachConversationInputContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/inputs`, paramsSchema: Session, bodySchema: CoachConversationInputRequestSchema, responseSchema: CoachConversationResultSchema } as const;
export const coachExecutionStartContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/start`, paramsSchema: Session, bodySchema: CoachExecutionStartRequestSchema, responseSchema: CoachExecutionStartResultSchema } as const;
export const coachExecutionEventContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/events`, paramsSchema: Session, bodySchema: CoachExecutionEventRequestSchema, responseSchema: CoachExecutionEventResultSchema } as const;
export const coachGuideEndContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/end-guide`, paramsSchema: Session, bodySchema: CoachGuideEndRequestSchema, responseSchema: CoachGuideEndResultSchema } as const;
export const coachSessionCloseContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/close`, paramsSchema: Session, bodySchema: CoachSessionCloseRequestSchema, responseSchema: CoachSessionCloseResultSchema } as const;
export const coachUsageObserveContract = { ...auth, method: 'POST', path: `${prefix}/sessions/:sessionId/usage`, paramsSchema: Session, bodySchema: CoachUsageObserveRequestSchema, responseSchema: CoachUsageObserveResultSchema } as const;
export function capCoachOperationalProgramRevisionPath(agentId: string, programId: string, programVersion: number): string {
  const p = Program.parse({ agentId, programId, programVersion: String(programVersion) });
  return operationalAgentPath(p.agentId) + '/programs/' + encodeURIComponent(p.programId) + '/revisions/' + p.programVersion;
}
export function capCoachOpeningPath(agentId: string): string { return operationalAgentPath(agentId) + '/openings'; }
export function capCoachSessionInputPath(agentId: string, sessionId: string): string { return operationalSessionPath(agentId, sessionId) + '/inputs'; }
export function capCoachExecutionStartPath(agentId: string, sessionId: string): string { return operationalSessionPath(agentId, sessionId) + '/start'; }
export function capCoachExecutionEventPath(agentId: string, sessionId: string): string { return operationalSessionPath(agentId, sessionId) + '/events'; }
export function capCoachGuideEndPath(agentId: string, sessionId: string): string { return operationalSessionPath(agentId, sessionId) + '/end-guide'; }
export function capCoachSessionClosePath(agentId: string, sessionId: string): string { return operationalSessionPath(agentId, sessionId) + '/close'; }
export function capCoachUsageObservePath(agentId: string, sessionId: string): string { return operationalSessionPath(agentId, sessionId) + '/usage'; }
