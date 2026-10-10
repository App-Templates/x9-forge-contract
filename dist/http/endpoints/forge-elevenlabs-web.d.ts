import { z } from 'zod';
export declare const ForgeElevenLabsWebParamsSchema: z.ZodObject<{
    linkId: z.ZodString;
}, z.core.$strict>;
export declare const forgeElevenLabsWebMetadataContract: {
    readonly method: "GET";
    readonly path: "/api/parla/:linkId";
    readonly paramsSchema: z.ZodObject<{
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        linkId: z.ZodString;
        displayName: z.ZodString;
        state: z.ZodEnum<{
            unavailable: "unavailable";
            paused: "paused";
            ready: "ready";
            off: "off";
        }>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            source_unavailable: "source_unavailable";
            authentication_required: "authentication_required";
            access_denied: "access_denied";
            session_in_progress: "session_in_progress";
        }>;
    }, z.core.$strict>;
    readonly authentication: "optional-forge-session";
    readonly authorization: "server-web-policy";
    readonly cacheControl: "no-store";
};
export declare const forgeElevenLabsWebSessionContract: {
    readonly method: "POST";
    readonly path: "/api/parla/:linkId/session";
    readonly paramsSchema: z.ZodObject<{
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        linkId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        linkId: z.ZodString;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        signedUrl: z.ZodURL;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            source_unavailable: "source_unavailable";
            authentication_required: "authentication_required";
            access_denied: "access_denied";
            session_in_progress: "session_in_progress";
        }>;
    }, z.core.$strict>;
    readonly authentication: "optional-forge-session";
    readonly authorization: "server-web-policy";
    readonly cacheControl: "no-store";
};
export declare function forgeElevenLabsWebMetadataPath(linkId: string): string;
export declare function forgeElevenLabsWebSessionPath(linkId: string): string;
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
export declare function isElevenLabsWebBrowserRequestForLink(rawRequest: unknown, rawLinkId: unknown): boolean;
/** Administrative evidence only. It grants neither browser admission nor a provider session. */
export declare const ForgeElevenLabsWebSnapshotSchema: z.ZodObject<{
    binding: z.ZodObject<{
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
    }, z.core.$strict>;
    policy: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        version: z.ZodNumber;
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        paused: z.ZodBoolean;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    link: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        linkId: z.ZodString;
        url: z.ZodURL;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    lifecycle: z.ZodEnum<{
        unavailable: "unavailable";
        active: "active";
        archived: "archived";
        removed: "removed";
    }>;
    availability: z.ZodEnum<{
        unavailable: "unavailable";
        paused: "paused";
        ready: "ready";
        off: "off";
    }>;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ForgeElevenLabsWebSnapshot = z.infer<typeof ForgeElevenLabsWebSnapshotSchema>;
/** Scope is installed by Forge after authenticating the session and resolving the management ID. */
export declare const ForgeElevenLabsWebDraftSchema: z.ZodObject<{
    access: z.ZodEnum<{
        owner: "owner";
        invited: "invited";
        public: "public";
    }>;
    requestId: z.ZodString;
    paused: z.ZodBoolean;
    expectedVersion: z.ZodNumber;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type ForgeElevenLabsWebDraft = z.infer<typeof ForgeElevenLabsWebDraftSchema>;
/** Inputs must come from current trusted server records, never a browser declaration of ownership. */
export interface ForgeElevenLabsWebProjectionInput {
    binding: unknown;
    trustedAccess: unknown;
    requestedAgentId: unknown;
    admission: unknown;
    configuredOrigin: unknown;
    observedAt: unknown;
    now: number;
}
export declare function projectForgeElevenLabsWebSnapshot(input: ForgeElevenLabsWebProjectionInput): ForgeElevenLabsWebSnapshot | undefined;
/** Validate a browser readback against a separately reloaded binding and current session authorization. */
export declare function isForgeElevenLabsWebSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, access: unknown, agentId: unknown, origin: unknown, now: number): boolean;
export declare function isForgeElevenLabsWebDraftForSnapshot(rawDraft: unknown, rawSnapshot: unknown): boolean;
export declare const ForgeElevenLabsWebPreviewSchema: z.ZodObject<{
    requestId: z.ZodString;
    draft: z.ZodObject<{
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        requestId: z.ZodString;
        paused: z.ZodBoolean;
        expectedVersion: z.ZodNumber;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    snapshot: z.ZodObject<{
        binding: z.ZodObject<{
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
        }, z.core.$strict>;
        policy: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            version: z.ZodNumber;
            access: z.ZodEnum<{
                owner: "owner";
                invited: "invited";
                public: "public";
            }>;
            paused: z.ZodBoolean;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
        link: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            linkId: z.ZodString;
            url: z.ZodURL;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        lifecycle: z.ZodEnum<{
            unavailable: "unavailable";
            active: "active";
            archived: "archived";
            removed: "removed";
        }>;
        availability: z.ZodEnum<{
            unavailable: "unavailable";
            paused: "paused";
            ready: "ready";
            off: "off";
        }>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ForgeElevenLabsWebPreview = z.infer<typeof ForgeElevenLabsWebPreviewSchema>;
export declare function isForgeElevenLabsWebPreviewForDraft(rawDraft: unknown, rawPreview: unknown, binding: unknown, access: unknown, agentId: unknown, origin: unknown, now: number): boolean;
export declare const ForgeElevenLabsWebApplyResultSchema: z.ZodObject<{
    result: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        policy: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            version: z.ZodNumber;
            access: z.ZodEnum<{
                owner: "owner";
                invited: "invited";
                public: "public";
            }>;
            paused: z.ZodBoolean;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    snapshot: z.ZodObject<{
        binding: z.ZodObject<{
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
        }, z.core.$strict>;
        policy: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            version: z.ZodNumber;
            access: z.ZodEnum<{
                owner: "owner";
                invited: "invited";
                public: "public";
            }>;
            paused: z.ZodBoolean;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
        link: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            linkId: z.ZodString;
            url: z.ZodURL;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        lifecycle: z.ZodEnum<{
            unavailable: "unavailable";
            active: "active";
            archived: "archived";
            removed: "removed";
        }>;
        availability: z.ZodEnum<{
            unavailable: "unavailable";
            paused: "paused";
            ready: "ready";
            off: "off";
        }>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ForgeElevenLabsWebApplyResult = z.infer<typeof ForgeElevenLabsWebApplyResultSchema>;
/** The exact immutable command may be replayed; no later revision or replacement link is credited to it. */
export declare function isForgeElevenLabsWebApplyResultForDraft(rawDraft: unknown, rawResult: unknown, rawBefore: unknown, binding: unknown, access: unknown, agentId: unknown, origin: unknown, now: number): boolean;
export declare const forgeElevenLabsWebSnapshotContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:agentId/channels/web/access";
    readonly responseSchema: z.ZodObject<{
        binding: z.ZodObject<{
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
        }, z.core.$strict>;
        policy: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            version: z.ZodNumber;
            access: z.ZodEnum<{
                owner: "owner";
                invited: "invited";
                public: "public";
            }>;
            paused: z.ZodBoolean;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
        link: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            linkId: z.ZodString;
            url: z.ZodURL;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        lifecycle: z.ZodEnum<{
            unavailable: "unavailable";
            active: "active";
            archived: "archived";
            removed: "removed";
        }>;
        availability: z.ZodEnum<{
            unavailable: "unavailable";
            paused: "paused";
            ready: "ready";
            off: "off";
        }>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
    readonly cacheControl: "no-store";
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
export declare const forgeElevenLabsWebPreviewContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/web/access/preview";
    readonly bodySchema: z.ZodObject<{
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        requestId: z.ZodString;
        paused: z.ZodBoolean;
        expectedVersion: z.ZodNumber;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requestId: z.ZodString;
        draft: z.ZodObject<{
            access: z.ZodEnum<{
                owner: "owner";
                invited: "invited";
                public: "public";
            }>;
            requestId: z.ZodString;
            paused: z.ZodBoolean;
            expectedVersion: z.ZodNumber;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            binding: z.ZodObject<{
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
            }, z.core.$strict>;
            policy: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                version: z.ZodNumber;
                access: z.ZodEnum<{
                    owner: "owner";
                    invited: "invited";
                    public: "public";
                }>;
                paused: z.ZodBoolean;
                enabled: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
            link: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                linkId: z.ZodString;
                url: z.ZodURL;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            lifecycle: z.ZodEnum<{
                unavailable: "unavailable";
                active: "active";
                archived: "archived";
                removed: "removed";
            }>;
            availability: z.ZodEnum<{
                unavailable: "unavailable";
                paused: "paused";
                ready: "ready";
                off: "off";
            }>;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
    readonly cacheControl: "no-store";
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
export declare const forgeElevenLabsWebApplyContract: {
    readonly method: "POST";
    readonly path: "/api/agents/:agentId/channels/web/access/apply";
    readonly bodySchema: z.ZodObject<{
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        requestId: z.ZodString;
        paused: z.ZodBoolean;
        expectedVersion: z.ZodNumber;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodObject<{
            ok: z.ZodLiteral<true>;
            requestId: z.ZodString;
            replayed: z.ZodBoolean;
            policy: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                version: z.ZodNumber;
                access: z.ZodEnum<{
                    owner: "owner";
                    invited: "invited";
                    public: "public";
                }>;
                paused: z.ZodBoolean;
                enabled: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            binding: z.ZodObject<{
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
            }, z.core.$strict>;
            policy: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                version: z.ZodNumber;
                access: z.ZodEnum<{
                    owner: "owner";
                    invited: "invited";
                    public: "public";
                }>;
                paused: z.ZodBoolean;
                enabled: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
            link: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                linkId: z.ZodString;
                url: z.ZodURL;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            lifecycle: z.ZodEnum<{
                unavailable: "unavailable";
                active: "active";
                archived: "archived";
                removed: "removed";
            }>;
            availability: z.ZodEnum<{
                unavailable: "unavailable";
                paused: "paused";
                ready: "ready";
                off: "off";
            }>;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
    readonly cacheControl: "no-store";
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
/** Read-only discovery for the existing Modelli writer; this contract does not install a second writer. */
export declare const forgeElevenLabsWebCatalogContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:agentId/channels/web/access/catalog";
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        models: z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            version: z.ZodString;
            sourceVersion: z.ZodString;
            source: z.ZodEnum<{
                "provider-api": "provider-api";
                "provider-documentation": "provider-documentation";
                "server-registry": "server-registry";
            }>;
            observedAt: z.ZodNullable<z.ZodISODateTime>;
            validUntil: z.ZodNullable<z.ZodISODateTime>;
            state: z.ZodEnum<{
                available: "available";
                unavailable: "unavailable";
                "not-configured": "not-configured";
                partial: "partial";
            }>;
            entries: z.ZodArray<z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                label: z.ZodString;
                access: z.ZodEnum<{
                    unknown: "unknown";
                    available: "available";
                    unavailable: "unavailable";
                    "not-configured": "not-configured";
                }>;
                runtimeSupport: z.ZodEnum<{
                    supported: "supported";
                    unsupported: "unsupported";
                }>;
                features: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                limits: z.ZodOptional<z.ZodObject<{
                    maxInputTokens: z.ZodOptional<z.ZodNumber>;
                    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
                    maxInputCharacters: z.ZodOptional<z.ZodNumber>;
                    maxAudioSeconds: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>>;
                embeddingDimensions: z.ZodOptional<z.ZodNumber>;
                reason: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            inventory: z.ZodOptional<z.ZodArray<z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                access: z.ZodEnum<{
                    unknown: "unknown";
                    available: "available";
                    unavailable: "unavailable";
                    "not-configured": "not-configured";
                }>;
                compatibility: z.ZodLiteral<"unqualified">;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        voices: z.ZodObject<{
            version: z.ZodString;
            source: z.ZodLiteral<"provider-api">;
            observedAt: z.ZodNullable<z.ZodISODateTime>;
            validUntil: z.ZodNullable<z.ZodISODateTime>;
            state: z.ZodEnum<{
                available: "available";
                unavailable: "unavailable";
                "not-configured": "not-configured";
                partial: "partial";
            }>;
            entries: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                access: z.ZodEnum<{
                    unknown: "unknown";
                    available: "available";
                    unavailable: "unavailable";
                }>;
                reason: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
    readonly cacheControl: "no-store";
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
export declare function forgeElevenLabsWebSnapshotPath(id: string): string;
export declare function forgeElevenLabsWebPreviewPath(id: string): string;
export declare function forgeElevenLabsWebApplyPath(id: string): string;
export declare function forgeElevenLabsWebCatalogPath(id: string): string;
//# sourceMappingURL=forge-elevenlabs-web.d.ts.map