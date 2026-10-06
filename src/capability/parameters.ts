import { z } from 'zod';
import { AgentConfigVersionSchema, CapabilityAgentIdSchema } from './ricerca/agent-config.js';

/**
 * B1: ordinary configuration, never credentials. No product default is selected by the bridge.
 * A key is the dotted path in the per-agent configuration body of this capability.
 * Changes are saved with the existing PUT at capAgentConfigPath(agentId)
 * (/internal/capability/agents/:agentId/config); B1 adds no route.
 */
export const CapabilityParameterKeySchema = z.string().max(100).regex(/^[a-z][a-zA-Z0-9_.-]*$/);
const ListValueSchema = z.array(z.string().max(2000)).max(100);
export const CapabilityParameterValueSchema = z.union([z.number().finite(), z.string().max(8000), z.boolean(), ListValueSchema]);
export const CapabilityParameterOriginSchema = z.enum(['platform_default', 'agent_override', 'needs_choice']);
export const CapabilityParameterStatusSchema = z.enum(['decided', 'proposed']);
export const CapabilityParameterEditorRoleSchema = z.enum(['superadmin', 'owner']);
export const CapabilityParameterApplicationSchema = z.enum(['immediate', 'next_apply']);

const TextSchema = z.string().trim().min(1).max(200);
const DescriptionSchema = z.string().trim().min(1).max(2000);
const PatternSchema = z.string().min(1).max(200).refine(pattern => {
  try { new RegExp(pattern); return true; } catch { return false; }
}, 'invalid regular expression');
const metadata = {
  key: CapabilityParameterKeySchema,
  label: TextSchema,
  description: DescriptionSchema,
  explanation: DescriptionSchema.optional(),
  group: TextSchema.optional(),
  unit: TextSchema.optional(),
  status: CapabilityParameterStatusSchema,
  reference: DescriptionSchema,
  /** D1: parameters read directly by a capability apply immediately; others wait for manual Apply. */
  appliesWhen: CapabilityParameterApplicationSchema,
  consumes: z.boolean(),
  /** Whether this configuration field may be absent, e.g. an optional digest/read model. */
  optional: z.boolean(),
  editableBy: z.array(CapabilityParameterEditorRoleSchema).min(1).max(2)
    .refine(roles => new Set(roles).size === roles.length, 'editor roles must be unique'),
};
export const CapabilityParameterOptionSchema = z.object({ value: DescriptionSchema, label: TextSchema }).strict();
const OptionsSchema = z.array(CapabilityParameterOptionSchema).min(1).max(50);
const definition = z.discriminatedUnion('type', [
  z.object({ ...metadata, type: z.literal('number'), min: z.number().finite().optional(),
    max: z.number().finite().optional(), platformDefault: z.number().finite().optional() }).strict(),
  z.object({ ...metadata, type: z.literal('integer'), min: z.number().int().optional(),
    max: z.number().int().optional(), platformDefault: z.number().int().optional() }).strict(),
  z.object({ ...metadata, type: z.literal('string'), minLength: z.number().int().nonnegative().max(8000).optional(),
    maxLength: z.number().int().nonnegative().max(8000).optional(), pattern: PatternSchema.optional(),
    platformDefault: z.string().max(8000).optional() }).strict(),
  z.object({ ...metadata, type: z.literal('boolean'), platformDefault: z.boolean().optional() }).strict(),
  z.object({ ...metadata, type: z.literal('enum'), options: OptionsSchema,
    platformDefault: z.string().max(2000).optional() }).strict(),
  z.object({ ...metadata, type: z.literal('string_list'), minItems: z.number().int().nonnegative().max(100).optional(),
    maxItems: z.number().int().nonnegative().max(100).optional(), options: OptionsSchema.optional(),
    pattern: PatternSchema.optional(), platformDefault: ListValueSchema.optional() }).strict(),
]);
type ParameterDefinition = z.infer<typeof definition>;

function matches(pattern: string | undefined, value: string): boolean {
  if (pattern === undefined) return true;
  try { return new RegExp(pattern).test(value); } catch { return false; }
}

/** Validate a value against the capability's declared constraints, without coercing it. */
function accepts(parameter: ParameterDefinition, value: z.infer<typeof CapabilityParameterValueSchema>): boolean {
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

export const CapabilityParameterSchema = definition.superRefine((parameter, ctx) => {
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
export type CapabilityParameter = z.infer<typeof CapabilityParameterSchema>;

function sameValue(left: z.infer<typeof CapabilityParameterValueSchema> | undefined,
  right: z.infer<typeof CapabilityParameterValueSchema> | undefined): boolean {
  return Array.isArray(left) ? Array.isArray(right) && left.length === right.length && left.every((item, index) => item === right[index])
    : left === right;
}

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
  if (origin === 'agent_override' && parameter.optional && value === undefined) return;
  if (value === undefined || !accepts(parameter, value)) {
    ctx.addIssue({ code: 'custom', message: 'resolved value violates declared constraints', path: ['value'] });
  }
  if (origin === 'platform_default'
    && (parameter.platformDefault === undefined || !sameValue(value, parameter.platformDefault))) {
    ctx.addIssue({ code: 'custom', message: 'platform_default must match the declared default', path: ['value'] });
  }
});
export type CapabilityAgentParameter = z.infer<typeof CapabilityAgentParameterSchema>;
export const CapabilityParametersDeclarationSchema = z.object({
  parameters: z.array(CapabilityParameterSchema).max(100),
  consumes: z.boolean(),
  spendLedger: z.boolean(),
}).strict().refine(declaration => new Set(declaration.parameters.map(parameter => parameter.key)).size === declaration.parameters.length,
  { message: 'parameter keys must be unique', path: ['parameters'] });
export type CapabilityParametersDeclaration = z.infer<typeof CapabilityParametersDeclarationSchema>;
export const CapabilityAgentParametersSchema = z.object({
  agentId: CapabilityAgentIdSchema,
  capability: z.string().trim().min(1).max(100),
  /** The version of this capability's per-agent configuration, used by its existing config PUT. */
  version: AgentConfigVersionSchema,
  parameters: z.array(CapabilityAgentParameterSchema).max(100),
}).strict().refine(agent => new Set(agent.parameters.map(resolved => resolved.parameter.key)).size === agent.parameters.length,
  { message: 'resolved parameter keys must be unique', path: ['parameters'] });
export type CapabilityAgentParameters = z.infer<typeof CapabilityAgentParametersSchema>;
export type CapabilityParameterKey = z.infer<typeof CapabilityParameterKeySchema>;
export type CapabilityParameterValue = z.infer<typeof CapabilityParameterValueSchema>;
export type CapabilityParameterOrigin = z.infer<typeof CapabilityParameterOriginSchema>;
export type CapabilityParameterStatus = z.infer<typeof CapabilityParameterStatusSchema>;
export type CapabilityParameterApplication = z.infer<typeof CapabilityParameterApplicationSchema>;
export type CapabilityParameterOption = z.infer<typeof CapabilityParameterOptionSchema>;

export type CapabilityParameterEditorRole = z.infer<typeof CapabilityParameterEditorRoleSchema>;
