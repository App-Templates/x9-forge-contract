"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachBrowserContract = exports.CoachBrowserResultSchema = exports.CoachBrowserSessionSchema = exports.CoachBrowserBudgetSchema = exports.CoachBrowserRequestSchema = exports.CoachBrowserProjectionSchema = void 0;
exports.isCoachBrowserResultForRequest = isCoachBrowserResultForRequest;
exports.projectCoachBrowserBudget = projectCoachBrowserBudget;
exports.projectCoachBrowserSession = projectCoachBrowserSession;
exports.projectCoachBrowserMint = projectCoachBrowserMint;
const zod_1 = require("zod");
const conversation_js_1 = require("../../capability/coach/operational/conversation.cjs");
const observations_js_1 = require("../../capability/coach/operational/observations.cjs");
const opening_js_1 = require("../../capability/coach/operational/opening.cjs");
const rolling_budget_js_1 = require("../../capability/coach/rolling-budget.cjs");
const execution_js_1 = require("../../capability/coach/execution.cjs");
const accounting_js_1 = require("../../capability/coach/accounting.cjs");
const measures_js_1 = require("../../capability/coach/measures.cjs");
const native_session_js_1 = require("../../capability/agent-elevenlabs/native-session.cjs");
const common_js_1 = require("../../capability/coach/operational/common.cjs");
const shared_js_1 = require("../../capability/coach/shared.cjs");
const coach_operational_common_js_1 = require("./coach-operational-common.cjs");
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
exports.CoachBrowserProjectionSchema = conversation_js_1.CoachProgramProjectionSchema.refine(x => withoutInternalFields(x.value), 'Browser projection excludes internal identity and authority');
const BrowserInput = conversation_js_1.CoachProgramInputEnvelopeSchema.refine(x => withoutInternalFields(x.payload), 'Person input cannot carry authority or transport material');
const command = { requestId: shared_js_1.RefId, sessionRef: shared_js_1.RefId, expectedRevision: common_js_1.RevisionNumber };
/** Opaque refs select server-owned records. Clerk person/program/opening/proof are always resolved by the BFF. */
exports.CoachBrowserRequestSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({ action: zod_1.z.literal('person_program_read'), requestId: shared_js_1.RefId, programRef: shared_js_1.RefId, after: shared_js_1.RefId.nullable(), limit: zod_1.z.number().int().min(1).max(100) }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('open'), requestId: shared_js_1.RefId, programRef: shared_js_1.RefId, channel: zod_1.z.enum(['text', 'native']) }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('session_read'), requestId: shared_js_1.RefId, sessionRef: shared_js_1.RefId }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('revisions_read'), ...command, afterSequence: common_js_1.RevisionNumber, limit: zod_1.z.number().int().min(1).max(100) }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('conversation_input'), ...command, input: BrowserInput }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('execution_start'), ...command }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('execution_event'), ...command, event: BrowserInput }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('guide_end'), ...command }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('session_close'), ...command, conclusion: BrowserInput.nullable() }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('mint'), requestId: shared_js_1.RefId, sessionRef: shared_js_1.RefId, transport: native_session_js_1.ElevenLabsNativeMintRequestSchema.shape.transport }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('conversation_bind'), requestId: shared_js_1.RefId, sessionRef: shared_js_1.RefId, providerConversationId: native_session_js_1.ElevenLabsNativeConversationBindingSchema.shape.providerConversationId }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('execution_attach'), requestId: shared_js_1.RefId, sessionRef: shared_js_1.RefId }).strict(),
]);
const Budget = rolling_budget_js_1.CoachRollingBudgetSchema.shape, Quota = rolling_budget_js_1.CoachSessionQuotaSchema.shape;
/** Public budget retains explicit unknown, never a fabricated zero or an internal person scope. */
exports.CoachBrowserBudgetSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ status: zod_1.z.literal('known'), asOf: Budget.asOf, remainingSeconds: Quota.remainingSeconds, limitSeconds: Quota.limitSeconds, shareLimitSeconds: Quota.shareLimitSeconds }).strict()
        .refine(x => x.limitSeconds <= Math.min(x.remainingSeconds, x.shareLimitSeconds), 'Bounded public quota'),
    opening_js_1.CoachOperationalBudgetStateSchema.options[1],
]);
const Execution = execution_js_1.CoachSessionExecutionSnapshotSchema.shape, Revision = execution_js_1.CoachSessionPlanRevisionSchema.shape;
const Practice = accounting_js_1.CoachPracticeObservationSchema.shape, Accounting = accounting_js_1.CoachSessionAccountingSchema.shape, Measure = measures_js_1.CoachMeasureObservationSchema.shape;
const BrowserExecution = zod_1.z.object({ startedAt: Execution.startedAt, segments: Execution.segments, totalSeconds: Execution.totalSeconds, decisionCodes: Execution.decisionCodes }).strict();
const BrowserRevision = zod_1.z.object({ sequence: Revision.sequence, appliedAt: Revision.appliedAt, effectiveFromSeconds: Revision.effectiveFromSeconds,
    segments: Revision.segments, totalSeconds: Revision.totalSeconds, decisionCodes: Revision.decisionCodes }).strict();
