import { z } from 'zod';
export declare const CameraPtzPresetsSchema: z.ZodObject<{
    left: z.ZodNumber;
    center: z.ZodNumber;
    right: z.ZodNumber;
}, z.core.$strict>;
export declare const CameraPolicySchema: z.ZodObject<{
    uid: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
        primary: "primary";
        secondary: "secondary";
    }>;
    enabled: z.ZodBoolean;
    ptz_presets: z.ZodObject<{
        left: z.ZodNumber;
        center: z.ZodNumber;
        right: z.ZodNumber;
    }, z.core.$strict>;
    siren: z.ZodBoolean;
    battery: z.ZodBoolean;
}, z.core.$strict>;
export declare const CameraPoliciesSchema: z.ZodArray<z.ZodObject<{
    uid: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
        primary: "primary";
        secondary: "secondary";
    }>;
    enabled: z.ZodBoolean;
    ptz_presets: z.ZodObject<{
        left: z.ZodNumber;
        center: z.ZodNumber;
        right: z.ZodNumber;
    }, z.core.$strict>;
    siren: z.ZodBoolean;
    battery: z.ZodBoolean;
}, z.core.$strict>>;
export type CameraPolicy = z.infer<typeof CameraPolicySchema>;
export type CameraPolicyEditableField = 'role' | 'enabled' | 'ptz_presets' | 'siren' | 'battery';
export interface CameraPoliciesWriteAuthority {
    current: readonly unknown[];
    authorizedResourceIds: ReadonlySet<string>;
    /** Producer declaration for each already-owned camera; absence grants no write. */
    editableFieldsByUid: ReadonlyMap<string, ReadonlySet<CameraPolicyEditableField>>;
}
/** Preserve full camera inventory, including disabled cameras, before runtime filtering. */
export declare function parseCameraPoliciesWrite(value: unknown, authority: CameraPoliciesWriteAuthority): CameraPolicy[];
//# sourceMappingURL=camera-policy.d.ts.map