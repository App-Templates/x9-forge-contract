import { z } from 'zod';
export declare const CoachProgramInputEnvelopeSchema: z.ZodObject<{
    kind: z.ZodString;
    payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
}, z.core.$strict>;
export type CoachProgramInputEnvelope = z.infer<typeof CoachProgramInputEnvelopeSchema>;
export declare const CoachProgramProjectionSchema: z.ZodObject<{
    strategy: z.ZodObject<{
        strategyId: z.ZodString;
        strategyVersion: z.ZodString;
    }, z.core.$strict>;
    value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
}, z.core.$strict>;
export type CoachProgramProjection = z.infer<typeof CoachProgramProjectionSchema>;
export declare const CoachConversationInputRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    opening: z.ZodObject<{
        openingId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        sessionId: z.ZodString;
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
        appliedConfigVersion: z.ZodNumber;
        openedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    expectedRevision: z.ZodNumber;
    input: z.ZodObject<{
        kind: z.ZodString;
        payload: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CoachConversationInputRequest = z.infer<typeof CoachConversationInputRequestSchema>;
export declare const CoachConversationResultSchema: z.ZodObject<{
    draft: z.ZodNullable<z.ZodObject<{
        strategy: z.ZodObject<{
            strategyId: z.ZodString;
            strategyVersion: z.ZodString;
        }, z.core.$strict>;
        value: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
    }, z.core.$strict>>;
    decisionCodes: z.ZodArray<z.ZodString>;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    replayed: z.ZodBoolean;
    opening: z.ZodObject<{
        openingId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        sessionId: z.ZodString;
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
        appliedConfigVersion: z.ZodNumber;
        openedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    revision: z.ZodNumber;
}, z.core.$strict>;
export type CoachConversationResult = z.infer<typeof CoachConversationResultSchema>;
//# sourceMappingURL=conversation.d.ts.map