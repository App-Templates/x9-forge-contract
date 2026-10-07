"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCatalogSchema = exports.ModelCatalogEntrySchema = exports.ModelLimitsSchema = exports.ModelFeaturesSchema = exports.ModelDescriptorSchema = exports.ModelCatalogVersionSchema = exports.ModelFunctionSchema = exports.ModelApiProtocolSchema = exports.ModelCatalogProviderIdSchema = void 0;
exports.normalizeModelProvider = normalizeModelProvider;
exports.sameModelDescriptor = sameModelDescriptor;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
/** Server registered ids, never browser supplied URLs or credentials. */
const RegisteredIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
exports.ModelCatalogProviderIdSchema = RegisteredIdSchema.refine(value => value !== 'claude' && value !== 'gemini', { message: 'Use canonical provider ids' });
exports.ModelApiProtocolSchema = zod_1.z.enum(['responses', 'chat-completions', 'messages', 'generate-content', 'embeddings', 'speech', 'transcriptions', 'realtime']);
exports.ModelFunctionSchema = zod_1.z.enum(['reasoning', 'memory-extraction', 'embedding', 'tts', 'transcription', 'voice']);
exports.ModelCatalogVersionSchema = zod_1.z.string().min(1).max(64);
exports.ModelDescriptorSchema = zod_1.z.object({
    provider: exports.ModelCatalogProviderIdSchema,
    modelId: agent_config_js_1.CapabilityModelIdSchema,
    protocol: exports.ModelApiProtocolSchema,
    adapterId: RegisteredIdSchema,
}).strict();
exports.ModelFeaturesSchema = zod_1.z.object({ tools: zod_1.z.boolean(), stream: zod_1.z.boolean(), structuredOutput: zod_1.z.boolean() }).strict();
/** Missing limits mean unknown; only producer-attested values may be displayed. */
exports.ModelLimitsSchema = zod_1.z.object({
    maxInputTokens: zod_1.z.number().int().positive().optional(),
    maxOutputTokens: zod_1.z.number().int().positive().optional(),
    maxInputCharacters: zod_1.z.number().int().positive().optional(),
    maxAudioSeconds: zod_1.z.number().positive().optional(),
}).strict();
exports.ModelCatalogEntrySchema = exports.ModelDescriptorSchema.extend({
    function: exports.ModelFunctionSchema,
    label: zod_1.z.string().trim().min(1).max(120),
    /** Access and runtime compatibility are different observations. */
    access: zod_1.z.enum(['available', 'unavailable', 'unknown', 'not-configured']),
    runtimeSupport: zod_1.z.enum(['supported', 'unsupported']),
    features: exports.ModelFeaturesSchema,
    limits: exports.ModelLimitsSchema.optional(),
    embeddingDimensions: zod_1.z.number().int().positive().optional(),
    /** Sanitized operator explanation, never raw provider errors or credentials. */
    reason: zod_1.z.string().trim().min(1).max(500).optional(),
}).strict().superRefine((entry, ctx) => {
    if ((entry.access !== 'available' || entry.runtimeSupport === 'unsupported') && entry.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Unavailable or unsupported entries require a reason' });
    }
    if ((entry.function === 'embedding') !== (entry.embeddingDimensions !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Dimensions are present exactly for embedding models' });
    }
});
/** Metadata snapshot scoped to one management agent; producer owns discovery and source-version invalidation. */
exports.ModelCatalogSchema = zod_1.z.object({
    agentId: agent_identity_js_1.AgentIdSchema,
    version: exports.ModelCatalogVersionSchema,
    sourceVersion: exports.ModelCatalogVersionSchema,
    source: zod_1.z.enum(['provider-api', 'provider-documentation', 'server-registry']),
    observedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
    validUntil: zod_1.z.iso.datetime({ offset: true }).nullable(),
    state: zod_1.z.enum(['available', 'partial', 'unavailable', 'not-configured']),
    entries: zod_1.z.array(exports.ModelCatalogEntrySchema),
}).strict().superRefine((catalog, ctx) => {
    if ((catalog.observedAt === null) !== (catalog.validUntil === null)) {
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Observation and validity timestamps are present together' });
    }
    if ((catalog.state === 'available' || catalog.state === 'partial') && catalog.observedAt === null) {
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'Available catalog entries require an observation' });
    }
    if (catalog.observedAt !== null && catalog.validUntil !== null && Date.parse(catalog.validUntil) <= Date.parse(catalog.observedAt)) {
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Catalog validity must end after its observation' });
    }
    const seen = new Set();
    for (const [index, entry] of catalog.entries.entries()) {
        const key = JSON.stringify([entry.provider, entry.modelId, entry.function, entry.protocol, entry.adapterId]);
        if (seen.has(key))
            ctx.addIssue({ code: 'custom', path: ['entries', index], message: 'Duplicate model/function descriptor' });
        seen.add(key);
    }
});
/** Normalize only at the server boundary; new wire descriptors always carry canonical ids. */
function normalizeModelProvider(input) {
    if (typeof input !== 'string')
        return null;
    const aliases = new Map([['claude', 'anthropic'], ['gemini', 'google']]);
    const parsed = exports.ModelCatalogProviderIdSchema.safeParse(aliases.get(input) ?? input);
    return parsed.success ? parsed.data : null;
}
/** Model names alone never establish protocol, adapter compatibility or identity. */
function sameModelDescriptor(left, right) {
    return left.provider === right.provider && left.modelId === right.modelId && left.protocol === right.protocol && left.adapterId === right.adapterId;
}
//# sourceMappingURL=model-catalog.js.map