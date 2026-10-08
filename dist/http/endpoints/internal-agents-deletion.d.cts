import { z } from 'zod';
/**
 * Forge factory -> X9 agent-core. Secret authentication is enforced by the server.
 * POST /internal/agents/:agentId/deletion processes durable removal of one logical agent.
 * The address must equal body.identity.managementAgentId; X9 independently validates its
 * current mapping and protects the primary/Master, including concurrent lifecycle commands.
 * Forge owns user authorization and exact authoritative-name confirmation.
 * 200 carries complete OR partial per-piece results; the caller must correlate the response.
 * Same key/body resumes unfinished work. A changed body under the same key is a 409 conflict.
 * No container, shared runtime, owner memory or owner credentials are in this endpoint's scope.
 * Not-processed errors: 400 invalid_request/confirmation_mismatch, 403 protected_agent,
 * 404 agent_not_found, 409 identity_mismatch/idempotency_conflict/command_in_progress,
 * 503 source_unavailable. No raw diagnostics are serialized.
 */
export declare const AgentDeletionParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strict>;
export type AgentDeletionParams = z.infer<typeof AgentDeletionParamsSchema>;
export declare const AgentDeletionErrorCodeSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    agent_not_found: "agent_not_found";
    idempotency_conflict: "idempotency_conflict";
    source_unavailable: "source_unavailable";
    identity_mismatch: "identity_mismatch";
    command_in_progress: "command_in_progress";
    protected_agent: "protected_agent";
    confirmation_mismatch: "confirmation_mismatch";
}>;
export type AgentDeletionErrorCode = z.infer<typeof AgentDeletionErrorCodeSchema>;
export declare const AgentDeletionErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        agent_not_found: "agent_not_found";
        idempotency_conflict: "idempotency_conflict";
        source_unavailable: "source_unavailable";
        identity_mismatch: "identity_mismatch";
        command_in_progress: "command_in_progress";
        protected_agent: "protected_agent";
        confirmation_mismatch: "confirmation_mismatch";
    }>;
}, z.core.$strict>;
export type AgentDeletionErrorResponse = z.infer<typeof AgentDeletionErrorResponseSchema>;
export declare const agentDeletionContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/deletion";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        confirmedName: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
};
export declare function agentDeletionPath(agentId: string): string;
//# sourceMappingURL=internal-agents-deletion.d.ts.map