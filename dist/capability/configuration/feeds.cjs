"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsFeedsSettingsSchema = exports.NewsFeedsSchema = exports.NewsFeedSchema = exports.BriefingFeedsSchema = exports.BriefingFeedSchema = void 0;
const zod_1 = require("zod");
/** Promoted from cap-briefing's existing feed configuration; no recipient fields. */
exports.BriefingFeedSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    category: zod_1.z.string(),
    weight: zod_1.z.number().min(0).max(10).default(1),
}).strict();
exports.BriefingFeedsSchema = zod_1.z.array(exports.BriefingFeedSchema);
/** Editable selection of cap-news FeedEntry; source/addedAt remain server metadata. */
exports.NewsFeedSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    category: zod_1.z.string(),
    maxPerCategory: zod_1.z.number().int().min(1).max(20).optional(),
    label: zod_1.z.string().optional(),
}).strict();
exports.NewsFeedsSchema = zod_1.z.array(exports.NewsFeedSchema);
exports.NewsFeedsSettingsSchema = zod_1.z.object({
    feeds: exports.NewsFeedsSchema,
    hoursBack: zod_1.z.number().int().min(1).max(168).optional(),
}).strict();
//# sourceMappingURL=feeds.js.map