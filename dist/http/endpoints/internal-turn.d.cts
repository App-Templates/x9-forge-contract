import { z } from 'zod';
/**
 * POST /internal/turn — channel-agnostic synchronous turn.
 * Direction: X9 cap-glasses/cap-* -> X9 agent-core (internal)
 * Auth: X-Internal-Secret
 * Requirement: HTTP-04
 *
 * Real internalTurnSchema from agent-core (services/agent-core/src/index.ts:176-192):
 *   - channelId: regex /^[a-z0-9-]{1,64}$/
 *   - sessionId: regex /^[a-z0-9-]{1,64}$/
 *   - message: string min 1
 *   - history?: array of LLMMessage objects
 *
 * Response: `{ ok: true, reply: string, updatedHistory: LLMMessage[] }`
 *
 * LLMMessageSchema is shared with /internal/turn/stream (HTTP-05) and exposed
 * from the endpoints barrel for consumers (cap-glasses agent-bridge mirror type).
 */
/** LLM message shape as exchanged in turn history. */
export declare const LLMMessageSchema: z.ZodObject<{
    role: z.ZodEnum<{
        tool: "tool";
        system: "system";
        user: "user";
        assistant: "assistant";
    }>;
    content: z.ZodString;
    toolCallId: z.ZodOptional<z.ZodString>;
    toolName: z.ZodOptional<z.ZodString>;
    toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type LLMMessage = z.infer<typeof LLMMessageSchema>;
export declare const InternalTurnRequestSchema: z.ZodObject<{
    channelId: z.ZodString;
    sessionId: z.ZodString;
    message: z.ZodString;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            tool: "tool";
            system: "system";
            user: "user";
            assistant: "assistant";
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
}, z.core.$strip>;
export type InternalTurnRequest = z.infer<typeof InternalTurnRequestSchema>;
export declare const InternalTurnResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    reply: z.ZodString;
    updatedHistory: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            tool: "tool";
            system: "system";
            user: "user";
            assistant: "assistant";
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
}, z.core.$strip>;
export type InternalTurnResponse = z.infer<typeof InternalTurnResponseSchema>;
export declare const InternalTurnErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalTurnErrorResponse = z.infer<typeof InternalTurnErrorResponseSchema>;
export declare const internalTurnContract: {
    readonly method: "POST";
    readonly path: "/internal/turn";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        channelId: z.ZodString;
        sessionId: z.ZodString;
        message: z.ZodString;
        history: z.ZodOptional<z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                tool: "tool";
                system: "system";
                user: "user";
                assistant: "assistant";
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
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        reply: z.ZodString;
        updatedHistory: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                tool: "tool";
                system: "system";
                user: "user";
                assistant: "assistant";
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
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-turn.d.ts.map