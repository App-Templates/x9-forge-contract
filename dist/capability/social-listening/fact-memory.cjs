"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_FACT_MEMORY_MAX_AGE_DAYS = exports.SocialVerifiedFactSchema = exports.SocialFactKeySchema = void 0;
exports.socialFactKey = socialFactKey;
exports.socialFactFresh = socialFactFresh;
exports.socialCostPerPost = socialCostPerPost;
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
//# sourceMappingURL=fact-memory.js.map