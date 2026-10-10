import { z } from 'zod';
import { CapabilityPersonScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
import { CoachStrategyRefSchema } from './program-version.js';
import { RefId, SessionId, Text128, Instant } from './shared.js';
const reference = { scope: CapabilityPersonScopeSchema, sessionId: SessionId, openingId: RefId, snapshotId: RefId.nullable() };
const duration = z.number().finite().nonnegative();
export const CoachProviderUsageSchema = z.object({
  usageId: RefId, ...reference, providerConversationId: Text128, callStartedAt: Instant, callEndedAt: Instant,
  billableSeconds: duration.nullable(), durationSeconds: duration.nullable(),
  source: z.enum(['provider-report', 'transcript-lower-bound', 'estimate', 'pending', 'unavailable']),
  sourceRef: Text128.nullable(), confidence: z.number().min(0).max(1).nullable(), observedAt: Instant,
}).strict().superRefine((x, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  if (Date.parse(x.callEndedAt) < Date.parse(x.callStartedAt) || Date.parse(x.observedAt) < Date.parse(x.callEndedAt)) fail('Ordered usage timestamps');
  if (x.source !== 'provider-report' && x.billableSeconds !== null) fail('Only provider report can declare billing');
  if (x.source === 'pending' || x.source === 'unavailable') {
    if (x.durationSeconds !== null || x.confidence !== null) fail('Unknown usage has no numeric duration or confidence');
  } else if (x.durationSeconds === null || x.sourceRef === null) fail('Observed usage needs duration and source');
});
export type CoachProviderUsage = z.infer<typeof CoachProviderUsageSchema>;
export const CoachPracticeObservationSchema = z.object({
  observationId: RefId, ...reference, snapshotId: RefId, startedAt: Instant, endedAt: Instant,
  guidedSeconds: duration, wakeSeconds: duration,
}).strict().refine(x => x.guidedSeconds + x.wakeSeconds <= (Date.parse(x.endedAt) - Date.parse(x.startedAt)) / 1000, 'Practice is bounded by server elapsed time');
export type CoachPracticeObservation = z.infer<typeof CoachPracticeObservationSchema>;
export const CoachSessionAccountingSchema = z.object({
  ...reference, usage: CoachProviderUsageSchema.nullable(), practice: CoachPracticeObservationSchema.nullable(),
  outcome: z.enum(['completed', 'interrupted', 'abandoned']), progressionCredit: z.boolean(), strategy: CoachStrategyRefSchema,
}).strict().superRefine((x, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  if (x.progressionCredit && (x.outcome !== 'completed' || x.snapshotId === null || x.practice === null)) fail('Credit needs completed guided practice');
  if (x.snapshotId === null && (x.practice !== null || x.progressionCredit)) fail('Pre-guide accounting has no practice or credit');
  for (const child of [x.usage, x.practice]) if (child && (!sameCapabilityScope(child.scope, x.scope) || child.sessionId !== x.sessionId || child.openingId !== x.openingId || child.snapshotId !== x.snapshotId)) fail('Accounting evidence belongs to the same opening and snapshot');
});
export type CoachSessionAccounting = z.infer<typeof CoachSessionAccountingSchema>;
