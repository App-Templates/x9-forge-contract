"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityTrendsSchema = exports.CapabilityFeedbackListSchema = exports.CapabilityOutputsSchema = exports.CapabilityTrendSeriesSchema = exports.CapabilityTrendPointSchema = exports.CapabilityFeedbackSchema = exports.CapabilityOutputSchema = exports.CapabilityPresentationDeclarationSchema = exports.CapabilityFeedbackDeclarationSchema = exports.CAPABILITY_FEEDBACK_MAX_ATTACHMENTS = exports.CapabilityOutputsDeclarationSchema = exports.CapabilityTrendMetricSchema = exports.CapabilityOutputFieldSchema = exports.CapabilityOutputFieldTypeSchema = exports.CapabilityOutputKindSchema = exports.CapabilityFeedbackSourceSchema = exports.CapabilityFeedbackSourceKindSchema = exports.CapabilityFeedbackDecisionSchema = exports.CapabilityFeedbackKindSchema = exports.CAPABILITY_OUTPUT_CONTENT_MAX_BYTES = exports.CAPABILITY_PRESENTATION_PAGE_SIZE = void 0;
const zod_1 = require("zod");
const research_js_1 = require("./ricerca/research.cjs");
const agent_config_js_1 = require("./ricerca/agent-config.cjs");
const spend_js_1 = require("./ricerca/spend.cjs");
const parameters_js_1 = require("./parameters.cjs");
/** B7: capability-defined sections, domain data and feedback. No project configuration lives here. */
const TextSchema = zod_1.z.string().trim().min(1).max(200);
const IdSchema = zod_1.z.string().trim().min(1).max(100);
const DescriptionSchema = zod_1.z.string().trim().min(1).max(2000);
/** Maximum records in one capability presentation page. */
exports.CAPABILITY_PRESENTATION_PAGE_SIZE = 100;
exports.CAPABILITY_OUTPUT_CONTENT_MAX_BYTES = 64 * 1024;
const scope = { agentId: agent_config_js_1.CapabilityAgentIdSchema, capability: IdSchema };
exports.CapabilityFeedbackKindSchema = zod_1.z.enum(['rating', 'approval']);
exports.CapabilityFeedbackDecisionSchema = zod_1.z.enum(['approved', 'changes_requested']);
exports.CapabilityFeedbackSourceKindSchema = zod_1.z.enum(['project_view', 'domain_app']);
exports.CapabilityFeedbackSourceSchema = zod_1.z.object({
    kind: exports.CapabilityFeedbackSourceKindSchema,
    /** The external view/app identity; not a capability configuration key. */
    id: IdSchema,
}).strict();
exports.CapabilityOutputKindSchema = zod_1.z.object({
    key: parameters_js_1.CapabilityParameterKeySchema, label: TextSchema, description: DescriptionSchema,
}).strict();
exports.CapabilityOutputFieldTypeSchema = zod_1.z.enum(['text', 'number', 'boolean', 'json']);
exports.CapabilityOutputFieldSchema = zod_1.z.object({
    key: parameters_js_1.CapabilityParameterKeySchema, label: TextSchema,
    type: exports.CapabilityOutputFieldTypeSchema,
    /** Optional scale for numeric output, e.g. a critic's rating from 1 to 10. */
    min: zod_1.z.number().finite().optional(),
    max: zod_1.z.number().finite().optional(),
}).strict().superRefine((field, ctx) => {
    if (field.type !== 'number' && (field.min !== undefined || field.max !== undefined)) {
        ctx.addIssue({ code: 'custom', message: 'only numeric fields declare a scale' });
    }
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
        ctx.addIssue({ code: 'custom', message: 'minimum exceeds maximum', path: ['min'] });
    }
});
exports.CapabilityTrendMetricSchema = zod_1.z.object({
    key: parameters_js_1.CapabilityParameterKeySchema, label: TextSchema, unit: TextSchema,
}).strict();
exports.CapabilityOutputsDeclarationSchema = zod_1.z.object({
    label: TextSchema,
    kinds: zod_1.z.array(exports.CapabilityOutputKindSchema).min(1).max(50),
    fields: zod_1.z.array(exports.CapabilityOutputFieldSchema).max(100),
}).strict()
    .refine(outputs => new Set(outputs.kinds.map(kind => kind.key)).size === outputs.kinds.length, { message: 'output kinds must be unique', path: ['kinds'] })
    .refine(outputs => new Set(outputs.fields.map(field => field.key)).size === outputs.fields.length, { message: 'output fields must be unique', path: ['fields'] });
