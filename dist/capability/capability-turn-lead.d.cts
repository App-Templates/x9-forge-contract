import { z } from 'zod';
/** MVP turn leading, opt-in per agent. No voice budget or version negotiation. */
export declare const AGENT_TURN_MAX_TEXT_CHARS = 32000;
export declare const CAPABILITY_TURN_LEAD_MAX_CHARS = 6000;
/** Interpreter, one repair and formatter (45 seconds each), with transport margin. */
export declare const CAPABILITY_TURN_LEAD_TIMEOUT_MS = 150000;
/** Runtime-owned source, never a model tool argument. Preserve transcript whitespace verbatim. */
export declare const AgentTurnSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "kind">;
export type AgentTurn = z.infer<typeof AgentTurnSchema>;
/** Presence opts in; absence is legacy. Forge copies this declaration without inventing defaults. */
export declare const CapabilityTurnLeadDeclarationSchema: z.ZodObject<{}, z.core.$strict>;
export type CapabilityTurnLeadDeclaration = z.infer<typeof CapabilityTurnLeadDeclarationSchema>;
/** Identity comes from the authenticated runtime; the single-company MVP uses the existing context envelope. */
export declare const CapabilityTurnLeadRequestSchema: z.ZodObject<{
    agentId: z.ZodString;
    sessionId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    channelId: z.ZodOptional<z.ZodString>;
    turn: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type CapabilityTurnLeadRequest = z.infer<typeof CapabilityTurnLeadRequestSchema>;
export declare const CapabilityTurnLeadResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"speak">;
    moveId: z.ZodString;
    text: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"release">;
}, z.core.$strict>], "kind">;
export type CapabilityTurnLeadResponse = z.infer<typeof CapabilityTurnLeadResponseSchema>;
/** Correlates voice delivery on the per-agent route; never added to the personal route. */
export declare const AgentTurnMoveIdSchema: z.ZodString;
//# sourceMappingURL=capability-turn-lead.d.ts.map