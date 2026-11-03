import { z } from 'zod';
import { CoachProgramInputEnvelopeSchema, CoachProgramProjectionSchema } from "../../capability/coach/operational/conversation.js";
import { CoachOperationalSessionReadSchema } from "../../capability/coach/operational/observations.js";
import { CoachOperationalBudgetStateSchema } from "../../capability/coach/operational/opening.js";
import { CoachRollingBudgetSchema, CoachSessionQuotaSchema } from "../../capability/coach/rolling-budget.js";
import { CoachSessionExecutionSnapshotSchema, CoachSessionPlanRevisionSchema } from "../../capability/coach/execution.js";
import { CoachPracticeObservationSchema, CoachSessionAccountingSchema } from "../../capability/coach/accounting.js";
import { CoachMeasureDefinitionSchema, CoachMeasureObservationSchema } from "../../capability/coach/measures.js";
import { ElevenLabsNativeMintRequestSchema, ElevenLabsNativeMintResultSchema, ElevenLabsNativeConversationBindingSchema, isElevenLabsNativeMintCurrent } from "../../capability/agent-elevenlabs/native-session.js";
import { RevisionNumber } from "../../capability/coach/operational/common.js";
import { RefId, Instant, DecisionCodes } from "../../capability/coach/shared.js";
import { CoachOperationalErrorSchema, COACH_OPERATIONAL_ERROR_STATUS } from "./coach-operational-common.js";
/** Structural privacy fence, not an ACL or a text redactor. Strategies must publish browser-safe projections. */
function withoutInternalFields(raw) {
    const pending = [raw];
    const forbidden = new Set(['scope', 'tenantid', 'ownerid', 'userid', 'agentid', 'agentidentity', 'opening', 'openingid', 'binding', 'bindingid',
        'attempt', 'attemptid', 'grant', 'grantid', 'proof', 'proofref', 'authority', 'apikey', 'secret', 'token', 'conversationtoken', 'signedurl', 'connection', 'provideragentid', 'providerconversationid']);
    while (pending.length) {
        const value = pending.pop();
        if (value !== null && typeof value === 'object') {
            for (const [key, child] of Object.entries(value)) {
                if (forbidden.has(key.replace(/[_-]/g, '').toLowerCase()))
                    return false;
                pending.push(child);
            }
        }
    }
    return true;
}
export const CoachBrowserProjectionSchema = CoachProgramProjectionSchema.refine(x => withoutInternalFields(x.value), 'Browser projection excludes internal identity and authority');
const BrowserInput = CoachProgramInputEnvelopeSchema.refine(x => withoutInternalFields(x.payload), 'Person input cannot carry authority or transport material');
const command = { requestId: RefId, sessionRef: RefId, expectedRevision: RevisionNumber };
/** Opaque refs select server-owned records. Clerk person/program/opening/proof are always resolved by the BFF. */
export const CoachBrowserRequestSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('person_program_read'), requestId: RefId, programRef: RefId, after: RefId.nullable(), limit: z.number().int().min(1).max(100) }).strict(),
    z.object({ action: z.literal('open'), requestId: RefId, programRef: RefId, channel: z.enum(['text', 'native']) }).strict(),
    z.object({ action: z.literal('session_read'), requestId: RefId, sessionRef: RefId }).strict(),
    z.object({ action: z.literal('revisions_read'), ...command, afterSequence: RevisionNumber, limit: z.number().int().min(1).max(100) }).strict(),
    z.object({ action: z.literal('conversation_input'), ...command, input: BrowserInput }).strict(),
    z.object({ action: z.literal('execution_start'), ...command }).strict(),
    z.object({ action: z.literal('execution_event'), ...command, event: BrowserInput }).strict(),
    z.object({ action: z.literal('guide_end'), ...command }).strict(),
    z.object({ action: z.literal('session_close'), ...command, conclusion: BrowserInput.nullable() }).strict(),
    z.object({ action: z.literal('mint'), requestId: RefId, sessionRef: RefId, transport: ElevenLabsNativeMintRequestSchema.shape.transport }).strict(),
    z.object({ action: z.literal('conversation_bind'), requestId: RefId, sessionRef: RefId, providerConversationId: ElevenLabsNativeConversationBindingSchema.shape.providerConversationId }).strict(),
    z.object({ action: z.literal('execution_attach'), requestId: RefId, sessionRef: RefId }).strict(),
]);
const Budget = CoachRollingBudgetSchema.shape, Quota = CoachSessionQuotaSchema.shape;
/** Public budget retains explicit unknown, never a fabricated zero or an internal person scope. */
export const CoachBrowserBudgetSchema = z.discriminatedUnion('status', [
    z.object({ status: z.literal('known'), asOf: Budget.asOf, remainingSeconds: Quota.remainingSeconds, limitSeconds: Quota.limitSeconds, shareLimitSeconds: Quota.shareLimitSeconds }).strict()
        .refine(x => x.limitSeconds <= Math.min(x.remainingSeconds, x.shareLimitSeconds), 'Bounded public quota'),
    CoachOperationalBudgetStateSchema.options[1],
]);
const Execution = CoachSessionExecutionSnapshotSchema.shape, Revision = CoachSessionPlanRevisionSchema.shape;
const Practice = CoachPracticeObservationSchema.shape, Accounting = CoachSessionAccountingSchema.shape, Measure = CoachMeasureObservationSchema.shape;
const BrowserExecution = z.object({ startedAt: Execution.startedAt, segments: Execution.segments, totalSeconds: Execution.totalSeconds, decisionCodes: Execution.decisionCodes }).strict();
const BrowserRevision = z.object({ sequence: Revision.sequence, appliedAt: Revision.appliedAt, effectiveFromSeconds: Revision.effectiveFromSeconds,
    segments: Revision.segments, totalSeconds: Revision.totalSeconds, decisionCodes: Revision.decisionCodes }).strict();
