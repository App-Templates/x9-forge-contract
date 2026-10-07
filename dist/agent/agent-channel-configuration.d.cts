import { z } from 'zod';
/** R2: pausing admission preserves the agent's resource and credentials in their existing stores. */
export declare const AgentBirthChannelKindSchema: z.ZodEnum<{
    email: "email";
    telegram: "telegram";
}>;
export type AgentBirthChannelKind = z.infer<typeof AgentBirthChannelKindSchema>;
export declare const AgentChannelDesiredStateSchema: z.ZodEnum<{
    active: "active";
    paused: "paused";
}>;
export type AgentChannelDesiredState = z.infer<typeof AgentChannelDesiredStateSchema>;
/** Fixed codes only: provider messages, tokens, stack traces and arbitrary detail never cross this boundary. */
export declare const AgentChannelFailureCodeSchema: z.ZodEnum<{
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
export type AgentChannelFailureCode = z.infer<typeof AgentChannelFailureCodeSchema>;
export declare const AgentChannelFailureSchema: z.ZodObject<{
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
export type AgentChannelFailure = z.infer<typeof AgentChannelFailureSchema>;
export declare function channelFailure(code: unknown): AgentChannelFailure;
/** Metadata only; even the legacy free-form token reference is deliberately omitted. Resolve credentials via R3. */
export declare const AgentOwnedChannelResourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "kind">;
export type AgentOwnedChannelResource = z.infer<typeof AgentOwnedChannelResourceSchema>;
export declare const AgentChannelVersionedStateSchema: z.ZodObject<{
    version: z.ZodNumber;
    state: z.ZodEnum<{
        active: "active";
        paused: "paused";
    }>;
}, z.core.$strict>;
export declare const AgentChannelConfigurationSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type AgentChannelConfiguration = z.infer<typeof AgentChannelConfigurationSchema>;
/** Application requires matching versions/state and dated runtime evidence, not just a saved intention. */
export declare function isChannelConfigurationApplied(raw: unknown): boolean;
/** Additive context field. Absent is legacy; present is complete, validated and scoped with no tenant default. */
export declare const AgentContextWithChannelsSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>>;
}, z.core.$loose>;
export declare const AgentContextWithChannelsWriteSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>>;
}, z.core.$loose>;
export type AgentContextWithChannels = z.infer<typeof AgentContextWithChannelsSchema>;
/** Admission only, not readiness: the producer still resolves this agent's credentials and attests the load. */
export declare function shouldLoadAgentChannel(rawContext: unknown, kind: AgentBirthChannelKind): boolean;
//# sourceMappingURL=agent-channel-configuration.d.ts.map