import { z } from 'zod';
export declare const elevenLabsWebSnapshotContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs/web";
    readonly responseSchema: z.ZodObject<{
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
        provider: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            mapping: z.ZodNullable<z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                providerAgentId: z.ZodString;
                origin: z.ZodEnum<{
                    provisioned: "provisioned";
                    adopted: "adopted";
                }>;
                createdAt: z.ZodISODateTime;
                appliedConfigVersion: z.ZodNumber;
            }, z.core.$strip>>;
            desiredState: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
            channel: z.ZodObject<{
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
            }, z.core.$strip>;
            observedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strip>;
        lifecycle: z.ZodEnum<{
            unavailable: "unavailable";
            active: "active";
            archived: "archived";
            removed: "removed";
        }>;
        invitation: z.ZodNullable<z.ZodObject<{
            invitationId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            revision: z.ZodNumber;
            recipientUserId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
            revokedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        invitationRevision: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const elevenLabsWebPolicyContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs/web/policy";
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        expectedVersion: z.ZodNumber;
        access: z.ZodEnum<{
            owner: "owner";
            invited: "invited";
            public: "public";
        }>;
        paused: z.ZodBoolean;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const elevenLabsWebCatalogContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs/web/catalog";
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
                    live: "live";
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
                    vision: z.ZodOptional<z.ZodBoolean>;
                    webSearch: z.ZodOptional<z.ZodBoolean>;
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
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const elevenLabsWebSessionContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs/web/session";
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        linkId: z.ZodString;
        viewer: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"anonymous">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"authenticated">;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            owner: z.ZodNullable<z.ZodObject<{
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
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
        policyVersion: z.ZodNumber;
        mapping: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            providerAgentId: z.ZodString;
            origin: z.ZodEnum<{
                provisioned: "provisioned";
                adopted: "adopted";
            }>;
            createdAt: z.ZodISODateTime;
            appliedConfigVersion: z.ZodNumber;
        }, z.core.$strip>;
        viewer: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"anonymous">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"authenticated">;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            owner: z.ZodNullable<z.ZodObject<{
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>], "kind">;
        invitation: z.ZodNullable<z.ZodObject<{
            invitationId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            revision: z.ZodNumber;
            recipientUserId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
            revokedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        invitationRevision: z.ZodNullable<z.ZodNumber>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        signedUrl: z.ZodURL;
    }, z.core.$strict>;
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare function capElevenLabsWebPath(agentId: string): string;
export declare function capElevenLabsWebSessionPath(agentId: string): string;
export declare const ELEVENLABS_WEB_PUBLIC_PAGE_PATH: "/parla/:linkId";
export declare function elevenLabsWebPublicPath(linkId: string): string;
//# sourceMappingURL=internal-capability-elevenlabs-web.d.ts.map