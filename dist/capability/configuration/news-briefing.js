import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-model-management-values.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { sameOrdinaryData } from "../ordinary-configuration.js";
import { BriefingFeedsSchema, NewsFeedsSchema } from "./feeds.js";
import { BriefingSettingsSchema } from "./briefing.js";
import { BriefingRuleSchema, BriefingRulesSchema, NewsRuleSchema, NewsRulesSchema } from "./rules.js";
/** Only these two producers expose the configurable resource boundary. */
export const NewsBriefingFamilySchema = z.enum(['news', 'briefing']);
const cron = z.string().min(1).max(100);
function validateFeeds(feeds, ctx) {
    if (feeds.length > 100)
        ctx.addIssue({ code: 'custom', message: 'Too many feeds' });
    const urls = new Set();
    for (const [index, feed] of feeds.entries()) {
        // The promoted feed codec already reports malformed URLs; do not turn safeParse into a thrown exception.
        if (!URL.canParse(feed.url))
            continue;
        const url = new URL(feed.url);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
            ctx.addIssue({ code: 'custom', path: [index, 'url'], message: 'Feed requires HTTP(S) without credentials' });
        }
        if (urls.has(url.href))
            ctx.addIssue({ code: 'custom', path: [index, 'url'], message: 'Duplicate feed URL' });
        urls.add(url.href);
    }
}
export const NewsManagedFeedsSchema = NewsFeedsSchema.superRefine(validateFeeds);
export const BriefingManagedFeedsSchema = BriefingFeedsSchema.superRefine(validateFeeds);
export const NewsSettingsSchema = z.object({
    feeds: NewsManagedFeedsSchema,
    hoursBack: z.number().int().min(1).max(168),
    cronSchedule: cron,
    rules: NewsRulesSchema,
}).strict();
export const BriefingManagedSettingsSchema = BriefingSettingsSchema.extend({
    feeds: BriefingManagedFeedsSchema.optional(),
    cronSchedule: cron,
    newsCronSchedule: cron,
    rules: BriefingRulesSchema,
}).strict();
const newsPatch = NewsSettingsSchema.omit({ feeds: true, rules: true }).partial()
    .refine(value => Object.keys(value).length > 0, 'Empty settings patch');
const briefingPatch = BriefingManagedSettingsSchema.omit({ feeds: true, rules: true }).partial()
    .refine(value => Object.keys(value).length > 0, 'Empty settings patch');
/** IDs, timestamps, priorities and operator authority are created only by the producer. */
export const NewsRuleDraftSchema = NewsRuleSchema.pick({ condition: true, action: true, description: true }).strict();
export const BriefingRuleDraftSchema = BriefingRuleSchema.pick({ condition: true, action: true, description: true }).strict();
const removeRule = z.object({ type: z.literal('rule.remove'), id: NewsRuleSchema.shape.id }).strict();
export const NewsChangeSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('settings.patch'), settings: newsPatch }).strict(),
    z.object({ type: z.literal('feeds.replace'), feeds: NewsManagedFeedsSchema }).strict(),
    z.object({ type: z.literal('rule.add'), rule: NewsRuleDraftSchema }).strict(),
    z.object({ type: z.literal('rule.update'), id: NewsRuleSchema.shape.id, rule: NewsRuleDraftSchema }).strict(),
    removeRule,
]);
export const BriefingChangeSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('settings.patch'), settings: briefingPatch }).strict(),
    z.object({ type: z.literal('feeds.replace'), feeds: BriefingManagedFeedsSchema }).strict(),
    z.object({ type: z.literal('rule.add'), rule: BriefingRuleDraftSchema }).strict(),
    z.object({ type: z.literal('rule.update'), id: BriefingRuleSchema.shape.id, rule: BriefingRuleDraftSchema }).strict(),
    removeRule,
]);
const command = {
    scope: CapabilityAgentScopeSchema,
    requestId: AgentManagementRequestIdSchema,
    expectedVersion: AgentConfigVersionSchema.nullable(),
};
export const NewsBriefingCommandSchema = z.discriminatedUnion('family', [
    z.object({ ...command, family: z.literal('news'), changes: z.array(NewsChangeSchema).min(1).max(100) }).strict(),
    z.object({ ...command, family: z.literal('briefing'), changes: z.array(BriefingChangeSchema).min(1).max(100) }).strict(),
]);
function validateEffective(value, ctx) {
    if (value.effective && (value.effective.version > value.version
        || value.effective.version === value.version && !sameOrdinaryData(value.settings, value.effective.settings))) {
        ctx.addIssue({ code: 'custom', path: ['effective'], message: 'Effective revision conflicts with saved settings' });
    }
}
function state(family, settings) {
    return z.object({
        family: z.literal(family), scope: CapabilityAgentScopeSchema, version: AgentConfigVersionSchema,
        settings,
        effective: z.object({ version: AgentConfigVersionSchema, settings, observedAt: z.iso.datetime({ offset: true }) }).strict().nullable(),
        execution: z.enum(['running', 'stopped', 'unknown']),
    }).strict();
}
export const NewsBriefingStateSchema = z.discriminatedUnion('family', [
    state('news', NewsSettingsSchema).superRefine(validateEffective),
    state('briefing', BriefingManagedSettingsSchema).superRefine(validateEffective),
]);
//# sourceMappingURL=news-briefing.js.map