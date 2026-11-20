"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialRoundOptimizationSchema = void 0;
exports.socialRoundOptimization = socialRoundOptimization;
const zod_1 = require("zod");
const spend_js_1 = require("../ricerca/spend.cjs");
const fact_memory_js_1 = require("./fact-memory.cjs");
const optimized_estimate_js_1 = require("./optimized-estimate.cjs");
const topic_js_1 = require("./topic.cjs");
/** What the optimized round did: filter outcome, topics, facts reused vs paid, cost against the estimate (D19). */
exports.SocialRoundOptimizationSchema = zod_1.z
    .strictObject({
    day: spend_js_1.AgentDaySchema,
    track: topic_js_1.SocialTrackSchema,
    postsSeen: zod_1.z.int().min(0),
    postsKept: zod_1.z.int().min(0),
    postsDiscarded: zod_1.z.int().min(0),
    /** Posts that never went through the filter (rounds saved before the filter existed). */
    postsUnfiltered: zod_1.z.int().min(0),
    /** Kept / (kept + discarded), 6 decimals; null when no post was filtered. */
    keepRatio: zod_1.z.number().min(0).max(1).nullable(),
    topics: zod_1.z.int().min(0),
    factsReused: zod_1.z.int().min(0),
    factsNew: zod_1.z.int().min(0),
    spentUsd: zod_1.z.number().nonnegative().finite(),
    costPerPostUsd: zod_1.z.number().nonnegative().finite().nullable(),
    /** Server track only (the Mac consumes subscription quota, D8). */
    vsEstimate: zod_1.z
        .strictObject({
        estimateUsd: zod_1.z.number().positive().finite(),
        ratio: zod_1.z.number().nonnegative().finite(),
        near: zod_1.z.boolean(),
    })
        .nullable(),
})
    .refine((r) => r.postsKept + r.postsDiscarded + r.postsUnfiltered === r.postsSeen, {
    message: 'posts_sum_mismatch',
    path: ['postsSeen'],
});
/** Builds the optimization report of one round; throws `filtered_posts_exceed_seen` when kept + discarded > seen. */
function socialRoundOptimization(input) {
    const postsUnfiltered = input.postsSeen - input.postsKept - input.postsDiscarded;
    if (postsUnfiltered < 0)
        throw new Error('filtered_posts_exceed_seen');
    const filtered = input.postsKept + input.postsDiscarded;
    const keepRatio = filtered > 0 ? Math.round((input.postsKept / filtered) * 1e6) / 1e6 : null;
    const costPerPostUsd = (0, fact_memory_js_1.socialCostPerPost)({ spentUsd: input.spentUsd, postsSeen: input.postsSeen });
    const compared = input.track === 'server' && costPerPostUsd !== null
        ? (0, optimized_estimate_js_1.socialCostVsEstimate)({
            costPerPostUsd,
            ...(input.estimateUsd === undefined ? {} : { estimateUsd: input.estimateUsd }),
        })
        : null;
    return exports.SocialRoundOptimizationSchema.parse({
        day: input.day,
        track: input.track,
        postsSeen: input.postsSeen,
        postsKept: input.postsKept,
        postsDiscarded: input.postsDiscarded,
        postsUnfiltered,
        keepRatio,
        topics: input.topics,
        factsReused: input.factsReused,
        factsNew: input.factsNew,
        spentUsd: input.spentUsd,
        costPerPostUsd,
        vsEstimate: compared && { estimateUsd: compared.estimateUsd, ratio: compared.ratio, near: compared.near },
    });
}
//# sourceMappingURL=optimization-report.js.map