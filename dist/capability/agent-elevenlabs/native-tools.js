import { z } from 'zod';
import { CapabilityToolSchema } from "../capability-tool.js";
import { CredentialKeySchema } from "../../vault/credential-link.js";
import { RefId, Text128 } from "../coach/shared.js";
const description = z.string().max(4000).optional();
const ElevenLabsNativeInputPropertySchema = z.lazy(() => z.discriminatedUnion('type', [
    z.object({ type: z.literal('string'), description, enum: z.array(z.string().max(500)).min(1).max(128).refine(x => new Set(x).size === x.length).optional(), minLength: z.number().int().nonnegative().max(65536).optional(), maxLength: z.number().int().nonnegative().max(65536).optional() }).strict(),
    z.object({ type: z.enum(['integer', 'number']), description, minimum: z.number().finite().optional(), maximum: z.number().finite().optional() }).strict(),
    z.object({ type: z.literal('boolean'), description }).strict(),
    z.object({ type: z.literal('object'), description, properties: z.record(z.string().min(1).max(128), ElevenLabsNativeInputPropertySchema), required: z.array(z.string().min(1).max(128)).max(128), additionalProperties: z.literal(false).optional() }).strict(),
])).superRefine((x, ctx) => {
    if ((x.type === 'number' || x.type === 'integer') && x.minimum !== undefined && x.maximum !== undefined && x.minimum > x.maximum)
        ctx.addIssue({ code: 'custom', message: 'Ordered numeric bounds' });
    if (x.type === 'string' && x.minLength !== undefined && x.maxLength !== undefined && x.minLength > x.maxLength)
        ctx.addIssue({ code: 'custom', message: 'Ordered string bounds' });
    if (x.type === 'object' && (Object.keys(x.properties ?? {}).length > 128 || new Set(x.required).size !== x.required?.length || x.required?.some(k => !Object.hasOwn(x.properties ?? {}, k))))
        ctx.addIssue({ code: 'custom', message: 'Required properties are declared once' });
});
function boundedSchema(raw) {
    const queue = [[raw, 0]], seen = new WeakSet();
    let nodes = 0;
    while (queue.length) {
        const [x, depth] = queue.pop();
        if (++nodes > 4096 || depth > 12)
            return false;
        if (x && typeof x === 'object') {
            if (seen.has(x) || ![Object.prototype, Array.prototype, null].includes(Object.getPrototypeOf(x)))
                return false;
            seen.add(x);
            const descriptors = Object.getOwnPropertyDescriptors(x);
            for (const [key, value] of Object.entries(descriptors)) {
                if (key === 'length' && Array.isArray(x))
                    continue;
                if (!Object.hasOwn(value, 'value') || ['__proto__', 'constructor', 'prototype'].includes(key))
                    return false;
                queue.push([value.value, depth + 1]);
            }
        }
        else if (typeof x === 'number' ? !Number.isFinite(x) : !['string', 'boolean', 'undefined'].includes(typeof x) && x !== null)
            return false;
    }
    return true;
}
export const ElevenLabsNativeInputSchemaSchema = z.custom(boundedSchema).pipe(CapabilityToolSchema.shape.inputSchema).transform((x, ctx) => { const parsed = ElevenLabsNativeInputPropertySchema.safeParse(x); if (!parsed.success) {
    for (const issue of parsed.error.issues)
        ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path });
    return z.NEVER;
} return parsed.data; }).refine(x => x?.type === 'object', 'Tool parameters are an object');
const base = { name: CapabilityToolSchema.shape.name.min(1).max(64).regex(/^[a-z][a-z0-9_]*$/), description: CapabilityToolSchema.shape.description.min(1).max(4000) };
export const ElevenLabsNativeHeaderLocatorSchema = z.object({
    name: z.string().min(1).max(128).regex(/^[A-Za-z][A-Za-z0-9-]*$/),
    source: z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('credential'), key: CredentialKeySchema }).strict(),
        z.object({ kind: z.literal('session'), bindingId: RefId }).strict(),
    ]),
}).strict();
export const ElevenLabsNativeClientToolSchema = z.object({ ...base, type: z.literal('client'),
    expects_response: z.boolean(), response_timeout_secs: z.number().int().positive().max(120),
    execution_mode: z.enum(['immediate', 'post_tool_speech']).optional(), interruption_mode: z.enum(['allow', 'block']).optional(),
    parameters: ElevenLabsNativeInputSchemaSchema,
}).strict();
export const ElevenLabsNativeWebhookToolSchema = z.object({ ...base, type: z.literal('webhook'),
    response_timeout_secs: z.number().int().positive().max(120),
    api_schema: z.object({ method: z.literal('POST'), path: z.string().min(1).max(2048).regex(/^\/[^?#]*$/),
        request_body_schema: ElevenLabsNativeInputSchemaSchema,
        request_headers: z.array(ElevenLabsNativeHeaderLocatorSchema).max(16).refine(x => new Set(x.map(h => h.name.toLowerCase())).size === x.length),
    }).strict(),
}).strict();
export const ElevenLabsNativeBuiltinToolSchema = z.object({ ...base, type: z.literal('system'),
    params: z.object({ system_tool_type: z.enum(['end_call', 'skip_turn']) }).strict(),
}).strict().refine(x => x.name === x.params.system_tool_type, 'Builtin name and system type agree');
export const ElevenLabsNativeToolSchema = z.discriminatedUnion('type', [ElevenLabsNativeClientToolSchema, ElevenLabsNativeWebhookToolSchema, ElevenLabsNativeBuiltinToolSchema]);
export const ElevenLabsNativeToolsSchema = z.array(ElevenLabsNativeToolSchema).max(64).refine(x => new Set(x.map(t => t.name)).size === x.length, 'Unique native tools');
export const ElevenLabsNativeToolReferenceSchema = z.object({ name: Text128, kind: z.enum(['client', 'webhook', 'system']) }).strict();
//# sourceMappingURL=native-tools.js.map