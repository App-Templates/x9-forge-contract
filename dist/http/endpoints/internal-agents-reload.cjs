"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadAgentContract = exports.ReloadAgentErrorResponseSchema = exports.ReloadAgentResponseSchema = exports.ReloadAgentParamsSchema = void 0;
const zod_1 = require("zod");
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
exports.ReloadAgentParamsSchema = zod_1.z.object({
    agentId: zod_1.z.string().regex(/^[a-z0-9-]+$/),
});
exports.ReloadAgentResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    agentId: zod_1.z.string().min(1),
    /**
     * v1.13.2 (F-1 follow-up) — present and 'skipped' when the reloaded agent
     * is bot-less (no/empty telegramBotToken): context registered, Telegram
     * channel intentionally not booted. Absent for agents with a bot.
     * NOTE: zod default object parsing STRIPS unknown keys, so older pins
     * never errored on this field — this addition makes the contract describe
     * the real wire shape rather than fixing a runtime failure.
     */
    telegram: zod_1.z.literal('skipped').optional(),
});
exports.ReloadAgentErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.reloadAgentContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/reload',
    authType: 'secret',
    paramsSchema: exports.ReloadAgentParamsSchema,
    responseSchema: exports.ReloadAgentResponseSchema,
};
//# sourceMappingURL=internal-agents-reload.js.map