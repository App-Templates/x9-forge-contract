"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityAgentParametersSchema = exports.CapabilityParametersDeclarationSchema = exports.CapabilityAgentParameterSchema = exports.CapabilityParameterSchema = exports.CapabilityParameterOptionSchema = exports.CapabilityParameterApplicationSchema = exports.CapabilityParameterStatusSchema = exports.CapabilityParameterOriginSchema = exports.CapabilityParameterValueSchema = exports.CapabilityParameterKeySchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("./ricerca/agent-config.cjs");
/** B1: ordinary configuration, never credentials. No product default is selected by the bridge. */
exports.CapabilityParameterKeySchema = zod_1.z.string().regex(/^[a-z][a-zA-Z0-9_.-]*$/);
exports.CapabilityParameterValueSchema = zod_1.z.union([zod_1.z.number().finite(), zod_1.z.string(), zod_1.z.boolean()]);
exports.CapabilityParameterOriginSchema = zod_1.z.enum(['platform_default', 'agent_override', 'needs_choice']);
exports.CapabilityParameterStatusSchema = zod_1.z.enum(['decided', 'proposed']);
exports.CapabilityParameterApplicationSchema = zod_1.z.enum(['immediate', 'next_apply']);
const TextSchema = zod_1.z.string().trim().min(1);
const metadata = {
    key: exports.CapabilityParameterKeySchema,
    label: TextSchema,
    description: TextSchema,
    explanation: TextSchema.optional(),
    group: TextSchema.optional(),
    unit: TextSchema.optional(),
    status: exports.CapabilityParameterStatusSchema,
    reference: TextSchema,
    /** D1: parameters read directly by a capability apply immediately; others wait for manual Apply. */
    appliesWhen: exports.CapabilityParameterApplicationSchema,
    consumes: zod_1.z.boolean(),
};
exports.CapabilityParameterOptionSchema = zod_1.z.object({ value: TextSchema, label: TextSchema }).strict();
const definition = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('number'), min: zod_1.z.number().finite().optional(),
        max: zod_1.z.number().finite().optional(), platformDefault: zod_1.z.number().finite().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('integer'), min: zod_1.z.number().int().optional(),
        max: zod_1.z.number().int().optional(), platformDefault: zod_1.z.number().int().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('string'), minLength: zod_1.z.number().int().nonnegative().optional(),
        maxLength: zod_1.z.number().int().nonnegative().optional(), platformDefault: zod_1.z.string().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('boolean'), platformDefault: zod_1.z.boolean().optional() }).strict(),
    zod_1.z.object({ ...metadata, type: zod_1.z.literal('enum'), options: zod_1.z.array(exports.CapabilityParameterOptionSchema).min(1),
        platformDefault: zod_1.z.string().optional() }).strict(),
]);
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
                && (parameter.maxLength === undefined || value.length <= parameter.maxLength);
        case 'boolean':
            return typeof value === 'boolean';
        case 'enum':
            return typeof value === 'string' && parameter.options.some(option => option.value === value);
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
    if (parameter.type === 'enum' && new Set(parameter.options.map(option => option.value)).size !== parameter.options.length) {
        ctx.addIssue({ code: 'custom', message: 'option values must be unique', path: ['options'] });
    }
    if (parameter.platformDefault !== undefined && !accepts(parameter, parameter.platformDefault)) {
        ctx.addIssue({ code: 'custom', message: 'platform default violates declared constraints', path: ['platformDefault'] });
    }
});
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
    if (value === undefined || !accepts(parameter, value)) {
        ctx.addIssue({ code: 'custom', message: 'resolved value violates declared constraints', path: ['value'] });
    }
    if (origin === 'platform_default'
        && (parameter.platformDefault === undefined || value !== parameter.platformDefault)) {
        ctx.addIssue({ code: 'custom', message: 'platform_default must match the declared default', path: ['value'] });
    }
});
exports.CapabilityParametersDeclarationSchema = zod_1.z.object({
    parameters: zod_1.z.array(exports.CapabilityParameterSchema),
    consumes: zod_1.z.boolean(),
    spendLedger: zod_1.z.boolean(),
}).strict().refine(declaration => new Set(declaration.parameters.map(parameter => parameter.key)).size === declaration.parameters.length, { message: 'parameter keys must be unique', path: ['parameters'] });
exports.CapabilityAgentParametersSchema = zod_1.z.object({
    agentId: agent_config_js_1.CapabilityAgentIdSchema,
    capability: TextSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    parameters: zod_1.z.array(exports.CapabilityAgentParameterSchema),
}).strict().refine(agent => new Set(agent.parameters.map(resolved => resolved.parameter.key)).size === agent.parameters.length, { message: 'resolved parameter keys must be unique', path: ['parameters'] });
//# sourceMappingURL=parameters.js.map