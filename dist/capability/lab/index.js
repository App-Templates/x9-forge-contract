/**
 * cap-lab contracts — sub-path `@x9-forge/contracts/capability/lab` (v1.28.0, Phase 54).
 *
 * Digests research into an agent's wiki (an «LLM Wiki»: raw sources, pages, claims, typed links) and compiles a
 * competence graph with scores; hands the open gaps back to research. All wiki text is data, never instructions.
 *
 * Consumers (planned): agent-x9 services/cap-lab (server), services/cap-food and the scheduler's goals (callers),
 * forge-v2 agent management (control panel), enterprise-adoption ea-core (after its migration).
 *
 * STRICT (internal boundary, R-14): no `.passthrough()`.
 */
export { KindSlugSchema, LabAgentConfigSchema, LabBudgetSchema, LabModelsSchema } from "./agent-config.js";
export { WikiOriginSchema, WikiSourceIdSchema, WikiPageSlugSchema, WikiSourceSchema, WikiPageSchema, WikiClaimStatusSchema, WikiClaimSchema, WikiLinkSchema, } from "./wiki.js";
export { COMPETENCE_MAX_LEVEL, CompetenceNodeIdSchema, CompetenceNodeViewSchema, CompetenceGapReasonSchema, CompetenceGapSchema, } from "./competence.js";
export { LAB_TOOLS, LAB_INTERNAL_TOOLS, LabExecuteInputSchema, LabExecuteOutputSchema, LabIngestDocumentSchema, LabIngestInputSchema, LabIngestOutputSchema, LabToolErrorSchema, LabIngestIdSchema, LabIngestStatusInputSchema, LabIngestStatusOutputSchema, LabQueryInputSchema, LabQueryOutputSchema, LabGapsInputSchema, LabGapsOutputSchema, LabCompetenceInputSchema, LabCompetenceOutputSchema, LabPublicationRecipientSchema, LabPublishInputSchema, LabPublishOutputSchema, LabReadPublishedInputSchema, LabReadPublishedOutputSchema, LabBriefGapsInputSchema, LabBriefGapsOutputSchema, } from "./tools.js";
export { LabGapsRefSchema } from "../ricerca/research.js";
export { LabScopeSchema, LabGrowthPointSchema, LabGrowthHistoryInputSchema, LabGrowthHistoryOutputSchema, } from "./growth.js";
export { LabPageListInputSchema, LabPageListEntrySchema, LabPageListOutputSchema, LabPageDetailInputSchema, LabPageDetailOutputSchema, LabExportFormatSchema, LabExportRequestSchema, LabExportResultSchema, LabBrowseErrorSchema, } from "./browse.js";
//# sourceMappingURL=index.js.map