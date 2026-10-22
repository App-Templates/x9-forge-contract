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
        production: z.ZodOptional<z.ZodObject<{
            session: z.ZodObject<{
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
            roleModels: z.ZodOptional<z.ZodObject<{
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
            }, z.core.$strict>>;
            allowedProjectIds: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        ownerChatIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
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
        production: z.ZodOptional<z.ZodObject<{
            session: z.ZodObject<{
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
            roleModels: z.ZodOptional<z.ZodObject<{
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
            }, z.core.$strict>>;
            allowedProjectIds: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        ownerChatIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
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
            production: z.ZodOptional<z.ZodObject<{
                session: z.ZodObject<{
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
                roleModels: z.ZodOptional<z.ZodObject<{
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
                }, z.core.$strict>>;
                allowedProjectIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            ownerChatIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        state: z.ZodObject<{
            status: z.ZodEnum<{
                applied: "applied";
                offline: "offline";
                revoked: "revoked";
                pending: "pending";
                ready: "ready";
            }>;
            appliedConfigVersion: z.ZodNumber;
            lastSeenAt: z.ZodNullable<z.ZodISODateTime>;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-capability-dev.d.ts.map