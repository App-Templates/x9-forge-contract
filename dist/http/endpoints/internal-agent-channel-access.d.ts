import type { z } from 'zod';
export declare const AgentChannelAccessParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
    }>;
}, z.core.$strict>;
export type AgentChannelAccessParams = z.infer<typeof AgentChannelAccessParamsSchema>;
/** Forge -> X9. The producer authenticates with the existing internal secret guard,
 * resolves the route identity, and applies only this door. These descriptors install no handlers.
 */
export declare const internalAgentChannelAccessSnapshotContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/channels/:kind/access";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
        observedAt: z.ZodISODateTime;
        requests: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"available">;
            queue: z.ZodObject<{
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
                kind: z.ZodLiteral<"telegram">;
                version: z.ZodNumber;
                observedAt: z.ZodISODateTime;
                requests: z.ZodArray<z.ZodObject<{
                    requestId: z.ZodString;
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    requestedAt: z.ZodISODateTime;
                    updateId: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unavailable">;
            error: z.ZodEnum<{
                invalid_request: "invalid_request";
                agent_not_found: "agent_not_found";
                idempotency_conflict: "idempotency_conflict";
                source_unavailable: "source_unavailable";
                identity_mismatch: "identity_mismatch";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                stale_version: "stale_version";
                request_not_found: "request_not_found";
                command_in_progress: "command_in_progress";
                address_book_unavailable: "address_book_unavailable";
                queue_limit: "queue_limit";
                not_supported: "not_supported";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"not-applicable">;
        }, z.core.$strict>], "status">;
        attestation: z.ZodNullable<z.ZodObject<{
            applied: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                state: z.ZodEnum<{
                    active: "active";
                    paused: "paused";
                }>;
            }, z.core.$strict>>;
            channel: z.ZodObject<{
                channelId: z.ZodString;
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
                kind: z.ZodEnum<{
                    email: "email";
                    voice: "voice";
                }>;
            }, z.core.$strict>;
            observedAt: z.ZodISODateTime;
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
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>;
        currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
};
export declare const internalAgentChannelAccessApplyContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/channels/:kind/access/apply";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        action: z.ZodLiteral<"apply-channel">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        requestChanges: z.ZodNullable<z.ZodObject<{
            expectedQueueVersion: z.ZodNumber;
            operations: z.ZodArray<z.ZodObject<{
                requestId: z.ZodString;
                action: z.ZodEnum<{
                    admit: "admit";
                    ignore: "ignore";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
        action: z.ZodLiteral<"apply-channel">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        requestChanges: z.ZodNullable<z.ZodObject<{
            expectedQueueVersion: z.ZodNumber;
            operations: z.ZodArray<z.ZodObject<{
                requestId: z.ZodString;
                action: z.ZodEnum<{
                    admit: "admit";
                    ignore: "ignore";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        replayed: z.ZodBoolean;
        outcome: z.ZodEnum<{
            applied: "applied";
            failed: "failed";
            pending: "pending";
        }>;
        completedAt: z.ZodISODateTime;
        snapshot: z.ZodObject<{
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
            observedAt: z.ZodISODateTime;
            requests: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"available">;
                queue: z.ZodObject<{
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
                    kind: z.ZodLiteral<"telegram">;
                    version: z.ZodNumber;
                    observedAt: z.ZodISODateTime;
                    requests: z.ZodArray<z.ZodObject<{
                        requestId: z.ZodString;
                        chatId: z.ZodString;
                        type: z.ZodEnum<{
                            group: "group";
                            private: "private";
                            supergroup: "supergroup";
                        }>;
                        name: z.ZodString;
                        requestedAt: z.ZodISODateTime;
                        updateId: z.ZodNumber;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unavailable">;
                error: z.ZodEnum<{
                    invalid_request: "invalid_request";
                    agent_not_found: "agent_not_found";
                    idempotency_conflict: "idempotency_conflict";
                    source_unavailable: "source_unavailable";
                    identity_mismatch: "identity_mismatch";
                    load_failed: "load_failed";
                    apply_failed: "apply_failed";
                    reconcile_pending: "reconcile_pending";
                    stale_version: "stale_version";
                    request_not_found: "request_not_found";
                    command_in_progress: "command_in_progress";
                    address_book_unavailable: "address_book_unavailable";
                    queue_limit: "queue_limit";
                    not_supported: "not_supported";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"not-applicable">;
            }, z.core.$strict>], "status">;
            attestation: z.ZodNullable<z.ZodObject<{
                applied: z.ZodNullable<z.ZodObject<{
                    version: z.ZodNumber;
                    state: z.ZodEnum<{
                        active: "active";
                        paused: "paused";
                    }>;
                }, z.core.$strict>>;
                channel: z.ZodObject<{
                    channelId: z.ZodString;
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
                    kind: z.ZodEnum<{
                        email: "email";
                        voice: "voice";
                    }>;
                }, z.core.$strict>;
                observedAt: z.ZodISODateTime;
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
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        requestResults: z.ZodArray<z.ZodObject<{
            requestId: z.ZodString;
            action: z.ZodEnum<{
                admit: "admit";
                ignore: "ignore";
            }>;
            state: z.ZodEnum<{
                applied: "applied";
                failed: "failed";
                pending: "pending";
            }>;
        }, z.core.$strict>>;
        error: z.ZodNullable<z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>;
        currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
};
export declare function internalAgentChannelAccessPath(agentId: string, kind: string): string;
export declare function internalAgentChannelAccessApplyPath(agentId: string, kind: string): string;
//# sourceMappingURL=internal-agent-channel-access.d.ts.map