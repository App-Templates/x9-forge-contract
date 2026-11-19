"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_ROUND_FRESHNESS = exports.SOCIAL_HANDOVER_REASONS = void 0;
exports.socialRoundHandover = socialRoundHandover;
exports.socialRoundFreshness = socialRoundFreshness;
const zod_1 = require("zod");
const config_js_1 = require("./config.cjs");
const queue_js_1 = require("./queue.cjs");
const spend_js_1 = require("../ricerca/spend.cjs");
exports.SOCIAL_HANDOVER_REASONS = [
    'not_mac', 'no_fallback', 'already_done', 'already_on_server',
    'before_fallback_time', 'fallback_time_reached', 'day_passed',
];
const roundFields = config_js_1.SocialListeningAgentConfigSchema.shape.round.shape;
const giroFields = queue_js_1.SocialRoundSchema.shape;
const HandoverInputSchema = zod_1.z.object({
    round: zod_1.z.object({
        runsOn: roundFields.runsOn,
        fallbackToServer: roundFields.fallbackToServer,
        fallbackTime: roundFields.fallbackTime,
        timezone: roundFields.timezone,
    }).strict(),
    giro: zod_1.z.object({
        day: giroFields.day,
        track: giroFields.track,
        state: giroFields.state,
    }).strict().refine(giro => giro.state !== 'cap_reached' || giro.track === 'server', 'cap_reached only on the server track'),
    nowIso: zod_1.z.iso.datetime({ offset: true }),
}).strict();
/** Local calendar day and clock time of an instant in an IANA timezone. */
function localDayAndTime(nowIso, timezone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        calendar: 'iso8601',
        numberingSystem: 'latn',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(nowIso));
    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    const hour = parts.find(part => part.type === 'hour')?.value;
    const minute = parts.find(part => part.type === 'minute')?.value;
    if (!year || !month || !day || !hour || !minute)
        return null;
    return { day: `${year.padStart(4, '0')}-${month}-${day}`, time: `${hour}:${minute}` };
}
/** D9: decide from the caller's instant; the service owns the actual handover. */
function socialRoundHandover(input) {
    try {
        const parsed = HandoverInputSchema.safeParse(input);
        if (!parsed.success)
            return { action: 'none', reason: 'invalid_input' };
        const { round, giro, nowIso } = parsed.data;
        if (round.runsOn === 'server')
            return { action: 'none', reason: 'not_mac' };
        if (!round.fallbackToServer)
            return { action: 'none', reason: 'no_fallback' };
        if (giro.track === 'server')
            return { action: 'none', reason: 'already_on_server' };
        if (giro.state === 'done')
            return { action: 'none', reason: 'already_done' };
        const local = localDayAndTime(nowIso, round.timezone);
        if (!local)
            return { action: 'none', reason: 'invalid_input' };
        const localDay = local.day;
        if (localDay > giro.day)
            return { action: 'hand_to_server', reason: 'day_passed' };
        if (localDay === giro.day && local.time >= round.fallbackTime) {
            return { action: 'hand_to_server', reason: 'fallback_time_reached' };
        }
        return { action: 'wait', reason: 'before_fallback_time' };
    }
    catch {
        // Malformed objects, including throwing accessors, must never trigger a handover.
        return { action: 'none', reason: 'invalid_input' };
    }
}
exports.SOCIAL_ROUND_FRESHNESS = ['today', 'yesterday_pending', 'stale'];
const FreshnessInputSchema = zod_1.z.object({
    roundDay: spend_js_1.AgentDaySchema,
    nowIso: zod_1.z.iso.datetime({ offset: true }),
    timezone: roundFields.timezone,
    roundTime: roundFields.localTime,
}).strict();
const DAY_MS = 86_400_000;
/** One rule for how old a round is, in the agent's timezone (shared by Forge and X9). */
function socialRoundFreshness(input) {
    try {
        const parsed = FreshnessInputSchema.safeParse(input);
        if (!parsed.success)
            return { state: 'invalid_input' };
        const { roundDay, nowIso, timezone, roundTime } = parsed.data;
        const local = localDayAndTime(nowIso, timezone);
        if (!local)
            return { state: 'invalid_input' };
        // Calendar-day arithmetic on YYYY-MM-DD in UTC, never on the instant.
        const daysOld = Math.round((Date.parse(`${local.day}T00:00:00Z`) - Date.parse(`${roundDay}T00:00:00Z`)) / DAY_MS);
        if (!Number.isFinite(daysOld) || daysOld < 0)
            return { state: 'invalid_input' };
        if (daysOld === 0)
            return { state: 'today', daysOld: 0 };
        if (daysOld === 1 && local.time < roundTime)
            return { state: 'yesterday_pending', daysOld: 1 };
        return { state: 'stale', daysOld };
    }
    catch {
        return { state: 'invalid_input' };
    }
}
//# sourceMappingURL=handover.js.map