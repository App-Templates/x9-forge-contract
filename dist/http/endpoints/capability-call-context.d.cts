import { z } from 'zod';
/**
 * POST /resolve/capability-context — per-call context of one capability for one agent (R3, v1.31.0).
 * Direction: X9 (agent-core tool-router / capability-sdk) -> Forge vault-svc. Auth: X-Internal-Token
 * (`INTERNAL_TOKEN_HEADER`), like `GET /resolve/:agentId/:key`.
 *
 * 200 `{ ok: true, context }`; errors use the same body with `ok: false` and a distinct code:
 * 404 credential_missing (with `keys`), 503 source_unavailable, 403 capability_disabled / capability_not_installed /
 * identity_mismatch. Consumers MUST NOT fall back to process env on any error.
 */
export declare const CAPABILITY_CALL_CONTEXT_PATH: "/resolve/capability-context";
export declare const capabilityCallContextContract: {
    readonly method: "POST";
    readonly path: "/resolve/capability-context";
    readonly authType: "token";
    readonly bodySchema: z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        capability: z.ZodString;
        keys: z.ZodArray<z.ZodLazy<z.ZodString>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
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
};
//# sourceMappingURL=capability-call-context.d.ts.map