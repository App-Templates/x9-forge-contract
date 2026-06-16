"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalFactoryTelegramTokenContract = exports.InternalFactoryTelegramTokenErrorResponseSchema = exports.InternalFactoryTelegramTokenResponseSchema = exports.InternalFactoryTelegramTokenRequestSchema = exports.InternalFactoryTelegramTokenParamsSchema = void 0;
const zod_1 = require("zod");
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
exports.InternalFactoryTelegramTokenParamsSchema = zod_1.z.object({
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/),
});
exports.InternalFactoryTelegramTokenRequestSchema = zod_1.z.object({
    /** Fresh BotFather token. REQUIRED + non-empty — rotate cannot blank it. */
    telegram_bot_token: zod_1.z.string().min(1),
    /** Optional new bot @username; when omitted the consumer preserves the existing one. */
    telegram_bot_username: zod_1.z.string().optional(),
});
exports.InternalFactoryTelegramTokenResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    slug: zod_1.z.string().min(1),
    telegramBotUsername: zod_1.z.string().nullable().optional(),
    /** true when the bot rebooted; mirrors reload `telegram:'skipped'` (false/bot-less). */
    reloaded: zod_1.z.boolean(),
});
exports.InternalFactoryTelegramTokenErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.internalFactoryTelegramTokenContract = {
    method: 'PATCH',
    path: '/api/internal/factory/agents/:slug/telegram-token',
    authType: 'token',
    paramsSchema: exports.InternalFactoryTelegramTokenParamsSchema,
    bodySchema: exports.InternalFactoryTelegramTokenRequestSchema,
    responseSchema: exports.InternalFactoryTelegramTokenResponseSchema,
};
//# sourceMappingURL=internal-factory-telegram-token.js.map