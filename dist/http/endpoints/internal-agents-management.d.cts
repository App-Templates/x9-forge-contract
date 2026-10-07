import { z } from 'zod';
/**
 * R1b logical management (v1.31.0). Direction: Forge factory-svc -> X9 agent-core. Auth: X-Internal-Secret.
 *
 * - `POST /internal/agents/:agentId/commands` — start/stop/restart/reload one agent or apply a configuration version,
 *   idempotent by `requestId` (see `AgentManagementCommandSchema`). 200 `AgentManagementCommandResultSchema` even when
 *   targets failed (per-target outcome); errors below are for commands that were not processed at all.
 * - `GET /internal/agents/:agentId/management` — configuration versions and the actions each target supports.
 *
 * Errors (`AgentManagementErrorResponseSchema`): 400 invalid_request, 404 agent_not_found, 409 idempotency_conflict
 * (same requestId, different command) / stale_version (desired version older than the applied one, carries
 * `currentVersion`) / command_in_progress, 503 source_unavailable.
 *
 * The legacy `/reload` and `/stop` routes stay unchanged for 1.30 consumers.
 */
/** Same agent id rule as `/internal/agents/:agentId/reload|stop|turn`. */
export declare const AgentManagementParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export type AgentManagementParams = z.infer<typeof AgentManagementParamsSchema>;
export declare const AgentManagementErrorCodeSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    agent_not_found: "agent_not_found";
    idempotency_conflict: "idempotency_conflict";
    source_unavailable: "source_unavailable";
    stale_version: "stale_version";
    command_in_progress: "command_in_progress";
}>;
export type AgentManagementErrorCode = z.infer<typeof AgentManagementErrorCodeSchema>;
export declare const AgentManagementErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        agent_not_found: "agent_not_found";
        idempotency_conflict: "idempotency_conflict";
        source_unavailable: "source_unavailable";
        stale_version: "stale_version";
        command_in_progress: "command_in_progress";
    }>;
    currentVersion: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type AgentManagementErrorResponse = z.infer<typeof AgentManagementErrorResponseSchema>;
export declare const agentCommandContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/commands";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodUnion<readonly [z.ZodObject<{
        action: z.ZodEnum<{
            start: "start";
            stop: "stop";
            restart: "restart";
            reload: "reload";
        }>;
        requestId: z.ZodString;
        targets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                channel: "channel";
                runtime: "runtime";
                capability: "capability";
            }>;
            targetId: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"apply-config">;
        requestId: z.ZodString;
        desiredVersion: z.ZodNumber;
    }, z.core.$strict>]>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        agentId: z.ZodString;
        identity: z.ZodOptional<z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        requestId: z.ZodString;
        action: z.ZodEnum<{
            start: "start";
            stop: "stop";
            restart: "restart";
            reload: "reload";
            "apply-config": "apply-config";
        }>;
        replayed: z.ZodBoolean;
        outcome: z.ZodEnum<{
            error: "error";
            ok: "ok";
            partial: "partial";
            unmanageable: "unmanageable";
        }>;
        results: z.ZodArray<z.ZodObject<{
            target: z.ZodObject<{
                kind: z.ZodEnum<{
                    channel: "channel";
                    runtime: "runtime";
                    capability: "capability";
                }>;
                targetId: z.ZodString;
            }, z.core.$strict>;
            outcome: z.ZodEnum<{
                error: "error";
                ok: "ok";
                unmanageable: "unmanageable";
            }>;
            reason: z.ZodOptional<z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strip>>;
        requestedVersion: z.ZodOptional<z.ZodNumber>;
        versions: z.ZodOptional<z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>>;
        workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>>;
        completedAt: z.ZodISODateTime;
    }, z.core.$strip>;
};
export declare const agentManagementStateContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/management";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        agentId: z.ZodString;
        identity: z.ZodOptional<z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        versions: z.ZodNullable<z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>>;
        workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>>;
        targets: z.ZodArray<z.ZodObject<{
            target: z.ZodObject<{
                kind: z.ZodEnum<{
                    channel: "channel";
                    runtime: "runtime";
                    capability: "capability";
                }>;
                targetId: z.ZodString;
            }, z.core.$strict>;
            actions: z.ZodArray<z.ZodEnum<{
                start: "start";
                stop: "stop";
                restart: "restart";
                reload: "reload";
                "apply-config": "apply-config";
            }>>;
            reason: z.ZodOptional<z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
export declare function agentCommandsPath(agentId: string): string;
export declare function agentManagementPath(agentId: string): string;
//# sourceMappingURL=internal-agents-management.d.ts.map