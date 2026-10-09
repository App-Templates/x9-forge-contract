import { z } from 'zod';
import { BriefingFeedsSchema } from "./feeds.js";
export const BriefingCategoryWeightsSchema = z.record(z.string(), z.number());
/** Resolved ordinary settings, without provisioning defaults or channel identities. */
export const BriefingSettingsSchema = z.object({
    greeting: z.string(),
    tone: z.enum(['formal', 'terse', 'friendly']),
    maxWords: z.number().int().min(50).max(2000),
    promptStyle: z.string(),
    feeds: BriefingFeedsSchema.optional(),
    categoryWeights: BriefingCategoryWeightsSchema,
    structure: z.array(z.string()),
    cronSchedule: z.string(),
    newsCronSchedule: z.string(),
}).strict();
//# sourceMappingURL=briefing.js.map