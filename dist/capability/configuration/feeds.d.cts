import { z } from 'zod';
/** Promoted from cap-briefing's existing feed configuration; no recipient fields. */
export declare const BriefingFeedSchema: z.ZodObject<{
    url: z.ZodString;
    category: z.ZodString;
    weight: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export declare const BriefingFeedsSchema: z.ZodArray<z.ZodObject<{
    url: z.ZodString;
    category: z.ZodString;
    weight: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>>;
export type BriefingFeed = z.infer<typeof BriefingFeedSchema>;
/** Editable selection of cap-news FeedEntry; source/addedAt remain server metadata. */
export declare const NewsFeedSchema: z.ZodObject<{
    url: z.ZodString;
    category: z.ZodString;
    maxPerCategory: z.ZodOptional<z.ZodNumber>;
    label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const NewsFeedsSchema: z.ZodArray<z.ZodObject<{
    url: z.ZodString;
    category: z.ZodString;
    maxPerCategory: z.ZodOptional<z.ZodNumber>;
    label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>>;
export declare const NewsFeedsSettingsSchema: z.ZodObject<{
    feeds: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        maxPerCategory: z.ZodOptional<z.ZodNumber>;
        label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    hoursBack: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type NewsFeed = z.infer<typeof NewsFeedSchema>;
export type NewsFeedsSettings = z.infer<typeof NewsFeedsSettingsSchema>;
//# sourceMappingURL=feeds.d.ts.map