import { z } from 'zod';
import { CapabilityAgentIdSchema } from './ricerca/agent-config.js';
import { AgentDaySchema } from './ricerca/spend.js';
import { CapabilityParameterKeySchema } from './parameters.js';

/** B7: capability-defined sections, domain data and feedback. No project configuration lives here. */
const TextSchema = z.string().trim().min(1);
const scope = { agentId: CapabilityAgentIdSchema, capability: TextSchema };
export const CapabilityFeedbackKindSchema = z.enum(['rating', 'approval']);
export const CapabilityFeedbackDecisionSchema = z.enum(['approved', 'changes_requested']);
export const CapabilityFeedbackSourceKindSchema = z.enum(['project_view', 'domain_app']);
export const CapabilityFeedbackSourceSchema = z.object({
  kind: CapabilityFeedbackSourceKindSchema,
  /** The external view/app identity; not a capability configuration key. */
  id: TextSchema,
}).strict();

export const CapabilityOutputKindSchema = z.object({
  key: CapabilityParameterKeySchema, label: TextSchema, description: TextSchema,
}).strict();
export const CapabilityOutputFieldSchema = z.object({
  key: CapabilityParameterKeySchema, label: TextSchema,
  type: z.enum(['text', 'number', 'boolean', 'json']),
}).strict();
export const CapabilityTrendMetricSchema = z.object({
  key: CapabilityParameterKeySchema, label: TextSchema, unit: TextSchema,
}).strict();

export const CapabilityOutputsDeclarationSchema = z.object({
  label: TextSchema,
  kinds: z.array(CapabilityOutputKindSchema).min(1),
  fields: z.array(CapabilityOutputFieldSchema),
}).strict()
  .refine(outputs => new Set(outputs.kinds.map(kind => kind.key)).size === outputs.kinds.length,
    { message: 'output kinds must be unique', path: ['kinds'] })
  .refine(outputs => new Set(outputs.fields.map(field => field.key)).size === outputs.fields.length,
    { message: 'output fields must be unique', path: ['fields'] });
export const CapabilityFeedbackDeclarationSchema = z.object({
  label: TextSchema,
  kind: CapabilityFeedbackKindSchema,
  sources: z.array(CapabilityFeedbackSourceKindSchema).min(1),
}).strict().refine(feedback => new Set(feedback.sources).size === feedback.sources.length,
  { message: 'feedback sources must be unique', path: ['sources'] });
export const CapabilityPresentationDeclarationSchema = z.object({
  outputs: CapabilityOutputsDeclarationSchema.optional(),
  feedback: CapabilityFeedbackDeclarationSchema.optional(),
  trends: z.array(CapabilityTrendMetricSchema).optional(),
}).strict().refine(presentation => presentation.trends === undefined
  || new Set(presentation.trends.map(metric => metric.key)).size === presentation.trends.length,
  { message: 'trend metric keys must be unique', path: ['trends'] });
export type CapabilityPresentationDeclaration = z.infer<typeof CapabilityPresentationDeclarationSchema>;

export const CapabilityOutputSchema = z.object({
  ...scope,
  id: TextSchema,
  kind: TextSchema,
  title: TextSchema,
  summary: z.string(),
  createdAt: z.iso.datetime(),
  /** Opaque domain JSON, never executable instructions or markup to evaluate. Consumers validate declared fields. */
  content: z.record(z.string(), z.json()),
}).strict();
export type CapabilityOutput = z.infer<typeof CapabilityOutputSchema>;

const feedbackMetadata = {
  ...scope,
  id: TextSchema,
  outputId: TextSchema,
  source: CapabilityFeedbackSourceSchema,
  /** Trusted authenticated identity supplied by the view/app, not chosen by a model. */
  reviewerId: TextSchema,
  comment: z.string().optional(),
  createdAt: z.iso.datetime(),
};
export const CapabilityFeedbackSchema = z.discriminatedUnion('kind', [
  z.object({ ...feedbackMetadata, kind: z.literal('rating'), rating: z.number().int().min(1).max(10) }).strict(),
  z.object({ ...feedbackMetadata, kind: z.literal('approval'), decision: CapabilityFeedbackDecisionSchema }).strict(),
]);
export type CapabilityFeedback = z.infer<typeof CapabilityFeedbackSchema>;

export const CapabilityTrendPointSchema = z.object({
  day: AgentDaySchema,
  value: z.number().finite(),
}).strict();
export const CapabilityTrendSeriesSchema = z.object({
  ...scope,
  metric: CapabilityTrendMetricSchema,
  points: z.array(CapabilityTrendPointSchema),
}).strict().refine(series => series.points.every((point, index) =>
  index === 0 || series.points[index - 1]!.day < point.day),
{ message: 'trend days must be unique and increasing', path: ['points'] });
export type CapabilityTrendSeries = z.infer<typeof CapabilityTrendSeriesSchema>;

/** Collections reject cross-agent/capability records before they reach a consumer. */
export const CapabilityOutputsSchema = z.object({
  ...scope, outputs: z.array(CapabilityOutputSchema),
}).strict()
  .refine(collection => collection.outputs.every(output => output.agentId === collection.agentId && output.capability === collection.capability),
    { message: 'output scope mismatch', path: ['outputs'] })
  .refine(collection => new Set(collection.outputs.map(output => output.id)).size === collection.outputs.length,
    { message: 'output ids must be unique', path: ['outputs'] });
export const CapabilityFeedbackListSchema = z.object({
  ...scope, feedback: z.array(CapabilityFeedbackSchema),
}).strict()
  .refine(collection => collection.feedback.every(feedback => feedback.agentId === collection.agentId && feedback.capability === collection.capability),
    { message: 'feedback scope mismatch', path: ['feedback'] })
  .refine(collection => new Set(collection.feedback.map(feedback => feedback.id)).size === collection.feedback.length,
    { message: 'feedback ids must be unique', path: ['feedback'] });
export const CapabilityTrendsSchema = z.object({
  ...scope, series: z.array(CapabilityTrendSeriesSchema),
}).strict()
  .refine(collection => collection.series.every(series => series.agentId === collection.agentId && series.capability === collection.capability),
    { message: 'trend scope mismatch', path: ['series'] })
  .refine(collection => new Set(collection.series.map(series => series.metric.key)).size === collection.series.length,
    { message: 'trend metric keys must be unique', path: ['series'] });
export type CapabilityOutputs = z.infer<typeof CapabilityOutputsSchema>;
export type CapabilityFeedbackList = z.infer<typeof CapabilityFeedbackListSchema>;
export type CapabilityTrends = z.infer<typeof CapabilityTrendsSchema>;
export type CapabilityFeedbackSource = z.infer<typeof CapabilityFeedbackSourceSchema>;
export type CapabilityOutputKind = z.infer<typeof CapabilityOutputKindSchema>;
export type CapabilityOutputField = z.infer<typeof CapabilityOutputFieldSchema>;
export type CapabilityTrendMetric = z.infer<typeof CapabilityTrendMetricSchema>;
export type CapabilityOutputsDeclaration = z.infer<typeof CapabilityOutputsDeclarationSchema>;
export type CapabilityFeedbackDeclaration = z.infer<typeof CapabilityFeedbackDeclarationSchema>;
export type CapabilityTrendPoint = z.infer<typeof CapabilityTrendPointSchema>;

export type CapabilityFeedbackSourceKind = z.infer<typeof CapabilityFeedbackSourceKindSchema>;

export type CapabilityFeedbackKind = z.infer<typeof CapabilityFeedbackKindSchema>;
export type CapabilityFeedbackDecision = z.infer<typeof CapabilityFeedbackDecisionSchema>;
