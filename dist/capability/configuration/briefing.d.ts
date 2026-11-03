import { z } from 'zod';
export declare const BriefingCategoryWeightsSchema: z.ZodRecord<z.ZodString, z.ZodNumber>;
/** Resolved ordinary settings, without provisioning defaults or channel identities. */
export declare const BriefingSettingsSchema: z.ZodObject<{
    greeting: z.ZodString;
    tone: z.ZodEnum<{
        formal: "formal";
        terse: "terse";
        friendly: "friendly";
    }>;
    maxWords: z.ZodNumber;
    promptStyle: z.ZodString;
    feeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        weight: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>>;
    categoryWeights: z.ZodRecord<z.ZodString, z.ZodNumber>;
    structure: z.ZodArray<z.ZodString>;
    cronSchedule: z.ZodString;
    newsCronSchedule: z.ZodString;
}, z.core.$strict>;
export type BriefingSettings = z.infer<typeof BriefingSettingsSchema>;
//# sourceMappingURL=briefing.d.ts.map