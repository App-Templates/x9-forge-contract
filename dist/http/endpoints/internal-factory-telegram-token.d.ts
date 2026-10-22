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
export declare const InternalFactoryTelegramTokenParamsSchema: z.ZodObject<{
    slug: z.ZodString;
}, z.core.$strip>;
export type InternalFactoryTelegramTokenParams = z.infer<typeof InternalFactoryTelegramTokenParamsSchema>;
export declare const InternalFactoryTelegramTokenRequestSchema: z.ZodObject<{
    telegram_bot_token: z.ZodString;
    telegram_bot_username: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InternalFactoryTelegramTokenRequest = z.infer<typeof InternalFactoryTelegramTokenRequestSchema>;
export declare const InternalFactoryTelegramTokenResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    slug: z.ZodString;
    telegramBotUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reloaded: z.ZodBoolean;
}, z.core.$strip>;
export type InternalFactoryTelegramTokenResponse = z.infer<typeof InternalFactoryTelegramTokenResponseSchema>;
export declare const InternalFactoryTelegramTokenErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalFactoryTelegramTokenErrorResponse = z.infer<typeof InternalFactoryTelegramTokenErrorResponseSchema>;
export declare const internalFactoryTelegramTokenContract: {
    readonly method: "PATCH";
    readonly path: "/api/internal/factory/agents/:slug/telegram-token";
    readonly authType: "token";
    readonly paramsSchema: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        telegram_bot_token: z.ZodString;
        telegram_bot_username: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        slug: z.ZodString;
        telegramBotUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        reloaded: z.ZodBoolean;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-factory-telegram-token.d.ts.map