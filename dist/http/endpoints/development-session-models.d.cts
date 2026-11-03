import { z } from 'zod';
export declare const SessionModelSchema: z.ZodObject<{
    engine: z.ZodEnum<{
        claude: "claude";
        codex: "codex";
    }>;
    modelId: z.ZodString;
    label: z.ZodString;
    reasoningEfforts: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
/** Trusted adapter metadata only, never discovery or proof of actual model availability. */
export declare const DevelopmentSessionModelsSchema: z.ZodObject<{
    lease: z.ZodObject<{
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
    }, z.core.$strict>;
    models: z.ZodArray<z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        label: z.ZodString;
        reasoningEfforts: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevelopmentSessionModels = z.infer<typeof DevelopmentSessionModelsSchema>;
/** S2 authenticates the owner, correlates scope/path and queries a trusted adapter. */
export declare const getDevelopmentSessionModelsContract: {
    readonly method: "GET";
    readonly path: "/internal/connect/development-sessions/:sessionId/models";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        lease: z.ZodObject<{
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
        }, z.core.$strict>;
        models: z.ZodArray<z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            label: z.ZodString;
            reasoningEfforts: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
/** Pure selection using trusted binding and an injected clock; no model discovery. */
export declare function selectableDevelopmentSessionModels(raw: unknown, expectedBinding: unknown, nowMs: number): DevelopmentSessionModels['models'];
/** Canonical choice only; validity does not authorize execution. */
export declare const DevelopmentSessionModelSelectionSchema: z.ZodObject<{
    engine: z.ZodEnum<{
        claude: "claude";
        codex: "codex";
    }>;
    modelId: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type DevelopmentSessionModelSelection = z.infer<typeof DevelopmentSessionModelSelectionSchema>;
/** Match an explicit choice against usable, trusted adapter metadata. */
export declare function isDevelopmentSessionModelSelectionUsable(rawSelection: unknown, rawCatalog: unknown, expectedBinding: unknown, nowMs: number): boolean;
/** Explicit owner choices for all production roles; no defaults or discovery. */
export declare const DevProductionRoleModelsSchema: z.ZodObject<{
    coordination: z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    planning: z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    unblocking: z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    code: z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    design: z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    presentation: z.ZodObject<{
        engine: z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>;
        modelId: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DevProductionRoleModels = z.infer<typeof DevProductionRoleModelsSchema>;
/** Pure metadata check; services must recheck trusted state before execution. */
export declare function isDevProductionRoleModelsUsable(rawRoles: unknown, rawCatalog: unknown, expectedBinding: unknown, nowMs: number): boolean;
//# sourceMappingURL=development-session-models.d.ts.map