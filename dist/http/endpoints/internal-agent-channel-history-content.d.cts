import { z } from 'zod';
export declare const AgentChannelHistoryTranscriptParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    kind: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        web: "web";
        phone: "phone";
    }>;
    entryId: z.ZodString;
}, z.core.$strict>;
/** Internal authentication is mandatory; producers never accept a provider id or URL from the caller. */
export declare const internalAgentChannelHistoryTranscriptContract: {
    method: "GET";
    path: "/internal/agents/:agentId/channels/:kind/history/:entryId/transcript";
    authType: "secret";
    cacheControl: "no-store";
    paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
            web: "web";
            phone: "phone";
        }>;
        entryId: z.ZodString;
    }, z.core.$strict>;
    responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    errorResponseSchema: z.ZodObject<{
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
export declare function internalAgentChannelHistoryTranscriptPath(agentId: string, kind: string, entryId: string): string;
//# sourceMappingURL=internal-agent-channel-history-content.d.ts.map