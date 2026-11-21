import type { z } from 'zod';
export declare const MandateRequirementSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    attestor: z.ZodEnum<{
        sessione: "sessione";
        esecutore: "esecutore";
        revisore: "revisore";
        referente: "referente";
    }>;
    proof: z.ZodString;
    origin: z.ZodEnum<{
        capo: "capo";
        mandato: "mandato";
        ritorno: "ritorno";
    }>;
    reference: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"requirement">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
    }, z.core.$strict>], "kind">]>>;
    unit: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type MandateRequirement = z.infer<typeof MandateRequirementSchema>;
//# sourceMappingURL=mandate-requirement.d.ts.map