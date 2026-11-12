"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitNoticeSchema = exports.LimitNoticeRecipientSchema = exports.LIMIT_NOTICE_RECIPIENTS = exports.LimitNoticeEventSchema = exports.LIMIT_NOTICE_EVENTS = exports.LimitNoticeThresholdSchema = exports.LIMIT_NOTICE_THRESHOLDS = exports.LIMIT_NOTICE_UNITS = exports.LimitNoticeLimitSchema = exports.LIMIT_NOTICE_LIMITS = void 0;
exports.nextUtcMidnight = nextUtcMidnight;
exports.renderLimitNotice = renderLimitNotice;
const zod_1 = require("zod");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
/**
 * The one message that says a cap stopped (or is about to stop) an agent. Paperclip skips a wake over its daily run
 * cap without telling anyone, and the spend cap refuses a turn without a notice: this is the fixed shape and the fixed
 * sentence both are told with. Cap VALUES are never written here; whoever writes the notice supplies them.
 */
exports.LIMIT_NOTICE_LIMITS = ['daily_runs', 'daily_cost', 'company_spend'];
exports.LimitNoticeLimitSchema = zod_1.z.enum(exports.LIMIT_NOTICE_LIMITS);
/** Paperclip's units for the two daily caps; the company spend uses the unit of InternalCompanySpendResponseSchema. */
exports.LIMIT_NOTICE_UNITS = {
    daily_runs: 'runs',
    daily_cost: 'usd_cents',
    company_spend: 'usd_micros',
};
exports.LIMIT_NOTICE_THRESHOLDS = ['warning_80', 'reached'];
exports.LimitNoticeThresholdSchema = zod_1.z.enum(exports.LIMIT_NOTICE_THRESHOLDS);
exports.LIMIT_NOTICE_EVENTS = ['wake_skipped', 'turn_refused', 'warning'];
exports.LimitNoticeEventSchema = zod_1.z.enum(exports.LIMIT_NOTICE_EVENTS);
exports.LIMIT_NOTICE_RECIPIENTS = ['director', 'owner'];
exports.LimitNoticeRecipientSchema = zod_1.z.enum(exports.LIMIT_NOTICE_RECIPIENTS);
const Timestamp = zod_1.z.iso.datetime({ offset: true });
/** The next UTC midnight after `iso`, as `…T00:00:00.000Z`. Pure: the time comes only from the argument. */
function nextUtcMidnight(iso) {
    const at = new Date(iso);
    if (Number.isNaN(at.getTime()))
        throw new RangeError(`nextUtcMidnight: not a date-time: ${iso}`);
    return new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1)).toISOString();
}
const isDailyLimit = (limit) => limit === 'daily_runs' || limit === 'daily_cost';
exports.LimitNoticeSchema = zod_1.z
    .strictObject({
    limit: exports.LimitNoticeLimitSchema,
    limitValue: zod_1.z.number().int().min(1),
    observedValue: zod_1.z.number().int().min(0),
    threshold: exports.LimitNoticeThresholdSchema,
    event: exports.LimitNoticeEventSchema,
    organizationId: zod_1.z.string().min(1).max(64),
    agent: participant_binding_js_1.ParticipantAgentIdentitySchema.optional(),
    wakeupRequestId: zod_1.z.uuid().optional(),
    issueId: zod_1.z.uuid().optional(),
    observedAt: Timestamp,
    resetsAt: Timestamp.optional(),
    recipients: zod_1.z.array(exports.LimitNoticeRecipientSchema).min(1).max(2),
})
    .superRefine((n, ctx) => {
    const add = (path, message) => {
        ctx.addIssue({ code: 'custom', path: [path], message });
    };
    // (a) the threshold must agree with the numbers
    if (n.observedValue >= n.limitValue) {
        if (n.threshold !== 'reached')
            add('threshold', 'observedValue >= limitValue requires threshold reached');
    }
    else if (n.threshold === 'reached') {
        add('threshold', 'threshold reached requires observedValue >= limitValue');
    }
    else if (n.observedValue * 100 < n.limitValue * 80) {
        add('threshold', 'warning_80 requires observedValue at or above 80% of limitValue');
    }
    // (b) a warning is exactly the 80% threshold
    if ((n.event === 'warning') !== (n.threshold === 'warning_80')) {
        add('event', 'event warning if and only if threshold warning_80');
    }
    // (c) which event belongs to which cap
    if (n.event === 'wake_skipped' && !isDailyLimit(n.limit))
        add('event', 'wake_skipped belongs to a daily limit');
    if (n.event === 'turn_refused' && n.limit !== 'company_spend')
        add('event', 'turn_refused belongs to company_spend');
    // (d) the daily caps name the agent and reset at the next UTC midnight
    if (isDailyLimit(n.limit)) {
        if (n.agent === undefined)
            add('agent', 'a daily limit requires agent');
        if (n.resetsAt === undefined)
            add('resetsAt', 'a daily limit requires resetsAt');
        else if (n.resetsAt !== nextUtcMidnight(n.observedAt)) {
            add('resetsAt', 'resetsAt must be the next UTC midnight after observedAt');
        }
    }
    // (e) only a skipped wake has a wake request
    if (n.wakeupRequestId !== undefined && n.event !== 'wake_skipped') {
        add('wakeupRequestId', 'wakeupRequestId belongs to wake_skipped');
    }
    // (f) the spend cap belongs to the company, not to an agent
    if (n.limit === 'company_spend' && n.agent !== undefined)
        add('agent', 'company_spend carries no agent');
    if (new Set(n.recipients).size !== n.recipients.length)
        add('recipients', 'recipients must not repeat');
});
const LIMIT_TEXT = {
    daily_runs: 'Tetto di corse del giorno',
    daily_cost: 'Tetto di costo del giorno',
    company_spend: "Tetto di spesa dell'azienda",
};
const THRESHOLD_TEXT = {
    reached: 'raggiunto',
    warning_80: "oltre l'80%",
};
const UNIT_TEXT = {
    runs: 'corse',
    usd_cents: 'centesimi di dollaro',
    usd_micros: 'milionesimi di dollaro',
};
const EVENT_TEXT = {
    wake_skipped: 'Una sveglia è stata saltata.',
    turn_refused: 'Un turno è stato rifiutato.',
    warning: 'Nessun lavoro è stato fermato.',
};
const RESET_TEXT = 'Si azzera a mezzanotte UTC.';
/** One fixed Italian line for a notice. Pure: same notice, same string; throws if the notice is not valid. */
function renderLimitNotice(notice) {
    const n = exports.LimitNoticeSchema.parse(notice);
    const head = `${LIMIT_TEXT[n.limit]} ${THRESHOLD_TEXT[n.threshold]}${n.agent ? ` per ${n.agent.runtimeAgentId}` : ''}`;
    const numbers = `${n.observedValue} su ${n.limitValue} ${UNIT_TEXT[exports.LIMIT_NOTICE_UNITS[n.limit]]}`;
    const parts = [`${head}: ${numbers}.`, EVENT_TEXT[n.event]];
    if (isDailyLimit(n.limit))
        parts.push(RESET_TEXT);
    return parts.join(' ');
}
//# sourceMappingURL=limit-notice.js.map