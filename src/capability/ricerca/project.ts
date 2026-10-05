import { z } from 'zod';
import { InternalAgentTurnParamsSchema } from '../../http/endpoints/internal-agent-turn.js';

/**
 * The project — the unit a research budget belongs to (v1.28.0, Phase 54).
 *
 * A project is a goal of work that uses shared capabilities with its own parameters: the «food» project (an agent
 * that studies cooking on its own with a daily budget), the Enterprise Adoption analyses, and so on. Forge is the
 * source of the configuration (the control panel where it is edited); every capability keeps ITS part, keyed by
 * `projectId`, and Forge writes it with `PUT /internal/projects/:projectId/config` (see
 * `../../http/endpoints/internal-project-config.ts`).
 *
 * This file is cap-ricerca's part: the budget it enforces, the models it calls, how it researches. No field has a
 * default chosen here: the budget, the models and the source rule are product decisions, written by the project.
 */

/** A project id: lowercase slug, stable, used in paths. */
export const ProjectIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/);
export type ProjectId = z.infer<typeof ProjectIdSchema>;

/** Every change to a project's part raises its version; a capability refuses an older or equal one. */
export const ProjectConfigVersionSchema = z.number().int().positive();

/** IANA time zone of the project's day (the daily budget restarts at its midnight). */
export const ProjectTimeZoneSchema = z.string().min(1).max(64).refine(tz => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, 'unknown IANA time zone');

const UsdSchema = z.number().positive().finite();

export const ResearchBudgetSchema = z.object({
  /** Spend allowed in one project day, USD, every agent of the project together. */
  dailyUsd: UsdSchema,
  /** Spend allowed for one research, USD (never more than the daily budget). */
  perResearchMaxUsd: UsdSchema,
  timezone: ProjectTimeZoneSchema,
}).refine(b => b.perResearchMaxUsd <= b.dailyUsd, { message: 'perResearchMaxUsd above dailyUsd', path: ['perResearchMaxUsd'] });
export type ResearchBudget = z.infer<typeof ResearchBudgetSchema>;

const ModelIdSchema = z.string().min(1).max(100);

export const ResearchModelsSchema = z.object({
  /** The model that researches (search, read, reason). */
  research: ModelIdSchema,
  /** The model that digests findings, when different from `research`. */
  digest: ModelIdSchema.optional(),
  /** The model for mechanical reading tasks, when different; used only where it does not lose quality. */
  read: ModelIdSchema.optional(),
});
export type ResearchModels = z.infer<typeof ResearchModelsSchema>;

export const ResearchEffortSchema = z.enum(['low', 'medium', 'high']);

export const ResearchParamsSchema = z.object({
  /** Hosted tool calls (searches, opened pages, finds) allowed in one research. */
  maxToolCalls: z.number().int().min(1).max(100),
  searchContextSize: ResearchEffortSchema,
  reasoningEffort: ResearchEffortSchema,
});
export type ResearchParams = z.infer<typeof ResearchParamsSchema>;

/**
 * Which addresses may be cited as sources:
 * - `opened_only`: only pages the research actually opened;
 * - `opened_or_search_result`: also the sources of search results (what Enterprise Adoption does up to v1.27).
 */
export const SourceRuleSchema = z.enum(['opened_only', 'opened_or_search_result']);
export type SourceRule = z.infer<typeof SourceRuleSchema>;

export const ResearchProjectConfigSchema = z.object({
  projectId: ProjectIdSchema,
  version: ProjectConfigVersionSchema,
  name: z.string().trim().min(1).max(120),
  /** What the project wants to become or know, in plain words. */
  objective: z.string().trim().min(1).max(2000),
  budget: ResearchBudgetSchema,
  models: ResearchModelsSchema,
  research: ResearchParamsSchema,
  sourceRule: SourceRuleSchema,
  /** The agents allowed to spend on this project (agent-core ids, as in `/internal/agents/:agentId/turn`). */
  agents: z.array(InternalAgentTurnParamsSchema.shape.agentId).min(1).max(100),
}).strict();
export type ResearchProjectConfig = z.infer<typeof ResearchProjectConfigSchema>;
