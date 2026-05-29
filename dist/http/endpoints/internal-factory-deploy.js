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
/**
 * Capability slug pattern accepted by the factory registry step.
 * Mirrors the docker hostname constraint used by deploy.machine write-registry.
 */
const CapabilitySlugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const InternalFactoryDeployRequestSchema = z.object({
    /** Human-readable display name for the agent. */
    name: z.string().min(1),
    /**
     * Globally-unique agent slug (= agentId). Optional — factory derives one
     * from `name` when omitted. Lowercase alphanumeric + dash.
     */
    slug: CapabilitySlugSchema.optional(),
    /** Owner id for vault/workspace tenancy + audit attribution. */
    ownerId: z.string().min(1).optional(),
    /** Docker hostnames of capabilities to enable (e.g. ['cap-email']). */
    selectedCapabilities: z.array(CapabilitySlugSchema).default([]),
    /**
     * Per-agent inbound forward target written to context.json.
     * `.url().nullable().optional()` — back-compat with non-forwarding agents.
     */
    inboundForwardUrl: z.string().url().nullable().optional(),
    /** Optional persona fields (mirror the Clerk-gated deployBodySchema). */
    objective: z.string().optional(),
    creature: z.string().optional(),
    vibe: z.string().optional(),
    emoji: z.string().optional(),
    llmProvider: z.string().optional(),
    llmModel: z.string().optional(),
    /** Telegram allow-list for the deployed agent's bot. */
    telegram_allow_from: z.array(z.string()).optional(),
});
export const InternalFactoryDeployResponseSchema = z.object({
    ok: z.literal(true),
    slug: z.string().min(1),
    agentId: z.string().min(1),
    email: z.string().nullable(),
    telegramBotUsername: z.string().nullable().optional(),
});
export const InternalFactoryDeployErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
export const internalFactoryDeployContract = {
    method: 'POST',
    path: '/api/internal/factory/deploy',
    authType: 'token',
    bodySchema: InternalFactoryDeployRequestSchema,
    responseSchema: InternalFactoryDeployResponseSchema,
};
//# sourceMappingURL=internal-factory-deploy.js.map