import { z } from 'zod';
/** Only authenticated Telegram update metadata, never ordinary message contents or an automatic permission. */
export declare const AgentTelegramAccessRequestSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type AgentTelegramAccessRequest = z.infer<typeof AgentTelegramAccessRequestSchema>;
export declare const AgentTelegramAccessRequestQueueSchema: z.ZodObject<{
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
export type AgentTelegramAccessRequestQueue = z.infer<typeof AgentTelegramAccessRequestQueueSchema>;
export declare const AgentChannelAccessErrorCodeSchema: z.ZodEnum<{
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
export type AgentChannelAccessErrorCode = z.infer<typeof AgentChannelAccessErrorCodeSchema>;
export declare const AgentChannelAccessErrorResponseSchema: z.ZodObject<{
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
export type AgentChannelAccessErrorResponse = z.infer<typeof AgentChannelAccessErrorResponseSchema>;
export declare const AgentChannelAccessRequestOperationSchema: z.ZodObject<{
    requestId: z.ZodString;
    action: z.ZodEnum<{
        admit: "admit";
        ignore: "ignore";
    }>;
}, z.core.$strict>;
export type AgentChannelAccessRequestOperation = z.infer<typeof AgentChannelAccessRequestOperationSchema>;
/** Operations are staged until the saved door policy is explicitly applied; cancellation submits no command. */
export declare const AgentChannelAccessRequestChangesSchema: z.ZodObject<{
    expectedQueueVersion: z.ZodNumber;
    operations: z.ZodArray<z.ZodObject<{
        requestId: z.ZodString;
        action: z.ZodEnum<{
            admit: "admit";
            ignore: "ignore";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentChannelAccessRequestChanges = z.infer<typeof AgentChannelAccessRequestChangesSchema>;
export declare const AgentChannelAccessApplyCommandSchema: z.ZodObject<{
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
export type AgentChannelAccessApplyCommand = z.infer<typeof AgentChannelAccessApplyCommandSchema>;
/** Unavailable never means an empty queue; email has no Telegram start-request producer. */
export declare const AgentChannelAccessRequestSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type AgentChannelAccessRequestSource = z.infer<typeof AgentChannelAccessRequestSourceSchema>;
/** Composes existing config/attestation contracts: it neither changes legacy attestation nor copies saved into applied. */
export declare const AgentChannelAccessSnapshotSchema: z.ZodObject<{
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
export type AgentChannelAccessSnapshot = z.infer<typeof AgentChannelAccessSnapshotSchema>;
/** Current explicit policy evidence, independent of provider readiness or a successful end-to-end user message. */
export declare function isAgentChannelAccessSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, rawKind: unknown, now: number, maximumAgeMs?: number): boolean;
/** Runs against a fresh, authorized saved/effective snapshot BEFORE runtime effects; auth is the producer's duty. */
export declare function isAgentChannelAccessApplyReady(rawCommand: unknown, rawSnapshot: unknown): boolean;
export declare const AgentChannelAccessRequestResultSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type AgentChannelAccessRequestResult = z.infer<typeof AgentChannelAccessRequestResultSchema>;
export declare const AgentChannelAccessApplyResultSchema: z.ZodObject<{
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
export type AgentChannelAccessApplyResult = z.infer<typeof AgentChannelAccessApplyResultSchema>;
/** Complete command correlation after authenticated producer resolution; replay does not authorize another agent. */
export declare function isAgentChannelAccessResultForCommand(rawCommand: unknown, rawResult: unknown, rawBinding: unknown, rawKind: unknown): boolean;
//# sourceMappingURL=agent-channel-access-requests.d.ts.map