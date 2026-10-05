"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabCompetenceOutputSchema = exports.LabCompetenceInputSchema = exports.LabGapsOutputSchema = exports.LabGapsInputSchema = exports.LabQueryOutputSchema = exports.LabQueryInputSchema = exports.LabIngestOutputSchema = exports.LabIngestInputSchema = exports.LAB_TOOLS = exports.CompetenceGapSchema = exports.CompetenceGapReasonSchema = exports.CompetenceNodeViewSchema = exports.CompetenceNodeIdSchema = exports.COMPETENCE_MAX_LEVEL = exports.WikiLinkSchema = exports.WikiClaimSchema = exports.WikiClaimStatusSchema = exports.WikiPageSchema = exports.WikiSourceSchema = exports.WikiPageSlugSchema = exports.WikiSourceIdSchema = exports.WikiOriginSchema = exports.LabProjectConfigSchema = exports.KindSlugSchema = void 0;
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
var project_js_1 = require("./project.cjs");
Object.defineProperty(exports, "KindSlugSchema", { enumerable: true, get: function () { return project_js_1.KindSlugSchema; } });
Object.defineProperty(exports, "LabProjectConfigSchema", { enumerable: true, get: function () { return project_js_1.LabProjectConfigSchema; } });
var wiki_js_1 = require("./wiki.cjs");
Object.defineProperty(exports, "WikiOriginSchema", { enumerable: true, get: function () { return wiki_js_1.WikiOriginSchema; } });
Object.defineProperty(exports, "WikiSourceIdSchema", { enumerable: true, get: function () { return wiki_js_1.WikiSourceIdSchema; } });
Object.defineProperty(exports, "WikiPageSlugSchema", { enumerable: true, get: function () { return wiki_js_1.WikiPageSlugSchema; } });
Object.defineProperty(exports, "WikiSourceSchema", { enumerable: true, get: function () { return wiki_js_1.WikiSourceSchema; } });
Object.defineProperty(exports, "WikiPageSchema", { enumerable: true, get: function () { return wiki_js_1.WikiPageSchema; } });
Object.defineProperty(exports, "WikiClaimStatusSchema", { enumerable: true, get: function () { return wiki_js_1.WikiClaimStatusSchema; } });
Object.defineProperty(exports, "WikiClaimSchema", { enumerable: true, get: function () { return wiki_js_1.WikiClaimSchema; } });
Object.defineProperty(exports, "WikiLinkSchema", { enumerable: true, get: function () { return wiki_js_1.WikiLinkSchema; } });
var competence_js_1 = require("./competence.cjs");
Object.defineProperty(exports, "COMPETENCE_MAX_LEVEL", { enumerable: true, get: function () { return competence_js_1.COMPETENCE_MAX_LEVEL; } });
Object.defineProperty(exports, "CompetenceNodeIdSchema", { enumerable: true, get: function () { return competence_js_1.CompetenceNodeIdSchema; } });
Object.defineProperty(exports, "CompetenceNodeViewSchema", { enumerable: true, get: function () { return competence_js_1.CompetenceNodeViewSchema; } });
Object.defineProperty(exports, "CompetenceGapReasonSchema", { enumerable: true, get: function () { return competence_js_1.CompetenceGapReasonSchema; } });
Object.defineProperty(exports, "CompetenceGapSchema", { enumerable: true, get: function () { return competence_js_1.CompetenceGapSchema; } });
var tools_js_1 = require("./tools.cjs");
Object.defineProperty(exports, "LAB_TOOLS", { enumerable: true, get: function () { return tools_js_1.LAB_TOOLS; } });
Object.defineProperty(exports, "LabIngestInputSchema", { enumerable: true, get: function () { return tools_js_1.LabIngestInputSchema; } });
Object.defineProperty(exports, "LabIngestOutputSchema", { enumerable: true, get: function () { return tools_js_1.LabIngestOutputSchema; } });
Object.defineProperty(exports, "LabQueryInputSchema", { enumerable: true, get: function () { return tools_js_1.LabQueryInputSchema; } });
Object.defineProperty(exports, "LabQueryOutputSchema", { enumerable: true, get: function () { return tools_js_1.LabQueryOutputSchema; } });
Object.defineProperty(exports, "LabGapsInputSchema", { enumerable: true, get: function () { return tools_js_1.LabGapsInputSchema; } });
Object.defineProperty(exports, "LabGapsOutputSchema", { enumerable: true, get: function () { return tools_js_1.LabGapsOutputSchema; } });
Object.defineProperty(exports, "LabCompetenceInputSchema", { enumerable: true, get: function () { return tools_js_1.LabCompetenceInputSchema; } });
Object.defineProperty(exports, "LabCompetenceOutputSchema", { enumerable: true, get: function () { return tools_js_1.LabCompetenceOutputSchema; } });
//# sourceMappingURL=index.js.map