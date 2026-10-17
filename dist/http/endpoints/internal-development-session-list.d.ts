import { z } from 'zod';
export declare const DevelopmentSessionListQuerySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export declare const DevelopmentSessionListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        binding: z.ZodObject<{
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
        leaseId: z.ZodString;
        consentRef: z.ZodString;
        status: z.ZodEnum<{
            connected: "connected";
            offline: "offline";
            revoked: "revoked";
        }>;
        issuedAt: z.ZodString;
        lastSeenAt: z.ZodString;
        expiresAt: z.ZodString;
        availableEngines: z.ZodArray<z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>>;
    }, z.core.$strict>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type DevelopmentSessionList = z.infer<typeof DevelopmentSessionListSchema>;
export type DevelopmentSessionListQuery = z.infer<typeof DevelopmentSessionListQuerySchema>;
/**
 * The service authenticates the owner, filters by scope and correlates the cursor
 * with the authenticated tenant, owner and agent. The query alone authenticates nobody.
 * Include offline and revoked sessions so the selector shows their real state.
 * An empty page is valid; invalid registry data must propagate as an error, never an empty list.
 * This contract provides neither a registry nor an HTTP handler.
 */
export declare const listDevelopmentSessionsContract: {
    readonly method: "GET";
    readonly path: "/internal/connect/development-sessions";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            binding: z.ZodObject<{
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
            leaseId: z.ZodString;
            consentRef: z.ZodString;
            status: z.ZodEnum<{
                connected: "connected";
                offline: "offline";
                revoked: "revoked";
            }>;
            issuedAt: z.ZodString;
            lastSeenAt: z.ZodString;
            expiresAt: z.ZodString;
            availableEngines: z.ZodArray<z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>>;
        }, z.core.$strict>>;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
/**
 * Consumer-side check of a list page against the query the authenticated caller sent. Returns an independent
 * parsed copy, or null for any malformed input, oversized page or foreign scope. Order, nextCursor, targets,
 * engines and offline/revoked leases are kept as received: nothing is filtered and an error is never an empty page.
 * Owner authentication and the cursor stay the server's responsibility.
 */
export declare function selectDevelopmentSessionList(rawPage: unknown, expectedQuery: unknown): DevelopmentSessionList | null;
//# sourceMappingURL=internal-development-session-list.d.ts.map