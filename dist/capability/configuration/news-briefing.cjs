"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsBriefingStateSchema = exports.NewsBriefingCommandSchema = exports.BriefingChangeSchema = exports.NewsChangeSchema = exports.BriefingRuleDraftSchema = exports.NewsRuleDraftSchema = exports.BriefingManagedSettingsSchema = exports.NewsSettingsSchema = exports.BriefingManagedFeedsSchema = exports.NewsManagedFeedsSchema = exports.NewsBriefingFamilySchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_model_management_values_js_1 = require("../../agent/agent-model-management-values.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const ordinary_configuration_js_1 = require("../ordinary-configuration.cjs");
const feeds_js_1 = require("./feeds.cjs");
const briefing_js_1 = require("./briefing.cjs");
const rules_js_1 = require("./rules.cjs");
/** Only these two producers expose the configurable resource boundary. */
exports.NewsBriefingFamilySchema = zod_1.z.enum(['news', 'briefing']);
const cron = zod_1.z.string().min(1).max(100);
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
exports.NewsManagedFeedsSchema = feeds_js_1.NewsFeedsSchema.superRefine(validateFeeds);
exports.BriefingManagedFeedsSchema = feeds_js_1.BriefingFeedsSchema.superRefine(validateFeeds);
exports.NewsSettingsSchema = zod_1.z.object({
    feeds: exports.NewsManagedFeedsSchema,
    hoursBack: zod_1.z.number().int().min(1).max(168),
    cronSchedule: cron,
    rules: rules_js_1.NewsRulesSchema,
}).strict();
exports.BriefingManagedSettingsSchema = briefing_js_1.BriefingSettingsSchema.extend({
    feeds: exports.BriefingManagedFeedsSchema.optional(),
    cronSchedule: cron,
    newsCronSchedule: cron,
    rules: rules_js_1.BriefingRulesSchema,
}).strict();
const newsPatch = exports.NewsSettingsSchema.omit({ feeds: true, rules: true }).partial()
    .refine(value => Object.keys(value).length > 0, 'Empty settings patch');
const briefingPatch = exports.BriefingManagedSettingsSchema.omit({ feeds: true, rules: true }).partial()
    .refine(value => Object.keys(value).length > 0, 'Empty settings patch');
/** IDs, timestamps, priorities and operator authority are created only by the producer. */
exports.NewsRuleDraftSchema = rules_js_1.NewsRuleSchema.pick({ condition: true, action: true, description: true }).strict();
exports.BriefingRuleDraftSchema = rules_js_1.BriefingRuleSchema.pick({ condition: true, action: true, description: true }).strict();
const removeRule = zod_1.z.object({ type: zod_1.z.literal('rule.remove'), id: rules_js_1.NewsRuleSchema.shape.id }).strict();
exports.NewsChangeSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('settings.patch'), settings: newsPatch }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('feeds.replace'), feeds: exports.NewsManagedFeedsSchema }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('rule.add'), rule: exports.NewsRuleDraftSchema }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('rule.update'), id: rules_js_1.NewsRuleSchema.shape.id, rule: exports.NewsRuleDraftSchema }).strict(),
    removeRule,
]);
exports.BriefingChangeSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('settings.patch'), settings: briefingPatch }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('feeds.replace'), feeds: exports.BriefingManagedFeedsSchema }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('rule.add'), rule: exports.BriefingRuleDraftSchema }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('rule.update'), id: rules_js_1.BriefingRuleSchema.shape.id, rule: exports.BriefingRuleDraftSchema }).strict(),
    removeRule,
]);
const command = {
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    expectedVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
};
exports.NewsBriefingCommandSchema = zod_1.z.discriminatedUnion('family', [
    zod_1.z.object({ ...command, family: zod_1.z.literal('news'), changes: zod_1.z.array(exports.NewsChangeSchema).min(1).max(100) }).strict(),
    zod_1.z.object({ ...command, family: zod_1.z.literal('briefing'), changes: zod_1.z.array(exports.BriefingChangeSchema).min(1).max(100) }).strict(),
]);
function validateEffective(value, ctx) {
    if (value.effective && (value.effective.version > value.version
        || value.effective.version === value.version && !(0, ordinary_configuration_js_1.sameOrdinaryData)(value.settings, value.effective.settings))) {
        ctx.addIssue({ code: 'custom', path: ['effective'], message: 'Effective revision conflicts with saved settings' });
    }
}
function state(family, settings) {
    return zod_1.z.object({
        family: zod_1.z.literal(family), scope: capability_call_context_js_1.CapabilityAgentScopeSchema, version: agent_config_js_1.AgentConfigVersionSchema,
        settings,
        effective: zod_1.z.object({ version: agent_config_js_1.AgentConfigVersionSchema, settings, observedAt: zod_1.z.iso.datetime({ offset: true }) }).strict().nullable(),
        execution: zod_1.z.enum(['running', 'stopped', 'unknown']),
    }).strict();
}
exports.NewsBriefingStateSchema = zod_1.z.discriminatedUnion('family', [
    state('news', exports.NewsSettingsSchema).superRefine(validateEffective),
    state('briefing', exports.BriefingManagedSettingsSchema).superRefine(validateEffective),
]);
//# sourceMappingURL=news-briefing.js.map