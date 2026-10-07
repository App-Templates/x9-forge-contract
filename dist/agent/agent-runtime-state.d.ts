import { z } from 'zod';
/** Canonical agent state; legacy bot status alone cannot supply these values. */
export declare const AgentRuntimeStateSchema: z.ZodEnum<{
    error: "error";
    unknown: "unknown";
    active: "active";
    "no-channel": "no-channel";
    stopped: "stopped";
}>;
export type AgentRuntimeState = z.infer<typeof AgentRuntimeStateSchema>;
export declare const AgentRuntimeChannelKindSchema: z.ZodUnion<[z.ZodEnum<{
    email: "email";
    voice: "voice";
    telegram: "telegram";
    whatsapp: "whatsapp";
}>, z.ZodLiteral<"web">]>;
export type AgentRuntimeChannelKind = z.infer<typeof AgentRuntimeChannelKindSchema>;
export declare const AgentRuntimeChannelStateSchema: z.ZodEnum<{
    error: "error";
    unknown: "unknown";
    stopped: "stopped";
    loaded: "loaded";
    paused: "paused";
}>;
export type AgentRuntimeChannelState = z.infer<typeof AgentRuntimeChannelStateSchema>;
/** Readiness is independent of whether a channel is currently loaded. */
export declare const AgentRuntimeReadinessSchema: z.ZodEnum<{
    unknown: "unknown";
    ready: "ready";
    "not-ready": "not-ready";
}>;
export type AgentRuntimeReadiness = z.infer<typeof AgentRuntimeReadinessSchema>;
export declare const AgentRuntimeChannelSchema: z.ZodObject<{
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
export type AgentRuntimeChannel = z.infer<typeof AgentRuntimeChannelSchema>;
export type AgentTelegramChannelMetadata = Pick<AgentRuntimeChannel, 'botUsername' | 'allowFromCount'>;
/** Read validated Telegram observations without exposing authorization IDs or inferring readiness. */
export declare function telegramChannelMetadataOf(channel: unknown): AgentTelegramChannelMetadata | null;
export declare const AgentRuntimeLoadStateSchema: z.ZodEnum<{
    error: "error";
    unknown: "unknown";
    stopped: "stopped";
    loaded: "loaded";
}>;
export type AgentRuntimeLoadState = z.infer<typeof AgentRuntimeLoadStateSchema>;
export declare const AgentRuntimeEvidenceSchema: z.ZodObject<{
    loadState: z.ZodEnum<{
        error: "error";
        unknown: "unknown";
        stopped: "stopped";
        loaded: "loaded";
    }>;
    channelsComplete: z.ZodBoolean;
    channels: z.ZodArray<z.ZodObject<{
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
}, z.core.$strip>;
export type AgentRuntimeEvidence = z.infer<typeof AgentRuntimeEvidenceSchema>;
/** Derive state from validated X9 observations, including capability-owned channels. */
export declare function deriveAgentRuntimeState(evidence: AgentRuntimeEvidence): AgentRuntimeState;
export declare const AgentRuntimeSnapshotSchema: z.ZodObject<{
    loadState: z.ZodEnum<{
        error: "error";
        unknown: "unknown";
        stopped: "stopped";
        loaded: "loaded";
    }>;
    channelsComplete: z.ZodBoolean;
    channels: z.ZodArray<z.ZodObject<{
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
    state: z.ZodEnum<{
        error: "error";
        unknown: "unknown";
        active: "active";
        "no-channel": "no-channel";
        stopped: "stopped";
    }>;
}, z.core.$strip>;
export type AgentRuntimeSnapshot = z.infer<typeof AgentRuntimeSnapshotSchema>;
//# sourceMappingURL=agent-runtime-state.d.ts.map