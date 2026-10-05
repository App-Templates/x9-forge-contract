"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchResultOutputSchema = exports.ResearchResultInputSchema = exports.ResearchStatusOutputSchema = exports.ResearchStatusInputSchema = exports.ResearchStartOutputSchema = exports.ResearchStartInputSchema = exports.RICERCA_TOOLS = exports.ProjectSpendDaySchema = exports.ProjectDaySchema = exports.ResearchResultSchema = exports.ResearchCostSchema = exports.ResearchFindingSchema = exports.ResearchSourceSchema = exports.ResearchStateSchema = exports.ResearchRequestSchema = exports.WebUrlSchema = exports.ResearchIdSchema = exports.ResearchProjectConfigSchema = exports.SourceRuleSchema = exports.ResearchParamsSchema = exports.ResearchEffortSchema = exports.ResearchModelsSchema = exports.ResearchBudgetSchema = exports.ProjectTimeZoneSchema = exports.ProjectConfigVersionSchema = exports.ProjectIdSchema = void 0;
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
var project_js_1 = require("./project.cjs");
Object.defineProperty(exports, "ProjectIdSchema", { enumerable: true, get: function () { return project_js_1.ProjectIdSchema; } });
Object.defineProperty(exports, "ProjectConfigVersionSchema", { enumerable: true, get: function () { return project_js_1.ProjectConfigVersionSchema; } });
Object.defineProperty(exports, "ProjectTimeZoneSchema", { enumerable: true, get: function () { return project_js_1.ProjectTimeZoneSchema; } });
Object.defineProperty(exports, "ResearchBudgetSchema", { enumerable: true, get: function () { return project_js_1.ResearchBudgetSchema; } });
Object.defineProperty(exports, "ResearchModelsSchema", { enumerable: true, get: function () { return project_js_1.ResearchModelsSchema; } });
Object.defineProperty(exports, "ResearchEffortSchema", { enumerable: true, get: function () { return project_js_1.ResearchEffortSchema; } });
Object.defineProperty(exports, "ResearchParamsSchema", { enumerable: true, get: function () { return project_js_1.ResearchParamsSchema; } });
Object.defineProperty(exports, "SourceRuleSchema", { enumerable: true, get: function () { return project_js_1.SourceRuleSchema; } });
Object.defineProperty(exports, "ResearchProjectConfigSchema", { enumerable: true, get: function () { return project_js_1.ResearchProjectConfigSchema; } });
var research_js_1 = require("./research.cjs");
Object.defineProperty(exports, "ResearchIdSchema", { enumerable: true, get: function () { return research_js_1.ResearchIdSchema; } });
Object.defineProperty(exports, "WebUrlSchema", { enumerable: true, get: function () { return research_js_1.WebUrlSchema; } });
Object.defineProperty(exports, "ResearchRequestSchema", { enumerable: true, get: function () { return research_js_1.ResearchRequestSchema; } });
Object.defineProperty(exports, "ResearchStateSchema", { enumerable: true, get: function () { return research_js_1.ResearchStateSchema; } });
Object.defineProperty(exports, "ResearchSourceSchema", { enumerable: true, get: function () { return research_js_1.ResearchSourceSchema; } });
Object.defineProperty(exports, "ResearchFindingSchema", { enumerable: true, get: function () { return research_js_1.ResearchFindingSchema; } });
Object.defineProperty(exports, "ResearchCostSchema", { enumerable: true, get: function () { return research_js_1.ResearchCostSchema; } });
Object.defineProperty(exports, "ResearchResultSchema", { enumerable: true, get: function () { return research_js_1.ResearchResultSchema; } });
var spend_js_1 = require("./spend.cjs");
Object.defineProperty(exports, "ProjectDaySchema", { enumerable: true, get: function () { return spend_js_1.ProjectDaySchema; } });
Object.defineProperty(exports, "ProjectSpendDaySchema", { enumerable: true, get: function () { return spend_js_1.ProjectSpendDaySchema; } });
var tools_js_1 = require("./tools.cjs");
Object.defineProperty(exports, "RICERCA_TOOLS", { enumerable: true, get: function () { return tools_js_1.RICERCA_TOOLS; } });
Object.defineProperty(exports, "ResearchStartInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStartInputSchema; } });
Object.defineProperty(exports, "ResearchStartOutputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStartOutputSchema; } });
Object.defineProperty(exports, "ResearchStatusInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStatusInputSchema; } });
Object.defineProperty(exports, "ResearchStatusOutputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStatusOutputSchema; } });
Object.defineProperty(exports, "ResearchResultInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchResultInputSchema; } });
Object.defineProperty(exports, "ResearchResultOutputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchResultOutputSchema; } });
//# sourceMappingURL=index.js.map