"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityAgentParametersSchema = exports.CapabilityParametersDeclarationSchema = exports.CapabilityAgentParameterSchema = exports.CapabilityParameterSchema = exports.CapabilityParameterOptionSchema = exports.CapabilityParameterApplicationSchema = exports.CapabilityParameterEditorRoleSchema = exports.CapabilityParameterStatusSchema = exports.CapabilityParameterOriginSchema = exports.CapabilityParameterValueSchema = exports.CapabilityParameterKeySchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("./ricerca/agent-config.cjs");
/**
 * B1: ordinary configuration, never credentials. No product default is selected by the bridge.
 * A key is the dotted path in the per-agent configuration body of this capability.
 * Changes are saved with the existing PUT at capAgentConfigPath(agentId)
 * (/internal/capability/agents/:agentId/config); B1 adds no route.
 */
exports.CapabilityParameterKeySchema = zod_1.z.string().max(100).regex(/^[a-z][a-zA-Z0-9_.-]*$/);
const ListValueSchema = zod_1.z.array(zod_1.z.string().max(2000)).max(100);
exports.CapabilityParameterValueSchema = zod_1.z.union([zod_1.z.number().finite(), zod_1.z.string().max(8000), zod_1.z.boolean(), ListValueSchema]);
exports.CapabilityParameterOriginSchema = zod_1.z.enum(['platform_default', 'agent_override', 'needs_choice']);
exports.CapabilityParameterStatusSchema = zod_1.z.enum(['decided', 'proposed']);
exports.CapabilityParameterEditorRoleSchema = zod_1.z.enum(['superadmin', 'owner']);
exports.CapabilityParameterApplicationSchema = zod_1.z.enum(['immediate', 'next_apply']);
const TextSchema = zod_1.z.string().trim().min(1).max(200);
const DescriptionSchema = zod_1.z.string().trim().min(1).max(2000);
const PatternSchema = zod_1.z.string().min(1).max(200).refine(pattern => {
    try {
        new RegExp(pattern);
        return true;
    }
    catch {
        return false;
    }
}, 'invalid regular expression');
const metadata = {
    key: exports.CapabilityParameterKeySchema,
    label: TextSchema,
    description: DescriptionSchema,
    explanation: DescriptionSchema.optional(),
    group: TextSchema.optional(),
    unit: TextSchema.optional(),
    status: exports.CapabilityParameterStatusSchema,
    reference: DescriptionSchema,
    /** D1: parameters read directly by a capability apply immediately; others wait for manual Apply. */
    appliesWhen: exports.CapabilityParameterApplicationSchema,
    consumes: zod_1.z.boolean(),
    /** Whether this configuration field may be absent, e.g. an optional digest/read model. */
    optional: zod_1.z.boolean(),
    editableBy: zod_1.z.array(exports.CapabilityParameterEditorRoleSchema).min(1).max(2)
        .refine(roles => new Set(roles).size === roles.length, 'editor roles must be unique'),
};
exports.CapabilityParameterOptionSchema = zod_1.z.object({ value: DescriptionSchema, label: TextSchema }).strict();
const OptionsSchema = zod_1.z.array(exports.CapabilityParameterOptionSchema).min(1).max(50);
const definition = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('number'), min: zod_1.z.number().finite().optional(),
        max: zod_1.z.number().finite().optional(), platformDefault: zod_1.z.number().finite().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('integer'), min: zod_1.z.number().int().optional(),
        max: zod_1.z.number().int().optional(), platformDefault: zod_1.z.number().int().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('string'), minLength: zod_1.z.number().int().nonnegative().max(8000).optional(),
        maxLength: zod_1.z.number().int().nonnegative().max(8000).optional(), pattern: PatternSchema.optional(),
        platformDefault: zod_1.z.string().max(8000).optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('boolean'), platformDefault: zod_1.z.boolean().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('enum'), options: OptionsSchema,
        platformDefault: zod_1.z.string().max(2000).optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('string_list'), minItems: zod_1.z.number().int().nonnegative().max(100).optional(),
        maxItems: zod_1.z.number().int().nonnegative().max(100).optional(), options: OptionsSchema.optional(),
        pattern: PatternSchema.optional(), platformDefault: ListValueSchema.optional() }).strict(),
]);
function matches(pattern, value) {
    if (pattern === undefined)
        return true;
    try {
        return new RegExp(pattern).test(value);
    }
    catch {
        return false;
    }
}
/** Validate a value against the capability's declared constraints, without coercing it. */
function accepts(parameter, value) {
    switch (parameter.type) {
        case 'number':
        case 'integer':
            return typeof value === 'number' && Number.isFinite(value)
                && (parameter.type !== 'integer' || Number.isInteger(value))
                && (parameter.min === undefined || value >= parameter.min)
                && (parameter.max === undefined || value <= parameter.max);
        case 'string':
            return typeof value === 'string'
                && (parameter.minLength === undefined || value.length >= parameter.minLength)
                && (parameter.maxLength === undefined || value.length <= parameter.maxLength)
                && matches(parameter.pattern, value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'enum':
            return typeof value === 'string' && parameter.options.some(option => option.value === value);
        case 'string_list':
            return Array.isArray(value)
                && (parameter.minItems === undefined || value.length >= parameter.minItems)
                && (parameter.maxItems === undefined || value.length <= parameter.maxItems)
                && value.every(item => matches(parameter.pattern, item)
                    && (parameter.options === undefined || parameter.options.some(option => option.value === item)));
    }
}
exports.CapabilityParameterSchema = definition.superRefine((parameter, ctx) => {
    if ((parameter.type === 'number' || parameter.type === 'integer')
        && parameter.min !== undefined && parameter.max !== undefined && parameter.min > parameter.max) {
        ctx.addIssue({ code: 'custom', message: 'minimum exceeds maximum', path: ['min'] });
    }
    if (parameter.type === 'string' && parameter.minLength !== undefined && parameter.maxLength !== undefined
        && parameter.minLength > parameter.maxLength) {
        ctx.addIssue({ code: 'custom', message: 'minimum length exceeds maximum length', path: ['minLength'] });
    }
    if (parameter.type === 'string_list' && parameter.minItems !== undefined && parameter.maxItems !== undefined
        && parameter.minItems > parameter.maxItems) {
        ctx.addIssue({ code: 'custom', message: 'minimum items exceeds maximum items', path: ['minItems'] });
    }
    if ((parameter.type === 'enum' || parameter.type === 'string_list') && parameter.options !== undefined
        && new Set(parameter.options.map(option => option.value)).size !== parameter.options.length) {
        ctx.addIssue({ code: 'custom', message: 'option values must be unique', path: ['options'] });
    }
    if (parameter.platformDefault !== undefined && !accepts(parameter, parameter.platformDefault)) {
        ctx.addIssue({ code: 'custom', message: 'platform default violates declared constraints', path: ['platformDefault'] });
    }
});
function sameValue(left, right) {
    return Array.isArray(left) ? Array.isArray(right) && left.length === right.length && left.every((item, index) => item === right[index])
        : left === right;
}
/** A resolved parameter carries the source of its value. Absence is explicit, never a fabricated default. */
exports.CapabilityAgentParameterSchema = zod_1.z.object({
    parameter: exports.CapabilityParameterSchema,
    origin: exports.CapabilityParameterOriginSchema,
    value: exports.CapabilityParameterValueSchema.optional(),
}).strict().superRefine((resolved, ctx) => {
    const { parameter, origin, value } = resolved;
    if (origin === 'needs_choice') {
        if (value !== undefined || parameter.platformDefault !== undefined) {
            ctx.addIssue({ code: 'custom', message: 'needs_choice must have neither a value nor a platform default' });
        }
        return;
    }
    if (origin === 'agent_override' && parameter.optional && value === undefined)
        return;
    if (value === undefined || !accepts(parameter, value)) {
        ctx.addIssue({ code: 'custom', message: 'resolved value violates declared constraints', path: ['value'] });
    }
    if (origin === 'platform_default'
        && (parameter.platformDefault === undefined || !sameValue(value, parameter.platformDefault))) {
        ctx.addIssue({ code: 'custom', message: 'platform_default must match the declared default', path: ['value'] });
    }
});
exports.CapabilityParametersDeclarationSchema = zod_1.z.object({
    parameters: zod_1.z.array(exports.CapabilityParameterSchema).max(100),
    consumes: zod_1.z.boolean(),
    spendLedger: zod_1.z.boolean(),
}).strict().refine(declaration => new Set(declaration.parameters.map(parameter => parameter.key)).size === declaration.parameters.length, { message: 'parameter keys must be unique', path: ['parameters'] });
exports.CapabilityAgentParametersSchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    capability: zod_1.z.string().trim().min(1).max(100),
    /** The version of this capability's per-agent configuration, used by its existing config PUT. */
    version: agent_config_js_1.AgentConfigVersionSchema,
    parameters: zod_1.z.array(exports.CapabilityAgentParameterSchema).max(100),
}).strict().refine(agent => new Set(agent.parameters.map(resolved => resolved.parameter.key)).size === agent.parameters.length, { message: 'resolved parameter keys must be unique', path: ['parameters'] });
//# sourceMappingURL=parameters.js.map