import { z } from 'zod';
/** Card fixing capabilities, skills, model, engine, budget, delivery criteria and reviewer of a business unit type. */
export declare const BusinessUnitTypeCardSchema: z.ZodObject<{
    typeId: z.ZodString;
    label: z.ZodString;
    capabilities: z.ZodArray<z.ZodString>;
    skills: z.ZodArray<z.ZodString>;
    model: z.ZodEnum<{
        standard: "standard";
        advanced: "advanced";
        reasoning: "reasoning";
    }>;
    sessionEngine: z.ZodEnum<{
        claude: "claude";
        codex: "codex";
    }>;
    budget: z.ZodObject<{
        currency: z.ZodString;
        monthlyCap: z.ZodNumber;
        warnPercent: z.ZodNumber;
    }, z.core.$strict>;
    deliveryCriteria: z.ZodArray<z.ZodString>;
    reviewerTypeId: z.ZodOptional<z.ZodString>;
    version: z.ZodNumber;
}, z.core.$strict>;
export type BusinessUnitTypeCard = z.infer<typeof BusinessUnitTypeCardSchema>;
//# sourceMappingURL=business-unit-type.d.ts.map