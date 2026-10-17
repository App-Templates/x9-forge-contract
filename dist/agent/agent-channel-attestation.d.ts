import { z } from 'zod';
export declare const AgentExternalChannelKindSchema: z.ZodEnum<{
    email: "email";
    voice: "voice";
}>;
/** Service must authenticate and authorize this scope before observing its own handler. */
export declare const AgentChannelAttestationRequestSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        email: "email";
        voice: "voice";
    }>;
    configVersion: z.ZodNumber;
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
export type AgentChannelAttestationRequest = z.infer<typeof AgentChannelAttestationRequestSchema>;
/** Actual service observation, never inferred from persisted desired state or global health. */
export declare const AgentChannelAttestationSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type AgentChannelAttestation = z.infer<typeof AgentChannelAttestationSchema>;
/** Binding/freshness only. Current error/not-ready observations do not prove readiness or channelsComplete.
 * Clock is injected for deterministic consumers; the service must observe on each request, not refresh a cached date.
 */
export declare function isChannelAttestationCurrent(rawRequest: unknown, rawObservation: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-channel-attestation.d.ts.map