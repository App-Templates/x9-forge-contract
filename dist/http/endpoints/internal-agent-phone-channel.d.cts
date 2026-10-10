import type { z } from 'zod';
export declare const AgentPhoneParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strict>;
export type AgentPhoneParams = z.infer<typeof AgentPhoneParamsSchema>;
/** Authenticated internal service boundaries. Provider signature verification remains at its existing webhook. */
export declare const internalAgentPhoneSnapshotContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/channels/phone/access";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        configuration: z.ZodObject<{
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
            kind: z.ZodLiteral<"phone">;
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
            access: z.ZodObject<{
                desiredPolicy: z.ZodObject<{
                    kind: z.ZodLiteral<"phone">;
                    inbound: z.ZodEnum<{
                        anyone: "anyone";
                        "address-book": "address-book";
                    }>;
                    outboundEnabled: z.ZodBoolean;
                }, z.core.$strict>;
                appliedPolicy: z.ZodNullable<z.ZodObject<{
                    kind: z.ZodLiteral<"phone">;
                    inbound: z.ZodEnum<{
                        anyone: "anyone";
                        "address-book": "address-book";
                    }>;
                    outboundEnabled: z.ZodBoolean;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            sharedNumber: z.ZodObject<{
                status: z.ZodEnum<{
                    unknown: "unknown";
                    available: "available";
                    unavailable: "unavailable";
                }>;
                number: z.ZodNullable<z.ZodString>;
                resourceId: z.ZodNullable<z.ZodString>;
                version: z.ZodNullable<z.ZodNumber>;
                observedAt: z.ZodNullable<z.ZodISODateTime>;
            }, z.core.$strict>;
            routing: z.ZodNullable<z.ZodObject<{
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
                number: z.ZodString;
                resourceId: z.ZodString;
                routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strict>>;
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
        observedAt: z.ZodISODateTime;
        runtimeLoadState: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            stopped: "stopped";
            loaded: "loaded";
        }>;
        agentArchived: z.ZodBoolean;
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
export declare const internalAgentPhoneApplyContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/channels/phone/access/apply";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        action: z.ZodLiteral<"apply-channel">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        requestChanges: z.ZodNull;
        expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
        expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
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
        kind: z.ZodLiteral<"phone">;
        replayed: z.ZodBoolean;
        outcome: z.ZodEnum<{
            applied: "applied";
            failed: "failed";
            pending: "pending";
        }>;
        completedAt: z.ZodISODateTime;
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
        action: z.ZodLiteral<"apply-channel">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        requestChanges: z.ZodNull;
        expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
        expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
        snapshot: z.ZodObject<{
            configuration: z.ZodObject<{
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
                kind: z.ZodLiteral<"phone">;
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
                access: z.ZodObject<{
                    desiredPolicy: z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>;
                    appliedPolicy: z.ZodNullable<z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                sharedNumber: z.ZodObject<{
                    status: z.ZodEnum<{
                        unknown: "unknown";
                        available: "available";
                        unavailable: "unavailable";
                    }>;
                    number: z.ZodNullable<z.ZodString>;
                    resourceId: z.ZodNullable<z.ZodString>;
                    version: z.ZodNullable<z.ZodNumber>;
                    observedAt: z.ZodNullable<z.ZodISODateTime>;
                }, z.core.$strict>;
                routing: z.ZodNullable<z.ZodObject<{
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
                    number: z.ZodString;
                    resourceId: z.ZodString;
                    routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                }, z.core.$strict>>;
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
            observedAt: z.ZodISODateTime;
            runtimeLoadState: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
            }>;
            agentArchived: z.ZodBoolean;
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
};
/** Private routing after verification, never a replacement public provider webhook or a caller admission API. */
export declare const internalAgentPhoneRouteContract: {
    readonly method: "POST";
    readonly path: "/internal/channels/phone/route";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        callId: z.ZodString;
        toNumber: z.ZodString;
        fromNumber: z.ZodNullable<z.ZodString>;
        routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        receivedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        event: z.ZodObject<{
            callId: z.ZodString;
            toNumber: z.ZodString;
            fromNumber: z.ZodNullable<z.ZodString>;
            routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            receivedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        resolvedAt: z.ZodISODateTime;
        snapshot: z.ZodNullable<z.ZodObject<{
            configuration: z.ZodObject<{
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
                kind: z.ZodLiteral<"phone">;
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
                access: z.ZodObject<{
                    desiredPolicy: z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>;
                    appliedPolicy: z.ZodNullable<z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                sharedNumber: z.ZodObject<{
                    status: z.ZodEnum<{
                        unknown: "unknown";
                        available: "available";
                        unavailable: "unavailable";
                    }>;
                    number: z.ZodNullable<z.ZodString>;
                    resourceId: z.ZodNullable<z.ZodString>;
                    version: z.ZodNullable<z.ZodNumber>;
                    observedAt: z.ZodNullable<z.ZodISODateTime>;
                }, z.core.$strict>;
                routing: z.ZodNullable<z.ZodObject<{
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
                    number: z.ZodString;
                    resourceId: z.ZodString;
                    routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                }, z.core.$strict>>;
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
            observedAt: z.ZodISODateTime;
            runtimeLoadState: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
            }>;
            agentArchived: z.ZodBoolean;
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
export declare function internalAgentPhonePath(agentId: string): string;
export declare function internalAgentPhoneApplyPath(agentId: string): string;
/**
 * Runtime-only response views on the same private paths. Retained legacy exports describe older
 * producers; new producers and Forge clients must adopt this view together. No archive default.
 */
export declare const internalAgentPhoneRuntimeSnapshotContract: {
    readonly responseSchema: z.ZodObject<{
        configuration: z.ZodObject<{
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
            kind: z.ZodLiteral<"phone">;
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
            access: z.ZodObject<{
                desiredPolicy: z.ZodObject<{
                    kind: z.ZodLiteral<"phone">;
                    inbound: z.ZodEnum<{
                        anyone: "anyone";
                        "address-book": "address-book";
                    }>;
                    outboundEnabled: z.ZodBoolean;
                }, z.core.$strict>;
                appliedPolicy: z.ZodNullable<z.ZodObject<{
                    kind: z.ZodLiteral<"phone">;
                    inbound: z.ZodEnum<{
                        anyone: "anyone";
                        "address-book": "address-book";
                    }>;
                    outboundEnabled: z.ZodBoolean;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            sharedNumber: z.ZodObject<{
                status: z.ZodEnum<{
                    unknown: "unknown";
                    available: "available";
                    unavailable: "unavailable";
                }>;
                number: z.ZodNullable<z.ZodString>;
                resourceId: z.ZodNullable<z.ZodString>;
                version: z.ZodNullable<z.ZodNumber>;
                observedAt: z.ZodNullable<z.ZodISODateTime>;
            }, z.core.$strict>;
            routing: z.ZodNullable<z.ZodObject<{
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
                number: z.ZodString;
                resourceId: z.ZodString;
                routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            }, z.core.$strict>>;
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
        observedAt: z.ZodISODateTime;
        runtimeLoadState: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            stopped: "stopped";
            loaded: "loaded";
        }>;
    }, z.core.$strict>;
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/channels/phone/access";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
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
export declare const internalAgentPhoneRuntimeApplyContract: {
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
        kind: z.ZodLiteral<"phone">;
        replayed: z.ZodBoolean;
        outcome: z.ZodEnum<{
            applied: "applied";
            failed: "failed";
            pending: "pending";
        }>;
        completedAt: z.ZodISODateTime;
        snapshot: z.ZodObject<{
            configuration: z.ZodObject<{
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
                kind: z.ZodLiteral<"phone">;
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
                access: z.ZodObject<{
                    desiredPolicy: z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>;
                    appliedPolicy: z.ZodNullable<z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                sharedNumber: z.ZodObject<{
                    status: z.ZodEnum<{
                        unknown: "unknown";
                        available: "available";
                        unavailable: "unavailable";
                    }>;
                    number: z.ZodNullable<z.ZodString>;
                    resourceId: z.ZodNullable<z.ZodString>;
                    version: z.ZodNullable<z.ZodNumber>;
                    observedAt: z.ZodNullable<z.ZodISODateTime>;
                }, z.core.$strict>;
                routing: z.ZodNullable<z.ZodObject<{
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
                    number: z.ZodString;
                    resourceId: z.ZodString;
                    routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                }, z.core.$strict>>;
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
            observedAt: z.ZodISODateTime;
            runtimeLoadState: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
            }>;
        }, z.core.$strict>;
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
        action: z.ZodLiteral<"apply-channel">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        requestChanges: z.ZodNull;
        expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
        expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/channels/phone/access/apply";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        action: z.ZodLiteral<"apply-channel">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        requestChanges: z.ZodNull;
        expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
        expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
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
export declare const internalAgentPhoneRuntimeRouteContract: {
    readonly responseSchema: z.ZodObject<{
        event: z.ZodObject<{
            callId: z.ZodString;
            toNumber: z.ZodString;
            fromNumber: z.ZodNullable<z.ZodString>;
            routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            receivedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        snapshot: z.ZodNullable<z.ZodObject<{
            configuration: z.ZodObject<{
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
                kind: z.ZodLiteral<"phone">;
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
                access: z.ZodObject<{
                    desiredPolicy: z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>;
                    appliedPolicy: z.ZodNullable<z.ZodObject<{
                        kind: z.ZodLiteral<"phone">;
                        inbound: z.ZodEnum<{
                            anyone: "anyone";
                            "address-book": "address-book";
                        }>;
                        outboundEnabled: z.ZodBoolean;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                sharedNumber: z.ZodObject<{
                    status: z.ZodEnum<{
                        unknown: "unknown";
                        available: "available";
                        unavailable: "unavailable";
                    }>;
                    number: z.ZodNullable<z.ZodString>;
                    resourceId: z.ZodNullable<z.ZodString>;
                    version: z.ZodNullable<z.ZodNumber>;
                    observedAt: z.ZodNullable<z.ZodISODateTime>;
                }, z.core.$strict>;
                routing: z.ZodNullable<z.ZodObject<{
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
                    number: z.ZodString;
                    resourceId: z.ZodString;
                    routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                }, z.core.$strict>>;
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
            observedAt: z.ZodISODateTime;
            runtimeLoadState: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
            }>;
        }, z.core.$strict>>;
        resolvedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/internal/channels/phone/route";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        callId: z.ZodString;
        toNumber: z.ZodString;
        fromNumber: z.ZodNullable<z.ZodString>;
        routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        receivedAt: z.ZodISODateTime;
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
//# sourceMappingURL=internal-agent-phone-channel.d.ts.map