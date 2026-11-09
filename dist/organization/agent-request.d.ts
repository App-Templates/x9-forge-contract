import { z } from 'zod';
export declare const AGENT_REQUEST_TARGET_KINDS: readonly ["director", "lab", "business_unit"];
export declare const AgentRequestTargetKindSchema: z.ZodEnum<{
    lab: "lab";
    director: "director";
    business_unit: "business_unit";
}>;
export type AgentRequestTargetKind = z.infer<typeof AgentRequestTargetKindSchema>;
export declare const AgentRequestIdSchema: z.ZodString;
/** A lead asks the Director, the Lab or another unit for something only they can give. */
export declare const AgentRequestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    requestId: z.ZodString;
    from: z.ZodObject<{
        unitId: z.ZodString;
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
    to: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"director">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"lab">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"business_unit">;
        unitId: z.ZodString;
    }, z.core.$strict>], "kind">;
    need: z.ZodString;
    why: z.ZodString;
    mandate: z.ZodObject<{
        issueId: z.ZodUUID;
        identifier: z.ZodString;
    }, z.core.$strict>;
    plan: z.ZodOptional<z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodInt;
    }, z.core.$strict>>;
    requestedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
//# sourceMappingURL=agent-request.d.ts.map