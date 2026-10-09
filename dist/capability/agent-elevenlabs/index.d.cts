import { z } from 'zod';
/**
 * cap-agent-elevenlabs (R6, v1.31.0) — standard capability that owns an agent's ElevenLabs conversational agent.
 *
 * Forge Apply provisions the provider resource ONCE per agent (idempotent by `requestId`; a timeout or replay
 * reconciles the resource already created instead of creating a second one), keeps the mapping provider resource ↔
 * tenant/owner/agent, and reports the external channel as an `AgentRuntimeChannel`, so the agent's canonical state
 * counts it: stopping agent-core does not make a live provider channel look stopped. An existing resource is adopted
 * only through an explicit mapping (`adoptProviderAgentId`); new agents are never wired to a hard-coded id.
 * Provider credentials travel only through the per-call context (R3), never in these payloads.
 */
/** One provider resource serves one agent: no person in this scope. */
export declare const ElevenLabsAgentScopeSchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsAgentScope = z.infer<typeof ElevenLabsAgentScopeSchema>;
export declare const ElevenLabsProviderAgentIdSchema: z.ZodString;
export type ElevenLabsProviderAgentId = z.infer<typeof ElevenLabsProviderAgentIdSchema>;
/** webhook: the provider calls the capability's `/call/:tool` · client: handled by the project UI. */
export declare const ElevenLabsToolKindSchema: z.ZodEnum<{
    webhook: "webhook";
    client: "client";
}>;
export type ElevenLabsToolKind = z.infer<typeof ElevenLabsToolKindSchema>;
export declare const ElevenLabsToolBindingSchema: z.ZodObject<{
    name: z.ZodString;
    kind: z.ZodEnum<{
        webhook: "webhook";
        client: "client";
    }>;
    description: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsToolBinding = z.infer<typeof ElevenLabsToolBindingSchema>;
export declare const ElevenLabsAgentConfigSchema: z.ZodObject<{
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
export type ElevenLabsAgentConfig = z.infer<typeof ElevenLabsAgentConfigSchema>;
export declare const ElevenLabsDesiredStateSchema: z.ZodEnum<{
    active: "active";
    paused: "paused";
}>;
export type ElevenLabsDesiredState = z.infer<typeof ElevenLabsDesiredStateSchema>;
export declare const ElevenLabsProvisionRequestSchema: z.ZodObject<{
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
export type ElevenLabsProvisionRequest = z.infer<typeof ElevenLabsProvisionRequestSchema>;
export declare const ElevenLabsMappingOriginSchema: z.ZodEnum<{
    provisioned: "provisioned";
    adopted: "adopted";
}>;
export type ElevenLabsMappingOrigin = z.infer<typeof ElevenLabsMappingOriginSchema>;
export declare const ElevenLabsAgentMappingSchema: z.ZodObject<{
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
export type ElevenLabsAgentMapping = z.infer<typeof ElevenLabsAgentMappingSchema>;
/**
 * Same binding snapshot: full scope (tenant, owner, agent), provider resource, origin, applied version and creation
 * time. A provider id alone never identifies a binding across tenants/owners/agents.
 */
export declare function sameElevenLabsMapping(a: ElevenLabsAgentMapping, b: ElevenLabsAgentMapping): boolean;
export declare const ElevenLabsChannelStatusSchema: z.ZodObject<{
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
export type ElevenLabsChannelStatus = z.infer<typeof ElevenLabsChannelStatusSchema>;
export declare const ElevenLabsProvisionOutcomeSchema: z.ZodEnum<{
    adopted: "adopted";
    created: "created";
    updated: "updated";
    unchanged: "unchanged";
}>;
export type ElevenLabsProvisionOutcome = z.infer<typeof ElevenLabsProvisionOutcomeSchema>;
export declare const ElevenLabsProvisionResultSchema: z.ZodObject<{
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
export type ElevenLabsProvisionResult = z.infer<typeof ElevenLabsProvisionResultSchema>;
export declare const ElevenLabsProvisionErrorCodeSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    idempotency_conflict: "idempotency_conflict";
    credential_missing: "credential_missing";
    provider_unavailable: "provider_unavailable";
    provider_rejected: "provider_rejected";
    reconcile_pending: "reconcile_pending";
    stale_version: "stale_version";
    agent_mismatch: "agent_mismatch";
    adoption_conflict: "adoption_conflict";
}>;
export type ElevenLabsProvisionErrorCode = z.infer<typeof ElevenLabsProvisionErrorCodeSchema>;
export declare const ElevenLabsProvisionErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        idempotency_conflict: "idempotency_conflict";
        credential_missing: "credential_missing";
        provider_unavailable: "provider_unavailable";
        provider_rejected: "provider_rejected";
        reconcile_pending: "reconcile_pending";
        stale_version: "stale_version";
        agent_mismatch: "agent_mismatch";
        adoption_conflict: "adoption_conflict";
    }>;
    retryable: z.ZodBoolean;
    currentVersion: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ElevenLabsProvisionErrorResponse = z.infer<typeof ElevenLabsProvisionErrorResponseSchema>;
//# sourceMappingURL=index.d.ts.map