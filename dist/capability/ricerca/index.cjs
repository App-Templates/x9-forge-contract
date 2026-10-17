"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchResultOutputSchema = exports.ResearchResultInputSchema = exports.ResearchStatusOutputSchema = exports.ResearchStatusInputSchema = exports.ResearchStartOutputSchema = exports.ResearchStartInputSchema = exports.RicercaToolErrorSchema = exports.researchExecutePath = exports.ResearchExecuteInputSchema = exports.RICERCA_INTERNAL_TOOLS = exports.RICERCA_TOOLS = exports.AgentSpendDaySchema = exports.SpendingCapabilitySchema = exports.AgentDaySchema = exports.ResearchResultSchema = exports.ResearchCostSchema = exports.ResearchFindingSchema = exports.ResearchSourceSchema = exports.ResearchStateSchema = exports.ResearchRequestSchema = exports.WebUrlSchema = exports.ResearchIdSchema = exports.ResearchAgentConfigSchema = exports.SourceRuleSchema = exports.ResearchParamsSchema = exports.ResearchEffortSchema = exports.ResearchModelsSchema = exports.ResearchBudgetSchema = exports.CapabilityModelIdSchema = exports.CapabilityUsdSchema = exports.AgentTimeZoneSchema = exports.AgentConfigVersionSchema = exports.CapabilityAgentIdSchema = void 0;
/**
 * cap-ricerca contracts — sub-path `@x9-forge/contracts/capability/ricerca` (v1.28.0, Phase 54).
 *
 * Budgeted, goal-driven web research in cascades for any agent the capability is attached to. The agent's
 * configuration (budget never exceeded, models, research parameters, source rule) and its day-by-day spend live here.
 *
 * Consumers (planned): agent-x9 services/cap-ricerca (server), services/cap-lab and services/cap-food (callers),
 * forge-v2 agent management (control panel), enterprise-adoption ea-core (caller, after its migration).
 *
 * STRICT (internal boundary, R-14): no `.passthrough()`.
 */
var agent_config_js_1 = require("./agent-config.cjs");
Object.defineProperty(exports, "CapabilityAgentIdSchema", { enumerable: true, get: function () { return agent_config_js_1.CapabilityAgentIdSchema; } });
Object.defineProperty(exports, "AgentConfigVersionSchema", { enumerable: true, get: function () { return agent_config_js_1.AgentConfigVersionSchema; } });
Object.defineProperty(exports, "AgentTimeZoneSchema", { enumerable: true, get: function () { return agent_config_js_1.AgentTimeZoneSchema; } });
Object.defineProperty(exports, "CapabilityUsdSchema", { enumerable: true, get: function () { return agent_config_js_1.CapabilityUsdSchema; } });
Object.defineProperty(exports, "CapabilityModelIdSchema", { enumerable: true, get: function () { return agent_config_js_1.CapabilityModelIdSchema; } });
Object.defineProperty(exports, "ResearchBudgetSchema", { enumerable: true, get: function () { return agent_config_js_1.ResearchBudgetSchema; } });
Object.defineProperty(exports, "ResearchModelsSchema", { enumerable: true, get: function () { return agent_config_js_1.ResearchModelsSchema; } });
Object.defineProperty(exports, "ResearchEffortSchema", { enumerable: true, get: function () { return agent_config_js_1.ResearchEffortSchema; } });
Object.defineProperty(exports, "ResearchParamsSchema", { enumerable: true, get: function () { return agent_config_js_1.ResearchParamsSchema; } });
Object.defineProperty(exports, "SourceRuleSchema", { enumerable: true, get: function () { return agent_config_js_1.SourceRuleSchema; } });
Object.defineProperty(exports, "ResearchAgentConfigSchema", { enumerable: true, get: function () { return agent_config_js_1.ResearchAgentConfigSchema; } });
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
Object.defineProperty(exports, "AgentDaySchema", { enumerable: true, get: function () { return spend_js_1.AgentDaySchema; } });
Object.defineProperty(exports, "SpendingCapabilitySchema", { enumerable: true, get: function () { return spend_js_1.SpendingCapabilitySchema; } });
Object.defineProperty(exports, "AgentSpendDaySchema", { enumerable: true, get: function () { return spend_js_1.AgentSpendDaySchema; } });
var tools_js_1 = require("./tools.cjs");
Object.defineProperty(exports, "RICERCA_TOOLS", { enumerable: true, get: function () { return tools_js_1.RICERCA_TOOLS; } });
Object.defineProperty(exports, "RICERCA_INTERNAL_TOOLS", { enumerable: true, get: function () { return tools_js_1.RICERCA_INTERNAL_TOOLS; } });
Object.defineProperty(exports, "ResearchExecuteInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchExecuteInputSchema; } });
Object.defineProperty(exports, "researchExecutePath", { enumerable: true, get: function () { return tools_js_1.researchExecutePath; } });
Object.defineProperty(exports, "RicercaToolErrorSchema", { enumerable: true, get: function () { return tools_js_1.RicercaToolErrorSchema; } });
Object.defineProperty(exports, "ResearchStartInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStartInputSchema; } });
Object.defineProperty(exports, "ResearchStartOutputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStartOutputSchema; } });
Object.defineProperty(exports, "ResearchStatusInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStatusInputSchema; } });
Object.defineProperty(exports, "ResearchStatusOutputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchStatusOutputSchema; } });
Object.defineProperty(exports, "ResearchResultInputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchResultInputSchema; } });
Object.defineProperty(exports, "ResearchResultOutputSchema", { enumerable: true, get: function () { return tools_js_1.ResearchResultOutputSchema; } });
//# sourceMappingURL=index.js.map