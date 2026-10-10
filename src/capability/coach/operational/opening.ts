import { z } from 'zod';
import { CapabilityPersonScopeSchema, sameCapabilityScope } from '../../capability-call-context.js';
import { AgentConfigVersionSchema } from '../../ricerca/agent-config.js';
import { CoachRollingBudgetSchema, CoachSessionQuotaSchema, coachRollingRemainingSeconds } from '../rolling-budget.js';
import { CoachProgramVersionRefSchema } from '../program-version.js';
import { CoachSessionOpeningRefSchema } from '../execution.js';
import { RefId, Instant, agentScope } from '../shared.js';
import { RevisionNumber } from './common.js';
export const CoachOperationalBudgetStateSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('known'), budget: CoachRollingBudgetSchema, quota: CoachSessionQuotaSchema }).strict()
    .refine(x => sameCapabilityScope(x.budget.scope, x.quota.scope) && Date.parse(x.budget.asOf) === Date.parse(x.quota.budgetAsOf) && coachRollingRemainingSeconds(x.budget) === x.quota.remainingSeconds, 'Budget and quota are one scoped observation'),
  z.object({ status: z.literal('unknown'), reason: z.enum(['usage_pending', 'source_unavailable', 'authority_unavailable']) }).strict(),
]);
export type CoachOperationalBudgetState = z.infer<typeof CoachOperationalBudgetStateSchema>;
export const CoachReservationSchema = z.object({
  reservationId: RefId, openingId: RefId, scope: CapabilityPersonScopeSchema, version: AgentConfigVersionSchema,
  status: z.enum(['held', 'consumed', 'released', 'uncertain']), limitSeconds: z.number().int().nonnegative(),
  createdAt: Instant, updatedAt: Instant, expiresAt: Instant.nullable(),
}).strict().refine(x => (x.status !== 'held' || x.limitSeconds > 0) && Date.parse(x.updatedAt) >= Date.parse(x.createdAt)
  && (x.expiresAt === null || Date.parse(x.expiresAt) > Date.parse(x.createdAt)), 'Ordered nonempty reservation');
export type CoachReservation = z.infer<typeof CoachReservationSchema>;
export const CoachOpeningRequestSchema = z.object({
  requestId: RefId, scope: CapabilityPersonScopeSchema, program: CoachProgramVersionRefSchema, appliedConfigVersion: AgentConfigVersionSchema,
}).strict().refine(x => sameCapabilityScope(agentScope(x.scope), x.program.scope), 'Program belongs to opening agent');
export type CoachOpeningRequest = z.infer<typeof CoachOpeningRequestSchema>;
export const CoachOpeningResultSchema = z.object({
  ok: z.literal(true), replayed: z.boolean(), opening: CoachSessionOpeningRefSchema, revision: RevisionNumber,
  budget: CoachOperationalBudgetStateSchema, reservation: CoachReservationSchema,
}).strict().refine(x => x.budget.status === 'known' && x.reservation.status === 'held'
  && sameCapabilityScope(x.opening.scope, x.budget.budget.scope) && sameCapabilityScope(x.opening.scope, x.reservation.scope)
  && x.opening.openingId === x.reservation.openingId && x.reservation.limitSeconds <= x.budget.quota.limitSeconds, 'Admission needs known scoped reserved quota');
export type CoachOpeningResult = z.infer<typeof CoachOpeningResultSchema>;
