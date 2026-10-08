import { z } from 'zod';
/** The name is exact, never trimmed. Forge compares it to its authoritative saved name. */
export declare const AgentDeletionCommandSchema: z.ZodObject<{
    requestId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    confirmedName: z.ZodString;
}, z.core.$strict>;
export type AgentDeletionCommand = z.infer<typeof AgentDeletionCommandSchema>;
/**
 * Every report includes exactly these runtime scopes; none denotes a shared process or owner resource.
 * context/workspace detach in-memory references only. Factory retains all filesystem/data writers.
 * Channel cleanup closes runtime handlers; Factory owns provider resource deletion.
 */
export declare const AgentDeletionStepSchema: z.ZodEnum<{
    runtime: "runtime";
    workspace: "workspace";
    context: "context";
    channels: "channels";
    tombstone: "tombstone";
    admission: "admission";
    caches: "caches";
    "private-state": "private-state";
}>;
export type AgentDeletionStep = z.infer<typeof AgentDeletionStepSchema>;
export declare const AGENT_DELETION_STEPS: ("runtime" | "workspace" | "context" | "channels" | "tombstone" | "admission" | "caches" | "private-state")[];
/** Machine codes only: no provider messages, file paths, tokens or free text diagnostics. */
export declare const AgentDeletionFailureCodeSchema: z.ZodEnum<{
    timeout: "timeout";
    "source-unavailable": "source-unavailable";
    "scope-unavailable": "scope-unavailable";
    "shared-resource": "shared-resource";
    "drain-failed": "drain-failed";
    "channel-close-failed": "channel-close-failed";
    "storage-failed": "storage-failed";
    "cleanup-failed": "cleanup-failed";
}>;
export type AgentDeletionFailureCode = z.infer<typeof AgentDeletionFailureCodeSchema>;
export declare const AgentDeletionPieceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    step: z.ZodEnum<{
        runtime: "runtime";
        workspace: "workspace";
        context: "context";
        channels: "channels";
        tombstone: "tombstone";
        admission: "admission";
        caches: "caches";
        "private-state": "private-state";
    }>;
    outcome: z.ZodLiteral<"completed">;
}, z.core.$strict>, z.ZodObject<{
    step: z.ZodEnum<{
        runtime: "runtime";
        workspace: "workspace";
        context: "context";
        channels: "channels";
        tombstone: "tombstone";
        admission: "admission";
        caches: "caches";
        "private-state": "private-state";
    }>;
    outcome: z.ZodLiteral<"absent">;
}, z.core.$strict>, z.ZodObject<{
    step: z.ZodEnum<{
        runtime: "runtime";
        workspace: "workspace";
        context: "context";
        channels: "channels";
        tombstone: "tombstone";
        admission: "admission";
        caches: "caches";
        "private-state": "private-state";
    }>;
    outcome: z.ZodLiteral<"failed">;
    reason: z.ZodEnum<{
        timeout: "timeout";
        "source-unavailable": "source-unavailable";
        "scope-unavailable": "scope-unavailable";
        "shared-resource": "shared-resource";
        "drain-failed": "drain-failed";
        "channel-close-failed": "channel-close-failed";
        "storage-failed": "storage-failed";
        "cleanup-failed": "cleanup-failed";
    }>;
}, z.core.$strict>, z.ZodObject<{
    step: z.ZodEnum<{
        runtime: "runtime";
        workspace: "workspace";
        context: "context";
        channels: "channels";
        tombstone: "tombstone";
        admission: "admission";
        caches: "caches";
        "private-state": "private-state";
    }>;
    outcome: z.ZodLiteral<"blocked">;
    reason: z.ZodLiteral<"dependency-failed">;
}, z.core.$strict>], "outcome">;
export type AgentDeletionPiece = z.infer<typeof AgentDeletionPieceSchema>;
/**
 * Durable single-agent removal, separate from lifecycle stop and Forge archival.
 *
 * Producers persist the tombstone before effects, share the lifecycle/apply mutex, drain admission,
 * and retain per-piece progress across crashes. The tombstone prevents resurrection by load/start/
 * reload/apply after process restart. It is NEVER deleted by private-state cleanup.
 * Same requestId and exact command resumes unfinished pieces only; different intention conflicts.
 * 200 partial is an honest processed report, not an HTTP-level success for all resources.
 */
export declare const AgentDeletionResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    agentId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    requestId: z.ZodString;
    replayed: z.ZodBoolean;
    outcome: z.ZodEnum<{
        partial: "partial";
        complete: "complete";
    }>;
    tombstoned: z.ZodBoolean;
    results: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        step: z.ZodEnum<{
            runtime: "runtime";
            workspace: "workspace";
            context: "context";
            channels: "channels";
            tombstone: "tombstone";
            admission: "admission";
            caches: "caches";
            "private-state": "private-state";
        }>;
        outcome: z.ZodLiteral<"completed">;
    }, z.core.$strict>, z.ZodObject<{
        step: z.ZodEnum<{
            runtime: "runtime";
            workspace: "workspace";
            context: "context";
            channels: "channels";
            tombstone: "tombstone";
            admission: "admission";
            caches: "caches";
            "private-state": "private-state";
        }>;
        outcome: z.ZodLiteral<"absent">;
    }, z.core.$strict>, z.ZodObject<{
        step: z.ZodEnum<{
            runtime: "runtime";
            workspace: "workspace";
            context: "context";
            channels: "channels";
            tombstone: "tombstone";
            admission: "admission";
            caches: "caches";
            "private-state": "private-state";
        }>;
        outcome: z.ZodLiteral<"failed">;
        reason: z.ZodEnum<{
            timeout: "timeout";
            "source-unavailable": "source-unavailable";
            "scope-unavailable": "scope-unavailable";
            "shared-resource": "shared-resource";
            "drain-failed": "drain-failed";
            "channel-close-failed": "channel-close-failed";
            "storage-failed": "storage-failed";
            "cleanup-failed": "cleanup-failed";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        step: z.ZodEnum<{
            runtime: "runtime";
            workspace: "workspace";
            context: "context";
            channels: "channels";
            tombstone: "tombstone";
            admission: "admission";
            caches: "caches";
            "private-state": "private-state";
        }>;
        outcome: z.ZodLiteral<"blocked">;
        reason: z.ZodLiteral<"dependency-failed">;
    }, z.core.$strict>], "outcome">>;
    completedAt: z.ZodString;
}, z.core.$strict>;
export type AgentDeletionResult = z.infer<typeof AgentDeletionResultSchema>;
/** Consumers must correlate a validated report before advancing their durable deletion job. */
export declare function isAgentDeletionResultCurrent(agentId: string, command: unknown, result: unknown): boolean;
//# sourceMappingURL=agent-deletion.d.ts.map