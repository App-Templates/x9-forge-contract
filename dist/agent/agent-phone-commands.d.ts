import { z } from 'zod';
/** Runtime evidence only. X9 cannot assert the archival status owned by Forge. */
export declare const AgentPhoneRuntimeSnapshotSchema: z.ZodObject<{
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
export type AgentPhoneRuntimeSnapshot = z.infer<typeof AgentPhoneRuntimeSnapshotSchema>;
/** Public composition requires archival status from the owning agent record, never a default. */
export declare const AgentPhoneSnapshotSchema: z.ZodObject<{
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
        loaded: "loaded";
        stopped: "stopped";
    }>;
    agentArchived: z.ZodBoolean;
}, z.core.$strict>;
export type AgentPhoneSnapshot = z.infer<typeof AgentPhoneSnapshotSchema>;
/** Phone has no Telegram request queue. Reuse C1 CAS/action/requestId and reject all request changes. */
export declare const AgentPhoneApplyCommandSchema: z.ZodObject<{
    action: z.ZodLiteral<"apply-channel">;
    requestId: z.ZodString;
    desiredVersion: z.ZodNumber;
    expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
    requestChanges: z.ZodNull;
    expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
    expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
}, z.core.$strict>;
export type AgentPhoneApplyCommand = z.infer<typeof AgentPhoneApplyCommandSchema>;
export declare function isAgentPhoneRuntimeSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
export declare function isAgentPhoneSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
export declare function isAgentPhoneRuntimeApplyReady(rawCommand: unknown, rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
export declare function isAgentPhoneApplyReady(rawCommand: unknown, rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
/** C1 outcome vocabulary and sanitized errors, with phone-specific snapshot correlation. */
export declare const AgentPhoneRuntimeApplyResultSchema: z.ZodObject<{
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
            loaded: "loaded";
            stopped: "stopped";
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
export type AgentPhoneRuntimeApplyResult = z.infer<typeof AgentPhoneRuntimeApplyResultSchema>;
export declare const AgentPhoneApplyResultSchema: z.ZodObject<{
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
export type AgentPhoneApplyResult = z.infer<typeof AgentPhoneApplyResultSchema>;
export declare function isAgentPhoneRuntimeResultForCommand(rawCommand: unknown, rawResult: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
export declare function isAgentPhoneResultForCommand(rawCommand: unknown, rawResult: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
/** Payload from an already verified provider event; this schema never verifies a signature or grants admission. */
export declare const AgentPhoneInboundRouteEventSchema: z.ZodObject<{
    callId: z.ZodString;
    toNumber: z.ZodString;
    fromNumber: z.ZodNullable<z.ZodString>;
    routingIdentity: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    receivedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentPhoneInboundRouteEvent = z.infer<typeof AgentPhoneInboundRouteEventSchema>;
/** Completeness is authoritative for ambiguity detection; a partial inventory cannot prove a unique route. */
export declare const AgentPhoneRuntimeRoutingInventorySchema: z.ZodObject<{
    source: z.ZodObject<{
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
    }, z.core.$strict>;
    snapshots: z.ZodArray<z.ZodObject<{
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
}, z.core.$strict>;
export type AgentPhoneRuntimeRoutingInventory = z.infer<typeof AgentPhoneRuntimeRoutingInventorySchema>;
export declare const AgentPhoneRoutingInventorySchema: z.ZodObject<{
    source: z.ZodObject<{
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
    }, z.core.$strict>;
    snapshots: z.ZodArray<z.ZodObject<{
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
            loaded: "loaded";
            stopped: "stopped";
        }>;
        agentArchived: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentPhoneRoutingInventory = z.infer<typeof AgentPhoneRoutingInventorySchema>;
/** A runtime candidate is not admission: Forge archival, Rubrica and caller authority still gate effects. */
export declare function resolveAgentPhoneRuntimeRoute(rawEvent: unknown, rawInventory: unknown, now: number, maximumAgeMs?: number): AgentPhoneRuntimeSnapshot | null;
export declare function resolveAgentPhoneRoute(rawEvent: unknown, rawInventory: unknown, now: number, maximumAgeMs?: number): AgentPhoneSnapshot | null;
/** Correlated routing observation, including an explicit unresolved result. Never a caller admission receipt. */
export declare const AgentPhoneRuntimeRouteResultSchema: z.ZodObject<{
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
            loaded: "loaded";
            stopped: "stopped";
        }>;
    }, z.core.$strict>>;
    resolvedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentPhoneRuntimeRouteResult = z.infer<typeof AgentPhoneRuntimeRouteResultSchema>;
export declare const AgentPhoneRouteResultSchema: z.ZodObject<{
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
export type AgentPhoneRouteResult = z.infer<typeof AgentPhoneRouteResultSchema>;
export declare function isAgentPhoneRuntimeRouteResultForEvent(rawEvent: unknown, rawResult: unknown, now: number, maximumAgeMs?: number): boolean;
export declare function isAgentPhoneRouteResultForEvent(rawEvent: unknown, rawResult: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-phone-commands.d.ts.map