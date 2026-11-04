import { z } from 'zod';
import type { DeliveryPackage } from "./delivery-package.cjs";
/**
 * Business unit types whose lead is born by the capo-bu route (Forge F2F-01, `businessUnitBirthPlan`): the ids of
 * the lead types of Forge's catalog (`packages/shared/src/business-unit-types.ts`, commit 0e150e058). An action plan
 * may name only these types, so a unit never fails at birth for an unknown type. This list is the single source
 * (R-14): Forge's catalog imports these ids and keeps only its own details (capabilities, level, profile).
 */
export declare const BUSINESS_UNIT_LEAD_TYPE_IDS: readonly ["dati", "design", "sviluppo", "finanza", "marketing"];
export declare const BusinessUnitLeadTypeIdSchema: z.ZodEnum<{
    dati: "dati";
    design: "design";
    sviluppo: "sviluppo";
    finanza: "finanza";
    marketing: "marketing";
}>;
export type BusinessUnitLeadTypeId = z.infer<typeof BusinessUnitLeadTypeIdSchema>;
export declare const DeliveryEmailModelSchema: z.ZodObject<{
    keyScreens: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>;
    overviewSheet: z.ZodBoolean;
    preview: z.ZodBoolean;
}, z.core.$strict>;
export type DeliveryEmailModel = z.infer<typeof DeliveryEmailModelSchema>;
export declare const BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS: Readonly<Partial<Record<BusinessUnitLeadTypeId, DeliveryEmailModel>>>;
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
    deliveryEmail: z.ZodOptional<z.ZodObject<{
        keyScreens: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>;
        overviewSheet: z.ZodBoolean;
        preview: z.ZodBoolean;
    }, z.core.$strict>>;
    version: z.ZodNumber;
}, z.core.$strict>;
export type BusinessUnitTypeCard = z.infer<typeof BusinessUnitTypeCardSchema>;
/** Missing delivery requirements in presentation order; legacy cards impose none. */
export declare function deliveryPackageMeets(card: Pick<BusinessUnitTypeCard, 'deliveryEmail'>, pkg: DeliveryPackage): string[];
//# sourceMappingURL=business-unit-type.d.ts.map