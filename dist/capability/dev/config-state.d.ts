import { z } from 'zod';
export declare const DevBindingSchema: z.ZodObject<{
    computerId: z.ZodString;
    projectId: z.ZodString;
    pathLabel: z.ZodString;
    addedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevBinding = z.infer<typeof DevBindingSchema>;
/**
 * Agent-scoped cap-dev configuration. It carries no secret or key material,
 * only the key version; unknown keys (e.g. `token`) are rejected.
 */
export declare const DevAgentConfigSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    boardId: z.ZodString;
    enabled: z.ZodBoolean;
    configVersion: z.ZodNumber;
    keyVersion: z.ZodNumber;
    bindings: z.ZodArray<z.ZodObject<{
        computerId: z.ZodString;
        projectId: z.ZodString;
        pathLabel: z.ZodString;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevAgentConfig = z.infer<typeof DevAgentConfigSchema>;
export declare const DevAgentStatusSchema: z.ZodEnum<{
    applied: "applied";
    revoked: "revoked";
    pending: "pending";
    ready: "ready";
    offline: "offline";
}>;
export type DevAgentStatus = z.infer<typeof DevAgentStatusSchema>;
export declare const DevAgentStateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        applied: "applied";
        revoked: "revoked";
        pending: "pending";
        ready: "ready";
        offline: "offline";
    }>;
    appliedConfigVersion: z.ZodNumber;
    lastSeenAt: z.ZodNullable<z.ZodISODateTime>;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type DevAgentState = z.infer<typeof DevAgentStateSchema>;
/** Config plus its reported state: the applied version can never be ahead of the config. */
export declare const DevAgentConfigStateSchema: z.ZodObject<{
    config: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        boardId: z.ZodString;
        enabled: z.ZodBoolean;
        configVersion: z.ZodNumber;
        keyVersion: z.ZodNumber;
        bindings: z.ZodArray<z.ZodObject<{
            computerId: z.ZodString;
            projectId: z.ZodString;
            pathLabel: z.ZodString;
            addedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    state: z.ZodObject<{
        status: z.ZodEnum<{
            applied: "applied";
            revoked: "revoked";
            pending: "pending";
            ready: "ready";
            offline: "offline";
        }>;
        appliedConfigVersion: z.ZodNumber;
        lastSeenAt: z.ZodNullable<z.ZodISODateTime>;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DevAgentConfigState = z.infer<typeof DevAgentConfigStateSchema>;
//# sourceMappingURL=config-state.d.ts.map