import type { z } from 'zod';
/**
 * GET /internal/model-config/version — X9 polls Forge for the current model
 * config version. Response shape = ModelHotReloadNotification (D-17).
 * Auth: X-Internal-Secret.
 *
 * Decision rationale: per 06-RESEARCH-X9-ALIGNMENT.md §"Hot-Reload Mechanism
 * Decision" — ROUTER-06 describes a pull model; polling fits best. If Phase 35
 * later needs push, the same payload shape drops into an SSE frame without
 * a breaking contract change.
 *
 * @see @x9-forge/contracts/model-router (ModelHotReloadNotificationSchema)
 */
export declare const ModelConfigVersionResponseSchema: z.ZodObject<{
    version: z.ZodString;
    appliedAt: z.ZodISODateTime;
    providersChanged: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        openai: "openai";
        anthropic: "anthropic";
        google: "google";
    }>>>;
    capsChanged: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ModelConfigVersionResponse = z.infer<typeof ModelConfigVersionResponseSchema>;
export declare const modelConfigVersionContract: {
    readonly method: "GET";
    readonly path: "/internal/model-config/version";
    readonly authType: "secret";
    readonly responseSchema: z.ZodObject<{
        version: z.ZodString;
        appliedAt: z.ZodISODateTime;
        providersChanged: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
            google: "google";
        }>>>;
        capsChanged: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-model-config-version.d.ts.map