const BrowserPractice = zod_1.z.object({ startedAt: Practice.startedAt, endedAt: Practice.endedAt, guidedSeconds: Practice.guidedSeconds, wakeSeconds: Practice.wakeSeconds }).strict()
    .refine(x => x.guidedSeconds + x.wakeSeconds <= (Date.parse(x.endedAt) - Date.parse(x.startedAt)) / 1000, 'Practice retains server-observed bounds');
const BrowserAccounting = zod_1.z.object({ outcome: Accounting.outcome, progressionCredit: Accounting.progressionCredit }).strict()
    .refine(x => !x.progressionCredit || x.outcome === 'completed', 'Credit requires completion');
const BrowserMeasure = zod_1.z.object({ measureId: Measure.measureId, definitionVersion: Measure.definitionVersion, unit: Measure.unit, observedAt: Measure.observedAt, value: Measure.value }).strict();
exports.CoachBrowserSessionSchema = zod_1.z.object({
    sessionRef: shared_js_1.RefId, revision: common_js_1.RevisionNumber, lifecycle: observations_js_1.CoachOperationalSessionReadSchema.shape.lifecycle, openedAt: shared_js_1.Instant,
    projection: exports.CoachBrowserProjectionSchema.nullable(), execution: BrowserExecution.nullable(), latestRevision: BrowserRevision.nullable(),
    practice: BrowserPractice.nullable(), accounting: BrowserAccounting.nullable(),
    measureDefinitions: zod_1.z.array(measures_js_1.CoachMeasureDefinitionSchema).max(500), measures: zod_1.z.array(BrowserMeasure).max(500), budget: exports.CoachBrowserBudgetSchema,
}).strict().refine(x => new Set(x.measureDefinitions.map(d => d.measureId + ':' + d.version)).size === x.measureDefinitions.length
    && x.measures.every(m => x.measureDefinitions.some(d => d.measureId === m.measureId && d.version === m.definitionVersion && d.unit === m.unit
        && (m.value.kind === 'unknown' || (m.value.value >= d.min && m.value.value <= d.max))))
    && (x.latestRevision === null || (x.execution !== null && x.latestRevision.sequence <= x.revision))
    && (x.lifecycle !== 'closed' || x.accounting !== null), 'Public measures and revisions retain pinned definitions');