exports.CAPABILITY_FEEDBACK_MAX_ATTACHMENTS = 10;
exports.CapabilityFeedbackDeclarationSchema = zod_1.z.object({
    label: TextSchema,
    kind: exports.CapabilityFeedbackKindSchema,
    /** Whether this feedback kind accepts photos, supplied as bounded http(s) URLs. */
    attachments: zod_1.z.boolean(),
    sources: zod_1.z.array(exports.CapabilityFeedbackSourceKindSchema).min(1).max(2),
}).strict().refine(feedback => new Set(feedback.sources).size === feedback.sources.length, { message: 'feedback sources must be unique', path: ['sources'] });
exports.CapabilityPresentationDeclarationSchema = zod_1.z.object({
    outputs: exports.CapabilityOutputsDeclarationSchema.optional(),
    feedback: exports.CapabilityFeedbackDeclarationSchema.optional(),
    trends: zod_1.z.array(exports.CapabilityTrendMetricSchema).max(100).optional(),
}).strict().refine(presentation => presentation.trends === undefined
    || new Set(presentation.trends.map(metric => metric.key)).size === presentation.trends.length, { message: 'trend metric keys must be unique', path: ['trends'] });
exports.CapabilityOutputSchema = zod_1.z.object({
    ...scope,
    id: IdSchema,
    kind: IdSchema,
    title: TextSchema,
    summary: zod_1.z.string().max(2000),
    createdAt: zod_1.z.iso.datetime(),
    /** Opaque domain JSON, never executable instructions or markup to evaluate. Consumers validate declared fields. */
    content: zod_1.z.record(zod_1.z.string(), zod_1.z.json()).refine(content => new TextEncoder().encode(JSON.stringify(content)).byteLength <= exports.CAPABILITY_OUTPUT_CONTENT_MAX_BYTES, { message: 'serialized content exceeds 64 KiB' }),
}).strict();
const feedbackMetadata = {
    ...scope,
    id: IdSchema,
    outputId: IdSchema,
    source: exports.CapabilityFeedbackSourceSchema,
    /** Trusted authenticated identity supplied by the view/app, not chosen by a model. */
    reviewerId: IdSchema,
    reviewerName: zod_1.z.string().trim().min(1).max(200),
    attachments: zod_1.z.array(research_js_1.WebUrlSchema).max(exports.CAPABILITY_FEEDBACK_MAX_ATTACHMENTS).optional(),
    comment: zod_1.z.string().max(2000).optional(),
    createdAt: zod_1.z.iso.datetime(),
};
exports.CapabilityFeedbackSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ ...feedbackMetadata, kind: zod_1.z.literal('rating'), rating: zod_1.z.number().int().min(1).max(10) }).strict(),
    zod_1.z.object({ ...feedbackMetadata, kind: zod_1.z.literal('approval'), decision: exports.CapabilityFeedbackDecisionSchema }).strict(),
]);
exports.CapabilityTrendPointSchema = zod_1.z.object({
    day: spend_js_1.AgentDaySchema,
    value: zod_1.z.number().finite(),
}).strict();
exports.CapabilityTrendSeriesSchema = zod_1.z.object({
    ...scope,
    metric: exports.CapabilityTrendMetricSchema,
    points: zod_1.z.array(exports.CapabilityTrendPointSchema).max(spend_js_1.AGENT_SPEND_MAX_DAYS),
}).strict().refine(series => series.points.every((point, index) => index === 0 || series.points[index - 1].day < point.day), { message: 'trend days must be unique and increasing', path: ['points'] });
/** Collections reject cross-agent/capability records before they reach a consumer. */
exports.CapabilityOutputsSchema = zod_1.z.object({
    ...scope, outputs: zod_1.z.array(exports.CapabilityOutputSchema).max(exports.CAPABILITY_PRESENTATION_PAGE_SIZE),
}).strict()
    .refine(collection => collection.outputs.every(output => output.agentId === collection.agentId && output.capability === collection.capability), { message: 'output scope mismatch', path: ['outputs'] })
    .refine(collection => new Set(collection.outputs.map(output => output.id)).size === collection.outputs.length, { message: 'output ids must be unique', path: ['outputs'] });
exports.CapabilityFeedbackListSchema = zod_1.z.object({
    ...scope, feedback: zod_1.z.array(exports.CapabilityFeedbackSchema).max(exports.CAPABILITY_PRESENTATION_PAGE_SIZE),
}).strict()
    .refine(collection => collection.feedback.every(feedback => feedback.agentId === collection.agentId && feedback.capability === collection.capability), { message: 'feedback scope mismatch', path: ['feedback'] })
    .refine(collection => new Set(collection.feedback.map(feedback => feedback.id)).size === collection.feedback.length, { message: 'feedback ids must be unique', path: ['feedback'] });
exports.CapabilityTrendsSchema = zod_1.z.object({
    ...scope, series: zod_1.z.array(exports.CapabilityTrendSeriesSchema).max(exports.CAPABILITY_PRESENTATION_PAGE_SIZE),
}).strict()
    .refine(collection => collection.series.every(series => series.agentId === collection.agentId && series.capability === collection.capability), { message: 'trend scope mismatch', path: ['series'] })
    .refine(collection => new Set(collection.series.map(series => series.metric.key)).size === collection.series.length, { message: 'trend metric keys must be unique', path: ['series'] });
//# sourceMappingURL=presentation.js.map