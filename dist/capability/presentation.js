import { z } from 'zod';
import { WebUrlSchema } from "./ricerca/research.js";
import { CapabilityAgentIdSchema } from "./ricerca/agent-config.js";
import { AGENT_SPEND_MAX_DAYS, AgentDaySchema } from "./ricerca/spend.js";
import { CapabilityParameterKeySchema } from "./parameters.js";
/** B7: capability-defined sections, domain data and feedback. No project configuration lives here. */
const TextSchema = z.string().trim().min(1).max(200);
const IdSchema = z.string().trim().min(1).max(100);
const DescriptionSchema = z.string().trim().min(1).max(2000);
/** Maximum records in one capability presentation page. */
export const CAPABILITY_PRESENTATION_PAGE_SIZE = 100;
export const CAPABILITY_OUTPUT_CONTENT_MAX_BYTES = 64 * 1024;
const scope = { agentId: CapabilityAgentIdSchema, capability: IdSchema };
export const CapabilityFeedbackKindSchema = z.enum(['rating', 'approval']);
export const CapabilityFeedbackDecisionSchema = z.enum(['approved', 'changes_requested']);
export const CapabilityFeedbackSourceKindSchema = z.enum(['project_view', 'domain_app']);
export const CapabilityFeedbackSourceSchema = z.object({
    kind: CapabilityFeedbackSourceKindSchema,
    /** The external view/app identity; not a capability configuration key. */
    id: IdSchema,
}).strict();
export const CapabilityOutputKindSchema = z.object({
    key: CapabilityParameterKeySchema, label: TextSchema, description: DescriptionSchema,
}).strict();
export const CapabilityOutputFieldTypeSchema = z.enum(['text', 'number', 'boolean', 'json']);
export const CapabilityOutputFieldSchema = z.object({
    key: CapabilityParameterKeySchema, label: TextSchema,
    type: CapabilityOutputFieldTypeSchema,
    /** Optional scale for numeric output, e.g. a critic's rating from 1 to 10. */
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
}).strict().superRefine((field, ctx) => {
    if (field.type !== 'number' && (field.min !== undefined || field.max !== undefined)) {
        ctx.addIssue({ code: 'custom', message: 'only numeric fields declare a scale' });
    }
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
        ctx.addIssue({ code: 'custom', message: 'minimum exceeds maximum', path: ['min'] });
    }
});
export const CapabilityTrendMetricSchema = z.object({
    key: CapabilityParameterKeySchema, label: TextSchema, unit: TextSchema,
}).strict();
export const CapabilityOutputsDeclarationSchema = z.object({
    label: TextSchema,
    kinds: z.array(CapabilityOutputKindSchema).min(1).max(50),
    fields: z.array(CapabilityOutputFieldSchema).max(100),
}).strict()
    .refine(outputs => new Set(outputs.kinds.map(kind => kind.key)).size === outputs.kinds.length, { message: 'output kinds must be unique', path: ['kinds'] })
    .refine(outputs => new Set(outputs.fields.map(field => field.key)).size === outputs.fields.length, { message: 'output fields must be unique', path: ['fields'] });
export const CAPABILITY_FEEDBACK_MAX_ATTACHMENTS = 10;
export const CapabilityFeedbackDeclarationSchema = z.object({
    label: TextSchema,
    kind: CapabilityFeedbackKindSchema,
    /** Whether this feedback kind accepts photos, supplied as bounded http(s) URLs. */
    attachments: z.boolean(),
    sources: z.array(CapabilityFeedbackSourceKindSchema).min(1).max(2),
}).strict().refine(feedback => new Set(feedback.sources).size === feedback.sources.length, { message: 'feedback sources must be unique', path: ['sources'] });
export const CapabilityPresentationDeclarationSchema = z.object({
    outputs: CapabilityOutputsDeclarationSchema.optional(),
    feedback: CapabilityFeedbackDeclarationSchema.optional(),
    trends: z.array(CapabilityTrendMetricSchema).max(100).optional(),
}).strict().refine(presentation => presentation.trends === undefined
    || new Set(presentation.trends.map(metric => metric.key)).size === presentation.trends.length, { message: 'trend metric keys must be unique', path: ['trends'] });
