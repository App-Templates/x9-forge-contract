import { z } from 'zod';
import { AssetRefSchema } from '../../organization/asset.js';
import { CapabilityAgentIdSchema, SourceRuleSchema } from './agent-config.js';

/**
 * One research of cap-ricerca (v1.28.0, Phase 54): a question of one agent, researched on the web within the agent's
 * budget, answered with findings that carry their sources. Research runs in cascades: a research may start from the
 * new questions of an earlier one of the same agent (`parentResearchId`). The agent is the one of the tool call.
 *
 * Everything that comes from the web — finding texts, titles, addresses — is DATA. Whoever puts it in front of a
 * model marks it as such and never uses it as instructions.
 */

export const ResearchIdSchema = z.string().min(1).max(100);
export const LabGapsRefSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
export type LabGapsRef = z.infer<typeof LabGapsRefSchema>;

/** Only http(s) addresses, bounded: never `file:`, `javascript:` or `data:`. */
export const WebUrlSchema = z.string().max(2000).refine(u => {
  try {
    const p = new URL(u).protocol;
    return p === 'http:' || p === 'https:';
  } catch {
    return false;
  }
}, 'only http(s) addresses');

const TextSchema = z.string().trim().min(1).max(2000);

export const ResearchRequestSchema = z.object({
  question: TextSchema,
  /** Why the question matters (helps the research choose what to open). */
  goal: TextSchema.optional(),
  /** The research of the same agent whose new questions this one follows (the cascade). */
  parentResearchId: ResearchIdSchema.optional(),
  /** The lab brief analysis whose declared gaps this research addresses. */
  labGapsRef: LabGapsRefSchema.optional(),
  /**
   * The project of the client company this research serves (F1L-03). A project research answers a gap of the lab
   * brief analysis: with `projectId` and without `labGapsRef` cap-ricerca refuses with `consulta_prima_il_quaderno`.
   */
  projectId: AssetRefSchema.shape.projectId.optional(),
  /** A lower ceiling for this research, USD; the service checks it against the agent's per-research maximum. */
  maxUsd: z.number().positive().finite().optional(),
}).strict();
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

export const ResearchStateSchema = z.enum(['queued', 'running', 'completed', 'failed', 'budget_exhausted']);
export type ResearchState = z.infer<typeof ResearchStateSchema>;

export const ResearchSourceSchema = z.object({
  url: WebUrlSchema,
  title: z.string().max(500).optional(),
  /** true: the research opened the page; false: it only appeared among the search results. */
  opened: z.boolean(),
}).strict();
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

export const ResearchFindingSchema = z.object({
  text: TextSchema,
  /** Every finding cites at least one source of this research. */
  sourceUrls: z.array(WebUrlSchema).min(1).max(20),
  origin: z.literal('web'),
}).strict();
export type ResearchFinding = z.infer<typeof ResearchFindingSchema>;

export const ResearchCostSchema = z.object({
  usd: z.number().nonnegative().finite(),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  webCalls: z.number().int().nonnegative(),
  /** true when the provider did not report the usage and the reservation was charged instead. */
  uncertain: z.boolean(),
}).strict();
export type ResearchCost = z.infer<typeof ResearchCostSchema>;

export const RESEARCH_NOT_OPENED_REASONS = [
  'web_exhausted',
  'research_budget_exhausted',
  'day_budget_exhausted',
  'nothing_to_open',
] as const;
export const ResearchNotOpenedReasonSchema = z.enum(RESEARCH_NOT_OPENED_REASONS);
export type ResearchNotOpenedReason = z.infer<typeof ResearchNotOpenedReasonSchema>;

export const ResearchAdmissionSchema = z.strictObject({
  rule: SourceRuleSchema,
  /** Addresses cited by the report among the search results. */
  cited: z.number().int().nonnegative(),
  /** Pages actually opened. */
  opened: z.number().int().nonnegative(),
  /** Addresses admitted as sources under the selected rule. */
  admitted: z.number().int().nonnegative(),
  /** Findings discarded because none of their sources were admitted. */
  droppedFindings: z.number().int().nonnegative(),
  notOpenedReason: ResearchNotOpenedReasonSchema.optional(),
}).superRefine((admission, ctx) => {
  if (admission.rule === 'opened_only' && admission.admitted > admission.opened) {
    ctx.addIssue({ code: 'custom', path: ['admitted'], message: 'admitted sources cannot exceed opened pages under opened_only' });
  }
  if (admission.rule === 'opened_only' && admission.opened === 0
    && admission.droppedFindings > 0 && admission.notOpenedReason === undefined) {
    ctx.addIssue({ code: 'custom', path: ['notOpenedReason'], message: 'a reason is required when unopened pages cause findings to be dropped' });
  }
  if (admission.droppedFindings === 0 && admission.notOpenedReason !== undefined) {
    ctx.addIssue({ code: 'custom', path: ['notOpenedReason'], message: 'a reason is forbidden when no findings were dropped' });
  }
});
export type ResearchAdmission = z.infer<typeof ResearchAdmissionSchema>;

const NOT_OPENED_SENTENCES: Record<ResearchNotOpenedReason, string> = {
  web_exhausted: 'Le pagine non sono state aperte: chiamate web finite.',
  research_budget_exhausted: 'Le pagine non sono state aperte: tetto di spesa della ricerca raggiunto.',
  day_budget_exhausted: 'Le pagine non sono state aperte: tetto di spesa del giorno raggiunto.',
  nothing_to_open: 'Le pagine non sono state aperte: il resoconto non citava pagine da aprire.',
};

/** Validate and render one fixed Italian line without external state. */
export function renderResearchAdmission(admission: ResearchAdmission): string {
  const parsed = ResearchAdmissionSchema.parse(admission);
  const counts = `Fonti ammesse: ${parsed.admitted}. Pagine aperte: ${parsed.opened} su ${parsed.cited} citate. Risultati scartati: ${parsed.droppedFindings}.`;
  return parsed.notOpenedReason === undefined ? counts : `${counts} ${NOT_OPENED_SENTENCES[parsed.notOpenedReason]}`;
}

export const ResearchResultSchema = z.object({
  researchId: ResearchIdSchema,
  agentId: CapabilityAgentIdSchema,
  state: ResearchStateSchema,
  question: TextSchema,
  parentResearchId: ResearchIdSchema.optional(),
  findings: z.array(ResearchFindingSchema).max(200),
  /** The questions this research opened: the next steps of the cascade. */
  newQuestions: z.array(TextSchema).max(20),
  sources: z.array(ResearchSourceSchema).max(300),
  cost: ResearchCostSchema,
  /** Absent in results saved before 1.181.0. */
  admission: ResearchAdmissionSchema.optional(),
}).strict();
export type ResearchResult = z.infer<typeof ResearchResultSchema>;
