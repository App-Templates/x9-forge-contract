import { z } from 'zod';
/**
 * GET /internal/agents — list all loaded agents.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-03
 *
 * Real response shape from agent-core (services/agent-core/src/index.ts:328-333):
 *   { agents: [{ agentId: string, displayName: string, ownerId: string }] }
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.listAgents()` reads `data.agents.map(a => a.agentId)`
 *   - forge-v2 factory health route checks `data.agents.some(a => a.agentId === slug)`
 *
 * NOTE: This is the current shape. Does NOT yet conform to standard
 * BridgeSuccessResponse format. Standardization tracked for 04-03.
 *
 * Phase 22 (additive, MINOR): per-agent runtime status. agent-core enriches each
 * entry with `runtimeStatus` (+ `loaded`/`errorKind`/`lastError`) read live from
 * its AgentManager + BotSupervisor, so the Forge admin panel reflects the REAL
 * runtime state instead of the stale stored `agents.status`. All new fields are
 * `.optional()` — an OLD agent-core (pre-deploy) response without them still
 * validates, and a NEW Forge reading an old agent-core treats them as absent.
 *
 * Two status vocabularies (intentional, D2/D3):
 *   - `RuntimeAgentStatusSchema` — the 5 REAL wire states agent-core emits.
 *     agent-core imports THIS; it can never emit `unknown`.
 *   - `ForgeRuntimeStatusSchema` — the 5 states + `unknown`. Forge-side overlay
 *     value produced when agent-core is unreachable (never falls back to the
 *     stale stored value). Forge imports THIS.
 */
/**
 * The 5 real per-agent runtime states agent-core emits on the wire.
 * `bot-less` = agent loaded for internal-turn/proactive but with no Telegram bot
 * (empty token). Mirrors agent-core BotState + the bot-less discriminator.
 */
export declare const RuntimeAgentStatusSchema: z.ZodEnum<{
    degraded: "degraded";
    running: "running";
    starting: "starting";
    stopped: "stopped";
    "bot-less": "bot-less";
}>;
export type RuntimeAgentStatus = z.infer<typeof RuntimeAgentStatusSchema>;
/**
 * Forge-side overlay union: the 5 wire states plus `unknown`. `unknown` is
 * produced by the Forge consumer when agent-core is unreachable — it is NEVER
 * emitted by agent-core and is NOT part of the wire enum above.
 */
export declare const ForgeRuntimeStatusSchema: z.ZodEnum<{
    unknown: "unknown";
    degraded: "degraded";
    running: "running";
    starting: "starting";
    stopped: "stopped";
    "bot-less": "bot-less";
}>;
export type ForgeRuntimeStatus = z.infer<typeof ForgeRuntimeStatusSchema>;
/**
 * Why a `degraded` bot is in error — mirrors agent-core BotErrorKind. Nullable:
 * a healthy/non-degraded agent carries `null`.
 */
export declare const RuntimeErrorKindSchema: z.ZodNullable<z.ZodEnum<{
    auth: "auth";
    "poll-death": "poll-death";
    transient: "transient";
}>>;
export type RuntimeErrorKind = z.infer<typeof RuntimeErrorKindSchema>;
export declare const ListAgentsAgentSchema: z.ZodObject<{
    agentId: z.ZodString;
    displayName: z.ZodString;
    ownerId: z.ZodString;
    runtimeStatus: z.ZodOptional<z.ZodEnum<{
        degraded: "degraded";
        running: "running";
        starting: "starting";
        stopped: "stopped";
        "bot-less": "bot-less";
    }>>;
    loaded: z.ZodOptional<z.ZodBoolean>;
    errorKind: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        auth: "auth";
        "poll-death": "poll-death";
        transient: "transient";
    }>>>;
    lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type ListAgentsAgent = z.infer<typeof ListAgentsAgentSchema>;
export declare const ListAgentsResponseSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        displayName: z.ZodString;
        ownerId: z.ZodString;
        runtimeStatus: z.ZodOptional<z.ZodEnum<{
            degraded: "degraded";
            running: "running";
            starting: "starting";
            stopped: "stopped";
            "bot-less": "bot-less";
        }>>;
        loaded: z.ZodOptional<z.ZodBoolean>;
        errorKind: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            auth: "auth";
            "poll-death": "poll-death";
            transient: "transient";
        }>>>;
        lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListAgentsResponse = z.infer<typeof ListAgentsResponseSchema>;
export declare const listAgentsContract: {
    readonly method: "GET";
    readonly path: "/internal/agents";
    readonly authType: "secret";
    readonly responseSchema: z.ZodObject<{
        agents: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            displayName: z.ZodString;
            ownerId: z.ZodString;
            runtimeStatus: z.ZodOptional<z.ZodEnum<{
                degraded: "degraded";
                running: "running";
                starting: "starting";
                stopped: "stopped";
                "bot-less": "bot-less";
            }>>;
            loaded: z.ZodOptional<z.ZodBoolean>;
            errorKind: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                auth: "auth";
                "poll-death": "poll-death";
                transient: "transient";
            }>>>;
            lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agents-list.d.ts.map