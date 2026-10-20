import { z } from 'zod';
export declare const FeatureSwitchStateSchema: z.ZodEnum<{
    spenta: "spenta";
    accesa: "accesa";
}>;
export declare const FeatureSwitchSchema: z.ZodObject<{
    name: z.ZodString;
    state: z.ZodEnum<{
        spenta: "spenta";
        accesa: "accesa";
    }>;
    feature: z.ZodString;
    openLinks: z.ZodArray<z.ZodString>;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export declare const FeatureSwitchListSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    state: z.ZodEnum<{
        spenta: "spenta";
        accesa: "accesa";
    }>;
    feature: z.ZodString;
    openLinks: z.ZodArray<z.ZodString>;
    updatedAt: z.ZodString;
}, z.core.$strict>>;
export type FeatureSwitchState = z.infer<typeof FeatureSwitchStateSchema>;
export type FeatureSwitch = z.infer<typeof FeatureSwitchSchema>;
export type FeatureSwitchList = z.infer<typeof FeatureSwitchListSchema>;
//# sourceMappingURL=feature-switch.d.ts.map