"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchProjectConfigSchema = exports.SourceRuleSchema = exports.ResearchParamsSchema = exports.ResearchEffortSchema = exports.ResearchModelsSchema = exports.ResearchBudgetSchema = exports.ProjectTimeZoneSchema = exports.ProjectConfigVersionSchema = exports.ProjectIdSchema = void 0;
const zod_1 = require("zod");
const internal_agent_turn_js_1 = require("../../http/endpoints/internal-agent-turn.cjs");
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
exports.ProjectIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/);
/** Every change to a project's part raises its version; a capability refuses an older or equal one. */
exports.ProjectConfigVersionSchema = zod_1.z.number().int().positive();
/** IANA time zone of the project's day (the daily budget restarts at its midnight). */
exports.ProjectTimeZoneSchema = zod_1.z.string().min(1).max(64).refine(tz => {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    }
    catch {
        return false;
    }
}, 'unknown IANA time zone');
const UsdSchema = zod_1.z.number().positive().finite();
exports.ResearchBudgetSchema = zod_1.z.object({
    /** Spend allowed in one project day, USD, every agent of the project together. */
    dailyUsd: UsdSchema,
    /** Spend allowed for one research, USD (never more than the daily budget). */
    perResearchMaxUsd: UsdSchema,
    timezone: exports.ProjectTimeZoneSchema,
}).refine(b => b.perResearchMaxUsd <= b.dailyUsd, { message: 'perResearchMaxUsd above dailyUsd', path: ['perResearchMaxUsd'] });
const ModelIdSchema = zod_1.z.string().min(1).max(100);
exports.ResearchModelsSchema = zod_1.z.object({
    /** The model that researches (search, read, reason). */
    research: ModelIdSchema,
    /** The model that digests findings, when different from `research`. */
    digest: ModelIdSchema.optional(),
    /** The model for mechanical reading tasks, when different; used only where it does not lose quality. */
    read: ModelIdSchema.optional(),
});
exports.ResearchEffortSchema = zod_1.z.enum(['low', 'medium', 'high']);
exports.ResearchParamsSchema = zod_1.z.object({
    /** Hosted tool calls (searches, opened pages, finds) allowed in one research. */
    maxToolCalls: zod_1.z.number().int().min(1).max(100),
    searchContextSize: exports.ResearchEffortSchema,
    reasoningEffort: exports.ResearchEffortSchema,
});
/**
 * Which addresses may be cited as sources:
 * - `opened_only`: only pages the research actually opened;
 * - `opened_or_search_result`: also the sources of search results (what Enterprise Adoption does up to v1.27).
 */
exports.SourceRuleSchema = zod_1.z.enum(['opened_only', 'opened_or_search_result']);
exports.ResearchProjectConfigSchema = zod_1.z.object({
    projectId: exports.ProjectIdSchema,
    version: exports.ProjectConfigVersionSchema,
    name: zod_1.z.string().trim().min(1).max(120),
    /** What the project wants to become or know, in plain words. */
    objective: zod_1.z.string().trim().min(1).max(2000),
    budget: exports.ResearchBudgetSchema,
    models: exports.ResearchModelsSchema,
    research: exports.ResearchParamsSchema,
    sourceRule: exports.SourceRuleSchema,
    /** The agents allowed to spend on this project (agent-core ids, as in `/internal/agents/:agentId/turn`). */
    agents: zod_1.z.array(internal_agent_turn_js_1.InternalAgentTurnParamsSchema.shape.agentId).min(1).max(100),
}).strict();
//# sourceMappingURL=project.js.map