const receipt = { ok: zod_1.z.literal(true), requestId: shared_js_1.RefId };
exports.CoachBrowserResultSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({ ...receipt, action: zod_1.z.literal('person_program_read'), programRef: shared_js_1.RefId, observedAt: shared_js_1.Instant,
        personState: exports.CoachBrowserProjectionSchema.nullable(), budget: exports.CoachBrowserBudgetSchema,
        sessions: zod_1.z.array(exports.CoachBrowserSessionSchema).max(100), nextCursor: shared_js_1.RefId.nullable() }).strict()
        .refine(x => new Set(x.sessions.map(s => s.sessionRef)).size === x.sessions.length, 'Unique browser session refs'),
    zod_1.z.object({ ...receipt, action: zod_1.z.literal('open'), programRef: shared_js_1.RefId, channel: zod_1.z.enum(['text', 'native']), session: exports.CoachBrowserSessionSchema }).strict(),
    zod_1.z.object({ ...receipt, action: zod_1.z.enum(['session_read', 'conversation_input', 'execution_start', 'execution_event', 'session_close', 'conversation_bind', 'execution_attach']),
        session: exports.CoachBrowserSessionSchema, decisionCodes: shared_js_1.DecisionCodes }).strict(),
    zod_1.z.object({ ...receipt, action: zod_1.z.literal('guide_end'), session: exports.CoachBrowserSessionSchema, done: zod_1.z.boolean(), remainingSeconds: zod_1.z.number().int().nonnegative() }).strict()
        .refine(x => x.done ? x.remainingSeconds === 0 && x.session.practice !== null : x.remainingSeconds > 0 && x.session.practice === null, 'Guide ends only on server-observed practice'),
    zod_1.z.object({ ...receipt, action: zod_1.z.literal('revisions_read'), sessionRef: shared_js_1.RefId, asOfRevision: common_js_1.RevisionNumber,
        revisions: zod_1.z.array(BrowserRevision).max(100), nextAfterSequence: common_js_1.RevisionNumber.nullable() }).strict()
        .refine(x => x.revisions.every((r, i) => r.sequence <= x.asOfRevision && (i === 0 || r.sequence > x.revisions[i - 1].sequence))
        && (x.nextAfterSequence === null || (x.revisions.length > 0 && x.nextAfterSequence === x.revisions.at(-1).sequence)), 'Ordered revisions with exact cursor'),
    zod_1.z.object({ ...receipt, action: zod_1.z.literal('mint'), sessionRef: shared_js_1.RefId, issuedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
        connection: native_session_js_1.ElevenLabsNativeMintResultSchema.shape.connection }).strict()
        .refine(x => Date.parse(x.expiresAt) > Date.parse(x.issuedAt) && Date.parse(x.expiresAt) - Date.parse(x.issuedAt) <= 15 * 60000, 'Bounded ephemeral connection'),
]);
/** Correlation only, after trusted server access and source validation; refs do not prove ownership. */
function isCoachBrowserResultForRequest(rawResult, rawRequest) {
    const result = exports.CoachBrowserResultSchema.safeParse(rawResult), request = exports.CoachBrowserRequestSchema.safeParse(rawRequest);
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
function projectCoachBrowserBudget(raw) {
    const value = opening_js_1.CoachOperationalBudgetStateSchema.parse(raw);
    return exports.CoachBrowserBudgetSchema.parse(value.status === 'unknown' ? value : { status: 'known', asOf: value.budget.asOf,
        remainingSeconds: value.quota.remainingSeconds, limitSeconds: value.quota.limitSeconds, shareLimitSeconds: value.quota.shareLimitSeconds });
}
/** Resolve and authorize the ref first, then validate the full canonical read before projecting. */
function projectCoachBrowserSession(raw, trustedSessionRef) {
    const s = observations_js_1.CoachOperationalSessionReadSchema.parse(raw), sessionRef = shared_js_1.RefId.parse(trustedSessionRef);
    return exports.CoachBrowserSessionSchema.parse({ sessionRef, revision: s.revision, lifecycle: s.lifecycle, openedAt: s.opening.openedAt,
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
function projectCoachBrowserMint(rawRequest, rawResult, trustedNativeRequest, trustedBinding, trustedSessionRef, now) {
    const browser = exports.CoachBrowserRequestSchema.safeParse(rawRequest), native = native_session_js_1.ElevenLabsNativeMintRequestSchema.safeParse(trustedNativeRequest);
    const ref = shared_js_1.RefId.safeParse(trustedSessionRef);
    if (!browser.success || browser.data.action !== 'mint' || !native.success || !ref.success || browser.data.sessionRef !== ref.data || browser.data.requestId !== native.data.requestId
        || browser.data.transport !== native.data.transport || !(0, native_session_js_1.isElevenLabsNativeMintCurrent)(native.data, rawResult, trustedBinding, now))
        return null;
    const s = native_session_js_1.ElevenLabsNativeMintResultSchema.parse(rawResult);
    return exports.CoachBrowserResultSchema.parse({ ok: true, action: 'mint', requestId: browser.data.requestId, sessionRef: browser.data.sessionRef,
        issuedAt: s.issuedAt, expiresAt: s.expiresAt, connection: s.connection });
}
/** BFF resolves authenticated Clerk person and current program/session authority, and rechecks after awaits. */
exports.coachBrowserContract = {
    method: 'POST', path: '/api/coach', authType: 'forge_session', cacheControl: 'no-store',
    bodySchema: exports.CoachBrowserRequestSchema, responseSchema: exports.CoachBrowserResultSchema,
    errorSchema: coach_operational_common_js_1.CoachOperationalErrorSchema, errorStatus: coach_operational_common_js_1.COACH_OPERATIONAL_ERROR_STATUS,
};
//# sourceMappingURL=coach-browser.js.map