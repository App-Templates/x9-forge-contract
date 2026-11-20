import { z } from 'zod';
import { SOCIAL_MEASUREMENT_KINDS, SocialCostMeasurementSchema, socialCostPerPost, socialMeasurementSummary, socialMonthlyCostPerAuthor, } from "./fact-memory.js";
import { SocialTrackSchema } from "./topic.js";
/** Posts per day measured by the MVP (17/11). */
export const SOCIAL_P0_POSTS_PER_DAY = [0.49, 1.04, 1.75];
/** Share of posts kept: 1 = no filter, 0.6 = the proposed filter quota. */
export const SOCIAL_P0_KEEP_RATIOS = [1, 0.6];
export const SOCIAL_P0_MISSING_GROUPS = ['mac_post_analysis', 'server_post_analysis', 'extended_research'];
export const SocialP0TableSchema = z.strictObject({
    rows: z.array(z.strictObject({
        track: SocialTrackSchema,
        kind: z.enum(SOCIAL_MEASUREMENT_KINDS),
        count: z.number().int().positive(),
        avgUsd: z.number().nonnegative(),
        avgDurationSec: z.number().nonnegative(),
        avgQuality: z.number().min(1).max(5).nullable(),
    })),
    monthlyPerAuthor: z.array(z.strictObject({
        track: SocialTrackSchema,
        postsPerDay: z.number().nonnegative(),
        keepRatio: z.number().nonnegative(),
        monthlyUsd: z.number().nonnegative(),
    })),
    extendedResearch: z.strictObject({
        count: z.number().int().positive(),
        avgUsd: z.number().nonnegative(),
        maxUsd: z.number().nonnegative(),
    }).nullable(),
    missing: z.array(z.enum(SOCIAL_P0_MISSING_GROUPS)),
});
function checkedList(values) {
    for (const v of values) {
        if (!Number.isFinite(v) || v < 0)
            throw new Error('invalid_p0_option');
    }
    return values;
}
/** P0 cost table for Stefano, computed from the saved measurements (invalid rows are skipped). */
export function socialP0Table(rows, options = {}) {
    const postsPerDay = checkedList(options.postsPerDay ?? SOCIAL_P0_POSTS_PER_DAY);
    const keepRatios = checkedList(options.keepRatios ?? SOCIAL_P0_KEEP_RATIOS);
    const valid = rows.flatMap(row => {
        const parsed = SocialCostMeasurementSchema.safeParse(row);
        return parsed.success ? [parsed.data] : [];
    });
    const tableRows = socialMeasurementSummary(rows).map(summary => {
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
        const monthlyUsd = socialMonthlyCostPerAuthor({ postsPerDay: perDay, costPerPostUsd: keepRatio * r.avgUsd });
        return monthlyUsd === null ? [] : [{ track: r.track, postsPerDay: perDay, keepRatio, monthlyUsd }];
    })));
    const research = valid.filter(r => r.kind === 'extended_research');
    const avgResearchUsd = socialCostPerPost({
        spentUsd: research.reduce((sum, r) => sum + r.usd, 0), postsSeen: research.length,
    });
    const extendedResearch = research.length === 0 || avgResearchUsd === null
        ? null
        : { count: research.length, avgUsd: avgResearchUsd, maxUsd: Math.max(...research.map(r => r.usd)) };
    const has = (track) => tableRows.some(r => r.track === track && r.kind === 'post_analysis');
    const missing = SOCIAL_P0_MISSING_GROUPS.filter(group => {
        if (group === 'mac_post_analysis')
            return !has('mac');
        if (group === 'server_post_analysis')
            return !has('server');
        return extendedResearch === null;
    });
    return { rows: tableRows, monthlyPerAuthor, extendedResearch, missing };
}
//# sourceMappingURL=p0-table.js.map