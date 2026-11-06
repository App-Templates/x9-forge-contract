import { z } from 'zod';
import { CompleteModelIdentitySchema } from "./agent-model-configuration-values.js";
export const MODEL_PRESET_KINDS = ['platform', 'company'];
export const ModelPresetKindSchema = z.enum(MODEL_PRESET_KINDS);
export const ModelPresetCompanyIdSchema = z.string().min(1).max(64);
/** Preset metadata only; company presets always identify their company. */
export const ModelPresetRefSchema = z.object({
    presetId: z.number().int().positive(),
    kind: ModelPresetKindSchema,
    tenantId: z.string().min(1),
    companyId: ModelPresetCompanyIdSchema.nullable(),
}).strict().superRefine((preset, ctx) => {
    if ((preset.kind === 'company') !== (preset.companyId !== null)) {
        ctx.addIssue({
            code: 'custom', path: ['companyId'],
            message: 'Only company presets require a company identifier',
        });
    }
});
export const AgentPresetResolutionSchema = z.enum(['company', 'platform-fallback']);
/**
 * Every birth path writes this attachment together with identity and tenantId (R-33).
 * Contains no credential values; platform fallback is explained in the birth report note.
 */
export const AgentPresetAttachmentSchema = z.object({
    identity: CompleteModelIdentitySchema,
    tenantId: z.string().min(1),
    preset: ModelPresetRefSchema,
    resolvedBy: AgentPresetResolutionSchema,
    note: z.string().trim().min(1).max(500).nullable(),
}).strict().superRefine((attachment, ctx) => {
    if (attachment.preset.tenantId !== attachment.tenantId) {
        ctx.addIssue({
            code: 'custom', path: ['preset', 'tenantId'],
            message: 'The preset must belong to the birth tenant',
        });
    }
    if ((attachment.resolvedBy === 'company') !== (attachment.preset.kind === 'company')) {
        ctx.addIssue({
            code: 'custom', path: ['resolvedBy'],
            message: 'Resolution must match the preset kind',
        });
    }
    if (attachment.resolvedBy === 'platform-fallback' && attachment.note === null) {
        ctx.addIssue({
            code: 'custom', path: ['note'],
            message: 'Platform fallback requires a birth report note',
        });
    }
});
/** Select by tenant and company identifiers, never by company or group names. */
export function selectBirthPreset(presets, birth) {
    const tenantPresets = presets.filter(preset => preset.tenantId === birth.tenantId);
    if (birth.companyId !== null) {
        const companies = tenantPresets.filter(preset => preset.kind === 'company' && preset.companyId === birth.companyId);
        if (companies.length > 1)
            return { ok: false, error: 'ambiguous-preset' };
        const company = companies[0];
        if (company !== undefined)
            return { ok: true, preset: company, resolvedBy: 'company' };
    }
    const platforms = tenantPresets.filter(preset => preset.kind === 'platform');
    if (platforms.length > 1)
        return { ok: false, error: 'ambiguous-preset' };
    const platform = platforms[0];
    if (platform === undefined)
        return { ok: false, error: 'no-platform-preset' };
    return { ok: true, preset: platform, resolvedBy: 'platform-fallback' };
}
//# sourceMappingURL=model-preset.js.map