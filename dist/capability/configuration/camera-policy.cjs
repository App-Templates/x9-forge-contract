"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraPoliciesSchema = exports.CameraPolicySchema = exports.CameraPtzPresetsSchema = void 0;
exports.parseCameraPoliciesWrite = parseCameraPoliciesWrite;
const zod_1 = require("zod");
exports.CameraPtzPresetsSchema = zod_1.z.object({
    left: zod_1.z.number().int().min(1).max(32), center: zod_1.z.number().int().min(1).max(32), right: zod_1.z.number().int().min(1).max(32),
}).strict();
exports.CameraPolicySchema = zod_1.z.object({
    uid: zod_1.z.string().min(1), name: zod_1.z.string().min(1), role: zod_1.z.enum(['primary', 'secondary']),
    enabled: zod_1.z.boolean(), ptz_presets: exports.CameraPtzPresetsSchema, siren: zod_1.z.boolean(), battery: zod_1.z.boolean(),
}).strict();
exports.CameraPoliciesSchema = zod_1.z.array(exports.CameraPolicySchema).superRefine((cameras, ctx) => {
    if (new Set(cameras.map(camera => camera.uid)).size !== cameras.length)
        ctx.addIssue({ code: 'custom', message: 'Camera UIDs must be unique' });
    if (cameras.filter(camera => camera.role === 'primary').length > 1)
        ctx.addIssue({ code: 'custom', message: 'At most one primary camera' });
});
/** Preserve full camera inventory, including disabled cameras, before runtime filtering. */
function parseCameraPoliciesWrite(value, authority) {
    const previous = exports.CameraPoliciesSchema.parse(authority.current);
    const next = exports.CameraPoliciesSchema.parse(value);
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