import { z } from 'zod';

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
export type ReloadAgentParams = z.infer<typeof ReloadAgentParamsSchema>;

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
});
export type ReloadAgentResponse = z.infer<typeof ReloadAgentResponseSchema>;

export const ReloadAgentErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
export type ReloadAgentErrorResponse = z.infer<typeof ReloadAgentErrorResponseSchema>;

export const reloadAgentContract = {
  method: 'POST' as const,
  path: '/internal/agents/:agentId/reload' as const,
  authType: 'secret' as const,
  paramsSchema: ReloadAgentParamsSchema,
  responseSchema: ReloadAgentResponseSchema,
} as const;
