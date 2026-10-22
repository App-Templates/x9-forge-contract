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
    /** A saved choice only; presence, consent and an execution lease are separate facts. */
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
    /**
     * Private Telegram chats (canonical ids, no sign) the owner chose in Forge
     * as «theirs»: only these may command cap-dev for this agent. The regex is
     * repeated here on purpose (importing agent-channel-access would create an
     * agent → capability cycle).
     */
    ownerChatIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type DevAgentConfig = z.infer<typeof DevAgentConfigSchema>;
export declare const DevAgentStatusSchema: z.ZodEnum<{
    applied: "applied";
    offline: "offline";
    revoked: "revoked";
    pending: "pending";
    ready: "ready";
}>;
export type DevAgentStatus = z.infer<typeof DevAgentStatusSchema>;
export declare const DevAgentStateSchema: z.ZodObject<{
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
        /** A saved choice only; presence, consent and an execution lease are separate facts. */
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
        /**
         * Private Telegram chats (canonical ids, no sign) the owner chose in Forge
         * as «theirs»: only these may command cap-dev for this agent. The regex is
         * repeated here on purpose (importing agent-channel-access would create an
         * agent → capability cycle).
         */
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
export type DevAgentConfigState = z.infer<typeof DevAgentConfigStateSchema>;
//# sourceMappingURL=config-state.d.ts.map