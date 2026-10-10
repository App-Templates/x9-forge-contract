"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsNativeToolReferenceSchema = exports.ElevenLabsNativeToolsSchema = exports.ElevenLabsNativeToolSchema = exports.ElevenLabsNativeBuiltinToolSchema = exports.ElevenLabsNativeWebhookToolSchema = exports.ElevenLabsNativeClientToolSchema = exports.ElevenLabsNativeHeaderLocatorSchema = exports.ElevenLabsNativeInputSchemaSchema = void 0;
const zod_1 = require("zod");
const capability_tool_js_1 = require("../capability-tool.cjs");
const credential_link_js_1 = require("../../vault/credential-link.cjs");
const shared_js_1 = require("../coach/shared.cjs");
const description = zod_1.z.string().max(4000).optional();
const ElevenLabsNativeInputPropertySchema = zod_1.z.lazy(() => zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('string'), description, enum: zod_1.z.array(zod_1.z.string().max(500)).min(1).max(128).refine(x => new Set(x).size === x.length).optional(), minLength: zod_1.z.number().int().nonnegative().max(65536).optional(), maxLength: zod_1.z.number().int().nonnegative().max(65536).optional() }).strict(),
    zod_1.z.object({ type: zod_1.z.enum(['integer', 'number']), description, minimum: zod_1.z.number().finite().optional(), maximum: zod_1.z.number().finite().optional() }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('boolean'), description }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('object'), description, properties: zod_1.z.record(zod_1.z.string().min(1).max(128), ElevenLabsNativeInputPropertySchema), required: zod_1.z.array(zod_1.z.string().min(1).max(128)).max(128), additionalProperties: zod_1.z.literal(false).optional() }).strict(),
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
exports.ElevenLabsNativeInputSchemaSchema = zod_1.z.custom(boundedSchema).pipe(capability_tool_js_1.CapabilityToolSchema.shape.inputSchema).transform((x, ctx) => { const parsed = ElevenLabsNativeInputPropertySchema.safeParse(x); if (!parsed.success) {
    for (const issue of parsed.error.issues)
        ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path });
    return zod_1.z.NEVER;
} return parsed.data; }).refine(x => x?.type === 'object', 'Tool parameters are an object');
const base = { name: capability_tool_js_1.CapabilityToolSchema.shape.name.min(1).max(64).regex(/^[a-z][a-z0-9_]*$/), description: capability_tool_js_1.CapabilityToolSchema.shape.description.min(1).max(4000) };
exports.ElevenLabsNativeHeaderLocatorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(128).regex(/^[A-Za-z][A-Za-z0-9-]*$/),
    source: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.object({ kind: zod_1.z.literal('credential'), key: credential_link_js_1.CredentialKeySchema }).strict(),
        zod_1.z.object({ kind: zod_1.z.literal('session'), bindingId: shared_js_1.RefId }).strict(),
    ]),
}).strict();
exports.ElevenLabsNativeClientToolSchema = zod_1.z.object({ ...base, type: zod_1.z.literal('client'),
    expects_response: zod_1.z.boolean(), response_timeout_secs: zod_1.z.number().int().positive().max(120),
    execution_mode: zod_1.z.enum(['immediate', 'post_tool_speech']).optional(), interruption_mode: zod_1.z.enum(['allow', 'block']).optional(),
    parameters: exports.ElevenLabsNativeInputSchemaSchema,
}).strict();
exports.ElevenLabsNativeWebhookToolSchema = zod_1.z.object({ ...base, type: zod_1.z.literal('webhook'),
    response_timeout_secs: zod_1.z.number().int().positive().max(120),
    api_schema: zod_1.z.object({ method: zod_1.z.literal('POST'), path: zod_1.z.string().min(1).max(2048).regex(/^\/[^?#]*$/),
        request_body_schema: exports.ElevenLabsNativeInputSchemaSchema,
        request_headers: zod_1.z.array(exports.ElevenLabsNativeHeaderLocatorSchema).max(16).refine(x => new Set(x.map(h => h.name.toLowerCase())).size === x.length),
    }).strict(),
}).strict();
exports.ElevenLabsNativeBuiltinToolSchema = zod_1.z.object({ ...base, type: zod_1.z.literal('system'),
    params: zod_1.z.object({ system_tool_type: zod_1.z.enum(['end_call', 'skip_turn']) }).strict(),
}).strict().refine(x => x.name === x.params.system_tool_type, 'Builtin name and system type agree');
exports.ElevenLabsNativeToolSchema = zod_1.z.discriminatedUnion('type', [exports.ElevenLabsNativeClientToolSchema, exports.ElevenLabsNativeWebhookToolSchema, exports.ElevenLabsNativeBuiltinToolSchema]);
exports.ElevenLabsNativeToolsSchema = zod_1.z.array(exports.ElevenLabsNativeToolSchema).max(64).refine(x => new Set(x.map(t => t.name)).size === x.length, 'Unique native tools');
exports.ElevenLabsNativeToolReferenceSchema = zod_1.z.object({ name: shared_js_1.Text128, kind: zod_1.z.enum(['client', 'webhook', 'system']) }).strict();
//# sourceMappingURL=native-tools.js.map