import { z } from 'zod';
/**
 * Logical agent management (R1b, v1.31.0) — Forge asks X9 to act on ONE agent, never on the shared process.
 *
 * - Lifecycle actions stop/start/restart/reload a single agent's admission to turns and the channels it owns;
 *   they never stop the shared agent-core process nor touch other agents.
 * - `apply-config` makes a saved (desired) configuration version effective. If it fails, the previously applied
 *   version stays in force (`applied` does not move) and the failure is reported with its reason.
 * - Every command carries a `requestId`: the same key with the same command is a replay (no second execution,
 *   `replayed: true`); the same key with a different command is an `idempotency_conflict` (see endpoint contract).
 * - Results are per target (runtime, channel, capability) and the overall outcome is DERIVED from them: a failed
 *   target can never be hidden behind a global success.
 */
export declare const AgentLifecycleActionSchema: z.ZodEnum<{
    start: "start";
    stop: "stop";
    restart: "restart";
    reload: "reload";
}>;
export type AgentLifecycleAction = z.infer<typeof AgentLifecycleActionSchema>;
export declare const AgentManagementActionSchema: z.ZodEnum<{
    start: "start";
    stop: "stop";
    restart: "restart";
    reload: "reload";
    "apply-config": "apply-config";
}>;
export type AgentManagementAction = z.infer<typeof AgentManagementActionSchema>;
/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
export declare const AgentManagementRequestIdSchema: z.ZodString;
export type AgentManagementRequestId = z.infer<typeof AgentManagementRequestIdSchema>;
export declare const AgentManagementTargetKindSchema: z.ZodEnum<{
    capability: "capability";
    runtime: "runtime";
    channel: "channel";
}>;
export type AgentManagementTargetKind = z.infer<typeof AgentManagementTargetKindSchema>;
/** `targetId`: runtime agent id, channel id (as in `AgentRuntimeChannel.channelId`) or capability name. */
export declare const AgentManagementTargetSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        capability: "capability";
        runtime: "runtime";
        channel: "channel";
    }>;
    targetId: z.ZodString;
}, z.core.$strict>;
export type AgentManagementTarget = z.infer<typeof AgentManagementTargetSchema>;
export declare const AgentManagementOutcomeSchema: z.ZodEnum<{
    error: "error";
    ok: "ok";
    unmanageable: "unmanageable";
}>;
export type AgentManagementOutcome = z.infer<typeof AgentManagementOutcomeSchema>;
export declare const AgentManagementOverallOutcomeSchema: z.ZodEnum<{
    error: "error";
    ok: "ok";
    partial: "partial";
    unmanageable: "unmanageable";
}>;
export type AgentManagementOverallOutcome = z.infer<typeof AgentManagementOverallOutcomeSchema>;
export declare const AgentManagementReasonCodeSchema: z.ZodEnum<{
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
export type AgentManagementReasonCode = z.infer<typeof AgentManagementReasonCodeSchema>;
/** `detail` is sanitized operator text: never secrets, tokens or personal data. */
export declare const AgentManagementReasonSchema: z.ZodObject<{
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
export type AgentManagementReason = z.infer<typeof AgentManagementReasonSchema>;
/** Desired (saved) vs applied (effective) configuration version of one agent. */
export declare const AgentConfigVersionStateSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type AgentConfigVersionState = z.infer<typeof AgentConfigVersionStateSchema>;
export declare const AgentManagementCommandSchema: z.ZodUnion<readonly [z.ZodObject<{
    action: z.ZodEnum<{
        start: "start";
        stop: "stop";
        restart: "restart";
        reload: "reload";
    }>;
    requestId: z.ZodString;
    targets: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            capability: "capability";
            runtime: "runtime";
            channel: "channel";
        }>;
        targetId: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"apply-config">;
    requestId: z.ZodString;
    desiredVersion: z.ZodNumber;
}, z.core.$strict>]>;
export type AgentManagementCommand = z.infer<typeof AgentManagementCommandSchema>;
/** Same command (action, version, target set) — the replay test for one `requestId`. Target order is irrelevant. */
export declare function sameAgentCommand(a: AgentManagementCommand, b: AgentManagementCommand): boolean;
export declare const AgentManagementTargetResultSchema: z.ZodObject<{
    target: z.ZodObject<{
        kind: z.ZodEnum<{
            capability: "capability";
            runtime: "runtime";
            channel: "channel";
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
}, z.core.$strip>;
export type AgentManagementTargetResult = z.infer<typeof AgentManagementTargetResultSchema>;
/** ok: all ok · unmanageable: none manageable · error: none ok · partial: some ok, some not. */
export declare function deriveAgentManagementOutcome(results: ReadonlyArray<{
    readonly outcome: AgentManagementOutcome;
}>): AgentManagementOverallOutcome;
/** Response to a processed command (`ok: true` = processed; read `outcome` for what happened). */
export declare const AgentManagementCommandResultSchema: z.ZodObject<{
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
                capability: "capability";
                runtime: "runtime";
                channel: "channel";
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
export type AgentManagementCommandResult = z.infer<typeof AgentManagementCommandResultSchema>;
/** What a target supports; an empty action list is unmanageable and must say why. */
export declare const AgentManagementTargetCapabilitySchema: z.ZodObject<{
    target: z.ZodObject<{
        kind: z.ZodEnum<{
            capability: "capability";
            runtime: "runtime";
            channel: "channel";
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
}, z.core.$strip>;
export type AgentManagementTargetCapability = z.infer<typeof AgentManagementTargetCapabilitySchema>;
export declare const AgentManagementStateSchema: z.ZodObject<{
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
                capability: "capability";
                runtime: "runtime";
                channel: "channel";
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
export type AgentManagementState = z.infer<typeof AgentManagementStateSchema>;
//# sourceMappingURL=agent-management.d.ts.map