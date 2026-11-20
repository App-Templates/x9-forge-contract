"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialCapCheckSchema = exports.SOCIAL_SERVER_VERIFY_ESTIMATE_USD = exports.SOCIAL_SERVER_DAILY_CAP_DEFAULT_USD = void 0;
exports.socialServerVerifyEstimate = socialServerVerifyEstimate;
exports.socialCapDecision = socialCapDecision;
const zod_1 = require("zod");
const topic_js_1 = require("./topic.cjs");
/** D24: daily pay-per-use server budget for one agent, in USD. */
exports.SOCIAL_SERVER_DAILY_CAP_DEFAULT_USD = 2;
/** Placeholder until P0 measures the cost of a server verification. */
exports.SOCIAL_SERVER_VERIFY_ESTIMATE_USD = 0.25;
function socialServerVerifyEstimate(seenUsd) {
    return seenUsd.reduce((estimate, usd) => Number.isFinite(usd) && usd >= 0 ? Math.max(estimate, usd) : estimate, exports.SOCIAL_SERVER_VERIFY_ESTIMATE_USD);
}
exports.SocialCapCheckSchema = zod_1.z.object({
    track: topic_js_1.SocialTrackSchema,
    capUsd: zod_1.z.number().positive().finite(),
    spentUsd: zod_1.z.number().nonnegative().finite(),
    estimateUsd: zod_1.z.number().nonnegative().finite(),
}).strict();
function microdollars(usd) {
    const rounded = Math.round(usd * 1e6);
    // Values whose scaling overflows are already whole dollars at this magnitude.
    return Number.isFinite(rounded) ? BigInt(rounded) : BigInt(usd) * 1000000n;
}
/** Check the agent's day total before reserving a call; the service owns the ledger and day. */
function socialCapDecision(input) {
    try {
        const parsed = exports.SocialCapCheckSchema.safeParse(input);
        if (!parsed.success)
            return { ok: false, reason: 'invalid_input' };
        const { track, capUsd, spentUsd, estimateUsd } = parsed.data;
        if (track === 'mac')
            return { ok: true, capped: false };
        const cap = microdollars(capUsd);
        const spent = microdollars(spentUsd);
        const estimate = microdollars(estimateUsd);
        const remaining = cap > spent ? cap - spent : 0n;
        // Decimal conversion keeps six places without overflowing the scaled integer.
        const remainingUsd = Number(`${remaining}e-6`);
        if (spent + estimate <= cap)
            return { ok: true, capped: true, remainingUsd };
        return { ok: false, reason: 'cap_reached', remainingUsd };
    }
    catch {
        // Even malformed objects with throwing accessors must stop the call safely.
        return { ok: false, reason: 'invalid_input' };
    }
}
//# sourceMappingURL=cap.js.map