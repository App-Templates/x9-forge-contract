import { z } from 'zod';
/** Server-derived session access, never accepted as a browser body or authorization header. */
export declare const ForgeAgentChannelAccessAuthorizationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    role: z.ZodLiteral<"sa">;
}, z.core.$strict>, z.ZodObject<{
    role: z.ZodLiteral<"owner">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    tenantId: z.ZodString;
}, z.core.$strict>], "role">;
export type ForgeAgentChannelAccessAuthorization = z.infer<typeof ForgeAgentChannelAccessAuthorizationSchema>;
export declare function isAgentChannelAccessWithinForgeAuthorization(rawSnapshot: unknown, trustedAccess: unknown): boolean;
/** Unsaved door intent. The existing Forge writer assigns the next version after CAS;
 * no URL, resource, credentials or client-declared identity is part of this body.
 */
export declare const ForgeAgentChannelAccessDraftSchema: z.ZodObject<{
    requestId: z.ZodString;
    expectedDesiredVersion: z.ZodNumber;
    expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
    desiredState: z.ZodEnum<{
        active: "active";
        paused: "paused";
    }>;
    policy: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type ForgeAgentChannelAccessDraft = z.infer<typeof ForgeAgentChannelAccessDraftSchema>;
/** Pre-save validation against the resolved server snapshot. Producers also check scope, authority and freshness. */
export declare function isForgeAgentChannelAccessDraftForSnapshot(rawDraft: unknown, rawSnapshot: unknown): boolean;
/** Preview echoes the draft alongside actual evidence; it cannot assert a successful application. */
export declare const ForgeAgentChannelAccessPreviewSchema: z.ZodObject<{
    requestId: z.ZodString;
    draft: z.ZodObject<{
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        policy: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>;
export type ForgeAgentChannelAccessPreview = z.infer<typeof ForgeAgentChannelAccessPreviewSchema>;
export declare function isForgeAgentChannelAccessPreviewForDraft(rawDraft: unknown, rawPreview: unknown): boolean;
export declare const forgeAgentChannelAccessSnapshotContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:agentId/channels/:kind/access";
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
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
};
export declare const forgeAgentChannelAccessPreviewContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/:kind/access/preview";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        policy: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        requestId: z.ZodString;
        draft: z.ZodObject<{
            requestId: z.ZodString;
            expectedDesiredVersion: z.ZodNumber;
            expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
            desiredState: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
            policy: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
};
export declare const forgeAgentChannelAccessApplyContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/:kind/access/apply";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        policy: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
};
export declare function forgeAgentChannelAccessPath(agentId: string, kind: string): string;
export declare function forgeAgentChannelAccessPreviewPath(agentId: string, kind: string): string;
export declare function forgeAgentChannelAccessApplyPath(agentId: string, kind: string): string;
//# sourceMappingURL=forge-agent-channel-access.d.ts.map