import { z } from 'zod';
import { AgentDaySchema } from "../ricerca/spend.js";
import { socialCostPerPost, socialMonthlyCostPerAuthor } from "./fact-memory.js";
import { SocialFollowedProfileSchema, SocialVerticalIdSchema } from "./post.js";
import { SocialTrackSchema } from "./topic.js";
/** Costs report tool: read-only and separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export const SOCIAL_COSTS_TOOLS = { report: 'social_costs_report' };
/** Longest window of one costs report, days (both ends counted). */
export const SOCIAL_COSTS_REPORT_MAX_DAYS = 90;
const DAY_MS = 86_400_000;
/** Days from `from` to `to`, both ends counted (inputs are valid calendar days). */
function inclusiveDays(from, to) {
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS) + 1;
}
/** No identity in the input: tenant, owner and agent come from the call envelope (R-33). */
export const SocialCostsReportInputSchema = z.strictObject({
    verticalId: SocialVerticalIdSchema,
    from: AgentDaySchema,
    to: AgentDaySchema,
}).superRefine((r, ctx) => {
    const days = inclusiveDays(r.from, r.to);
    if (days < 1)
        ctx.addIssue({ code: 'custom', path: ['from'], message: 'from must not be after to' });
    else if (days > SOCIAL_COSTS_REPORT_MAX_DAYS) {
        ctx.addIssue({ code: 'custom', path: ['to'], message: `window is at most ${SOCIAL_COSTS_REPORT_MAX_DAYS} days` });
    }
});
const UsdSchema = z.number().nonnegative().finite();
export const SocialCostsRoundSchema = z.strictObject({
    day: AgentDaySchema,
    track: SocialTrackSchema,
    postsSeen: z.int().min(0),
    spentUsd: UsdSchema,
    /** From `socialCostPerPost`; null when no post was seen. */
    costPerPostUsd: UsdSchema.nullable(),
});
export const SocialCostsAuthorSchema = z.strictObject({
    ...SocialFollowedProfileSchema.shape,
    postsPerDay: UsdSchema,
    /** From `socialMonthlyCostPerAuthor` on the server cost per post; null when that is null. */
    monthlyUsd: UsdSchema.nullable(),
});
export const SocialCostsReportOutputSchema = z.strictObject({
    verticalId: SocialVerticalIdSchema,
    from: AgentDaySchema,
    to: AgentDaySchema,
    rounds: z.array(SocialCostsRoundSchema).max(SOCIAL_COSTS_REPORT_MAX_DAYS),
    /** Mean cost of one post on the server track: summed spend over summed posts; null with no server round. */
    serverCostPerPostUsd: UsdSchema.nullable(),
    authors: z.array(SocialCostsAuthorSchema).max(100),
}).superRefine((r, ctx) => {
    const seen = new Set();
    let serverSpent = 0;
    let serverPosts = 0;
    let hasServer = false;
    r.rounds.forEach((round, i) => {
        if (round.day < r.from || round.day > r.to) {
            ctx.addIssue({ code: 'custom', path: ['rounds', i, 'day'], message: 'round day is outside from..to' });
        }
        const key = `${round.day}|${round.track}`;
        if (seen.has(key)) {
            ctx.addIssue({ code: 'custom', path: ['rounds', i], message: 'round repeated for the same day and track' });
        }
        seen.add(key);
        if (round.costPerPostUsd !== socialCostPerPost({ spentUsd: round.spentUsd, postsSeen: round.postsSeen })) {
            ctx.addIssue({ code: 'custom', path: ['rounds', i, 'costPerPostUsd'], message: 'costPerPostUsd must match spentUsd / postsSeen' });
        }
        if (round.track === 'server') {
            hasServer = true;
            serverSpent += round.spentUsd;
            serverPosts += round.postsSeen;
        }
    });
    const expectedServer = hasServer ? socialCostPerPost({ spentUsd: serverSpent, postsSeen: serverPosts }) : null;
    if (r.serverCostPerPostUsd !== expectedServer) {
        ctx.addIssue({ code: 'custom', path: ['serverCostPerPostUsd'], message: 'serverCostPerPostUsd must match the summed server rounds' });
    }
    r.authors.forEach((a, i) => {
        const expected = r.serverCostPerPostUsd === null
            ? null
            : socialMonthlyCostPerAuthor({ postsPerDay: a.postsPerDay, costPerPostUsd: r.serverCostPerPostUsd });
        if (a.monthlyUsd !== expected) {
            ctx.addIssue({ code: 'custom', path: ['authors', i, 'monthlyUsd'], message: 'monthlyUsd must match postsPerDay and serverCostPerPostUsd' });
        }
    });
});
export const SocialCostsToolErrorSchema = z.enum(['invalid_request', 'not_configured', 'unknown_vertical']);
//# sourceMappingURL=costs.js.map