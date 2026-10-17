import { z } from 'zod';
import { parseCapabilityOrdinaryLifecycle } from "./ordinary-lifecycle.cjs";
declare const ordinaryCall: z.ZodObject<{
    callId: z.ZodString;
    tool: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    agentId: z.ZodString;
    sessionId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    organization: z.ZodOptional<z.ZodObject<{
        organizationRun: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            attemptNumber: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            idempotencyKey: z.ZodString;
        }, z.core.$strict>;
        tenantId: z.ZodString;
    }, z.core.$strict>>;
    vaultAgentId: z.ZodOptional<z.ZodNumber>;
    personRef: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    ordinaryConfiguration: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        version: z.ZodNumber;
        values: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const authorityResponse: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    capability: z.ZodString;
    requestId: z.ZodString;
    bundle: z.ZodObject<{
        sha256: z.ZodString;
        appliedVersion: z.ZodNumber;
    }, z.core.$strict>;
    membership: z.ZodEnum<{
        enabled: "enabled";
        disabled: "disabled";
        removed: "removed";
    }>;
    operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"apply-config">;
        execution: z.ZodEnum<{
            stopped: "stopped";
            running: "running";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"reload">;
        execution: z.ZodEnum<{
            stopped: "stopped";
            running: "running";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"start">;
        execution: z.ZodLiteral<"running">;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"stop">;
        execution: z.ZodLiteral<"stopped">;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"restart">;
        execution: z.ZodLiteral<"running">;
    }, z.core.$strict>], "action">>;
    configuration: z.ZodNullable<z.ZodObject<{
        format: z.ZodLiteral<"ordinary-v2">;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        version: z.ZodNumber;
        parameters: z.ZodArray<z.ZodNever>;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const ragCall: z.ZodObject<{
    callId: z.ZodString;
    tool: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    agentId: z.ZodString;
    sessionId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    organization: z.ZodOptional<z.ZodObject<{
        organizationRun: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            attemptNumber: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            idempotencyKey: z.ZodString;
        }, z.core.$strict>;
        tenantId: z.ZodString;
    }, z.core.$strict>>;
    vaultAgentId: z.ZodOptional<z.ZodNumber>;
    personRef: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    ordinaryConfiguration: z.ZodOptional<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        version: z.ZodNumber;
        values: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type PortableCapabilityRule = {
    op: 'empty_configuration_target';
} | {
    op: 'ordinary_empty_state';
} | {
    op: 'max_properties';
    path: string;
    max: number;
} | {
    op: 'equal_paths';
    left: string;
    right: string;
} | {
    op: 'equal_paths_if_present';
    left: string;
    right: string;
} | {
    op: 'timestamp_after_if_present';
    earlier: string;
    later: string;
} | {
    op: 'authority_equal';
    path: string;
} | {
    op: 'normalize_integer';
    path: string;
    schema: Record<string, unknown>;
} | {
    op: 'authority_lookup';
    identitySchema: Record<string, unknown>;
    bindings: Array<{
        path: string;
        authorityPath: string;
    }>;
} | {
    op: 'membership_call';
    capability: string;
} | {
    op: 'lifecycle_request';
    sameBundleActions: string[];
    reloadActions: string[];
    phaseOrder: Record<string, string[]>;
    runtimeBinding: [string, string];
    authorityBindings: Array<[string, string]>;
    nullishBindingFields: string[];
    ignoredBindingFields: string[];
    previousStateBindings: Array<[string, string]>;
    receiptFenceFields: string[];
    ambiguousStates: string[];
} | {
    op: 'lifecycle_receipt';
    targetBindings: Array<[string, string]>;
    runtimeBinding: [string, string];
    preparationPhases: string[];
    inactiveMemberships: string[];
    fenceFields: string[];
};
export interface PortableCapabilityContract {
    supported: boolean;
    schema: Record<string, unknown> | null;
    rules: PortableCapabilityRule[];
    gates: string[];
    customRefinements: number;
    limitations: string[];
}
export interface PortableCapabilityCatalog {
    format: 'x9-capability-portable-v1';
    contracts: Record<string, PortableCapabilityContract>;
    transports: Record<string, {
        method: string;
        path: string;
        authHeader: string;
        paramsSchema: Record<string, unknown>;
        queryContract?: string;
    }>;
}
/** Export data consumed by the compiled generator. Gated schemas are documentation, never admission. */
export declare function getPortableCapabilityContracts(): PortableCapabilityCatalog;
/** Pure IR binding used by TS and generated Python; authority must come from the authenticated loaded consumer. */
export declare function applyPortableCapabilityRules(value: unknown, rules: readonly PortableCapabilityRule[], authority?: unknown): void;
export declare function parsePortableAuthorityResponse(response: unknown, lookup: unknown, expectedIdentity: unknown): z.infer<typeof authorityResponse>;
export declare function parsePortableRagToolCall(value: unknown, authority: unknown): z.infer<typeof ragCall>;
export declare function parsePortableLifecycleRequest(value: unknown, authority: unknown): ReturnType<typeof parseCapabilityOrdinaryLifecycle>;
export declare function parsePortableOrdinaryToolCall(value: unknown, authoritativeLoadedSnapshot: unknown): z.infer<typeof ordinaryCall>;
export {};
//# sourceMappingURL=portable-contracts.d.ts.map