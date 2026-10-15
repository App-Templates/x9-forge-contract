import { z } from 'zod';
/**
 * POST /internal/agents/:agentId/turn — synchronous turn addressed to ONE
 * specific agent loaded in agent-core (v1.22.0, Enterprise Adoption M0).
 * Direction: X9 cap-voice-live (web ingress) -> X9 agent-core (internal)
 * Auth: X-Internal-Secret
 *
 * `/internal/turn` always runs the env PRIMARY agent (Stefano's personal X9).
 * This sibling runs the turn with the deps of the agent named in the path
 * (workspace, registry, memory identity from its own context.json), so a voice
 * session bound to a Forge-created agent never touches the personal agent's
 * memory. A primary turn additionally requires the complete trusted identity
 * to match its current loaded context; legacy primary bodies remain refused.
 *
 * Legacy bodies and responses remain valid. Only this per-agent route adds
 * optional `turn` and response `moveId` (v1.25.0) and an optional authenticated
 * caller's `userId` (v1.26.0), and the voice-led `prepare`/`exchange` turns with response
 * `lead`/`note` (v1.27.0), and the optional trusted `organizationRun`
 * (run context + attempt, additive); the personal `/internal/turn` schema is unchanged.
 * agentId uses the same regex as `/internal/agents/:agentId/reload|stop`
 * (agent-core agent id; Forge factory slugs are a subset).
 *
 * Errors: 400 invalid agentId/body, 401 missing/wrong secret, 403 primary
 * agent, 404 `{ ok: false, error: 'unknown_agent' }`, 500 turn failure.
 *
 * Consumers:
 *   - agent-x9 services/agent-core (server)
 *   - agent-x9 services/cap-voice-live `x9_ask` for agent-bound web sessions (client)
 */
export declare const InternalAgentTurnParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export type InternalAgentTurnParams = z.infer<typeof InternalAgentTurnParamsSchema>;
/** Trusted run context and attempt of the calling organization run; both must name the same run. */
export declare const InternalAgentTurnOrganizationRunSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    attempt: z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        attemptNumber: z.ZodNumber;
        startedAt: z.ZodISODateTime;
        idempotencyKey: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type InternalAgentTurnOrganizationRun = z.infer<typeof InternalAgentTurnOrganizationRunSchema>;
export declare const InternalAgentTurnRequestSchema: z.ZodObject<{
    channelId: z.ZodString;
    sessionId: z.ZodString;
    message: z.ZodString;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            system: "system";
            user: "user";
            assistant: "assistant";
            tool: "tool";
        }>;
        content: z.ZodString;
        toolCallId: z.ZodOptional<z.ZodString>;
        toolName: z.ZodOptional<z.ZodString>;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    attachment: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            document: "document";
            photo: "photo";
            video: "video";
        }>;
        fileUrl: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
        filename: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    turn: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"opening">;
        turnId: z.ZodString;
        text: z.ZodLiteral<"">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"answer">;
        turnId: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"incomplete">;
        turnId: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"delivery">;
        turnId: z.ZodString;
        text: z.ZodLiteral<"">;
        moveId: z.ZodString;
        spokenText: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"prepare">;
        turnId: z.ZodString;
        text: z.ZodLiteral<"">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"exchange">;
        turnId: z.ZodString;
        text: z.ZodString;
        spokenText: z.ZodString;
        ended: z.ZodBoolean;
    }, z.core.$strict>], "kind">>;
    identity: z.ZodOptional<z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    userId: z.ZodOptional<z.ZodString>;
    organizationRun: z.ZodOptional<z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            attemptNumber: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            idempotencyKey: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type InternalAgentTurnRequest = z.infer<typeof InternalAgentTurnRequestSchema>;
