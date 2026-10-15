import { z } from 'zod';
/**
 * cap-dev per-agent routes (P04-d). Direction: Forge / X9 -> cap-dev.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 */
/** GET the agent's cap-dev configuration. */
export declare const devConfigGetContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/dev/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
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
};
/** PUT the agent's cap-dev configuration. */
export declare const devConfigPutContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/dev/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        version: z.ZodNumber;
    }, z.core.$strict>;
};
/** GET the agent's cap-dev configuration together with its reported state. */
export declare const devStateGetContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/dev/state";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
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
};
//# sourceMappingURL=internal-capability-dev.d.ts.map