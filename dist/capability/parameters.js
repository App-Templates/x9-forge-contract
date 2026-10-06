import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema } from "./ricerca/agent-config.js";
/** B1: ordinary configuration, never credentials. No product default is selected by the bridge. */
export const CapabilityParameterKeySchema = z.string().regex(/^[a-z][a-zA-Z0-9_.-]*$/);
export const CapabilityParameterValueSchema = z.union([z.number().finite(), z.string(), z.boolean()]);
export const CapabilityParameterOriginSchema = z.enum(['platform_default', 'agent_override', 'needs_choice']);
export const CapabilityParameterStatusSchema = z.enum(['decided', 'proposed']);
export const CapabilityParameterApplicationSchema = z.enum(['immediate', 'next_apply']);
const TextSchema = z.string().trim().min(1);
const metadata = {
    key: CapabilityParameterKeySchema,
    label: TextSchema,
    description: TextSchema,
    explanation: TextSchema.optional(),
    group: TextSchema.optional(),
    unit: TextSchema.optional(),
    status: CapabilityParameterStatusSchema,
    reference: TextSchema,
    /** D1: parameters read directly by a capability apply immediately; others wait for manual Apply. */
    appliesWhen: CapabilityParameterApplicationSchema,
    consumes: z.boolean(),
};
export const CapabilityParameterOptionSchema = z.object({ value: TextSchema, label: TextSchema }).strict();
const definition = z.discriminatedUnion('type', [
    z.object({ ...metadata, type: z.literal('number'), min: z.number().finite().optional(),
        max: z.number().finite().optional(), platformDefault: z.number().finite().optional() }).strict(),
    z.object({ ...metadata, type: z.literal('integer'), min: z.number().int().optional(),
        max: z.number().int().optional(), platformDefault: z.number().int().optional() }).strict(),
    z.object({ ...metadata, type: z.literal('string'), minLength: z.number().int().nonnegative().optional(),
        maxLength: z.number().int().nonnegative().optional(), platformDefault: z.string().optional() }).strict(),
    z.object({ ...metadata, type: z.literal('boolean'), platformDefault: z.boolean().optional() }).strict(),
    z.object({ ...metadata, type: z.literal('enum'), options: z.array(CapabilityParameterOptionSchema).min(1),
        platformDefault: z.string().optional() }).strict(),
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
export const CapabilityParameterSchema = definition.superRefine((parameter, ctx) => {
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
export const CapabilityAgentParameterSchema = z.object({
    parameter: CapabilityParameterSchema,
    origin: CapabilityParameterOriginSchema,
    value: CapabilityParameterValueSchema.optional(),
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
export const CapabilityParametersDeclarationSchema = z.object({
    parameters: z.array(CapabilityParameterSchema),
    consumes: z.boolean(),
    spendLedger: z.boolean(),
}).strict().refine(declaration => new Set(declaration.parameters.map(parameter => parameter.key)).size === declaration.parameters.length, { message: 'parameter keys must be unique', path: ['parameters'] });
export const CapabilityAgentParametersSchema = z.object({
    agentId: CapabilityAgentIdSchema,
    capability: TextSchema,
    version: AgentConfigVersionSchema,
    parameters: z.array(CapabilityAgentParameterSchema),
}).strict().refine(agent => new Set(agent.parameters.map(resolved => resolved.parameter.key)).size === agent.parameters.length, { message: 'resolved parameter keys must be unique', path: ['parameters'] });
//# sourceMappingURL=parameters.js.map