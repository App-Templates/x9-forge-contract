import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { CapabilityModelIdSchema } from "../capability/ricerca/agent-config.js";
/** Server registered ids, never browser supplied URLs or credentials. */
const RegisteredIdSchema = z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
export const ModelCatalogProviderIdSchema = RegisteredIdSchema.refine(value => value !== 'claude' && value !== 'gemini', { message: 'Use canonical provider ids' });
export const ModelApiProtocolSchema = z.enum(['responses', 'chat-completions', 'messages', 'generate-content', 'embeddings', 'speech', 'transcriptions', 'realtime']);
export const ModelFunctionSchema = z.enum(['reasoning', 'memory-extraction', 'embedding', 'tts', 'transcription', 'voice']);
export const ModelCatalogVersionSchema = z.string().min(1).max(64);
export const ModelDescriptorSchema = z.object({
    provider: ModelCatalogProviderIdSchema,
    modelId: CapabilityModelIdSchema,
    protocol: ModelApiProtocolSchema,
    adapterId: RegisteredIdSchema,
}).strict();
export const ModelFeaturesSchema = z.object({ tools: z.boolean(), stream: z.boolean(), structuredOutput: z.boolean() }).strict();
/** Missing limits mean unknown; only producer-attested values may be displayed. */
export const ModelLimitsSchema = z.object({
    maxInputTokens: z.number().int().positive().optional(),
    maxOutputTokens: z.number().int().positive().optional(),
    maxInputCharacters: z.number().int().positive().optional(),
    maxAudioSeconds: z.number().positive().optional(),
}).strict();
export const ModelCatalogEntrySchema = ModelDescriptorSchema.extend({
    function: ModelFunctionSchema,
    label: z.string().trim().min(1).max(120),
    /** Access and runtime compatibility are different observations. */
    access: z.enum(['available', 'unavailable', 'unknown', 'not-configured']),
    runtimeSupport: z.enum(['supported', 'unsupported']),
    features: ModelFeaturesSchema,
    limits: ModelLimitsSchema.optional(),
    embeddingDimensions: z.number().int().positive().optional(),
    /** Sanitized operator explanation, never raw provider errors or credentials. */
    reason: z.string().trim().min(1).max(500).optional(),
}).strict().superRefine((entry, ctx) => {
    if ((entry.access !== 'available' || entry.runtimeSupport === 'unsupported') && entry.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Unavailable or unsupported entries require a reason' });
    }
    if ((entry.function === 'embedding') !== (entry.embeddingDimensions !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Dimensions are present exactly for embedding models' });
    }
});
/** Metadata snapshot scoped to one management agent; producer owns discovery and source-version invalidation. */
export const ModelCatalogSchema = z.object({
    agentId: AgentIdSchema,
    version: ModelCatalogVersionSchema,
    sourceVersion: ModelCatalogVersionSchema,
    source: z.enum(['provider-api', 'provider-documentation', 'server-registry']),
    observedAt: z.iso.datetime({ offset: true }).nullable(),
    validUntil: z.iso.datetime({ offset: true }).nullable(),
    state: z.enum(['available', 'partial', 'unavailable', 'not-configured']),
    entries: z.array(ModelCatalogEntrySchema),
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
export function normalizeModelProvider(input) {
    if (typeof input !== 'string')
        return null;
    const aliases = new Map([['claude', 'anthropic'], ['gemini', 'google']]);
    const parsed = ModelCatalogProviderIdSchema.safeParse(aliases.get(input) ?? input);
    return parsed.success ? parsed.data : null;
}
/** Model names alone never establish protocol, adapter compatibility or identity. */
export function sameModelDescriptor(left, right) {
    return left.provider === right.provider && left.modelId === right.modelId && left.protocol === right.protocol && left.adapterId === right.adapterId;
}
//# sourceMappingURL=model-catalog.js.map