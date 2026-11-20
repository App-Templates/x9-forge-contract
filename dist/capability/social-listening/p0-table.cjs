"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialP0TableSchema = exports.SOCIAL_P0_MISSING_GROUPS = exports.SOCIAL_P0_KEEP_RATIOS = exports.SOCIAL_P0_POSTS_PER_DAY = void 0;
exports.socialP0Table = socialP0Table;
const zod_1 = require("zod");
const fact_memory_js_1 = require("./fact-memory.cjs");
const topic_js_1 = require("./topic.cjs");
/** Posts per day measured by the MVP (17/11). */
exports.SOCIAL_P0_POSTS_PER_DAY = [0.49, 1.04, 1.75];
/** Share of posts kept: 1 = no filter, 0.6 = the proposed filter quota. */
exports.SOCIAL_P0_KEEP_RATIOS = [1, 0.6];
exports.SOCIAL_P0_MISSING_GROUPS = ['mac_post_analysis', 'server_post_analysis', 'extended_research'];
exports.SocialP0TableSchema = zod_1.z.strictObject({
    rows: zod_1.z.array(zod_1.z.strictObject({
        track: topic_js_1.SocialTrackSchema,
        kind: zod_1.z.enum(fact_memory_js_1.SOCIAL_MEASUREMENT_KINDS),
        count: zod_1.z.number().int().positive(),
        avgUsd: zod_1.z.number().nonnegative(),
        avgDurationSec: zod_1.z.number().nonnegative(),
        avgQuality: zod_1.z.number().min(1).max(5).nullable(),
    })),
    monthlyPerAuthor: zod_1.z.array(zod_1.z.strictObject({
        track: topic_js_1.SocialTrackSchema,
        postsPerDay: zod_1.z.number().nonnegative(),
        keepRatio: zod_1.z.number().nonnegative(),
        monthlyUsd: zod_1.z.number().nonnegative(),
    })),
    extendedResearch: zod_1.z.strictObject({
        count: zod_1.z.number().int().positive(),
        avgUsd: zod_1.z.number().nonnegative(),
        maxUsd: zod_1.z.number().nonnegative(),
    }).nullable(),
    missing: zod_1.z.array(zod_1.z.enum(exports.SOCIAL_P0_MISSING_GROUPS)),
});
function checkedList(values) {
    for (const v of values) {
        if (!Number.isFinite(v) || v < 0)
            throw new Error('invalid_p0_option');
    }
    return values;
}
/** P0 cost table for Stefano, computed from the saved measurements (invalid rows are skipped). */
function socialP0Table(rows, options = {}) {
    const postsPerDay = checkedList(options.postsPerDay ?? exports.SOCIAL_P0_POSTS_PER_DAY);
    const keepRatios = checkedList(options.keepRatios ?? exports.SOCIAL_P0_KEEP_RATIOS);
    const valid = rows.flatMap(row => {
        const parsed = fact_memory_js_1.SocialCostMeasurementSchema.safeParse(row);
        return parsed.success ? [parsed.data] : [];
    });
    const tableRows = (0, fact_memory_js_1.socialMeasurementSummary)(rows).map(summary => {
        const qualities = valid
            .filter(r => r.track === summary.track && r.kind === summary.kind)
            .flatMap(r => (r.quality === undefined ? [] : [r.quality]));
        const avgQuality = qualities.length === 0
            ? null
            : Math.round((qualities.reduce((sum, q) => sum + q, 0) / qualities.length) * 10) / 10;
        return { ...summary, avgQuality };
    });
    const monthlyPerAuthor = tableRows
        .filter(r => r.kind === 'post_analysis')
        .flatMap(r => postsPerDay.flatMap(perDay => keepRatios.flatMap(keepRatio => {
        const monthlyUsd = (0, fact_memory_js_1.socialMonthlyCostPerAuthor)({ postsPerDay: perDay, costPerPostUsd: keepRatio * r.avgUsd });
        return monthlyUsd === null ? [] : [{ track: r.track, postsPerDay: perDay, keepRatio, monthlyUsd }];
    })));
    const research = valid.filter(r => r.kind === 'extended_research');
    const avgResearchUsd = (0, fact_memory_js_1.socialCostPerPost)({
        spentUsd: research.reduce((sum, r) => sum + r.usd, 0), postsSeen: research.length,
    });
    const extendedResearch = research.length === 0 || avgResearchUsd === null
        ? null
        : { count: research.length, avgUsd: avgResearchUsd, maxUsd: Math.max(...research.map(r => r.usd)) };
    const has = (track) => tableRows.some(r => r.track === track && r.kind === 'post_analysis');
    const missing = exports.SOCIAL_P0_MISSING_GROUPS.filter(group => {
        if (group === 'mac_post_analysis')
            return !has('mac');
        if (group === 'server_post_analysis')
            return !has('server');
        return extendedResearch === null;
    });
    return { rows: tableRows, monthlyPerAuthor, extendedResearch, missing };
}
//# sourceMappingURL=p0-table.js.map