import { z } from 'zod';
/**
 * cap-agent-elevenlabs per-agent routes (R6, v1.31.0). Direction: Forge Apply -> cap-agent-elevenlabs.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 *
 * - `PUT  /internal/capability/agents/:agentId/elevenlabs` — provision/update the provider agent (idempotent).
 * - `GET  /internal/capability/agents/:agentId/elevenlabs` — mapping and external channel state.
 *
 * Errors: `ElevenLabsProvisionErrorResponseSchema` (400 invalid_request / agent_mismatch when `scope.agentId` differs
 * from the path, 409 idempotency_conflict / stale_version / adoption_conflict, 424 credential_missing,
 * 502 provider_rejected, 503 provider_unavailable / reconcile_pending).
 */
export declare const elevenLabsProvisionContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        config: z.ZodObject<{
            displayName: z.ZodString;
            voiceId: z.ZodString;
            model: z.ZodString;
            llm: z.ZodString;
            language: z.ZodString;
            firstMessage: z.ZodOptional<z.ZodString>;
            promptVersion: z.ZodString;
            tools: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                kind: z.ZodEnum<{
                    webhook: "webhook";
                    client: "client";
                }>;
                description: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        desiredState: z.ZodEnum<{
            active: "active";
            paused: "paused";
        }>;
        adoptProviderAgentId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        outcome: z.ZodEnum<{
            adopted: "adopted";
            created: "created";
            updated: "updated";
            unchanged: "unchanged";
        }>;
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
        status: z.ZodObject<{
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
            }, z.core.$strip>;
            observedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
export declare const elevenLabsStatusContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/elevenlabs";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
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
        }, z.core.$strip>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strip>;
};
export declare function capElevenLabsAgentPath(agentId: string): string;
//# sourceMappingURL=internal-capability-elevenlabs.d.ts.map