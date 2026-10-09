"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionSchema = exports.PrimitiveConditionSchema = exports.DayOfWeekSchema = void 0;
const zod_1 = require("zod");
exports.DayOfWeekSchema = zod_1.z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
/** Existing rule-engine conditions; transport rejects rather than strips unknown fields. */
exports.PrimitiveConditionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('always') }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('day_of_week'), days: zod_1.z.array(exports.DayOfWeekSchema).min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('time_range'), from: zod_1.z.string().regex(/^\d{2}:\d{2}$/), to: zod_1.z.string().regex(/^\d{2}:\d{2}$/) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('date_range'), from: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().date()), to: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().date()) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('calendar_count'), operator: zod_1.z.enum(['>', '<', '=', '>=']), value: zod_1.z.number().int().min(0) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('weather'), condition: zod_1.z.enum(['rain', 'clear', 'cold', 'hot']), source: zod_1.z.literal('open-meteo') }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('is_dark'), value: zod_1.z.boolean() }).strict(),
]);
exports.ConditionSchema = zod_1.z.lazy(() => zod_1.z.union([
    exports.PrimitiveConditionSchema,
    zod_1.z.object({ type: zod_1.z.literal('and'), conditions: zod_1.z.array(exports.ConditionSchema).min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('or'), conditions: zod_1.z.array(exports.ConditionSchema).min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('not'), condition: exports.ConditionSchema }).strict(),
]));
//# sourceMappingURL=conditions.js.map