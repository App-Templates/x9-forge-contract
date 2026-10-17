import { z } from 'zod';
/** Engines are independent of the local/cloud session target. */
export declare const DevelopmentSessionEngineSchema: z.ZodEnum<{
    claude: "claude";
    codex: "codex";
}>;
export type DevelopmentSessionEngine = z.infer<typeof DevelopmentSessionEngineSchema>;
export declare const DevelopmentSessionEnginesSchema: z.ZodArray<z.ZodEnum<{
    claude: "claude";
    codex: "codex";
}>>;
export type DevelopmentSessionEngines = z.infer<typeof DevelopmentSessionEnginesSchema>;
/** Public references only; local connections are initiated outbound by the device. */
export declare const DevelopmentSessionTargetSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"local">;
    deviceId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"cloud">;
    connectionRef: z.ZodString;
}, z.core.$strict>], "kind">;
export type DevelopmentSessionTarget = z.infer<typeof DevelopmentSessionTargetSchema>;
/** Configured reference only: neither online presence nor permission to execute. */
export declare const DevelopmentSessionBindingSchema: z.ZodObject<{
    scope: z.ZodLazy<z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>>;
    sessionId: z.ZodString;
    target: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"local">;
        deviceId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"cloud">;
        connectionRef: z.ZodString;
    }, z.core.$strict>], "kind">;
    engines: z.ZodArray<z.ZodEnum<{
        claude: "claude";
        codex: "codex";
    }>>;
}, z.core.$strict>;
export type DevelopmentSessionBinding = z.infer<typeof DevelopmentSessionBindingSchema>;
//# sourceMappingURL=development-session.d.ts.map