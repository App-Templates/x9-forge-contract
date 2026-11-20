import { z } from 'zod';
import { CompanySpendSourceSchema } from "../../http/endpoints/internal-company-spend.js";
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
/**
 * The one message that says a cap stopped (or is about to stop) an agent. Paperclip skips a wake over its daily run
 * cap without telling anyone, and the spend cap refuses a turn without a notice: this is the fixed shape and the fixed
 * sentence both are told with. Cap VALUES are never written here; whoever writes the notice supplies them.
 */
export const LIMIT_NOTICE_LIMITS = ['daily_runs', 'daily_cost', 'company_spend', 'business_unit_spend'];
export const LimitNoticeLimitSchema = z.enum(LIMIT_NOTICE_LIMITS);
/** Paperclip's units for the two daily caps; spend uses the unit of InternalCompanySpendResponseSchema. */
export const LIMIT_NOTICE_UNITS = {
    daily_runs: 'runs',
    daily_cost: 'usd_cents',
    company_spend: 'usd_micros',
    business_unit_spend: 'usd_micros',
};
export const LIMIT_NOTICE_THRESHOLDS = ['warning_80', 'reached'];
export const LimitNoticeThresholdSchema = z.enum(LIMIT_NOTICE_THRESHOLDS);
export const LIMIT_NOTICE_EVENTS = ['wake_skipped', 'turn_refused', 'warning'];
export const LimitNoticeEventSchema = z.enum(LIMIT_NOTICE_EVENTS);
export const LIMIT_NOTICE_RECIPIENTS = ['director', 'owner'];
export const LimitNoticeRecipientSchema = z.enum(LIMIT_NOTICE_RECIPIENTS);
const Timestamp = z.iso.datetime({ offset: true });
/** The next UTC midnight after `iso`, as `…T00:00:00.000Z`. Pure: the time comes only from the argument. */
export function nextUtcMidnight(iso) {
    const at = new Date(iso);
    if (Number.isNaN(at.getTime()))
        throw new RangeError(`nextUtcMidnight: not a date-time: ${iso}`);
    return new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1)).toISOString();
}
const isDailyLimit = (limit) => limit === 'daily_runs' || limit === 'daily_cost';
const isSpendLimit = (limit) => limit === 'company_spend' || limit === 'business_unit_spend';
export const LimitNoticeSchema = z
    .strictObject({
    limit: LimitNoticeLimitSchema,
    limitValue: z.number().int().min(1),
    observedValue: z.number().int().min(0),
    threshold: LimitNoticeThresholdSchema,
    event: LimitNoticeEventSchema,
    organizationId: z.string().min(1).max(64),
    agent: ParticipantAgentIdentitySchema.optional(),
    wakeupRequestId: z.uuid().optional(),
    issueId: z.uuid().optional(),
    observedAt: Timestamp,
    resetsAt: Timestamp.optional(),
    spend: z.strictObject({
        scopeName: z.string().min(1).max(120).refine((name) => !/[\r\n\u2028\u2029]/.test(name), 'scopeName must not contain line breaks'),
        windowStart: Timestamp,
        usdPerEur: z.number().positive().finite(),
    }).optional(),
    recipients: z.array(LimitNoticeRecipientSchema).min(1).max(2),
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
    if (n.event === 'turn_refused' && !isSpendLimit(n.limit))
        add('event', 'turn_refused belongs to a spend limit');
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
    // (f) spend caps belong to a company or business unit, not to an agent
    if (isSpendLimit(n.limit) && n.agent !== undefined)
        add('agent', 'a spend limit carries no agent');
    // (g) only spend caps carry spend details; business unit caps must name their scope
    if (n.spend !== undefined && !isSpendLimit(n.limit))
        add('spend', 'spend belongs to a spend limit');
    if (n.limit === 'business_unit_spend' && n.spend === undefined)
        add('spend', 'business_unit_spend requires spend');
    if (new Set(n.recipients).size !== n.recipients.length)
        add('recipients', 'recipients must not repeat');
});
const LIMIT_TEXT = {
    daily_runs: 'Tetto di corse del giorno',
    daily_cost: 'Tetto di costo del giorno',
    company_spend: "Tetto di spesa dell'azienda",
    business_unit_spend: 'Tetto di spesa del reparto',
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
const SPEND_SCOPE_TEXT = {
    company_spend: "dell'azienda",
    business_unit_spend: 'del reparto',
};
const SPEND_SOURCE_TEXT = {
    model: 'modelli',
    tool: 'strumenti',
    ricerca: 'ricerche',
    lab: 'Lab',
};
const SPEND_SOURCES = CompanySpendSourceSchema.options.map((source) => SPEND_SOURCE_TEXT[source]);
const SPEND_SOURCES_TEXT = `${SPEND_SOURCES.slice(0, -1).join(', ')} e ${SPEND_SOURCES.at(-1)}`;
const SPEND_REACHED_TEXT = 'Finché il tetto non è alzato i turni nuovi restano fermi.';
/** One fixed Italian line for a notice. Pure: same notice, same string; throws if the notice is not valid. */
export function renderLimitNotice(notice) {
    const n = LimitNoticeSchema.parse(notice);
    const spend = n.spend;
    if (spend !== undefined && isSpendLimit(n.limit)) {
        const euros = (micros) => `${(micros / 1_000_000 / spend.usdPerEur).toFixed(2).replace('.', ',')} €`;
        const start = new Date(spend.windowStart);
        const date = `${String(start.getUTCDate()).padStart(2, '0')}/${String(start.getUTCMonth() + 1).padStart(2, '0')}/${String(start.getUTCFullYear()).padStart(4, '0')}`;
        const parts = [
            `${LIMIT_TEXT[n.limit]} «${spend.scopeName}» ${THRESHOLD_TEXT[n.threshold]}: ${euros(n.observedValue)} su ${euros(n.limitValue)}.`,
            `Resta ${euros(Math.max(n.limitValue - n.observedValue, 0))}.`,
            `Conta la spesa di ${SPEND_SOURCES_TEXT} di tutti gli agenti ${SPEND_SCOPE_TEXT[n.limit]} dal ${date}.`,
            EVENT_TEXT[n.event],
        ];
        if (n.threshold === 'reached')
            parts.push(SPEND_REACHED_TEXT);
        return parts.join(' ');
    }
    const head = `${LIMIT_TEXT[n.limit]} ${THRESHOLD_TEXT[n.threshold]}${n.agent ? ` per ${n.agent.runtimeAgentId}` : ''}`;
    const numbers = `${n.observedValue} su ${n.limitValue} ${UNIT_TEXT[LIMIT_NOTICE_UNITS[n.limit]]}`;
    const parts = [`${head}: ${numbers}.`, EVENT_TEXT[n.event]];
    if (isDailyLimit(n.limit))
        parts.push(RESET_TEXT);
    return parts.join(' ');
}
//# sourceMappingURL=limit-notice.js.map