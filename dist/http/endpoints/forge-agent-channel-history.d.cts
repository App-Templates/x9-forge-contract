import { z } from 'zod';
/** Server-only session ownership comparison; a GET never turns a historical event into readiness. */
export declare function isAgentChannelHistoryWithinForgeAuthorization(rawHistory: unknown, trustedAccess: unknown, requestedAgentId: unknown): boolean;
export declare const forgeAgentChannelHistoryContract: {
    readonly method: "GET";
    readonly path: "/api/agents/:agentId/channels/:kind/history";
    readonly authentication: "forge-session";
    readonly authorization: "sa-or-agent-owner";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
            web: "web";
            phone: "phone";
        }>;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare function forgeAgentChannelHistoryPath(agentId: string, kind: string): string;
//# sourceMappingURL=forge-agent-channel-history.d.ts.map