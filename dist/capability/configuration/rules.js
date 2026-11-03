import { z } from 'zod';
import { ConditionSchema } from "./conditions.js";
export const BriefingActionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('skip_section'), section: z.string() }).strict(),
    // The producer's arbitrary add_section.config has no typed consumer codec yet.
    z.object({ type: z.literal('add_section'), section: z.string() }).strict(),
    z.object({ type: z.literal('set_tone'), tone: z.enum(['formal', 'friendly', 'terse']) }).strict(),
    z.object({ type: z.literal('set_maxWords'), maxWords: z.number().int().min(50).max(2000) }).strict(),
    z.object({ type: z.literal('set_greeting'), greeting: z.string() }).strict(),
    z.object({ type: z.literal('add_feed_category'), category: z.string() }).strict(),
    z.object({ type: z.literal('skip_feed_category'), category: z.string() }).strict(),
    z.object({ type: z.literal('add_closing'), text: z.string() }).strict(),
    z.object({ type: z.literal('set_cronSchedule'), cron: z.string() }).strict(),
]);
export const NewsActionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('skip_category'), category: z.string().min(1) }).strict(),
    z.object({ type: z.literal('add_category'), category: z.string().min(1) }).strict(),
    z.object({ type: z.literal('set_hours_back'), hours: z.number().int().min(1).max(168) }).strict(),
    z.object({ type: z.literal('set_max_per_category'), category: z.string().min(1), max: z.number().int().min(1).max(20) }).strict(),
]);
export const NetatmoActionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('auto_light_on'), module_id: z.string().min(1) }).strict(),
    z.object({ type: z.literal('auto_light_off'), module_id: z.string().min(1) }).strict(),
    z.object({ type: z.literal('suppress_automation'), module_id: z.string().min(1) }).strict(),
    z.object({ type: z.literal('set_is_dark_offset'), offset_minutes: z.number().int().min(-120).max(120) }).strict(),
]);
export const SecurityActionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('set_pir'), enabled: z.boolean() }).strict(),
    z.object({ type: z.literal('set_sleep'), enabled: z.boolean() }).strict(),
    z.object({ type: z.literal('set_ir'), mode: z.enum(['on', 'off', 'auto']) }).strict(),
    z.object({ type: z.literal('set_floodlight'), enabled: z.boolean() }).strict(),
    z.object({ type: z.literal('auto_patrol') }).strict(),
]);
export function makeCapabilityRuleSchema(skill, action) {
    return z.object({
        id: z.string().uuid(), skill: z.literal(skill), condition: ConditionSchema, action,
        priority: z.number().int().min(0).max(199), created_by: z.enum(['operator', 'user']),
        created_at: z.string().datetime({ offset: true }), description: z.string(), locked: z.boolean().optional(),
    }).strict();
}
export const BriefingRuleSchema = makeCapabilityRuleSchema('briefing', BriefingActionSchema);
export const NewsRuleSchema = makeCapabilityRuleSchema('news', NewsActionSchema);
export const NetatmoRuleSchema = makeCapabilityRuleSchema('netatmo', NetatmoActionSchema);
export const SecurityRuleSchema = makeCapabilityRuleSchema('security', SecurityActionSchema);
function rulesList(schema) {
    return z.array(schema).max(50).refine(rules => new Set(rules.map(r => r.id)).size === rules.length, { message: 'Rule IDs must be unique' });
}
export const BriefingRulesSchema = rulesList(BriefingRuleSchema);
export const NewsRulesSchema = rulesList(NewsRuleSchema);
export const NetatmoRulesSchema = rulesList(NetatmoRuleSchema);
export const SecurityRulesSchema = rulesList(SecurityRuleSchema);
const ruleSchemas = { briefing: BriefingRulesSchema, news: NewsRulesSchema, netatmo: NetatmoRulesSchema, security: SecurityRulesSchema };
/** An ordinary configuration write cannot manufacture operator/audit authority or devices. */
export function parseCapabilityRulesWrite(family, value, authority) {
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
export function detectSecurityRuleConflicts(candidate, existing) {
    const incoming = SecurityRuleSchema.parse(candidate);
    return existing.map(rule => SecurityRuleSchema.parse(rule)).filter(rule => {
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