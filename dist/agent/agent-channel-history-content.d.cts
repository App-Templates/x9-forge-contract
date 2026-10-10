import { z } from 'zod';
/** Plain conversation text only. Never HTML, provider envelopes, tool arguments or system prompts. */
export declare const AgentChannelHistoryTranscriptTurnSchema: z.ZodObject<{
    speaker: z.ZodEnum<{
        user: "user";
        assistant: "assistant";
    }>;
    text: z.ZodString;
    offsetSeconds: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export declare const AgentChannelHistoryTranscriptResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    observedAt: z.ZodISODateTime;
    subject: z.ZodNullable<z.ZodString>;
    turns: z.ZodArray<z.ZodObject<{
        speaker: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        text: z.ZodString;
        offsetSeconds: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        web: "web";
        phone: "phone";
    }>;
    entryId: z.ZodString;
    conversationId: z.ZodString;
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
    status: z.ZodEnum<{
        unavailable: "unavailable";
        expired: "expired";
        "not-applicable": "not-applicable";
        "not-retained": "not-retained";
    }>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        web: "web";
        phone: "phone";
    }>;
    entryId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>], "status">;
export type AgentChannelHistoryTranscriptResponse = z.infer<typeof AgentChannelHistoryTranscriptResponseSchema>;
/** Correlation only: the producer authenticates, reloads the exact stored entry and rechecks current authority.
 * A missing/expired/unretained transcript never becomes an empty successful conversation.
 */
export declare function isAgentChannelHistoryTranscriptCurrent(rawContent: unknown, rawBinding: unknown, rawKind: unknown, rawEntryId: unknown, rawEntry: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-channel-history-content.d.ts.map