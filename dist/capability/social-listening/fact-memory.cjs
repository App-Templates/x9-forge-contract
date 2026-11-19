"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_DAYS_PER_MONTH = exports.SocialCostMeasurementSchema = exports.SOCIAL_MEASUREMENT_KINDS = exports.SOCIAL_FACT_MEMORY_MAX_AGE_DAYS = exports.SocialVerifiedFactSchema = exports.SocialFactKeySchema = void 0;
exports.socialFactKey = socialFactKey;
exports.socialFactFresh = socialFactFresh;
exports.socialCostPerPost = socialCostPerPost;
exports.socialMonthlyCostPerAuthor = socialMonthlyCostPerAuthor;
exports.socialMeasurementSummary = socialMeasurementSummary;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
const verdict_js_1 = require("./verdict.cjs");
/** Normalised fact text: lowercase, no accents, no punctuation, single spaces. */
function socialFactKey(text) {
    return text
        .normalize('NFKD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}
exports.SocialFactKeySchema = zod_1.z.string().min(1).max(300);
exports.SocialVerifiedFactSchema = zod_1.z.object({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    verticalId: post_js_1.SocialVerticalIdSchema,
    category: topic_js_1.SocialCategorySlugSchema,
    factKey: exports.SocialFactKeySchema,
    fact: verdict_js_1.SocialFactSchema,
    topicId: zod_1.z.string().min(1).max(100),
    verifiedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict();
exports.SOCIAL_FACT_MEMORY_MAX_AGE_DAYS = 30;
const DAY_MS = 86_400_000;
/** True when `verifiedAt` is at most `maxAgeDays` before `nowIso` and not after it. */
function socialFactFresh(row, nowIso, maxAgeDays = exports.SOCIAL_FACT_MEMORY_MAX_AGE_DAYS) {
    try {
        const at = zod_1.z.iso.datetime({ offset: true }).safeParse(row?.verifiedAt);
        const now = zod_1.z.iso.datetime({ offset: true }).safeParse(nowIso);
        if (!at.success || !now.success || !Number.isFinite(maxAgeDays) || maxAgeDays < 0)
            return false;
        const age = Date.parse(now.data) - Date.parse(at.data);
        return age >= 0 && age <= maxAgeDays * DAY_MS;
    }
    catch {
        return false;
    }
}
/** Cost of one post in USD, 6 decimals (microdollars); `null` when no post was seen. */
function socialCostPerPost({ spentUsd, postsSeen }) {
    if (!Number.isFinite(spentUsd) || spentUsd < 0 || !Number.isInteger(postsSeen) || postsSeen <= 0)
        return null;
    return Math.round((Math.round(spentUsd * 1e6) / postsSeen)) / 1e6;
}
exports.SOCIAL_MEASUREMENT_KINDS = ['post_analysis', 'extended_research'];
/** One P0 observation; Mac work consumes subscription quota rather than dollars. */
exports.SocialCostMeasurementSchema = zod_1.z.strictObject({
    measurementId: zod_1.z.string().min(1).max(100),
    track: topic_js_1.SocialTrackSchema,
    kind: zod_1.z.enum(exports.SOCIAL_MEASUREMENT_KINDS),
    postId: zod_1.z.string().min(1).max(100).optional(),
    usd: zod_1.z.number().nonnegative().finite(),
    durationSec: zod_1.z.number().nonnegative().finite(),
    quality: zod_1.z.number().int().min(1).max(5).optional(),
    measuredAt: zod_1.z.iso.datetime({ offset: true }),
    note: zod_1.z.string().max(500).optional(),
}).superRefine((row, ctx) => {
    if (row.track === 'mac' && row.usd !== 0) {
        ctx.addIssue({ code: 'custom', path: ['usd'], message: 'Mac measurements must cost zero dollars' });
    }
    if (row.kind === 'post_analysis' && row.postId === undefined) {
        ctx.addIssue({ code: 'custom', path: ['postId'], message: 'Post analysis requires a post id' });
    }
});
exports.SOCIAL_DAYS_PER_MONTH = 30;
/** D8: monthly cost per followed author, calculated in microdollars. */
function socialMonthlyCostPerAuthor({ postsPerDay, costPerPostUsd }) {
    if (!Number.isFinite(postsPerDay) || postsPerDay < 0)
        return null;
    const cost = socialCostPerPost({ spentUsd: costPerPostUsd, postsSeen: 1 });
    if (cost === null)
        return null;
    const monthlyMicrodollars = Math.round(cost * 1e6) * postsPerDay * exports.SOCIAL_DAYS_PER_MONTH;
    return Number.isFinite(monthlyMicrodollars) ? Math.round(monthlyMicrodollars) / 1e6 : null;
}
/** Valid observations only, ordered by track and then measurement kind. */
function socialMeasurementSummary(rows) {
    const valid = rows.flatMap(row => {
        const parsed = exports.SocialCostMeasurementSchema.safeParse(row);
        return parsed.success ? [parsed.data] : [];
    });
    return topic_js_1.SOCIAL_TRACKS.flatMap(track => exports.SOCIAL_MEASUREMENT_KINDS.flatMap(kind => {
        const group = valid.filter(row => row.track === track && row.kind === kind);
        const count = group.length;
        if (count === 0)
            return [];
        const avgUsd = socialCostPerPost({
            spentUsd: group.reduce((sum, row) => sum + row.usd, 0), postsSeen: count,
        });
        // A nonempty group of validated observations satisfies the cost helper's inputs.
        if (avgUsd === null)
            return [];
        const avgDurationSec = Math.round((group.reduce((sum, row) => sum + row.durationSec, 0) / count) * 1e6) / 1e6;
        return [{ track, kind, count, avgUsd, avgDurationSec }];
    }));
}
//# sourceMappingURL=fact-memory.js.map