const BrowserPractice = z.object({ startedAt: Practice.startedAt, endedAt: Practice.endedAt, guidedSeconds: Practice.guidedSeconds, wakeSeconds: Practice.wakeSeconds }).strict()
    .refine(x => x.guidedSeconds + x.wakeSeconds <= (Date.parse(x.endedAt) - Date.parse(x.startedAt)) / 1000, 'Practice retains server-observed bounds');
const BrowserAccounting = z.object({ outcome: Accounting.outcome, progressionCredit: Accounting.progressionCredit }).strict()
    .refine(x => !x.progressionCredit || x.outcome === 'completed', 'Credit requires completion');
const BrowserMeasure = z.object({ measureId: Measure.measureId, definitionVersion: Measure.definitionVersion, unit: Measure.unit, observedAt: Measure.observedAt, value: Measure.value }).strict();
export const CoachBrowserSessionSchema = z.object({
    sessionRef: RefId, revision: RevisionNumber, lifecycle: CoachOperationalSessionReadSchema.shape.lifecycle, openedAt: Instant,
    projection: CoachBrowserProjectionSchema.nullable(), execution: BrowserExecution.nullable(), latestRevision: BrowserRevision.nullable(),
    practice: BrowserPractice.nullable(), accounting: BrowserAccounting.nullable(),
    measureDefinitions: z.array(CoachMeasureDefinitionSchema).max(500), measures: z.array(BrowserMeasure).max(500), budget: CoachBrowserBudgetSchema,
}).strict().refine(x => new Set(x.measureDefinitions.map(d => d.measureId + ':' + d.version)).size === x.measureDefinitions.length
    && x.measures.every(m => x.measureDefinitions.some(d => d.measureId === m.measureId && d.version === m.definitionVersion && d.unit === m.unit
        && (m.value.kind === 'unknown' || (m.value.value >= d.min && m.value.value <= d.max))))
    && (x.latestRevision === null || (x.execution !== null && x.latestRevision.sequence <= x.revision))
    && (x.lifecycle !== 'closed' || x.accounting !== null), 'Public measures and revisions retain pinned definitions');
