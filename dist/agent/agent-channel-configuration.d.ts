import { z } from 'zod';
import type { AgentId } from "./agent-identity.js";
import type { AgentVoiceSettings } from "../capability/voice/agent-voice-settings.js";
import type { AgentScopePolicy } from "./agent-scope-policy.js";
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
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_EMAIL: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
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
    configVersion: z.ZodOptional<z.ZodNumber>;
    identity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
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
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        versions: z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>;
        desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">;
        applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">>;
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
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
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_EMAIL: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
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
    configVersion: z.ZodOptional<z.ZodNumber>;
    identity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
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
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        versions: z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>;
        desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">;
        applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">>;
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$loose>;
export type AgentContextWithChannels = z.infer<typeof AgentContextWithChannelsSchema>;
/** Management ID of a validated context, from its explicit pair or concordant channels. Never guesses from runtime/voice. */
export declare function managementAgentIdOf(context: Pick<AgentContextWithChannels, 'identity' | 'channelConfigurations'>): AgentId | null;
/** Vault key of a validated context. Only Forge's explicit root identity is authoritative; no slug/channel fallback. */
export declare function vaultAgentIdOf(context: Pick<AgentContextWithChannels, 'identity'>): number | null;
/** Applied voice of a validated context; absent or never applied is null, never the desired settings. */
export declare function appliedAgentVoiceSettings(ctx: Pick<AgentContextWithChannels, 'voiceConfiguration'>): AgentVoiceSettings | null;
/** Applied policy of a validated context; absence is unconfigured, never an invented default. */
export declare function appliedAgentScopePolicy(ctx: Pick<AgentContextWithChannels, 'scopePolicy'>): AgentScopePolicy | null;
/** Admission only, not readiness: the producer still resolves this agent's credentials and attests the load. */
export declare function shouldLoadAgentChannel(rawContext: unknown, kind: AgentBirthChannelKind): boolean;
//# sourceMappingURL=agent-channel-configuration.d.ts.map