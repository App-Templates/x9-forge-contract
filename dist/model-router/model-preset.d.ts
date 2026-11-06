import { z } from 'zod';
export declare const MODEL_PRESET_KINDS: readonly ["platform", "company"];
export declare const ModelPresetKindSchema: z.ZodEnum<{
    platform: "platform";
    company: "company";
}>;
export type ModelPresetKind = z.infer<typeof ModelPresetKindSchema>;
export declare const ModelPresetCompanyIdSchema: z.ZodString;
/** Preset metadata only; company presets always identify their company. */
export declare const ModelPresetRefSchema: z.ZodObject<{
    presetId: z.ZodNumber;
    kind: z.ZodEnum<{
        platform: "platform";
        company: "company";
    }>;
    tenantId: z.ZodString;
    companyId: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type ModelPresetRef = z.infer<typeof ModelPresetRefSchema>;
export declare const AgentPresetResolutionSchema: z.ZodEnum<{
    company: "company";
    "platform-fallback": "platform-fallback";
}>;
export type AgentPresetResolution = z.infer<typeof AgentPresetResolutionSchema>;
/**
 * Every birth path writes this attachment together with identity and tenantId (R-33).
 * Contains no credential values; platform fallback is explained in the birth report note.
 */
export declare const AgentPresetAttachmentSchema: z.ZodObject<{
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    tenantId: z.ZodString;
    preset: z.ZodObject<{
        presetId: z.ZodNumber;
        kind: z.ZodEnum<{
            platform: "platform";
            company: "company";
        }>;
        tenantId: z.ZodString;
        companyId: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    resolvedBy: z.ZodEnum<{
        company: "company";
        "platform-fallback": "platform-fallback";
    }>;
    note: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type AgentPresetAttachment = z.infer<typeof AgentPresetAttachmentSchema>;
/** Select by tenant and company identifiers, never by company or group names. */
export declare function selectBirthPreset(presets: readonly ModelPresetRef[], birth: {
    tenantId: string;
    companyId: string | null;
}): {
    ok: true;
    preset: ModelPresetRef;
    resolvedBy: AgentPresetResolution;
} | {
    ok: false;
    error: 'no-platform-preset' | 'ambiguous-preset';
};
//# sourceMappingURL=model-preset.d.ts.map