const receipt = { ok: z.literal(true), requestId: RefId };
export const CoachBrowserResultSchema = z.discriminatedUnion('action', [
    z.object({ ...receipt, action: z.literal('person_program_read'), programRef: RefId, observedAt: Instant,
        personState: CoachBrowserProjectionSchema.nullable(), budget: CoachBrowserBudgetSchema,
        sessions: z.array(CoachBrowserSessionSchema).max(100), nextCursor: RefId.nullable() }).strict()
        .refine(x => new Set(x.sessions.map(s => s.sessionRef)).size === x.sessions.length, 'Unique browser session refs'),
    z.object({ ...receipt, action: z.literal('open'), programRef: RefId, channel: z.enum(['text', 'native']), session: CoachBrowserSessionSchema }).strict(),
    z.object({ ...receipt, action: z.enum(['session_read', 'conversation_input', 'execution_start', 'execution_event', 'session_close', 'conversation_bind', 'execution_attach']),
        session: CoachBrowserSessionSchema, decisionCodes: DecisionCodes }).strict(),
    z.object({ ...receipt, action: z.literal('guide_end'), session: CoachBrowserSessionSchema, done: z.boolean(), remainingSeconds: z.number().int().nonnegative() }).strict()
        .refine(x => x.done ? x.remainingSeconds === 0 && x.session.practice !== null : x.remainingSeconds > 0 && x.session.practice === null, 'Guide ends only on server-observed practice'),
    z.object({ ...receipt, action: z.literal('revisions_read'), sessionRef: RefId, asOfRevision: RevisionNumber,
        revisions: z.array(BrowserRevision).max(100), nextAfterSequence: RevisionNumber.nullable() }).strict()
        .refine(x => x.revisions.every((r, i) => r.sequence <= x.asOfRevision && (i === 0 || r.sequence > x.revisions[i - 1].sequence))
        && (x.nextAfterSequence === null || (x.revisions.length > 0 && x.nextAfterSequence === x.revisions.at(-1).sequence)), 'Ordered revisions with exact cursor'),
    z.object({ ...receipt, action: z.literal('mint'), sessionRef: RefId, issuedAt: Instant, expiresAt: Instant,
        connection: ElevenLabsNativeMintResultSchema.shape.connection }).strict()
        .refine(x => Date.parse(x.expiresAt) > Date.parse(x.issuedAt) && Date.parse(x.expiresAt) - Date.parse(x.issuedAt) <= 15 * 60000, 'Bounded ephemeral connection'),
]);
/** Correlation only, after trusted server access and source validation; refs do not prove ownership. */
export function isCoachBrowserResultForRequest(rawResult, rawRequest) {
    const result = CoachBrowserResultSchema.safeParse(rawResult), request = CoachBrowserRequestSchema.safeParse(rawRequest);
    if (!result.success || !request.success)
        return false;
    const r = request.data, s = result.data;
    if (r.action !== s.action || r.requestId !== s.requestId)
        return false;
    if (r.action === 'person_program_read' && s.action === r.action)
        return r.programRef === s.programRef && s.sessions.length <= r.limit
            && (s.nextCursor === null || (s.sessions.length === r.limit && s.nextCursor !== r.after));
    if (r.action === 'open' && s.action === r.action)
        return r.programRef === s.programRef && r.channel === s.channel;
    if (r.action === 'mint' && s.action === r.action)
        return r.sessionRef === s.sessionRef && r.transport === s.connection.transport;
    if (r.action === 'revisions_read' && s.action === r.action)
        return r.sessionRef === s.sessionRef && r.expectedRevision === s.asOfRevision
            && s.revisions.length <= r.limit && s.revisions.every(x => x.sequence > r.afterSequence)
            && (s.nextAfterSequence === null || s.revisions.length === r.limit);
    return 'sessionRef' in r && 'session' in s && r.sessionRef === s.session.sessionRef
        && (!('expectedRevision' in r) || (r.action === 'guide_end' ? s.session.revision >= r.expectedRevision : s.session.revision > r.expectedRevision));
}
export function projectCoachBrowserBudget(raw) {
    const value = CoachOperationalBudgetStateSchema.parse(raw);
    return CoachBrowserBudgetSchema.parse(value.status === 'unknown' ? value : { status: 'known', asOf: value.budget.asOf,
        remainingSeconds: value.quota.remainingSeconds, limitSeconds: value.quota.limitSeconds, shareLimitSeconds: value.quota.shareLimitSeconds });
}
/** Resolve and authorize the ref first, then validate the full canonical read before projecting. */
export function projectCoachBrowserSession(raw, trustedSessionRef) {
    const s = CoachOperationalSessionReadSchema.parse(raw), sessionRef = RefId.parse(trustedSessionRef);
    return CoachBrowserSessionSchema.parse({ sessionRef, revision: s.revision, lifecycle: s.lifecycle, openedAt: s.opening.openedAt,
        projection: s.projection, execution: s.initialSnapshot === null ? null : { startedAt: s.initialSnapshot.startedAt,
            segments: s.initialSnapshot.segments, totalSeconds: s.initialSnapshot.totalSeconds, decisionCodes: s.initialSnapshot.decisionCodes },
        latestRevision: s.latestRevision === null ? null : { sequence: s.latestRevision.sequence, appliedAt: s.latestRevision.appliedAt,
            effectiveFromSeconds: s.latestRevision.effectiveFromSeconds, segments: s.latestRevision.segments,
            totalSeconds: s.latestRevision.totalSeconds, decisionCodes: s.latestRevision.decisionCodes },
        practice: s.practice === null ? null : { startedAt: s.practice.startedAt, endedAt: s.practice.endedAt, guidedSeconds: s.practice.guidedSeconds, wakeSeconds: s.practice.wakeSeconds },
        accounting: s.accounting === null ? null : { outcome: s.accounting.outcome, progressionCredit: s.accounting.progressionCredit },
        measureDefinitions: s.measureDefinitions, measures: s.measures.map(m => ({ measureId: m.measureId, definitionVersion: m.definitionVersion,
            unit: m.unit, observedAt: m.observedAt, value: m.value })), budget: projectCoachBrowserBudget(s.budget) });
}
/** Validate the full Native reply against the server's original mint and current binding before disclosure. Never log/store/cache. */
export function projectCoachBrowserMint(rawRequest, rawResult, trustedNativeRequest, trustedBinding, trustedSessionRef, now) {
    const browser = CoachBrowserRequestSchema.safeParse(rawRequest), native = ElevenLabsNativeMintRequestSchema.safeParse(trustedNativeRequest);
    const ref = RefId.safeParse(trustedSessionRef);
    if (!browser.success || browser.data.action !== 'mint' || !native.success || !ref.success || browser.data.sessionRef !== ref.data || browser.data.requestId !== native.data.requestId
        || browser.data.transport !== native.data.transport || !isElevenLabsNativeMintCurrent(native.data, rawResult, trustedBinding, now))
        return null;
    const s = ElevenLabsNativeMintResultSchema.parse(rawResult);
    return CoachBrowserResultSchema.parse({ ok: true, action: 'mint', requestId: browser.data.requestId, sessionRef: browser.data.sessionRef,
        issuedAt: s.issuedAt, expiresAt: s.expiresAt, connection: s.connection });
}
/** BFF resolves authenticated Clerk person and current program/session authority, and rechecks after awaits. */
export const coachBrowserContract = {
    method: 'POST', path: '/api/coach', authType: 'forge_session', cacheControl: 'no-store',
    bodySchema: CoachBrowserRequestSchema, responseSchema: CoachBrowserResultSchema,
    errorSchema: CoachOperationalErrorSchema, errorStatus: COACH_OPERATIONAL_ERROR_STATUS,
};
//# sourceMappingURL=coach-browser.js.map