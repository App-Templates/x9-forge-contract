import { z } from 'zod';

/** Promoted from cap-briefing's existing feed configuration; no recipient fields. */
export const BriefingFeedSchema = z.object({
  url: z.string().url(),
  category: z.string(),
  weight: z.number().min(0).max(10).default(1),
}).strict();
export const BriefingFeedsSchema = z.array(BriefingFeedSchema);
export type BriefingFeed = z.infer<typeof BriefingFeedSchema>;

/** Editable selection of cap-news FeedEntry; source/addedAt remain server metadata. */
export const NewsFeedSchema = z.object({
  url: z.string().url(),
  category: z.string(),
  maxPerCategory: z.number().int().min(1).max(20).optional(),
  label: z.string().optional(),
}).strict();
export const NewsFeedsSchema = z.array(NewsFeedSchema);
export const NewsFeedsSettingsSchema = z.object({
  feeds: NewsFeedsSchema,
  hoursBack: z.number().int().min(1).max(168).optional(),
}).strict();
export type NewsFeed = z.infer<typeof NewsFeedSchema>;
export type NewsFeedsSettings = z.infer<typeof NewsFeedsSettingsSchema>;
