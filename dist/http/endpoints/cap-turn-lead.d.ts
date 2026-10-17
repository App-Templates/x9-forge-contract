import { z } from 'zod';
/** POST /turn — authenticated runtime -> capability declared in the agent's registry. */
export declare const capTurnLeadContract: {
    readonly method: "POST";
    readonly path: "/turn";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        tenantId: z.ZodOptional<z.ZodString>;
        ownerId: z.ZodOptional<z.ZodString>;
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
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"speak">;
        moveId: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"release">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"lead">;
        instructions: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"noted">;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "kind">;
};
//# sourceMappingURL=cap-turn-lead.d.ts.map