/** v1.27.0: `lead` answers a `prepare` turn, `note` an `exchange` turn; both come with an empty `reply`. */
export declare const InternalAgentTurnResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    reply: z.ZodString;
    updatedHistory: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            system: "system";
            user: "user";
            assistant: "assistant";
            tool: "tool";
        }>;
        content: z.ZodString;
        toolCallId: z.ZodOptional<z.ZodString>;
        toolName: z.ZodOptional<z.ZodString>;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    moveId: z.ZodOptional<z.ZodString>;
    lead: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
    connectionCards: z.ZodOptional<z.ZodArray<z.ZodObject<{
        cardId: z.ZodString;
        provider: z.ZodEnum<{
            google: "google";
        }>;
        permissions: z.ZodArray<z.ZodEnum<{
            calendar_events: "calendar_events";
            contacts_read: "contacts_read";
            mail_send: "mail_send";
        }>>;
        url: z.ZodString;
        expiresAt: z.ZodNumber;
        state: z.ZodEnum<{
            connected: "connected";
            revoked: "revoked";
            pending: "pending";
            denied: "denied";
            expired: "expired";
        }>;
        reason: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strip>;
export type InternalAgentTurnResponse = z.infer<typeof InternalAgentTurnResponseSchema>;
export declare const InternalAgentTurnErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalAgentTurnErrorResponse = z.infer<typeof InternalAgentTurnErrorResponseSchema>;
/** Error code returned with 404 when the agent is not loaded in agent-core. */
export declare const INTERNAL_AGENT_TURN_UNKNOWN_AGENT: "unknown_agent";
/** Error code returned with 403 for a primary turn without a scoped admission. */
export declare const INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN: "primary_agent_forbidden";
/** Build the concrete path for an agent id (validated). */
export declare function internalAgentTurnPath(agentId: string): string;
export declare const internalAgentTurnContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/turn";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        channelId: z.ZodString;
        sessionId: z.ZodString;
        message: z.ZodString;
        history: z.ZodOptional<z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                system: "system";
                user: "user";
                assistant: "assistant";
                tool: "tool";
            }>;
            content: z.ZodString;
            toolCallId: z.ZodOptional<z.ZodString>;
            toolName: z.ZodOptional<z.ZodString>;
            toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        attachment: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                document: "document";
                photo: "photo";
                video: "video";
            }>;
            fileUrl: z.ZodString;
            mimeType: z.ZodOptional<z.ZodString>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        turn: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"opening">;
            turnId: z.ZodString;
            text: z.ZodLiteral<"">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"answer">;
            turnId: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"incomplete">;
            turnId: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            turnId: z.ZodString;
            text: z.ZodLiteral<"">;
            moveId: z.ZodString;
            spokenText: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"prepare">;
            turnId: z.ZodString;
            text: z.ZodLiteral<"">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"exchange">;
            turnId: z.ZodString;
            text: z.ZodString;
            spokenText: z.ZodString;
            ended: z.ZodBoolean;
        }, z.core.$strict>], "kind">>;
        identity: z.ZodOptional<z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        userId: z.ZodOptional<z.ZodString>;
        organizationRun: z.ZodOptional<z.ZodObject<{
            context: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                organizationId: z.ZodString;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                issuer: z.ZodEnum<{
                    x9: "x9";
                    forge: "forge";
                    paperclip: "paperclip";
                }>;
                issuedAt: z.ZodISODateTime;
                expiresAt: z.ZodISODateTime;
            }, z.core.$strict>;
            attempt: z.ZodObject<{
                runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
                attemptId: z.ZodString;
                attemptNumber: z.ZodNumber;
                startedAt: z.ZodISODateTime;
                idempotencyKey: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        reply: z.ZodString;
        updatedHistory: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                system: "system";
                user: "user";
                assistant: "assistant";
                tool: "tool";
            }>;
            content: z.ZodString;
            toolCallId: z.ZodOptional<z.ZodString>;
            toolName: z.ZodOptional<z.ZodString>;
            toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        moveId: z.ZodOptional<z.ZodString>;
        lead: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
        connectionCards: z.ZodOptional<z.ZodArray<z.ZodObject<{
            cardId: z.ZodString;
            provider: z.ZodEnum<{
                google: "google";
            }>;
            permissions: z.ZodArray<z.ZodEnum<{
                calendar_events: "calendar_events";
                contacts_read: "contacts_read";
                mail_send: "mail_send";
            }>>;
            url: z.ZodString;
            expiresAt: z.ZodNumber;
            state: z.ZodEnum<{
                connected: "connected";
                revoked: "revoked";
                pending: "pending";
                denied: "denied";
                expired: "expired";
            }>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agent-turn.d.ts.map