export const CapabilityOutputSchema = z.object({
    ...scope,
    id: IdSchema,
    kind: IdSchema,
    title: TextSchema,
    summary: z.string().max(2000),
    createdAt: z.iso.datetime(),
    /** Opaque domain JSON, never executable instructions or markup to evaluate. Consumers validate declared fields. */
    content: z.record(z.string(), z.json()).refine(content => new TextEncoder().encode(JSON.stringify(content)).byteLength <= CAPABILITY_OUTPUT_CONTENT_MAX_BYTES, { message: 'serialized content exceeds 64 KiB' }),
}).strict();
const feedbackMetadata = {
    ...scope,
    id: IdSchema,
    outputId: IdSchema,
    source: CapabilityFeedbackSourceSchema,
    /** Trusted authenticated identity supplied by the view/app, not chosen by a model. */
    reviewerId: IdSchema,
    reviewerName: z.string().trim().min(1).max(200),
    attachments: z.array(WebUrlSchema).max(CAPABILITY_FEEDBACK_MAX_ATTACHMENTS).optional(),
    comment: z.string().max(2000).optional(),
    createdAt: z.iso.datetime(),
};
export const CapabilityFeedbackSchema = z.discriminatedUnion('kind', [
    z.object({ ...feedbackMetadata, kind: z.literal('rating'), rating: z.number().int().min(1).max(10) }).strict(),
    z.object({ ...feedbackMetadata, kind: z.literal('approval'), decision: CapabilityFeedbackDecisionSchema }).strict(),
]);
export const CapabilityTrendPointSchema = z.object({
    day: AgentDaySchema,
    value: z.number().finite(),
}).strict();
export const CapabilityTrendSeriesSchema = z.object({
    ...scope,
    metric: CapabilityTrendMetricSchema,
    points: z.array(CapabilityTrendPointSchema).max(AGENT_SPEND_MAX_DAYS),
}).strict().refine(series => series.points.every((point, index) => index === 0 || series.points[index - 1].day < point.day), { message: 'trend days must be unique and increasing', path: ['points'] });
/** Collections reject cross-agent/capability records before they reach a consumer. */
export const CapabilityOutputsSchema = z.object({
    ...scope, outputs: z.array(CapabilityOutputSchema).max(CAPABILITY_PRESENTATION_PAGE_SIZE),
}).strict()
    .refine(collection => collection.outputs.every(output => output.agentId === collection.agentId && output.capability === collection.capability), { message: 'output scope mismatch', path: ['outputs'] })
    .refine(collection => new Set(collection.outputs.map(output => output.id)).size === collection.outputs.length, { message: 'output ids must be unique', path: ['outputs'] });
export const CapabilityFeedbackListSchema = z.object({
    ...scope, feedback: z.array(CapabilityFeedbackSchema).max(CAPABILITY_PRESENTATION_PAGE_SIZE),
}).strict()
    .refine(collection => collection.feedback.every(feedback => feedback.agentId === collection.agentId && feedback.capability === collection.capability), { message: 'feedback scope mismatch', path: ['feedback'] })
    .refine(collection => new Set(collection.feedback.map(feedback => feedback.id)).size === collection.feedback.length, { message: 'feedback ids must be unique', path: ['feedback'] });
export const CapabilityTrendsSchema = z.object({
    ...scope, series: z.array(CapabilityTrendSeriesSchema).max(CAPABILITY_PRESENTATION_PAGE_SIZE),
}).strict()
    .refine(collection => collection.series.every(series => series.agentId === collection.agentId && series.capability === collection.capability), { message: 'trend scope mismatch', path: ['series'] })
    .refine(collection => new Set(collection.series.map(series => series.metric.key)).size === collection.series.length, { message: 'trend metric keys must be unique', path: ['series'] });
//# sourceMappingURL=presentation.js.map