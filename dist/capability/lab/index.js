/**
 * cap-lab contracts — sub-path `@x9-forge/contracts/capability/lab` (v1.28.0, Phase 54).
 *
 * Digests research into a project's wiki (an «LLM Wiki»: raw sources, pages, claims, typed links) and compiles a
 * competence graph with scores; hands the open gaps back to research. All wiki text is data, never instructions.
 *
 * Consumers (planned): agent-x9 services/cap-lab (server), services/cap-food and the scheduler's goals (callers),
 * forge-v2 Progetti (control panel), enterprise-adoption ea-core (after its migration).
 *
 * STRICT (internal boundary, R-14): no `.passthrough()`.
 */
export { KindSlugSchema, LabProjectConfigSchema } from "./project.js";
export { WikiOriginSchema, WikiSourceIdSchema, WikiPageSlugSchema, WikiSourceSchema, WikiPageSchema, WikiClaimStatusSchema, WikiClaimSchema, WikiLinkSchema, } from "./wiki.js";
export { COMPETENCE_MAX_LEVEL, CompetenceNodeIdSchema, CompetenceNodeViewSchema, CompetenceGapReasonSchema, CompetenceGapSchema, } from "./competence.js";
export { LAB_TOOLS, LabIngestInputSchema, LabIngestOutputSchema, LabQueryInputSchema, LabQueryOutputSchema, LabGapsInputSchema, LabGapsOutputSchema, LabCompetenceInputSchema, LabCompetenceOutputSchema, } from "./tools.js";
//# sourceMappingURL=index.js.map