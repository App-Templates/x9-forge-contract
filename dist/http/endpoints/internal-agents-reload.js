import { z } from 'zod';
import { AgentBirthModelsReceiptSchema, AgentBirthSignalSchema } from "../../agent/agent-birth.js";
/**
 * POST /internal/agents/:agentId/reload — reload a running agent.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-01
 *
 * agent-core validates agentId via AGENT_ID_SCHEMA regex test (alphanumeric + dash).
 * Response: `{ ok: true, agentId }` on success, `{ ok: false, error }` on failure.
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.reload(agentId)` via createBridgeClient<'secret'>
 */
export const ReloadAgentParamsSchema = z.object({
    agentId: z.string().regex(/^[a-z0-9-]+$/),
});
/**
 * v1.75.0 — optional body. A deploy job that is at its `reload-agent-core` step for an agent born WITH models sends
 * `birth`; every other caller (Applica, restore, token rotation, enable/disable) sends no body, as before.
 */
export const ReloadAgentBodySchema = z.object({
    birth: AgentBirthSignalSchema.optional(),
}).strict();
export const ReloadAgentResponseSchema = z.object({
    ok: z.literal(true),
    agentId: z.string().min(1),
    /**
     * v1.13.2 (F-1 follow-up) — present and 'skipped' when the reloaded agent
     * is bot-less (no/empty telegramBotToken): context registered, Telegram
     * channel intentionally not booted. Absent for agents with a bot.
     * NOTE: zod default object parsing STRIPS unknown keys, so older pins
     * never errored on this field — this addition makes the contract describe
     * the real wire shape rather than fixing a runtime failure.
     */
    telegram: z.literal('skipped').optional(),
    /**
     * v1.75.0 — present when the request carried `birth` and the models of the agent are published and confirmed.
     * Absent: the reload happened, but nothing confirms that the birth models were published.
     */
    birthModels: AgentBirthModelsReceiptSchema.optional(),
});
export const ReloadAgentErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
export const reloadAgentContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/reload',
    authType: 'secret',
    paramsSchema: ReloadAgentParamsSchema,
    /** Optional body (v1.75.0); a request without body stays valid. */
    bodySchema: ReloadAgentBodySchema,
    responseSchema: ReloadAgentResponseSchema,
};
//# sourceMappingURL=internal-agents-reload.js.map