"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSpendDaySchema = exports.SpendingCapabilitySchema = exports.AGENT_SPEND_MAX_DAYS = exports.AgentDaySchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("./agent-config.cjs");
/**
 * One day of spend of one agent on one capability (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the agent's time zone. `spentUsd` is settled cost; `reservedUsd` is cost reserved and not settled:
 * calls still running, and calls that ended without a reported usage (an unknown cost is never free: it stays reserved).
 * `capUsd` is the daily budget in force that day (the highest, if it changed during the day).
 */
exports.AgentDaySchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => {
    const t = new Date(d + 'T00:00:00Z');
    return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
}, 'not a calendar date');
/** Longest window of one agent spend request, days (inclusive). */
exports.AGENT_SPEND_MAX_DAYS = 400;
/** The capabilities that report spend this way. */
exports.SpendingCapabilitySchema = zod_1.z.enum(['ricerca', 'lab']);
exports.AgentSpendDaySchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    capability: exports.SpendingCapabilitySchema,
    day: exports.AgentDaySchema,
    spentUsd: zod_1.z.number().nonnegative().finite(),
    reservedUsd: zod_1.z.number().nonnegative().finite(),
    capUsd: zod_1.z.number().positive().finite(),
    calls: zod_1.z.number().int().nonnegative(),
    webCalls: zod_1.z.number().int().nonnegative(),
    /** Jobs (researches or ingests) stopped by the DAY's budget; a job's own ceiling is not counted here. */
    budgetStops: zod_1.z.number().int().nonnegative(),
    /** When the first job of that day was stopped by the day's budget («finito alle 15:52»); null if it never was. */
    budgetReachedAt: zod_1.z.iso.datetime().nullable(),
    /**
     * When the agent's day was closed because a call may have cost more than its worst-case reservation: it did (overrun),
     * or it was sent and ended without a reported usage (unknown cost). Nothing else is reserved until that day's
     * midnight. null if it never happened. The residual risk of hosted web reading.
     */
    overrunAt: zod_1.z.iso.datetime().nullable(),
}).strict();
//# sourceMappingURL=spend.js.map