import { z } from 'zod';
export declare const AgentRuntimeAvailabilitySchema: z.ZodEnum<{
    unknown: "unknown";
    available: "available";
    unavailable: "unavailable";
}>;
export type AgentRuntimeAvailability = z.infer<typeof AgentRuntimeAvailabilitySchema>;
export declare const AgentRuntimeCompletenessSchema: z.ZodEnum<{
    unknown: "unknown";
    complete: "complete";
    partial: "partial";
}>;
export type AgentRuntimeCompleteness = z.infer<typeof AgentRuntimeCompletenessSchema>;
/** Source observations describe inventory coverage, not an agent's readiness. */
export declare const AgentRuntimeSourceSchema: z.ZodObject<{
    authority: z.ZodLiteral<"x9">;
    availability: z.ZodEnum<{
        unknown: "unknown";
        available: "available";
        unavailable: "unavailable";
    }>;
    completeness: z.ZodEnum<{
        unknown: "unknown";
        complete: "complete";
        partial: "partial";
    }>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
}, z.core.$strip>;
export type AgentRuntimeSource = z.infer<typeof AgentRuntimeSourceSchema>;
//# sourceMappingURL=agent-runtime-source.d.ts.map