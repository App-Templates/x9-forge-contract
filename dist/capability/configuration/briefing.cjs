"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingSettingsSchema = exports.BriefingCategoryWeightsSchema = void 0;
const zod_1 = require("zod");
const feeds_js_1 = require("./feeds.cjs");
exports.BriefingCategoryWeightsSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.number());
/** Resolved ordinary settings, without provisioning defaults or channel identities. */
exports.BriefingSettingsSchema = zod_1.z.object({
    greeting: zod_1.z.string(),
    tone: zod_1.z.enum(['formal', 'terse', 'friendly']),
    maxWords: zod_1.z.number().int().min(50).max(2000),
    promptStyle: zod_1.z.string(),
    feeds: feeds_js_1.BriefingFeedsSchema.optional(),
    categoryWeights: exports.BriefingCategoryWeightsSchema,
    structure: zod_1.z.array(zod_1.z.string()),
    cronSchedule: zod_1.z.string(),
    newsCronSchedule: zod_1.z.string(),
}).strict();
//# sourceMappingURL=briefing.js.map