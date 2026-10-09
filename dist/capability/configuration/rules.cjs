"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityRulesSchema = exports.NetatmoRulesSchema = exports.NewsRulesSchema = exports.BriefingRulesSchema = exports.SecurityRuleSchema = exports.NetatmoRuleSchema = exports.NewsRuleSchema = exports.BriefingRuleSchema = exports.SecurityActionSchema = exports.NetatmoActionSchema = exports.NewsActionSchema = exports.BriefingActionSchema = void 0;
exports.makeCapabilityRuleSchema = makeCapabilityRuleSchema;
exports.parseCapabilityRulesWrite = parseCapabilityRulesWrite;
exports.detectSecurityRuleConflicts = detectSecurityRuleConflicts;
const zod_1 = require("zod");
const conditions_js_1 = require("./conditions.cjs");
exports.BriefingActionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('skip_section'), section: zod_1.z.string() }).strict(),
    // The producer's arbitrary add_section.config has no typed consumer codec yet.
    zod_1.z.object({ type: zod_1.z.literal('add_section'), section: zod_1.z.string() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_tone'), tone: zod_1.z.enum(['formal', 'friendly', 'terse']) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_maxWords'), maxWords: zod_1.z.number().int().min(50).max(2000) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_greeting'), greeting: zod_1.z.string() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('add_feed_category'), category: zod_1.z.string() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('skip_feed_category'), category: zod_1.z.string() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('add_closing'), text: zod_1.z.string() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_cronSchedule'), cron: zod_1.z.string() }).strict(),
]);
exports.NewsActionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('skip_category'), category: zod_1.z.string().min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('add_category'), category: zod_1.z.string().min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_hours_back'), hours: zod_1.z.number().int().min(1).max(168) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_max_per_category'), category: zod_1.z.string().min(1), max: zod_1.z.number().int().min(1).max(20) }).strict(),
]);
exports.NetatmoActionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('auto_light_on'), module_id: zod_1.z.string().min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('auto_light_off'), module_id: zod_1.z.string().min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('suppress_automation'), module_id: zod_1.z.string().min(1) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_is_dark_offset'), offset_minutes: zod_1.z.number().int().min(-120).max(120) }).strict(),
]);
exports.SecurityActionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('set_pir'), enabled: zod_1.z.boolean() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_sleep'), enabled: zod_1.z.boolean() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_ir'), mode: zod_1.z.enum(['on', 'off', 'auto']) }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('set_floodlight'), enabled: zod_1.z.boolean() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('auto_patrol') }).strict(),
]);
function makeCapabilityRuleSchema(skill, action) {
    return zod_1.z.object({
        id: zod_1.z.string().uuid(), skill: zod_1.z.literal(skill), condition: conditions_js_1.ConditionSchema, action,
        priority: zod_1.z.number().int().min(0).max(199), created_by: zod_1.z.enum(['operator', 'user']),
        created_at: zod_1.z.string().datetime({ offset: true }), description: zod_1.z.string(), locked: zod_1.z.boolean().optional(),
    }).strict();
}
exports.BriefingRuleSchema = makeCapabilityRuleSchema('briefing', exports.BriefingActionSchema);
exports.NewsRuleSchema = makeCapabilityRuleSchema('news', exports.NewsActionSchema);
exports.NetatmoRuleSchema = makeCapabilityRuleSchema('netatmo', exports.NetatmoActionSchema);
exports.SecurityRuleSchema = makeCapabilityRuleSchema('security', exports.SecurityActionSchema);
function rulesList(schema) {
    return zod_1.z.array(schema).max(50).refine(rules => new Set(rules.map(r => r.id)).size === rules.length, { message: 'Rule IDs must be unique' });
}
exports.BriefingRulesSchema = rulesList(exports.BriefingRuleSchema);
exports.NewsRulesSchema = rulesList(exports.NewsRuleSchema);
exports.NetatmoRulesSchema = rulesList(exports.NetatmoRuleSchema);
exports.SecurityRulesSchema = rulesList(exports.SecurityRuleSchema);
const ruleSchemas = { briefing: exports.BriefingRulesSchema, news: exports.NewsRulesSchema, netatmo: exports.NetatmoRulesSchema, security: exports.SecurityRulesSchema };
/** An ordinary configuration write cannot manufacture operator/audit authority or devices. */
function parseCapabilityRulesWrite(family, value, authority) {
    const schema = ruleSchemas[family];
    const previous = schema.parse(authority.current);
    const next = schema.parse(value);
    const byId = new Map(previous.map(rule => [rule.id, rule]));
    for (const rule of previous) {
        if ((rule.locked || rule.created_by === 'operator') && !next.some(candidate => candidate.id === rule.id && JSON.stringify(candidate) === JSON.stringify(rule))) {
            throw new Error('Locked/operator rule cannot change or disappear');
        }
    }
    for (const rule of next) {
        const current = byId.get(rule.id);
        if (!current)
            throw new Error('Rule record must be created by the authoritative producer');
        for (const field of ['created_by', 'created_at', 'priority', 'locked']) {
            if (rule[field] !== current[field])
                throw new Error('Rule authority metadata cannot change');
        }
        if ('module_id' in rule.action && !authority.authorizedResourceIds.has(rule.action.module_id)) {
            throw new Error('Rule resource is outside the authorized owner scope');
        }
    }
    return next;
}
/** Existing security detector: opposing values of the same action conflict. */
function detectSecurityRuleConflicts(candidate, existing) {
    const incoming = exports.SecurityRuleSchema.parse(candidate);
    return existing.map(rule => exports.SecurityRuleSchema.parse(rule)).filter(rule => {
        const a = incoming.action;
        const b = rule.action;
        if (a.type !== b.type)
            return false;
        if ('enabled' in a && 'enabled' in b)
            return a.enabled !== b.enabled;
        if (a.type === 'set_ir' && b.type === 'set_ir')
            return a.mode !== b.mode;
        return false;
    });
}
//# sourceMappingURL=rules.js.map