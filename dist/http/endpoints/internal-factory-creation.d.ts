import { z } from 'zod';
/** R2 opt-in request on the existing S2S deploy route. Legacy 1.30 contract is untouched.
 * Producers must explicitly support this shape before consumers use it; no fallback to non-idempotent deploy.
 * Authentication and ownership are checked before scoped key lookup. A conflicting intent is HTTP409.
 */
export declare const internalFactoryReplayableDeployContract: {
    readonly bodySchema: z.ZodObject<{
        emoji: z.ZodOptional<z.ZodString>;
        inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodString;
        objective: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        creature: z.ZodOptional<z.ZodString>;
        vibe: z.ZodOptional<z.ZodString>;
        selectedCapabilities: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        telegram_user_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        telegram_allow_from: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        llmProvider: z.ZodOptional<z.ZodString>;
        llmModel: z.ZodOptional<z.ZodString>;
        intent: z.ZodObject<{
            idempotencyKey: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strip>;
            source: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strip>;
            configVersion: z.ZodNumber;
            channels: z.ZodObject<{
                telegram: z.ZodEnum<{
                    active: "active";
                    paused: "paused";
                }>;
                email: z.ZodEnum<{
                    active: "active";
                    paused: "paused";
                }>;
            }, z.core.$strict>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        replayed: z.ZodBoolean;
        checkpoint: z.ZodObject<{
            jobId: z.ZodString;
            request: z.ZodObject<{
                emoji: z.ZodOptional<z.ZodString>;
                inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                name: z.ZodString;
                objective: z.ZodOptional<z.ZodString>;
                slug: z.ZodOptional<z.ZodString>;
                creature: z.ZodOptional<z.ZodString>;
                vibe: z.ZodOptional<z.ZodString>;
                selectedCapabilities: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
                telegram_user_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                telegram_allow_from: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
                llmProvider: z.ZodOptional<z.ZodString>;
                llmModel: z.ZodOptional<z.ZodString>;
                intent: z.ZodObject<{
                    idempotencyKey: z.ZodString;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    }, z.core.$strip>;
                    source: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    }, z.core.$strip>;
                    configVersion: z.ZodNumber;
                    channels: z.ZodObject<{
                        telegram: z.ZodEnum<{
                            active: "active";
                            paused: "paused";
                        }>;
                        email: z.ZodEnum<{
                            active: "active";
                            paused: "paused";
                        }>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>;
            agentRecordId: z.ZodNullable<z.ZodNumber>;
            phase: z.ZodEnum<{
                incomplete: "incomplete";
                pending: "pending";
                completed: "completed";
                running: "running";
            }>;
            channels: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    email: "email";
                    telegram: "telegram";
                }>;
                desired: z.ZodObject<{
                    version: z.ZodNumber;
                    state: z.ZodEnum<{
                        active: "active";
                        paused: "paused";
                    }>;
                }, z.core.$strict>;
                applied: z.ZodNullable<z.ZodObject<{
                    version: z.ZodNumber;
                    state: z.ZodEnum<{
                        active: "active";
                        paused: "paused";
                    }>;
                }, z.core.$strict>>;
                resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        telegram: "telegram";
                    }>;
                    resource: z.ZodObject<{
                        agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        bot_username: z.ZodString;
                        created_at: z.ZodString;
                    }, z.core.$strict>;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    }, z.core.$strip>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodEnum<{
                        email: "email";
                    }>;
                    resource: z.ZodObject<{
                        agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        provider_inbox_id: z.ZodString;
                        address: z.ZodString;
                        display_name: z.ZodNullable<z.ZodString>;
                        created_at: z.ZodString;
                    }, z.core.$strict>;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    }, z.core.$strip>;
                }, z.core.$strict>], "kind">>;
                observation: z.ZodNullable<z.ZodObject<{
                    channelId: z.ZodString;
                    kind: z.ZodUnion<[z.ZodEnum<{
                        email: "email";
                        telegram: "telegram";
                        voice: "voice";
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
                }, z.core.$strip>>;
                observedAt: z.ZodNullable<z.ZodISODateTime>;
                error: z.ZodNullable<z.ZodObject<{
                    code: z.ZodEnum<{
                        source_unavailable: "source_unavailable";
                        resource_missing: "resource_missing";
                        resource_conflict: "resource_conflict";
                        provider_unavailable: "provider_unavailable";
                        provider_rejected: "provider_rejected";
                        account_blocked: "account_blocked";
                        load_failed: "load_failed";
                        apply_failed: "apply_failed";
                        reconcile_pending: "reconcile_pending";
                        first_check_failed: "first_check_failed";
                    }>;
                    retryable: z.ZodBoolean;
                }, z.core.$strict>>;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                }, z.core.$strip>;
            }, z.core.$strict>>;
            firstCheck: z.ZodNullable<z.ZodObject<{
                checkedAt: z.ZodISODateTime;
                channel: z.ZodObject<{
                    channelId: z.ZodString;
                    kind: z.ZodUnion<[z.ZodEnum<{
                        email: "email";
                        telegram: "telegram";
                        voice: "voice";
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
                }, z.core.$strip>;
                error: z.ZodNullable<z.ZodObject<{
                    code: z.ZodEnum<{
                        source_unavailable: "source_unavailable";
                        resource_missing: "resource_missing";
                        resource_conflict: "resource_conflict";
                        provider_unavailable: "provider_unavailable";
                        provider_rejected: "provider_rejected";
                        account_blocked: "account_blocked";
                        load_failed: "load_failed";
                        apply_failed: "apply_failed";
                        reconcile_pending: "reconcile_pending";
                        first_check_failed: "first_check_failed";
                    }>;
                    retryable: z.ZodBoolean;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            failure: z.ZodNullable<z.ZodObject<{
                step: z.ZodEnum<{
                    runtime: "runtime";
                    context: "context";
                    resources: "resources";
                    workspace: "workspace";
                    "first-check": "first-check";
                    save: "save";
                }>;
                error: z.ZodObject<{
                    code: z.ZodEnum<{
                        source_unavailable: "source_unavailable";
                        resource_missing: "resource_missing";
                        resource_conflict: "resource_conflict";
                        provider_unavailable: "provider_unavailable";
                        provider_rejected: "provider_rejected";
                        account_blocked: "account_blocked";
                        load_failed: "load_failed";
                        apply_failed: "apply_failed";
                        reconcile_pending: "reconcile_pending";
                        first_check_failed: "first_check_failed";
                    }>;
                    retryable: z.ZodBoolean;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/internal/factory/deploy";
    readonly authType: "token";
};
//# sourceMappingURL=internal-factory-creation.d.ts.map