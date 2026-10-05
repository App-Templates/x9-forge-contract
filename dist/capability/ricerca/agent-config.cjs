"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchAgentConfigSchema = exports.SourceRuleSchema = exports.ResearchParamsSchema = exports.ResearchEffortSchema = exports.ResearchModelsSchema = exports.ResearchBudgetSchema = exports.AgentTimeZoneSchema = exports.AgentConfigVersionSchema = exports.CapabilityAgentIdSchema = void 0;
const zod_1 = require("zod");
const internal_agent_turn_js_1 = require("../../http/endpoints/internal-agent-turn.cjs");
/**
 * cap-ricerca's configuration for ONE agent (v1.28.0, Phase 54).
 *
 * Forge manages agents: every capability attached to an agent keeps that agent's configuration, keyed by `agentId`,
 * and Forge writes it with `PUT /internal/capability/agents/:agentId/config` (see
 * `../../http/endpoints/internal-capability-agent.ts`). There is no «project» inside the capabilities: a view that
 * groups agents lives outside Forge and reads them by agent.
 *
 * No field has a default chosen here: the budget, the models and the source rule are product decisions.
 * The budget is never exceeded: cap-ricerca reserves the worst case of every call before it runs.
 */
/** An agent-core agent id, as in `/internal/agents/:agentId/turn`. */
exports.CapabilityAgentIdSchema = internal_agent_turn_js_1.InternalAgentTurnParamsSchema.shape.agentId;
/** Every change to an agent's configuration raises its version; a capability refuses an older or equal one. */
exports.AgentConfigVersionSchema = zod_1.z.number().int().positive();
/** IANA time zone of the agent's day (the daily budget restarts at its midnight). */
exports.AgentTimeZoneSchema = zod_1.z.string().min(1).max(64).refine(tz => {
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
    /** Spend allowed in one day of the agent, USD, never exceeded. */
    dailyUsd: UsdSchema,
    /** Spend allowed for one research, USD (never more than the daily budget). */
    perResearchMaxUsd: UsdSchema,
    timezone: exports.AgentTimeZoneSchema,
}).refine(b => b.perResearchMaxUsd <= b.dailyUsd, { message: 'perResearchMaxUsd above dailyUsd', path: ['perResearchMaxUsd'] });
const ModelIdSchema = zod_1.z.string().min(1).max(100);
exports.ResearchModelsSchema = zod_1.z.object({
    /** The model that researches (search, read, reason) and transcribes the findings. */
    research: ModelIdSchema,
    /** The model that digests findings, when different from `research`. */
    digest: ModelIdSchema.optional(),
    /** The model for mechanical reading tasks, when different; used only where it does not lose quality. */
    read: ModelIdSchema.optional(),
});
exports.ResearchEffortSchema = zod_1.z.enum(['low', 'medium', 'high']);
exports.ResearchParamsSchema = zod_1.z.object({
    /** Most hosted tool calls (searches, opened pages, finds) of one research; fewer when the budget left covers fewer. */
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
exports.ResearchAgentConfigSchema = zod_1.z.object({
    agentId: exports.CapabilityAgentIdSchema,
    version: exports.AgentConfigVersionSchema,
    /** What the agent wants to become or know, in plain words: the frame of its research. */
    objective: zod_1.z.string().trim().min(1).max(2000),
    budget: exports.ResearchBudgetSchema,
    models: exports.ResearchModelsSchema,
    research: exports.ResearchParamsSchema,
    sourceRule: exports.SourceRuleSchema,
}).strict();
//# sourceMappingURL=agent-config.js.map