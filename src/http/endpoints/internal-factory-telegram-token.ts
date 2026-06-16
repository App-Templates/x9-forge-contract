import { z } from 'zod';

/**
 * PATCH /api/internal/factory/agents/:slug/telegram-token — rotate an
 * existing agent's Telegram bot token WITHOUT deprovision+redeploy.
 * Direction: trusted internal caller (operator/automation) -> Forge factory-svc
 * Auth: X-Internal-Token (INTERNAL_TOKEN_HEADER), constant-time compare
 *       (consumer owns its timing-safe impl — see require-internal-auth.ts).
 * Requirement: TOKROT-01 (Phase 21).
 *
 * Effect (forge-v2 side): validate slug exists -> agentRepo.updateTelegramBot
 * -> atomic rewrite of /data/agents/<slug>/context.json (parseAgentContextFile
 * before rename) -> x9Client.reload(slug). The response `reloaded` field
 * surfaces the agent-core bot-less `telegram:'skipped'` outcome (see
 * reloadAgentContract).
 *
 * R-17: the request DOES carry a credential (telegram_bot_token). It is never
 * logged by the consumer; the auth token is the standard INTERNAL_SERVICE_TOKEN
 * already provisioned to factory-svc — no NEW env key (D-21-1, RESEARCH §5).
 */

export const InternalFactoryTelegramTokenParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
});
export type InternalFactoryTelegramTokenParams = z.infer<
  typeof InternalFactoryTelegramTokenParamsSchema
>;

export const InternalFactoryTelegramTokenRequestSchema = z.object({
  /** Fresh BotFather token. REQUIRED + non-empty — rotate cannot blank it. */
  telegram_bot_token: z.string().min(1),
  /** Optional new bot @username; when omitted the consumer preserves the existing one. */
  telegram_bot_username: z.string().optional(),
});
export type InternalFactoryTelegramTokenRequest = z.infer<
  typeof InternalFactoryTelegramTokenRequestSchema
>;

export const InternalFactoryTelegramTokenResponseSchema = z.object({
  ok: z.literal(true),
  slug: z.string().min(1),
  telegramBotUsername: z.string().nullable().optional(),
  /** true when the bot rebooted; mirrors reload `telegram:'skipped'` (false/bot-less). */
  reloaded: z.boolean(),
});
export type InternalFactoryTelegramTokenResponse = z.infer<
  typeof InternalFactoryTelegramTokenResponseSchema
>;

export const InternalFactoryTelegramTokenErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
export type InternalFactoryTelegramTokenErrorResponse = z.infer<
  typeof InternalFactoryTelegramTokenErrorResponseSchema
>;

export const internalFactoryTelegramTokenContract = {
  method: 'PATCH' as const,
  path: '/api/internal/factory/agents/:slug/telegram-token' as const,
  authType: 'token' as const,
  paramsSchema: InternalFactoryTelegramTokenParamsSchema,
  bodySchema: InternalFactoryTelegramTokenRequestSchema,
  responseSchema: InternalFactoryTelegramTokenResponseSchema,
} as const;
