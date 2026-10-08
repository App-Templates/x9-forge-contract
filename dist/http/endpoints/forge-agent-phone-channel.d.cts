import { z } from 'zod';
/** Authority comes from the existing server session guard; this value is never a browser input. */
export declare function isAgentPhoneWithinForgeAuthorization(rawSnapshot: unknown, trustedAccess: unknown, requestedAgentId: unknown): boolean;
/** Phone door only: no voice writer, recipient number, contact copy, provider or client authority. */
export declare const ForgeAgentPhoneDraftSchema: z.ZodObject<{
    requestId: z.ZodString;
    expectedDesiredVersion: z.ZodNumber;
    expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
    desiredState: z.ZodEnum<{
        active: "active";
        paused: "paused";
    }>;
    policy: z.ZodObject<{
        kind: z.ZodLiteral<"phone">;
        inbound: z.ZodEnum<{
            anyone: "anyone";
            "address-book": "address-book";
        }>;
        outboundEnabled: z.ZodBoolean;
    }, z.core.$strict>;
    expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
    expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
}, z.core.$strict>;
export type ForgeAgentPhoneDraft = z.infer<typeof ForgeAgentPhoneDraftSchema>;
/** CAS comparison only. Producers must additionally check authorization and fresh evidence before saving. */
export declare function isForgeAgentPhoneDraftForSnapshot(rawDraft: unknown, rawSnapshot: unknown): boolean;
/** Unsaved intent alongside actual evidence; a preview never asserts that Apply succeeded. */
export declare const ForgeAgentPhonePreviewSchema: z.ZodObject<{
    requestId: z.ZodString;
    draft: z.ZodObject<{
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        policy: z.ZodObject<{
            kind: z.ZodLiteral<"phone">;
            inbound: z.ZodEnum<{
                anyone: "anyone";
                "address-book": "address-book";
            }>;
            outboundEnabled: z.ZodBoolean;
        }, z.core.$strict>;
        expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
        expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
    }, z.core.$strict>;
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
        agentArchived: z.ZodBoolean;
        runtimeLoadState: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            stopped: "stopped";
            loaded: "loaded";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ForgeAgentPhonePreview = z.infer<typeof ForgeAgentPhonePreviewSchema>;
export declare function isForgeAgentPhonePreviewForDraft(rawDraft: unknown, rawPreview: unknown, trustedAccess: unknown, requestedAgentId: unknown, now: number, maximumAgeMs?: number): boolean;
export declare const forgeAgentPhoneSnapshotContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:agentId/channels/phone/access";
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
        agentArchived: z.ZodBoolean;
        runtimeLoadState: z.ZodEnum<{
            error: "error";
            unknown: "unknown";
            stopped: "stopped";
            loaded: "loaded";
        }>;
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
export declare const forgeAgentPhonePreviewContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/phone/access/preview";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        policy: z.ZodObject<{
            kind: z.ZodLiteral<"phone">;
            inbound: z.ZodEnum<{
                anyone: "anyone";
                "address-book": "address-book";
            }>;
            outboundEnabled: z.ZodBoolean;
        }, z.core.$strict>;
        expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
        expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
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
            policy: z.ZodObject<{
                kind: z.ZodLiteral<"phone">;
                inbound: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
                outboundEnabled: z.ZodBoolean;
            }, z.core.$strict>;
            expectedNumberVersion: z.ZodNullable<z.ZodNumber>;
            expectedRoutingIdentity: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
        }, z.core.$strict>;
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
            agentArchived: z.ZodBoolean;
            runtimeLoadState: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
            }>;
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
export declare const forgeAgentPhoneApplyContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/phone/access/apply";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        expectedDesiredVersion: z.ZodNumber;
        expectedAppliedVersion: z.ZodNullable<z.ZodNumber>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        policy: z.ZodObject<{
            kind: z.ZodLiteral<"phone">;
            inbound: z.ZodEnum<{
                anyone: "anyone";
                "address-book": "address-book";
            }>;
            outboundEnabled: z.ZodBoolean;
        }, z.core.$strict>;
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
            agentArchived: z.ZodBoolean;
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
export declare function forgeAgentPhonePath(agentId: string): string;
export declare function forgeAgentPhonePreviewPath(agentId: string): string;
export declare function forgeAgentPhoneApplyPath(agentId: string): string;
//# sourceMappingURL=forge-agent-phone-channel.d.ts.map