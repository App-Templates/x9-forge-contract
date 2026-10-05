/**
 * cap-ricerca contracts — sub-path `@x9-forge/contracts/capability/ricerca` (v1.28.0, Phase 54).
 *
 * Budgeted, goal-driven web research in cascades, for any agent and any project. The project's part owned by
 * cap-ricerca (budget, models, research parameters, source rule) and the day-by-day spend live here too.
 *
 * Consumers (planned): agent-x9 services/cap-ricerca (server), services/cap-lab and services/cap-food (callers),
 * forge-v2 Progetti (control panel), enterprise-adoption ea-core (caller, after its migration).
 *
 * STRICT (internal boundary, R-14): no `.passthrough()`.
 */
export { ProjectIdSchema, ProjectConfigVersionSchema, ProjectTimeZoneSchema, ResearchBudgetSchema, ResearchModelsSchema, ResearchEffortSchema, ResearchParamsSchema, SourceRuleSchema, ResearchProjectConfigSchema, } from "./project.js";
export { ResearchIdSchema, WebUrlSchema, ResearchRequestSchema, ResearchStateSchema, ResearchSourceSchema, ResearchFindingSchema, ResearchCostSchema, ResearchResultSchema, } from "./research.js";
export { ProjectDaySchema, ProjectSpendDaySchema } from "./spend.js";
export { RICERCA_TOOLS, ResearchStartInputSchema, ResearchStartOutputSchema, ResearchStatusInputSchema, ResearchStatusOutputSchema, ResearchResultInputSchema, ResearchResultOutputSchema, } from "./tools.js";
//# sourceMappingURL=index.js.map