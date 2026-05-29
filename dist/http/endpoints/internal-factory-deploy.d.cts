import { z } from 'zod';
/**
 * POST /api/internal/factory/deploy — service-to-service agent deployment.
 * Direction: trusted internal service (e.g. Parallel workspace-seeder-svc) -> Forge factory-svc
 * Auth: X-Internal-Token (INTERNAL_TOKEN_HEADER), value = INTERNAL_SERVICE_TOKEN,
 *       constant-time compare (each consumer owns its timing-safe impl).
 * Requirement: Wave 2 (Parallel per-character agent delivery).
 *
 * This is the S2S sibling of the Clerk-gated `POST /api/factory/deploy`. It runs
 * the SAME 10-step deploy machine (`deploy.machine.ts`) — AgentMail inbox +
 * BotFather Telegram bot + workspace + vault + registry + context.json +
 * agent-core reload — but is authenticated by the shared internal-service token
 * instead of a Clerk superadmin session, so trusted control-plane services can
 * provision agents programmatically.
 *
 * `inboundForwardUrl` (optional) is threaded into the deployed agent's
 * `context.json` (see AgentContextCoreSchema.inboundForwardUrl). When set, the
 * agent-core per-agent forward gate routes that agent's inbound messages to the
 * URL instead of running the local LLM turn loop — the mechanism Parallel uses
 * so each character-agent's inbound flows to the narrative router. It is a
 * per-agent field: agents deployed WITHOUT it (e.g. Stefano's personal x9
 * agent) never forward.
 *
 * R-17 N/A: the request carries no credential. The auth token is the standard
 * shared INTERNAL_SERVICE_TOKEN already provisioned to factory-svc.
 *
 * Consumers:
 *   - forge-v2 factory-svc — validates the body + runs deploy() (server side)
 *   - parallel workspace-seeder-svc — builds the request (client side)
 */
export declare const InternalFactoryDeployRequestSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    objective: z.ZodOptional<z.ZodString>;
    creature: z.ZodOptional<z.ZodString>;
    vibe: z.ZodOptional<z.ZodString>;
    emoji: z.ZodOptional<z.ZodString>;
    selectedCapabilities: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    telegram_bot_token: z.ZodOptional<z.ZodString>;
    telegram_user_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    telegram_allow_from: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    ownerId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    llmProvider: z.ZodOptional<z.ZodString>;
    llmModel: z.ZodOptional<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type InternalFactoryDeployRequest = z.infer<typeof InternalFactoryDeployRequestSchema>;
export declare const InternalFactoryDeployResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    slug: z.ZodString;
    agentId: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    telegramBotUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type InternalFactoryDeployResponse = z.infer<typeof InternalFactoryDeployResponseSchema>;
export declare const InternalFactoryDeployErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalFactoryDeployErrorResponse = z.infer<typeof InternalFactoryDeployErrorResponseSchema>;
export declare const internalFactoryDeployContract: {
    readonly method: "POST";
    readonly path: "/api/internal/factory/deploy";
    readonly authType: "token";
    readonly bodySchema: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        objective: z.ZodOptional<z.ZodString>;
        creature: z.ZodOptional<z.ZodString>;
        vibe: z.ZodOptional<z.ZodString>;
        emoji: z.ZodOptional<z.ZodString>;
        selectedCapabilities: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        telegram_bot_token: z.ZodOptional<z.ZodString>;
        telegram_user_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        telegram_allow_from: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        ownerId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        llmProvider: z.ZodOptional<z.ZodString>;
        llmModel: z.ZodOptional<z.ZodString>;
        inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        slug: z.ZodString;
        agentId: z.ZodString;
        email: z.ZodNullable<z.ZodString>;
        telegramBotUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-factory-deploy.d.ts.map