import { z } from 'zod';
export const FeatureSwitchStateSchema = z.enum(['spenta', 'accesa']);
export const FeatureSwitchSchema = z
    .object({
    name: z.string().min(1).max(64).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    state: FeatureSwitchStateSchema,
    feature: z.string().min(1).max(120),
    openLinks: z.array(z.string().min(1)),
    updatedAt: z.string().datetime(),
})
    .strict()
    .refine((value) => !(value.state === 'accesa') || value.openLinks.length === 0, {
    message: 'An enabled function cannot have open links',
    path: ['openLinks'],
});
export const FeatureSwitchListSchema = z.array(FeatureSwitchSchema).refine((items) => new Set(items.map((item) => item.name)).size === items.length, { message: 'Feature switch names must be unique' });
//# sourceMappingURL=feature-switch.js.map