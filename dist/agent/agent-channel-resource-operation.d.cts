import { z } from 'zod';
/** Browser intent only. Resource, identity, provider endpoints and credentials are resolved by the producer. */
export declare const AgentChannelResourceCommandSchema: z.ZodObject<{
    action: z.ZodEnum<{
        "create-resource": "create-resource";
        "rotate-token": "rotate-token";
    }>;
    requestId: z.ZodString;
    expectedDesiredVersion: z.ZodNumber;
    expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type AgentChannelResourceCommand = z.infer<typeof AgentChannelResourceCommandSchema>;
/** Persist the immutable resolved intent before provider effects. Null requires authoritative absence,
 * not an unavailable legacy source. Rotation never means deleting and recreating a bot.
 * The producer owns authorization, freshness, locking and durable replay; this schema installs none of them.
 */
export declare const AgentChannelResourceIntentSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
    }>;
    command: z.ZodObject<{
        action: z.ZodEnum<{
            "create-resource": "create-resource";
            "rotate-token": "rotate-token";
        }>;
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    previousResource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
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
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type AgentChannelResourceIntent = z.infer<typeof AgentChannelResourceIntentSchema>;
/** Compare with the latest server-resolved configuration before EVERY effect, including after awaits.
 * A true result checks correlation only, not ownership authorization or provider absence/freshness.
 */
export declare function isAgentChannelResourceIntentReady(rawIntent: unknown, rawConfiguration: unknown): boolean;
/** Public progress is metadata only. Applied means this resource version is loaded (or deliberately paused),
 * NEVER that an owner received a real LLM reply. Ambiguous effects retain known metadata for reconciliation.
 */
export declare const AgentChannelResourceResultSchema: z.ZodObject<{
    intent: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        command: z.ZodObject<{
            action: z.ZodEnum<{
                "create-resource": "create-resource";
                "rotate-token": "rotate-token";
            }>;
            requestId: z.ZodString;
            expectedDesiredVersion: z.ZodNumber;
            expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        previousResource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
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
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>;
    outcome: z.ZodEnum<{
        applied: "applied";
        failed: "failed";
        pending: "pending";
        reconcile_pending: "reconcile_pending";
    }>;
    replayed: z.ZodBoolean;
    startedAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
    configuration: z.ZodObject<{
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
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
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
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
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
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
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
                loaded: "loaded";
                stopped: "stopped";
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
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>;
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
}, z.core.$strict>;
export type AgentChannelResourceResult = z.infer<typeof AgentChannelResourceResultSchema>;
/** A replay is valid only for the complete original intent, including its prior resource and all three identities. */
export declare function isAgentChannelResourceResultForIntent(rawIntent: unknown, rawResult: unknown): boolean;
//# sourceMappingURL=agent-channel-resource-operation.d.ts.map