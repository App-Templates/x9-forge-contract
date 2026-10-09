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
 * memory. agent-core refuses the primary agent id here (403): the personal
 * agent stays reachable only through the existing routes.
 *
 * Legacy bodies and responses remain valid. Only this per-agent route adds
 * optional `turn` and response `moveId` (v1.25.0) and an optional authenticated
 * caller's `userId` (v1.26.0), and the voice-led `prepare`/`exchange` turns with response
 * `lead`/`note` (v1.27.0); the personal `/internal/turn` schema is unchanged.
 * agentId uses the same regex as `/internal/agents/:agentId/reload|stop`
 * (agent-core agent id; Forge factory slugs are a subset).
 *
 * Paperclip adds optional two-phase `paperclipAdmission` on this same route.
 * The host authenticates exactly one loaded per-agent adapter secret through
 * X-Internal-Secret, denies generic/global credentials for this branch, and
 * reserves/consumes native runs before model work. Schema parsing establishes
 * no authentication, receipt ownership, current native state or replay protection.
 * Admission schemas contain native wire primitives only, avoiding an agent-id import cycle.
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
            photo: "photo";
            document: "document";
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
    userId: z.ZodOptional<z.ZodString>;
    paperclipAdmission: z.ZodOptional<z.ZodLazy<z.ZodDiscriminatedUnion<[z.ZodObject<{
        phase: z.ZodLiteral<"prepare">;
        native: z.ZodObject<{
            companyId: z.ZodUUID;
            paperclipAgentId: z.ZodUUID;
            runId: z.ZodUUID;
            issueId: z.ZodUUID;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        phase: z.ZodLiteral<"commit">;
        admissionId: z.ZodUUID;
    }, z.core.$strict>], "phase">>>;
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
    paperclipAdmission: z.ZodOptional<z.ZodLazy<z.ZodDiscriminatedUnion<[z.ZodObject<{
        admissionId: z.ZodUUID;
        challenge: z.ZodString;
        hostIssuedAt: z.ZodISODateTime;
        hostDeadlineAt: z.ZodISODateTime;
        companyId: z.ZodUUID;
        paperclipAgentId: z.ZodUUID;
        runId: z.ZodUUID;
        issueId: z.ZodUUID;
        phase: z.ZodLiteral<"prepared">;
    }, z.core.$strict>, z.ZodObject<{
        phase: z.ZodLiteral<"committed">;
        admissionId: z.ZodUUID;
        runId: z.ZodUUID;
    }, z.core.$strict>], "phase">>>;
}, z.core.$strip>;
export type InternalAgentTurnResponse = z.infer<typeof InternalAgentTurnResponseSchema>;
export declare const InternalAgentTurnErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalAgentTurnErrorResponse = z.infer<typeof InternalAgentTurnErrorResponseSchema>;
/** Error code returned with 404 when the agent is not loaded in agent-core. */
export declare const INTERNAL_AGENT_TURN_UNKNOWN_AGENT: "unknown_agent";
/** Error code returned with 403 when the path names the env primary agent. */
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
                photo: "photo";
                document: "document";
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
        userId: z.ZodOptional<z.ZodString>;
        paperclipAdmission: z.ZodOptional<z.ZodLazy<z.ZodDiscriminatedUnion<[z.ZodObject<{
            phase: z.ZodLiteral<"prepare">;
            native: z.ZodObject<{
                companyId: z.ZodUUID;
                paperclipAgentId: z.ZodUUID;
                runId: z.ZodUUID;
                issueId: z.ZodUUID;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            phase: z.ZodLiteral<"commit">;
            admissionId: z.ZodUUID;
        }, z.core.$strict>], "phase">>>;
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
        paperclipAdmission: z.ZodOptional<z.ZodLazy<z.ZodDiscriminatedUnion<[z.ZodObject<{
            admissionId: z.ZodUUID;
            challenge: z.ZodString;
            hostIssuedAt: z.ZodISODateTime;
            hostDeadlineAt: z.ZodISODateTime;
            companyId: z.ZodUUID;
            paperclipAgentId: z.ZodUUID;
            runId: z.ZodUUID;
            issueId: z.ZodUUID;
            phase: z.ZodLiteral<"prepared">;
        }, z.core.$strict>, z.ZodObject<{
            phase: z.ZodLiteral<"committed">;
            admissionId: z.ZodUUID;
            runId: z.ZodUUID;
        }, z.core.$strict>], "phase">>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agent-turn.d.ts.map