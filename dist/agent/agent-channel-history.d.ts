import { z } from 'zod';
/** One canonical owner-scoped history for all four doors; never a raw provider log. */
export declare const AgentChannelHistoryKindSchema: z.ZodEnum<{
    email: "email";
    telegram: "telegram";
    web: "web";
    phone: "phone";
}>;
export type AgentChannelHistoryKind = z.infer<typeof AgentChannelHistoryKindSchema>;
export declare const AgentChannelHistoryContentStateSchema: z.ZodEnum<{
    available: "available";
    unavailable: "unavailable";
    expired: "expired";
    "not-applicable": "not-applicable";
    "not-retained": "not-retained";
}>;
export declare const AgentChannelHistoryEntrySchema: z.ZodObject<{
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
    entryId: z.ZodString;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        web: "web";
        phone: "phone";
    }>;
    conversationId: z.ZodString;
    requestId: z.ZodNullable<z.ZodString>;
    direction: z.ZodEnum<{
        inbound: "inbound";
        outbound: "outbound";
    }>;
    participantName: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        unknown: "unknown";
        failed: "failed";
        active: "active";
        completed: "completed";
    }>;
    startedAt: z.ZodISODateTime;
    endedAt: z.ZodNullable<z.ZodISODateTime>;
    durationSeconds: z.ZodNullable<z.ZodNumber>;
    content: z.ZodObject<{
        audio: z.ZodEnum<{
            available: "available";
            unavailable: "unavailable";
            expired: "expired";
            "not-applicable": "not-applicable";
            "not-retained": "not-retained";
        }>;
        transcript: z.ZodEnum<{
            available: "available";
            unavailable: "unavailable";
            expired: "expired";
            "not-applicable": "not-applicable";
            "not-retained": "not-retained";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AgentChannelHistoryEntry = z.infer<typeof AgentChannelHistoryEntrySchema>;
export declare const AgentChannelHistoryVerificationSchema: z.ZodObject<{
    requestId: z.ZodString;
    entryId: z.ZodString;
    completedAt: z.ZodISODateTime;
    outcome: z.ZodEnum<{
        failed: "failed";
        completed: "completed";
    }>;
}, z.core.$strict>;
export type AgentChannelHistoryVerification = z.infer<typeof AgentChannelHistoryVerificationSchema>;
export declare const AgentChannelHistoryResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    status: z.ZodLiteral<"available">;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        web: "web";
        phone: "phone";
    }>;
    observedAt: z.ZodISODateTime;
    entries: z.ZodArray<z.ZodObject<{
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
        entryId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
            web: "web";
            phone: "phone";
        }>;
        conversationId: z.ZodString;
        requestId: z.ZodNullable<z.ZodString>;
        direction: z.ZodEnum<{
            inbound: "inbound";
            outbound: "outbound";
        }>;
        participantName: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            unknown: "unknown";
            failed: "failed";
            active: "active";
            completed: "completed";
        }>;
        startedAt: z.ZodISODateTime;
        endedAt: z.ZodNullable<z.ZodISODateTime>;
        durationSeconds: z.ZodNullable<z.ZodNumber>;
        content: z.ZodObject<{
            audio: z.ZodEnum<{
                available: "available";
                unavailable: "unavailable";
                expired: "expired";
                "not-applicable": "not-applicable";
                "not-retained": "not-retained";
            }>;
            transcript: z.ZodEnum<{
                available: "available";
                unavailable: "unavailable";
                expired: "expired";
                "not-applicable": "not-applicable";
                "not-retained": "not-retained";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    total: z.ZodNullable<z.ZodNumber>;
    nextCursor: z.ZodNullable<z.ZodString>;
    lastVerification: z.ZodNullable<z.ZodObject<{
        requestId: z.ZodString;
        entryId: z.ZodString;
        completedAt: z.ZodISODateTime;
        outcome: z.ZodEnum<{
            failed: "failed";
            completed: "completed";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
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
    status: z.ZodLiteral<"unavailable">;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        web: "web";
        phone: "phone";
    }>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
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
}, z.core.$strict>], "status">;
export type AgentChannelHistoryResponse = z.infer<typeof AgentChannelHistoryResponseSchema>;
/** A producer still authenticates the caller and attests each stored fact. */
export declare function isAgentChannelHistoryCurrent(rawHistory: unknown, rawBinding: unknown, rawKind: unknown, now: number, maximumAgeMs?: number): boolean;
/** Correlation/freshness only, NOT resource generation or a completed user round trip.
 * Compose the appropriate end-to-end evidence guard before displaying a healthy door. */
export declare function isAgentChannelHistoryVerificationCurrent(rawHistory: unknown, rawBinding: unknown, rawKind: unknown, expectedRequestId: unknown, now: number, maximumAgeMs?: number): boolean;
/** Internal server evidence, NEVER the public history DTO. Existing writers attest actual events;
 * these schemas do not authenticate accounts, deliver replies or establish a new ledger/store.
 */
/** Expected participant comes from the existing owners registry, not from the request body or admitted-chat list. */
export declare const AgentChannelHistoryOwnerParticipantSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"telegram">;
    userId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"email">;
    address: z.ZodEmail;
}, z.core.$strict>], "kind">;
export type AgentChannelHistoryOwnerParticipant = z.infer<typeof AgentChannelHistoryOwnerParticipantSchema>;
export declare const AgentChannelHistoryRoundTripEvidenceSchema: z.ZodObject<{
    requestId: z.ZodString;
    entryId: z.ZodString;
    participant: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"telegram">;
        userId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"email">;
        address: z.ZodEmail;
    }, z.core.$strict>], "kind">;
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
    owner: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestedAt: z.ZodISODateTime;
    receivedAt: z.ZodISODateTime;
    turnCompletedAt: z.ZodISODateTime;
    replyDeliveredAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentChannelHistoryRoundTripEvidence = z.infer<typeof AgentChannelHistoryRoundTripEvidenceSchema>;
/** TG/email only: phone/web require their canonical C2/C3 conversation-completion evidence separately. */
export declare function isAgentChannelHistoryRoundTripVerified(rawHistory: unknown, rawBinding: unknown, rawKind: unknown, expectedRequestId: unknown, rawEvidence: unknown, rawCurrentConfiguration: unknown, rawExpectedOwnerParticipant: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-channel-history.d.ts.map