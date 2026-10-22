import { z } from 'zod';
import { InternalAgentTurnParamsSchema } from "../../http/endpoints/internal-agent-turn.js";
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
export const CapabilityAgentIdSchema = InternalAgentTurnParamsSchema.shape.agentId;
/** Every change to an agent's configuration raises its version; a capability refuses an older or equal one. */
export const AgentConfigVersionSchema = z.number().int().positive();
/** IANA time zone of the agent's day (the daily budget restarts at its midnight). */
export const AgentTimeZoneSchema = z.string().min(1).max(64).refine(tz => {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    }
    catch {
        return false;
    }
}, 'unknown IANA time zone');
export const CapabilityUsdSchema = z.number().positive().finite();
export const ResearchBudgetSchema = z.object({
    /** Spend allowed in one day of the agent, USD, never exceeded. */
    dailyUsd: CapabilityUsdSchema,
    /** Spend allowed for one research, USD (never more than the daily budget). */
    perResearchMaxUsd: CapabilityUsdSchema,
    timezone: AgentTimeZoneSchema,
}).refine(b => b.perResearchMaxUsd <= b.dailyUsd, { message: 'perResearchMaxUsd above dailyUsd', path: ['perResearchMaxUsd'] });
export const CapabilityModelIdSchema = z.string().min(1).max(100);
export const ResearchModelsSchema = z.object({
    /** The model that researches (search, read, reason) and transcribes the findings. */
    research: CapabilityModelIdSchema,
    /** The model that digests findings, when different from `research`. */
    digest: CapabilityModelIdSchema.optional(),
    /** The model for mechanical reading tasks, when different; used only where it does not lose quality. */
    read: CapabilityModelIdSchema.optional(),
});
export const ResearchEffortSchema = z.enum(['low', 'medium', 'high']);
export const ResearchParamsSchema = z.object({
    /** Most hosted tool calls (searches, opened pages, finds) of one research; fewer when the budget left covers fewer. */
    maxToolCalls: z.number().int().min(1).max(100),
    searchContextSize: ResearchEffortSchema,
    reasoningEffort: ResearchEffortSchema,
});
/**
 * Which addresses may be cited as sources:
 * - `opened_only`: only pages the research actually opened;
 * - `opened_or_search_result`: also the sources of search results (what Enterprise Adoption does up to v1.27).
 */
export const SourceRuleSchema = z.enum(['opened_only', 'opened_or_search_result']);
export const ResearchAgentConfigSchema = z.object({
    agentId: CapabilityAgentIdSchema,
    version: AgentConfigVersionSchema,
    /** What the agent wants to become or know, in plain words: the frame of its research. */
    objective: z.string().trim().min(1).max(2000),
    budget: ResearchBudgetSchema,
    models: ResearchModelsSchema,
    research: ResearchParamsSchema,
    sourceRule: SourceRuleSchema,
}).strict();
//# sourceMappingURL=agent-config.js.map