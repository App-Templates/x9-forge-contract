import { z } from 'zod';
import { type CapabilityCallIdentity } from "./capability-call-identity.cjs";
export { CapabilityCallIdentitySchema, type CapabilityCallIdentity } from "./capability-call-identity.cjs";
import type { ToolCallRequest } from "./tool-call.cjs";
/**
 * Per-call capability context (R3, v1.31.0) — what ONE capability receives for ONE call of ONE agent.
 *
 * - Identity comes from authentication and the validated agent context, never from model-chosen parameters.
 *   Tenant, owner and agent are required: there is no default tenant that could make two customers equivalent.
 * - Credentials are the MINIMUM this capability needs for this call, each with the version in force, never the
 *   agent's whole credential bag, never platform-internal keys. They must not reach prompts, logs, traces or browsers.
 * - Missing key, unavailable source, disabled / not installed capability and forged identity are distinct errors;
 *   a consumer never falls back to a process-global key.
 */
/** Agent-level scope of capability data (no person): e.g. one provider resource or one program per agent. */
export declare const CapabilityAgentScopeSchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type CapabilityAgentScope = z.infer<typeof CapabilityAgentScopeSchema>;
/** Person-level scope: the end person's data is isolated by tenant/owner/agent/person. */
export declare const CapabilityPersonScopeSchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strict>;
export type CapabilityPersonScope = z.infer<typeof CapabilityPersonScopeSchema>;
/** Same tenant, owner and agent (and person when both carry one). */
export declare function sameCapabilityScope(a: CapabilityCallIdentity, b: CapabilityCallIdentity): boolean;
export declare const CapabilityCallContextSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capability: z.ZodString;
    configVersion: z.ZodNullable<z.ZodNumber>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
    credentials: z.ZodRecord<z.ZodLazy<z.ZodString>, z.ZodString>;
    credentialVersions: z.ZodRecord<z.ZodLazy<z.ZodString>, z.ZodLazy<z.ZodNumber>>;
}, z.core.$strict>;
export type CapabilityCallContext = z.infer<typeof CapabilityCallContextSchema>;
export declare const CapabilityCallContextErrorCodeSchema: z.ZodEnum<{
    source_unavailable: "source_unavailable";
    credential_missing: "credential_missing";
    capability_disabled: "capability_disabled";
    capability_not_installed: "capability_not_installed";
    identity_mismatch: "identity_mismatch";
}>;
export type CapabilityCallContextErrorCode = z.infer<typeof CapabilityCallContextErrorCodeSchema>;
/** Forge validates `keys` against what this capability declares; it never returns undeclared keys. */
export declare const CapabilityCallContextRequestSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capability: z.ZodString;
    keys: z.ZodArray<z.ZodLazy<z.ZodString>>;
}, z.core.$strict>;
export type CapabilityCallContextRequest = z.infer<typeof CapabilityCallContextRequestSchema>;
export declare const CapabilityCallContextErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        source_unavailable: "source_unavailable";
        credential_missing: "credential_missing";
        capability_disabled: "capability_disabled";
        capability_not_installed: "capability_not_installed";
        identity_mismatch: "identity_mismatch";
    }>;
    keys: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodString>>>;
}, z.core.$strip>;
export type CapabilityCallContextError = z.infer<typeof CapabilityCallContextErrorSchema>;
export declare const CapabilityCallContextResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    ok: z.ZodLiteral<true>;
    context: z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        capability: z.ZodString;
        configVersion: z.ZodNullable<z.ZodNumber>;
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        credentials: z.ZodRecord<z.ZodLazy<z.ZodString>, z.ZodString>;
        credentialVersions: z.ZodRecord<z.ZodLazy<z.ZodString>, z.ZodLazy<z.ZodNumber>>;
    }, z.core.$strict>;
}, z.core.$strip>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        source_unavailable: "source_unavailable";
        credential_missing: "credential_missing";
        capability_disabled: "capability_disabled";
        capability_not_installed: "capability_not_installed";
        identity_mismatch: "identity_mismatch";
    }>;
    keys: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodString>>>;
}, z.core.$strip>]>;
export type CapabilityCallContextResponse = z.infer<typeof CapabilityCallContextResponseSchema>;
export type PickCapabilityCredentialsResult = {
    ok: true;
    credentials: Record<string, string>;
    credentialVersions: Record<string, number>;
} | {
    ok: false;
    error: 'credential_missing';
    keys: string[];
};
/**
 * Select exactly the `required` keys from an agent's resolved credentials. Platform-internal keys are never picked
 * (a requirement on one counts as missing). Absent keys are reported, not replaced.
 */
export declare function pickCapabilityCredentials(available: Readonly<Record<string, {
    readonly value: string;
    readonly version: number;
}>>, required: readonly string[]): PickCapabilityCredentialsResult;
/** Fields of the 1.30 `ToolCallRequest` filled from a validated context (shape of the tool call unchanged). */
export declare function toToolCallScope(context: CapabilityCallContext): Pick<ToolCallRequest, 'agentId' | 'userId' | 'tenantId' | 'ownerId' | 'credentials'>;
//# sourceMappingURL=capability-call-context.d.ts.map