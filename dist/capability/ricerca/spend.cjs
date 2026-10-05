"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSpendDaySchema = exports.SpendingCapabilitySchema = exports.AgentDaySchema = void 0;
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
/** The capabilities that report spend this way. */
exports.SpendingCapabilitySchema = zod_1.z.enum(['ricerca']);
exports.AgentSpendDaySchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    capability: exports.SpendingCapabilitySchema,
    day: exports.AgentDaySchema,
    spentUsd: zod_1.z.number().nonnegative().finite(),
    reservedUsd: zod_1.z.number().nonnegative().finite(),
    capUsd: zod_1.z.number().positive().finite(),
    calls: zod_1.z.number().int().nonnegative(),
    webCalls: zod_1.z.number().int().nonnegative(),
    /** Researches that day ended because the budget was spent. */
    budgetStops: zod_1.z.number().int().nonnegative(),
}).strict();
//# sourceMappingURL=spend.js.map