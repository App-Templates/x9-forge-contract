"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalFactoryDeployContract = exports.InternalFactoryDeployErrorResponseSchema = exports.InternalFactoryDeployResponseSchema = exports.InternalFactoryDeployRequestSchema = void 0;
const zod_1 = require("zod");
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
// Mirrors forge-v2 factory deployBodySchema field-for-field (constraints
// included) so factory-svc can `InternalFactoryDeployRequestSchema.parse(body)`
// and pass straight to `deploy()`. The ONLY addition is `inboundForwardUrl`.
exports.InternalFactoryDeployRequestSchema = zod_1.z.object({
    /** Human-readable display name for the agent. */
    name: zod_1.z.string().min(1).max(50),
    /**
     * Globally-unique agent slug (= agentId). Optional — factory derives one
     * from `name` when omitted. Lowercase alphanumeric + dash.
     */
    slug: zod_1.z.string().min(1).max(30).regex(/^[a-z0-9-]+$/).optional(),
    objective: zod_1.z.string().max(500).optional(),
    creature: zod_1.z.string().max(100).optional(),
    vibe: zod_1.z.string().max(200).optional(),
    emoji: zod_1.z.string().max(10).optional(),
    /** Docker hostnames of capabilities to enable (e.g. ['cap-email']). */
    selectedCapabilities: zod_1.z.array(zod_1.z.string()).optional().default([]),
    telegram_bot_token: zod_1.z.string().optional(),
    telegram_user_id: zod_1.z.string().optional().nullable(),
    /** Operator-specified Telegram allow-list (FACT-08). */
    telegram_allow_from: zod_1.z.array(zod_1.z.string()).optional().default([]),
    /** Owner id for vault/workspace tenancy + audit (numeric, Forge DB id). */
    ownerId: zod_1.z.number().int().positive().optional().nullable(),
    llmProvider: zod_1.z.string().optional(),
    llmModel: zod_1.z.string().optional(),
    /**
     * NEW (Wave 2) — per-agent inbound forward target written to context.json.
     * `.url().nullable().optional()` — back-compat with non-forwarding agents.
     */
    inboundForwardUrl: zod_1.z.string().url().nullable().optional(),
});
exports.InternalFactoryDeployResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    slug: zod_1.z.string().min(1),
    agentId: zod_1.z.string().min(1),
    email: zod_1.z.string().nullable(),
    telegramBotUsername: zod_1.z.string().nullable().optional(),
});
exports.InternalFactoryDeployErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.internalFactoryDeployContract = {
    method: 'POST',
    path: '/api/internal/factory/deploy',
    authType: 'token',
    bodySchema: exports.InternalFactoryDeployRequestSchema,
    responseSchema: exports.InternalFactoryDeployResponseSchema,
};
//# sourceMappingURL=internal-factory-deploy.js.map