"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachSessionQuotaSchema = exports.CoachRollingBudgetSchema = void 0;
exports.coachRollingRemainingSeconds = coachRollingRemainingSeconds;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const shared_js_1 = require("./shared.cjs");
exports.CoachRollingBudgetSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityPersonScopeSchema, windowSeconds: zod_1.z.number().int().positive().max(366 * 86400),
    asOf: shared_js_1.Instant, windowStart: shared_js_1.Instant, limitSeconds: zod_1.z.number().int().positive(), usedSeconds: zod_1.z.number().int().nonnegative(),
}).strict().refine(x => Date.parse(x.asOf) % 1000 === 0 && Date.parse(x.windowStart) % 1000 === 0 && Date.parse(x.asOf) - Date.parse(x.windowStart) === x.windowSeconds * 1000, 'Exact second-precision rolling window');
exports.CoachSessionQuotaSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityPersonScopeSchema, budgetAsOf: shared_js_1.Instant, remainingSeconds: zod_1.z.number().int().nonnegative(),
    shareLimitSeconds: zod_1.z.number().int().nonnegative(), limitSeconds: zod_1.z.number().int().nonnegative(),
}).strict().refine(x => x.limitSeconds <= Math.min(x.remainingSeconds, x.shareLimitSeconds), 'Quota respects remaining and share');
function coachRollingRemainingSeconds(raw) {
    const budget = exports.CoachRollingBudgetSchema.safeParse(raw);
    return budget.success ? Math.max(0, budget.data.limitSeconds - budget.data.usedSeconds) : null;
}
//# sourceMappingURL=rolling-budget.js.map