"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureSwitchListSchema = exports.FeatureSwitchSchema = exports.FeatureSwitchStateSchema = void 0;
const zod_1 = require("zod");
exports.FeatureSwitchStateSchema = zod_1.z.enum(['spenta', 'accesa']);
exports.FeatureSwitchSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(64).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    state: exports.FeatureSwitchStateSchema,
    feature: zod_1.z.string().min(1).max(120),
    openLinks: zod_1.z.array(zod_1.z.string().min(1)),
    updatedAt: zod_1.z.string().datetime(),
})
    .strict()
    .refine((value) => !(value.state === 'accesa') || value.openLinks.length === 0, {
    message: 'An enabled function cannot have open links',
    path: ['openLinks'],
});
exports.FeatureSwitchListSchema = zod_1.z.array(exports.FeatureSwitchSchema).refine((items) => new Set(items.map((item) => item.name)).size === items.length, { message: 'Feature switch names must be unique' });
//# sourceMappingURL=feature-switch.js.map