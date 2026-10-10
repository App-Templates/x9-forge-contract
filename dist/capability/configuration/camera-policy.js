import { z } from 'zod';
export const CameraPtzPresetsSchema = z.object({
    left: z.number().int().min(1).max(32), center: z.number().int().min(1).max(32), right: z.number().int().min(1).max(32),
}).strict();
export const CameraPolicySchema = z.object({
    uid: z.string().min(1), name: z.string().min(1), role: z.enum(['primary', 'secondary']),
    enabled: z.boolean(), ptz_presets: CameraPtzPresetsSchema, siren: z.boolean(), battery: z.boolean(),
}).strict();
export const CameraPoliciesSchema = z.array(CameraPolicySchema).superRefine((cameras, ctx) => {
    if (new Set(cameras.map(camera => camera.uid)).size !== cameras.length)
        ctx.addIssue({ code: 'custom', message: 'Camera UIDs must be unique' });
    if (cameras.filter(camera => camera.role === 'primary').length > 1)
        ctx.addIssue({ code: 'custom', message: 'At most one primary camera' });
});
/** Preserve full camera inventory, including disabled cameras, before runtime filtering. */
export function parseCameraPoliciesWrite(value, authority) {
    const previous = CameraPoliciesSchema.parse(authority.current);
    const next = CameraPoliciesSchema.parse(value);
    const byUid = new Map(previous.map(camera => [camera.uid, camera]));
    if (previous.length !== next.length)
        throw new Error('Camera inventory cannot change through an ordinary policy write');
    for (const camera of next) {
        const current = byUid.get(camera.uid);
        if (!current || !authority.authorizedResourceIds.has(camera.uid))
            throw new Error('Camera resource is outside the authorized owner scope');
        if (camera.name !== current.name)
            throw new Error('Camera identity cannot change');
        const allowed = authority.editableFieldsByUid.get(camera.uid);
        for (const field of ['role', 'enabled', 'ptz_presets', 'siren', 'battery']) {
            if (JSON.stringify(camera[field]) !== JSON.stringify(current[field]) && !allowed?.has(field))
                throw new Error('Camera field is not editable for this producer');
        }
    }
    return next;
}
//# sourceMappingURL=camera-policy.js.map