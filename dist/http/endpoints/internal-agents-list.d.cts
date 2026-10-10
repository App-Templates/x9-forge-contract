import { z } from 'zod';
import type { AgentInventoryCapability } from "../../agent/agent-inventory-metadata.cjs";
import type { AgentRuntimeState } from "../../agent/agent-runtime-state.cjs";
import type { AgentContextIdentity } from "../../agent/agent-context-identity.cjs";
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
    stopped: "stopped";
    running: "running";
    degraded: "degraded";
    starting: "starting";
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
    stopped: "stopped";
    running: "running";
    degraded: "degraded";
    starting: "starting";
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
        stopped: "stopped";
        running: "running";
        degraded: "degraded";
        starting: "starting";
        "bot-less": "bot-less";
    }>>;
    loaded: z.ZodOptional<z.ZodBoolean>;
    errorKind: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        auth: "auth";
        "poll-death": "poll-death";
        transient: "transient";
    }>>>;
    lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    identity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    authority: z.ZodOptional<z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        role: z.ZodLiteral<"master">;
        masterAgentId: z.ZodOptional<z.ZodNever>;
    }, z.core.$strict>, z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        role: z.ZodLiteral<"erede">;
        masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>], "role">>>;
    runtime: z.ZodOptional<z.ZodObject<{
        loadState: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            stopped: "stopped";
            loaded: "loaded";
        }>;
        channelsComplete: z.ZodBoolean;
        channels: z.ZodArray<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        state: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            active: "active";
            "no-channel": "no-channel";
            stopped: "stopped";
        }>;
    }, z.core.$strip>>;
    workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        appliedVersion: z.ZodNumber;
        sha256: z.ZodString;
        loadedAt: z.ZodISODateTime;
    }, z.core.$strict>>>;
    capabilities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        enabled: z.ZodBoolean;
    }, z.core.$strict>>>>;
}, z.core.$strip>;
export type ListAgentsAgent = z.infer<typeof ListAgentsAgentSchema>;
export declare const ListAgentsResponseSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        displayName: z.ZodString;
        ownerId: z.ZodString;
        runtimeStatus: z.ZodOptional<z.ZodEnum<{
            stopped: "stopped";
            running: "running";
            degraded: "degraded";
            starting: "starting";
            "bot-less": "bot-less";
        }>>;
        loaded: z.ZodOptional<z.ZodBoolean>;
        errorKind: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            auth: "auth";
            "poll-death": "poll-death";
            transient: "transient";
        }>>>;
        lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        identity: z.ZodOptional<z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        authority: z.ZodOptional<z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            tenantId: z.ZodString;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            role: z.ZodLiteral<"master">;
            masterAgentId: z.ZodOptional<z.ZodNever>;
        }, z.core.$strict>, z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            tenantId: z.ZodString;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            role: z.ZodLiteral<"erede">;
            masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        }, z.core.$strict>], "role">>>;
        runtime: z.ZodOptional<z.ZodObject<{
            loadState: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
            }>;
            channelsComplete: z.ZodBoolean;
            channels: z.ZodArray<z.ZodObject<{
                channelId: z.ZodString;
                kind: z.ZodUnion<[z.ZodEnum<{
                    email: "email";
                    voice: "voice";
                    telegram: "telegram";
                    whatsapp: "whatsapp";
                }>, z.ZodLiteral<"web">]>;
                state: z.ZodEnum<{
                    error: "error";
                    unknown: "unknown";
                    stopped: "stopped";
                    loaded: "loaded";
                    paused: "paused";
                }>;
                loaded: z.ZodNullable<z.ZodBoolean>;
                readiness: z.ZodEnum<{
                    unknown: "unknown";
                    ready: "ready";
                    "not-ready": "not-ready";
                }>;
                botUsername: z.ZodOptional<z.ZodString>;
                allowFromCount: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                active: "active";
                "no-channel": "no-channel";
                stopped: "stopped";
            }>;
        }, z.core.$strip>>;
        workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>>;
        capabilities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            enabled: z.ZodBoolean;
        }, z.core.$strict>>>>;
    }, z.core.$strip>>;
    source: z.ZodOptional<z.ZodObject<{
        authority: z.ZodLiteral<"x9">;
        availability: z.ZodEnum<{
            unknown: "unknown";
            available: "available";
            unavailable: "unavailable";
        }>;
        completeness: z.ZodEnum<{
            unknown: "unknown";
            partial: "partial";
            complete: "complete";
        }>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListAgentsResponse = z.infer<typeof ListAgentsResponseSchema>;
/**
 * Resolve an exact declared management/runtime ID using current X9 evidence.
 * Missing rows, legacy bot status and unavailable sources remain unknown.
 * Invalid or ambiguous payloads throw rather than select an arbitrary agent.
 */
export declare function getListAgentsRuntimeState(input: unknown, agentId: string): AgentRuntimeState;
/**
 * Select an exact agent's registry observation from a validated available X9 source.
 * Missing, invalid or unavailable observations remain unknown. Freshness is a consumer
 * policy using source.observedAt; this helper does not invent a maximum age or readiness.
 */
export declare function getListAgentsCapabilities(input: unknown, agentId: string): AgentInventoryCapability[] | null;
/** Fresh declared context metadata, never inferred from legacy inventory or bot status. */
export declare function getListAgentsAuthority(input: unknown, agentId: string, now: Date, maxAgeSeconds?: number): AgentContextIdentity | null;
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
                stopped: "stopped";
                running: "running";
                degraded: "degraded";
                starting: "starting";
                "bot-less": "bot-less";
            }>>;
            loaded: z.ZodOptional<z.ZodBoolean>;
            errorKind: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                auth: "auth";
                "poll-death": "poll-death";
                transient: "transient";
            }>>>;
            lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            identity: z.ZodOptional<z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            authority: z.ZodOptional<z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"master">;
                masterAgentId: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>, z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                role: z.ZodLiteral<"erede">;
                masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strict>], "role">>>;
            runtime: z.ZodOptional<z.ZodObject<{
                loadState: z.ZodEnum<{
                    error: "error";
                    unknown: "unknown";
                    stopped: "stopped";
                    loaded: "loaded";
                }>;
                channelsComplete: z.ZodBoolean;
                channels: z.ZodArray<z.ZodObject<{
                    channelId: z.ZodString;
                    kind: z.ZodUnion<[z.ZodEnum<{
                        email: "email";
                        voice: "voice";
                        telegram: "telegram";
                        whatsapp: "whatsapp";
                    }>, z.ZodLiteral<"web">]>;
                    state: z.ZodEnum<{
                        error: "error";
                        unknown: "unknown";
                        stopped: "stopped";
                        loaded: "loaded";
                        paused: "paused";
                    }>;
                    loaded: z.ZodNullable<z.ZodBoolean>;
                    readiness: z.ZodEnum<{
                        unknown: "unknown";
                        ready: "ready";
                        "not-ready": "not-ready";
                    }>;
                    botUsername: z.ZodOptional<z.ZodString>;
                    allowFromCount: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>;
                state: z.ZodEnum<{
                    error: "error";
                    unknown: "unknown";
                    active: "active";
                    "no-channel": "no-channel";
                    stopped: "stopped";
                }>;
            }, z.core.$strip>>;
            workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
                loadedAt: z.ZodISODateTime;
            }, z.core.$strict>>>;
            capabilities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                enabled: z.ZodBoolean;
            }, z.core.$strict>>>>;
        }, z.core.$strip>>;
        source: z.ZodOptional<z.ZodObject<{
            authority: z.ZodLiteral<"x9">;
            availability: z.ZodEnum<{
                unknown: "unknown";
                available: "available";
                unavailable: "unavailable";
            }>;
            completeness: z.ZodEnum<{
                unknown: "unknown";
                partial: "partial";
                complete: "complete";
            }>;
            observedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agents-list.d.ts.map